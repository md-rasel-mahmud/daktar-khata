import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MerchantService } from "src/modules/merchant/merchant.service";

@Injectable()
export class SubscriptionScheduler {
  private readonly logger = new Logger(SubscriptionScheduler.name);

  constructor(private readonly merchantService: MerchantService) {}

  // Run daily at midnight. For development/testing switch to CronExpression.EVERY_10_SECONDS
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyExpiry() {
    this.logger.log("Running subscription expiry job (daily)");

    try {
      await this.merchantService.expireAllMerchantSubscription();
    } catch (err) {
      this.logger.error("Error while expiring subscriptions", err as any);
    }
  }
}
