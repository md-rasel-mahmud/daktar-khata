import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { TestOrderStatus } from "src/constant/enums/status.enum";

export class UpdateTestOrderItemStatusDto {
  @ApiProperty({ enum: TestOrderStatus })
  @IsNotEmpty()
  @IsEnum(TestOrderStatus)
  status: TestOrderStatus;
}
