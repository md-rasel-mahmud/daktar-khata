import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { PaymentDocument } from "./payment.schema";
import { SubscriptionService } from "../subscription/subscription.service";
import { Inject } from "@nestjs/common";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import * as qs from "qs";
import {
  PaymentStatus,
  SubscriptionStatus,
} from "src/constant/enums/status.enum";
import { MerchantService } from "src/modules/merchant/merchant.service";
import { AppointmentService } from "src/modules/appointment/appointment.service";
import { AppConfigType, SSLCommerzConfig } from "src/config/app.config";
import {
  SSLCommerzInitPayload,
  SSLCommerzValidateResponse,
} from "src/common/interfaces/sslcommerz.interface";
import { BillingForEnum } from "src/constant/enums/billing-for.enum";

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @InjectModel(collectionsName.payment)
    private readonly paymentModel: Model<PaymentDocument>,
    @Inject(SubscriptionService)
    private readonly subscriptionService: SubscriptionService,

    private readonly merchantService: MerchantService,
    private readonly appointmentService: AppointmentService,
    private readonly configService: ConfigService<AppConfigType>
  ) {}

  getSSLCommerzConfig() {
    return this.configService.get<SSLCommerzConfig>("sslcommerz");
  }

  verifyHmac(payload: string, signature: string) {
    const secret = this.getSSLCommerzConfig().hmac_secret;

    if (!secret) return false;

    const crypto = require("crypto");

    const computed = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest();

    const provided = Buffer.from(signature, "hex");

    if (provided.length !== computed.length) return false;

    return crypto.timingSafeEqual(provided, computed);
  }

  async initiate(
    paymentInfo: {
      amount: number;
      transactionId: string;
      paymentId: string;
    },
    customerInfo: {
      customerName: string;
      customerEmail: string;
      customerAddress: string;
      customerPhone: string;
    },
    billingFor: BillingForEnum = BillingForEnum.MERCHANT_SUBSCRIPTION,
    customCredentials?: { storeId: string; storePass: string }
  ) {
    const sslConfig = this.getSSLCommerzConfig();

    const storeId: string = customCredentials.storeId || sslConfig.store_id;
    const storePass: string =
      customCredentials.storePass || sslConfig.store_passwd;
    const sandbox: Boolean = sslConfig.sandbox !== "false";

    // Prepare payload for SSLCommerz initiate API
    const payload: SSLCommerzInitPayload = {
      store_id: storeId,
      store_passwd: storePass,
      total_amount: paymentInfo.amount,
      currency: "BDT",
      tran_id: paymentInfo.transactionId,
      success_url: `${this.configService.get("frontend_url")}/payment/success`,
      fail_url: `${this.configService.get("frontend_url")}/payment/fail`,
      cancel_url: `${this.configService.get("frontend_url")}/payment/cancel`,
      ipn_url: `${this.configService.get(
        "backend_url"
      )}/api/v1/payment/success`,
      product_name: "Monthly Subscription",
      cus_name: customerInfo.customerName,
      cus_email: customerInfo.customerEmail,
      cus_add1: customerInfo.customerAddress,
      cus_city: customerInfo.customerAddress,
      cus_phone: customerInfo.customerPhone,
      cus_country: "Bangladesh",
      shipping_method: "NO",
      product_category: "Subscription",
      product_profile: "general",
      value_a: paymentInfo.paymentId,
      value_b: billingFor,
    };

    try {
      const apiUrl = sandbox
        ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
        : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

      const resp = await axios.post(apiUrl, qs.stringify(payload), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // SSLCommerz returns a redirect GatewayPageURL in response.data
      const gatewayUrl =
        resp.data && resp.data.GatewayPageURL ? resp.data.GatewayPageURL : null;

      return {
        transactionId: paymentInfo.transactionId,
        gatewayUrl,
        raw: resp.data,
      };
    } catch (err: any) {
      this.logger.error(
        "SSLCommerz initiate error",
        err?.response?.data || err.message
      );
      // fallback to sandbox url
      const fallback = `https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?tran_id=${paymentInfo.transactionId}`;

      return { transactionId: paymentInfo.transactionId, gatewayUrl: fallback };
    }
  }

  async getMerchantPayments(merchantId: Types.ObjectId) {
    const payments = await this.paymentModel
      .find({ merchant: merchantId })
      .sort({ createdAt: -1 })
      .exec();
    return payments;
  }

  async createPayment(
    merchantId: Types.ObjectId,
    {
      subscriptionId,
      paymentId,
    }: {
      subscriptionId?: Types.ObjectId;
      paymentId?: Types.ObjectId;
    }
  ) {
    let selectedSubscription = null;
    let paymentRecord: PaymentDocument = null;
    let transactionId = "";

    if (!subscriptionId && paymentId) {
      const existingPayment = await this.paymentModel.findById(paymentId);

      if (existingPayment.status === PaymentStatus.COMPLETED) {
        throw new NotFoundException("Payment already completed");
      }

      if (!existingPayment)
        throw new NotFoundException("Payment record not found");

      transactionId = existingPayment.transactionId;
      paymentRecord = existingPayment;

      selectedSubscription = await this.subscriptionService.getById(
        existingPayment.subscription
      );
    } else if (subscriptionId) {
      selectedSubscription = await this.subscriptionService.getById(
        subscriptionId
      );
    }

    if (!selectedSubscription)
      throw new NotFoundException(
        "No active subscription found for this merchant"
      );

    const merchant = await this.merchantService.findOneById(
      merchantId.toString()
    );

    if (
      merchant.subscriptionStatus === SubscriptionStatus.ACTIVE &&
      merchant.subscriptionEndDate > new Date()
    ) {
      throw new NotFoundException(
        "Merchant already has an active subscription for this period"
      );
    }

    if (!merchant)
      throw new NotFoundException("Merchant not found for this payment");

    if (!paymentId) {
      transactionId = `TXN_${Date.now()}`;
      paymentRecord = await this.paymentModel.create({
        merchant: merchantId,
        transactionId,
        amount: selectedSubscription.amount,
        status: PaymentStatus.PENDING,
        subscription: subscriptionId,
      });
    }

    const payment = await this.initiate(
      {
        amount: selectedSubscription.amount,
        transactionId,
        paymentId: paymentRecord._id.toString(),
      },
      {
        customerName: merchant.name || "Unknown Merchant",
        customerEmail: merchant.user?.["email"] || "",
        customerPhone: merchant.user?.["phone"] || "",
        customerAddress: merchant.clinicAddress || "",
      }
    );

    return payment;
  }

  async markSuccess(
    transactionId: string,
    data: SSLCommerzValidateResponse | any
  ) {
    if (!transactionId) throw new Error("Missing transaction id");

    if (data.value_b === BillingForEnum.MERCHANT_SUBSCRIPTION) {
      return this.subscriptionPaymentSuccessJob(transactionId, data);
    }

    if (data.value_b === BillingForEnum.PATIENT_APPOINTMENT) {
      return this.appointmentPaymentSuccessJob(transactionId, data);
    }
  }

  async subscriptionPaymentSuccessJob(
    transactionId: string,
    data: SSLCommerzValidateResponse | any
  ) {
    // If already processed, return existing
    const paymentRecord = await this.paymentModel.findOne({ transactionId });

    if (paymentRecord && paymentRecord.status === PaymentStatus.COMPLETED)
      return paymentRecord;

    // Update payment record
    paymentRecord.status = PaymentStatus.COMPLETED;
    await paymentRecord.save();

    // If gateway provided val_id, try to verify via validation API
    const valId = data.val_id || data.valId || null;
    let verifiedData = data;
    if (valId) {
      try {
        verifiedData = await this.verifyTransaction(valId);
      } catch (err) {
        this.logger.error("Verification failed", err as any);
      }
    }

    const subscription = await this.subscriptionService.getById(
      paymentRecord?.subscription
    );

    // Attempt to activate subscription if present with retry
    if (paymentRecord && paymentRecord.subscription) {
      const maxRetry = parseInt(
        this.configService.get("payment")["max_retry"] || "3",
        10
      );

      let attempt = 0;
      let activated = false;
      while (attempt < maxRetry && !activated) {
        attempt += 1;

        try {
          await this.merchantService.verifyPaymentAndActivateMerchantSubscription(
            paymentRecord.merchant,
            paymentRecord.subscription,
            subscription?.durationInDays || 30
          );

          console.warn(
            `Successfully activated subscription ${paymentRecord.subscription} on attempt ${attempt}`
          );

          activated = true;
        } catch (err) {
          this.logger.warn(
            `Activation attempt ${attempt} failed for subscription ${
              paymentRecord.subscription
            }: ${err?.message || err}`
          );

          // exponential backoff sleep
          const wait = Math.pow(2, attempt) * 500;

          await new Promise((r) => setTimeout(r, wait));
        }
      }
      if (!activated)
        this.logger.error(
          `Failed to activate subscription ${paymentRecord.subscription} after ${maxRetry} attempts`
        );
    }

    return paymentRecord;
  }

  async appointmentPaymentSuccessJob(
    transactionId: string,
    data: SSLCommerzValidateResponse | any
  ) {
    // If already processed, return existing
    const appointmentRecord =
      await this.appointmentService.getAppointmentByTransactionId(
        transactionId
      );

    if (
      appointmentRecord &&
      appointmentRecord.paymentStatus === PaymentStatus.COMPLETED
    )
      return appointmentRecord;

    // Update appointment record
    appointmentRecord.paymentStatus = PaymentStatus.COMPLETED;
    await appointmentRecord.save();

    // If gateway provided val_id, try to verify via validation API
    const valId = data.val_id || data.valId || null;
    let verifiedData = data;
    if (valId) {
      try {
        verifiedData = await this.verifyTransaction(valId);
      } catch (err) {
        this.logger.error("Verification failed", err as any);
      }
    }

    return appointmentRecord;
  }

  async verifyTransaction(valId: string) {
    const sslConfig = this.getSSLCommerzConfig();
    const storeId: string = sslConfig.store_id;
    const storePass: string = sslConfig.store_passwd;
    const sandbox: Boolean = sslConfig.sandbox !== "false";

    const baseUrl = sandbox
      ? "https://sandbox.sslcommerz.com"
      : "https://securepay.sslcommerz.com";

    const url = `${baseUrl}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(
      valId
    )}&store_id=${encodeURIComponent(
      storeId
    )}&store_passwd=${encodeURIComponent(storePass)}&v=1&format=json`;
    const resp = await axios.get(url);
    return resp.data;
  }

  async markFailed(
    transactionId: string,
    data: SSLCommerzValidateResponse | any
  ) {
    if (data.value_b === BillingForEnum.MERCHANT_SUBSCRIPTION) {
      const p = await this.paymentModel.findOneAndUpdate(
        { transactionId },
        { status: PaymentStatus.FAILED, gatewayResponse: data },
        { new: true }
      );
      return p;
    }

    if (data.value_b === BillingForEnum.PATIENT_APPOINTMENT) {
      const appointment =
        await this.appointmentService.getAppointmentByTransactionId(
          transactionId
        );
      appointment.paymentStatus = PaymentStatus.FAILED;
      await appointment.save();
      return appointment;
    }
  }
}
