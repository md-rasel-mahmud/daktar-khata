import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OperationService } from "./operation.service";
import { OperationController } from "./operation.controller";
import {
  OperationCase,
  OperationCaseSchema,
} from "./schema/operation.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.operationCase, schema: OperationCaseSchema },
    ]),
  ],
  controllers: [OperationController],
  providers: [OperationService],
  exports: [OperationService],
})
export class OperationModule {}
