import {
  IsArray,
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { RolesEnum } from "src/constant";
import { PersonDto } from "src/common/dto/person.dto";

// Nested DTOs for better Swagger clarity
class HospitalInfoDto {
  @ApiPropertyOptional({ example: "Rajshahi Medical College Hospital" })
  @IsString()
  @IsOptional()
  hospitalName?: string;

  @ApiPropertyOptional({ example: "Ghoramara, Rajshahi" })
  @IsString()
  @IsOptional()
  chamberAddress?: string;

  @ApiPropertyOptional({ example: "Rajshahi, Bangladesh" })
  @IsString()
  @IsOptional()
  location?: string;
}

class DegreeInfoDto {
  @ApiProperty({ example: "MBBS" })
  @IsString()
  name: string;

  @ApiProperty({ example: "Dhaka Medical College" })
  @IsString()
  university: string;

  @ApiProperty({ example: 2018 })
  @IsNumber()
  year: number;
}

class ScheduleDto {
  @ApiProperty({ example: "09:00 AM" })
  @IsString()
  startTime: string;

  @ApiProperty({ example: "02:00 PM" })
  @IsString()
  endTime: string;

  @ApiProperty({
    example: ["Sunday", "Tuesday", "Thursday"],
    description: "Days the doctor is available",
  })
  @IsArray()
  days: string[];
}

export class CreateDoctorDto extends PersonDto {
  @ApiProperty({
    description: "List of doctor’s specializations",
    example: ["Cardiology", "Medicine"],
  })
  @IsArray()
  @IsNotEmpty()
  specialization: string[];

  @ApiProperty({
    description: "Doctor’s designation or position",
    example: "Consultant Cardiologist",
  })
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiPropertyOptional({
    description: "Years of experience",
    example: 8,
  })
  @IsNumber()
  @IsOptional()
  experienceInYears?: number;

  @ApiPropertyOptional({
    description: "List of hospitals where the doctor practices",
    type: [HospitalInfoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HospitalInfoDto)
  @IsOptional()
  hospitals?: HospitalInfoDto[];

  @ApiProperty({
    description: "List of degrees earned by the doctor",
    type: [DegreeInfoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DegreeInfoDto)
  degree: DegreeInfoDto[];

  @ApiPropertyOptional({
    description: "Languages spoken by the doctor",
    example: ["Bangla", "English"],
  })
  @IsArray()
  @IsOptional()
  languages?: string[];

  @ApiProperty({
    description: "Consultation fee",
    example: 500,
  })
  @IsNumber()
  @IsNotEmpty()
  fee: number;

  @ApiProperty({
    description: "Doctor’s weekly schedules",
    type: [ScheduleDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  schedules: ScheduleDto[];

  // User fields
  @ApiProperty({
    description: "Doctor’s phone number",
    example: "+8801712345678",
  })
  @IsMobilePhone()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: "Password for doctor’s account",
    example: "strongpassword123",
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: "Doctor’s email address",
    example: "doctor@example.com",
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: "User role (defaults to DOCTOR)",
    enum: RolesEnum,
    example: RolesEnum.DOCTOR,
  })
  @IsEnum(RolesEnum)
  @IsOptional()
  role?: RolesEnum;

  @ApiPropertyOptional({
    description: "Merchant ID (only for merchant-linked doctors)",
    example: "652fcf2c4f2b09a4b5a4c2a8",
  })
  @IsMongoId()
  @IsOptional()
  merchant?: string;
}
