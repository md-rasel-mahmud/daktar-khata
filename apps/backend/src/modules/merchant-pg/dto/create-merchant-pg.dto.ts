import { ApiProperty } from "@nestjs/swagger";
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { Types } from "mongoose";

class SSLCommerzCredentialDto {
  @ApiProperty({ example: true, description: "Whether SSLCommerz is active" })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: "SSL_STORE_001" })
  @IsOptional()
  storeId?: string;

  @ApiProperty({ example: "ssl_pass_789" })
  @IsOptional()
  storePassword?: string;

  @ApiProperty({ example: false, description: "Whether to use sandbox mode" })
  @IsOptional()
  isSandbox?: boolean;

  @ApiProperty({ example: true, description: "Whether to use tokenization" })
  @IsOptional()
  isTokenize?: boolean;
}

export class CreateMerchantPGDto {
  @ApiProperty({ type: () => SSLCommerzCredentialDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SSLCommerzCredentialDto)
  sslcommerz?: SSLCommerzCredentialDto;
}
