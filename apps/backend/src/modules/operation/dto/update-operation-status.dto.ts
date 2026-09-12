import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { OperationStatus } from "src/constant/enums/status.enum";

export class UpdateOperationStatusDto {
  @ApiProperty({ enum: OperationStatus, example: OperationStatus.IN_PROGRESS })
  @IsNotEmpty()
  @IsEnum(OperationStatus)
  status: OperationStatus;
}
