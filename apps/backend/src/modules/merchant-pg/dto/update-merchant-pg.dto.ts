import { PartialType } from "@nestjs/swagger";
import { CreateMerchantPGDto } from "./create-merchant-pg.dto";

export class UpdateMerchantPGDto extends PartialType(CreateMerchantPGDto) {}
