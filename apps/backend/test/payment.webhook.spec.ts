import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import * as express from "express";
import * as crypto from "crypto";
import { Controller, Post, Req, Body, Query, Inject } from "@nestjs/common";

// Lightweight test controller mirroring the /payment/success endpoint behavior
@Controller("payment")
class TestPaymentController {
  constructor(
    @Inject("PAYMENT_SERVICE") private readonly paymentService: any
  ) {}

  @Post("success")
  async success(@Req() req: any, @Body() body: any, @Query() query: any) {
    const cfg = this.paymentService.getConfig();
    const whitelist = (cfg.sslcommerz.whitelist_ips || "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const remoteIp = (
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.ip ||
      ""
    )
      .toString()
      .split(",")[0]
      .trim();

    const hmacHeader = (
      req.headers["x-sslc-hmac"] ||
      req.headers["x-sslc-signature"] ||
      ""
    ).toString();
    const raw = req.rawBody && req.rawBody.length ? req.rawBody : null;
    const payloadForVerify = raw
      ? raw.toString("utf8")
      : JSON.stringify({ ...body, ...query });

    if (whitelist.length && !whitelist.includes(remoteIp) && !hmacHeader) {
      throw new Error("Invalid webhook source");
    }

    if (hmacHeader) {
      const ok = this.paymentService.verifyHmac(payloadForVerify, hmacHeader);
      if (!ok) throw new Error("Invalid HMAC signature");
    }

    let transactionId: string | undefined;
    let parsedPayload: any = null;
    if (raw) {
      try {
        parsedPayload = JSON.parse(raw.toString("utf8"));
        transactionId = parsedPayload?.tran_id || parsedPayload?.tran_id;
      } catch (e) {
        parsedPayload = null;
      }
    }
    transactionId = transactionId || body?.tran_id || query?.tran_id;
    if (!transactionId) throw new Error("Missing transaction id");

    await this.paymentService.markSuccess(
      transactionId,
      parsedPayload || { ...body, ...query }
    );
    return { ok: true };
  }
}

describe("Payment Webhook (e2e)", () => {
  let app: INestApplication;
  const hmacSecret = "test_secret_123";

  beforeAll(async () => {
    process.env.SSLC_HMAC_SECRET = hmacSecret;
    process.env.SSLC_STORE_PASS = hmacSecret; // fallback

    const mockPaymentService = {
      initiate: jest.fn(),
      markSuccess: jest.fn().mockResolvedValue(true),
      verifyTransaction: jest.fn().mockResolvedValue({}),
      verifyHmac: (payload: string | Buffer, sig: string) => {
        const buf = Buffer.isBuffer(payload)
          ? payload
          : Buffer.from(payload as string, "utf8");
        const computed = crypto
          .createHmac("sha256", hmacSecret)
          .update(buf)
          .digest("hex");
        return computed === sig;
      },
      getConfig: () => ({ whitelist_ips: "" }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestPaymentController],
      providers: [{ provide: "PAYMENT_SERVICE", useValue: mockPaymentService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    // set same prefix as main app
    app.setGlobalPrefix("api/v1");
    // raw body parser for exact HMAC verification
    app.use("/api/v1/payment", express.raw({ type: "*/*" }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("accepts a valid signed webhook (raw body)", async () => {
    const payload = { tran_id: "TXN_TEST_1", amount: 100 };
    const raw = Buffer.from(JSON.stringify(payload), "utf8");
    const signature = crypto
      .createHmac("sha256", hmacSecret)
      .update(raw)
      .digest("hex");

    await request(app.getHttpServer())
      .post("/api/v1/payment/success")
      .set("Content-Type", "application/json")
      .set("x-sslc-hmac", signature)
      .send(raw)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ ok: true });
      });
  });

  it("rejects a webhook with invalid signature", async () => {
    const payload = { tran_id: "TXN_TEST_2", amount: 200 };
    const raw = Buffer.from(JSON.stringify(payload), "utf8");
    const signature = "deadbeef";

    await request(app.getHttpServer())
      .post("/api/v1/payment/success")
      .set("Content-Type", "application/json")
      .set("x-sslc-hmac", signature)
      .send(raw)
      .expect(400);
  });
});
