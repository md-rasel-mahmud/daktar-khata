import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContactMessageController } from "./contact-message.controller";
import { ContactMessageService } from "./contact-message.service";
import { ContactMessageSchema } from "./schema/contact-message.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.contactMessage, schema: ContactMessageSchema },
    ]),
  ],
  controllers: [ContactMessageController],
  providers: [ContactMessageService],
  exports: [ContactMessageService],
})
export class ContactMessageModule {}
