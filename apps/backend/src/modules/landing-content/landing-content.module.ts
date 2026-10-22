import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LandingContentController } from "./landing-content.controller";
import { LandingContentService } from "./landing-content.service";
import { LandingContentSchema } from "./schema/landing-content.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.landingContent, schema: LandingContentSchema },
    ]),
  ],
  controllers: [LandingContentController],
  providers: [LandingContentService],
  exports: [LandingContentService],
})
export class LandingContentModule {}
