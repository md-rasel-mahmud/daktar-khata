import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NursingTaskService } from "./nursing-task.service";
import { NursingTaskController } from "./nursing-task.controller";
import {
  NursingTask,
  NursingTaskSchema,
} from "./schema/nursing-task.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.nursingTask, schema: NursingTaskSchema },
    ]),
  ],
  controllers: [NursingTaskController],
  providers: [NursingTaskService],
  exports: [NursingTaskService],
})
export class NursingTaskModule {}
