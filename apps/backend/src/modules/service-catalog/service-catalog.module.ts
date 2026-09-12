import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ServiceCatalogService } from "./service-catalog.service";
import { ServiceCatalogController } from "./service-catalog.controller";
import {
  ServiceCatalog,
  ServiceCatalogSchema,
} from "./schema/service-catalog.schema";
import { collectionsName } from "../../constant";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: collectionsName.serviceCatalog, schema: ServiceCatalogSchema },
    ]),
  ],
  controllers: [ServiceCatalogController],
  providers: [ServiceCatalogService],
  exports: [ServiceCatalogService],
})
export class ServiceCatalogModule {}
