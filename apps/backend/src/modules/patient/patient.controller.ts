import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ForbiddenException,
} from "@nestjs/common";
import { PatientService } from "./patient.service";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesEnum } from "../../constant";
import { AuthUser } from "../../common/decorator/authUser.decorator";
import { IAuthUser } from "../../common";
import { Types } from "mongoose";
import { MedicalRecordService } from "../medical-records/medical-record.service";

@Controller("patients")
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
    private readonly medicalRecordService: MedicalRecordService,
  ) {}

  @Get()
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.MERCHANT,
  )
  findAll(
    @AuthUser() authUser: IAuthUser,
    @Query("doctorId") doctorId?: string,
  ) {
    if (authUser.role === RolesEnum.DOCTOR) {
      return this.patientService.findDoctorPatients(
        new Types.ObjectId(authUser._id),
      );
    }

    if (doctorId && Types.ObjectId.isValid(doctorId)) {
      return this.patientService.findDoctorPatients(
        new Types.ObjectId(doctorId),
      );
    }

    return this.patientService.findAll();
  }

  @Get("doctor")
  @Roles(
    RolesEnum.DOCTOR,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.MERCHANT,
  )
  findDoctorPatients(@AuthUser() authUser: IAuthUser) {
    return this.patientService.findDoctorPatients(
      new Types.ObjectId(authUser._id),
    );
  }

  @Get(":id/appointments")
  @Roles(
    RolesEnum.PATIENT,
    RolesEnum.DOCTOR,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.MERCHANT,
  )
  findAppointments(@AuthUser() authUser: IAuthUser, @Param("id") id: string) {
    if (authUser.role === RolesEnum.PATIENT && String(authUser._id) !== id) {
      throw new ForbiddenException("You can only view your own appointments");
    }

    return this.patientService.findPatientAppointments(id);
  }

  @Get(":id/medical-records")
  @Roles(
    RolesEnum.PATIENT,
    RolesEnum.DOCTOR,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.MERCHANT,
  )
  findMedicalRecords(@AuthUser() authUser: IAuthUser, @Param("id") id: string) {
    if (authUser.role === RolesEnum.PATIENT && String(authUser._id) !== id) {
      throw new ForbiddenException("You can only view your own records");
    }

    return this.medicalRecordService.findByPatient(id);
  }

  @Get(":id")
  @Roles(
    RolesEnum.PATIENT,
    RolesEnum.DOCTOR,
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.MERCHANT,
  )
  findOne(@AuthUser() authUser: IAuthUser, @Param("id") id: string) {
    if (authUser.role === RolesEnum.PATIENT && String(authUser._id) !== id) {
      throw new ForbiddenException("You can only view your own profile");
    }

    return this.patientService.findPatientById(id);
  }

  @Patch(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  update(@Param("id") id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }

  @Delete(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  remove(@Param("id") id: string) {
    return this.patientService.remove(id);
  }
}
