import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TestCatalogService } from "./test-catalog.service";
import { TestCatalogController } from "./test-catalog.controller";
import { TestCatalogSchema } from "./schema/test-catalog.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.testCatalog, schema: TestCatalogSchema },
    ]),
  ],
  controllers: [TestCatalogController],
  providers: [TestCatalogService],
  exports: [TestCatalogService],
})
export class TestCatalogModule {}
