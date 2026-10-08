import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { InvoiceStatus } from "../../../constant/enums/status.enum";

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatus, example: InvoiceStatus.CANCELLED })
  @IsNotEmpty()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
