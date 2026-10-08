import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  Query,
  BadRequestException,
  Param,
  Patch,
} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser, Public } from "../../common";
import * as querystring from "querystring";
import { SSLCommerzValidateResponse } from "../../common/interfaces/sslcommerz.interface";

@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("subscription/sslcommerz/:id")
  @Roles(RolesEnum.MERCHANT)
  async initiatePayment(
    @AuthUser() user: IAuthUser,
    @Param("id") subscriptionId: string,
    @Body("billingCycle") billingCycle?: string
  ) {
    if (user.role !== RolesEnum.MERCHANT && !user.merchant) {
      throw new BadRequestException("Only merchants can proceed the payments");
    }

    // is valid mongodb ids
    const isValidSubscriptionId = Types.ObjectId.isValid(subscriptionId);

    if (!isValidSubscriptionId) {
      throw new BadRequestException("Invalid subscription or merchant id");
    }

    return this.paymentService.createPayment(
      new Types.ObjectId(user.merchant),
      {
        subscriptionId: new Types.ObjectId(subscriptionId),
        billingCycle: billingCycle || "monthly",
      }
    );
  }

  @Patch("subscription/sslcommerz/repayment/:paymentId")
  @Roles(RolesEnum.MERCHANT)
  async repaymentInitiate(
    @AuthUser() user: IAuthUser,
    @Param("paymentId") paymentId: string
  ) {
    if (user.role !== RolesEnum.MERCHANT && !user.merchant) {
      throw new BadRequestException("Only merchants can proceed the payments");
    }

    // is valid mongodb ids
    const isValidPaymentId = Types.ObjectId.isValid(paymentId);

    if (!isValidPaymentId) {
      throw new BadRequestException(
        "Invalid subscription, merchant or payment id"
      );
    }

    return this.paymentService.createPayment(
      new Types.ObjectId(user.merchant),
      {
        paymentId: new Types.ObjectId(paymentId),
      }
    );
  }

  @Get("merchant")
  @Roles(RolesEnum.MERCHANT)
  async getMerchantPaymentList(@AuthUser() user: IAuthUser) {
    return this.paymentService.getMerchantPayments(
      new Types.ObjectId(user.merchant)
    );
  }

  // SSLCommerz will call these webhook-like endpoints
  @Public()
  @Post("success")
  async success(@Req() req: any, @Body() body: any, @Query() query: any) {
    // accept postback from gateway (server-to-server) or redirect query
    // Validate source IP and HMAC header
    const cfg = this.paymentService.getSSLCommerzConfig();

    const whitelist = (cfg.whitelist_ips || "")
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

    // Prefer raw body for exact HMAC verification
    const raw = req.rawBody && req.rawBody.length ? req.rawBody : null;

    const payloadForVerify = raw
      ? raw.toString("utf8")
      : JSON.stringify({ ...body, ...query });

    // if whitelist is set and remote IP not in it, reject (unless HMAC present)
    if (whitelist.length && !whitelist.includes(remoteIp) && !hmacHeader) {
      throw new BadRequestException("Invalid webhook source");
    }

    // verify HMAC if provided
    if (hmacHeader) {
      const ok = this.paymentService.verifyHmac(payloadForVerify, hmacHeader);
      if (!ok) throw new BadRequestException("Invalid HMAC signature");
    }

    // Extract transaction id
    let transactionId: string | undefined;
    let parsedPayload: SSLCommerzValidateResponse | any = null;

    const rawBody = req.body;

    // let bodyObject: any;
    if (Buffer.isBuffer(rawBody)) {
      const decoded = rawBody.toString("utf8");
      parsedPayload = querystring.parse(decoded);
      transactionId = parsedPayload?.tran_id || parsedPayload?.tran_id;
    } else if (typeof rawBody === "string") {
      parsedPayload = querystring.parse(rawBody);
      transactionId = parsedPayload?.tran_id || parsedPayload?.tran_id;
    } else {
      transactionId = rawBody?.tran_id || rawBody?.tran_id;
      parsedPayload = rawBody;
    }

    transactionId = transactionId || body?.tran_id || query?.tran_id;

    if (!transactionId) throw new BadRequestException("Missing transaction id");

    await this.paymentService.markSuccess(
      transactionId,
      parsedPayload || { ...body, ...query }
    );

    return { ok: true };
  }

  @Public()
  @Get("redirect")
  async redirect(@Query() query: any) {
    // Common redirect entrypoint if gateway redirects user after payment
    // Example: query may include tran_id and val_id — we verify and show status
    const { tran_id, val_id } = query;
    if (val_id) {
      const verified = await this.paymentService.verifyTransaction(val_id);
      // mark success based on verification
      await this.paymentService.markSuccess(tran_id, verified);
      return { status: "success", verified };
    }
    return { status: "unknown", query };
  }

  @Public()
  @Post("fail")
  async fail(@Body() body: any) {
    const { tran_id } = body;
    console.log("fail body :>> ", body);
    await this.paymentService.markFailed(tran_id, body);
    return { ok: true };
  }

  @Public()
  @Post("cancel")
  async cancel(@Body() body: any) {
    console.log("cancel body :>> ", body);
    const { tran_id } = body;
    await this.paymentService.markFailed(tran_id, { ...body, cancelled: true });
    return { ok: true };
  }
}
