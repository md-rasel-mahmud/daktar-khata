import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class InitiatePaymentDto {
  @ApiProperty({
    example: "652c9b1e5e8f4f4f2a9b1234",
    description: "Unique ID of the subscription the payment is for",
  })
  @IsString()
  @IsNotEmpty()
  subscriptionId: string;

  @ApiProperty({
    example: "Md. Rasel Mahmud Rana",
    description: "Full name of the customer making the payment",
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @ApiProperty({
    example: "rasel@example.com",
    description: "Valid email address of the customer",
  })
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @ApiProperty({
    example: "House 12, Road 3, Rajshahi",
    description: "Customer's full address",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  customerAddress: string;

  @ApiProperty({
    example: "+8801700000000",
    description:
      "Customer's active mobile number (international or local format)",
    minLength: 10,
    maxLength: 15,
  })
  @IsMobilePhone()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(15)
  customerPhone: string;
}
