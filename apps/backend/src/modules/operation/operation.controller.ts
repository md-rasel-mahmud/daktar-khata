import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { OperationService } from "./operation.service";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { CreateOperationDto } from "./dto/create-operation.dto";
import { UpdateOperationDto } from "./dto/update-operation.dto";
import { UpdatePreOpDto } from "./dto/update-pre-op.dto";
import { UpdateOperationNotesDto } from "./dto/update-operation-notes.dto";
import { UpdateOperationStatusDto } from "./dto/update-operation-status.dto";
import { Types } from "mongoose";
import { Roles } from "../../common/decorators/roles.decorator";
import { IAuthUser } from "../../common";
import { OperationStatus } from "../../constant/enums/status.enum";

@Controller("operation")
export class OperationController {
  constructor(private readonly operationService: OperationService) {}

  @Post()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async create(@AuthUser() user: IAuthUser, @Body() dto: CreateOperationDto) {
    const merchantId = user.merchant
      ? new Types.ObjectId(user.merchant)
      : undefined;
    if (!merchantId) {
      throw new BadRequestException("Merchant ID is required");
    }
    return this.operationService.create(dto, merchantId);
  }

  @Get()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findAll(
    @AuthUser() user: IAuthUser,
    @Query("merchant") merchantId?: string,
    @Query("surgeon") surgeonId?: string,
    @Query("patient") patientId?: string,
    @Query("status") status?: OperationStatus,
  ) {
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : merchantId;
    return this.operationService.findAll(
      targetMerchant,
      surgeonId,
      patientId,
      status,
    );
  }

  @Get("patient/:patientId")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.PATIENT,
  )
  async findByPatient(
    @AuthUser() user: IAuthUser,
    @Param("patientId") patientId: string,
  ) {
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BadRequestException("Invalid patient ID");
    }
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : undefined;
    return this.operationService.findByPatient(patientId, targetMerchant);
  }

  @Get("admission/:admissionId")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async findByAdmission(
    @AuthUser() user: IAuthUser,
    @Param("admissionId") admissionId: string,
  ) {
    if (!Types.ObjectId.isValid(admissionId)) {
      throw new BadRequestException("Invalid admission ID");
    }
    const targetMerchant = user.merchant
      ? user.merchant.toString()
      : undefined;
    return this.operationService.findByAdmission(admissionId, targetMerchant);
  }

  @Get(":id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.PATIENT,
  )
  async findOne(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid operation ID");
    }
    return this.operationService.findOne(id);
  }

  @Put(":id")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateOperationDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid operation ID");
    }
    return this.operationService.update(id, dto);
  }

  @Patch(":id/status")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateOperationStatusDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid operation ID");
    }
    return this.operationService.updateStatus(id, dto);
  }

  @Patch(":id/pre-op")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async updatePreOp(
    @Param("id") id: string,
    @Body() dto: UpdatePreOpDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid operation ID");
    }
    return this.operationService.updatePreOp(id, dto);
  }

  @Patch(":id/notes")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.STAFF,
    RolesEnum.MERCHANT,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
  )
  async updateNotes(
    @Param("id") id: string,
    @Body() dto: UpdateOperationNotesDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid operation ID");
    }
    return this.operationService.updateNotes(id, dto);
  }
}
