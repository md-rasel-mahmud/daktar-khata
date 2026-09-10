import { type Gender } from "@/enums/gender.enums";
import { type RolesEnum } from "@/enums/role.enum";

export type Doctor = {
  _id?: string;
  name: string;
  email?: string;
  mobile: string;
  address?: string;
  note?: string;
  merchant?: string;
  specialization: string[] | { value: string }[];
  designation: string;
  experienceInYears: number;
  hospitals: {
    hospitalName: string;
    chamberAddress: string;
    location: string;
    _id: string;
  }[];
  degree: {
    name: string;
    university: string;
    year: number;
    _id: string;
  }[];
  languages: string[];
  fee: number;
  schedules: {
    startTime: string;
    endTime: string;
    days: string[];
    _id: string;
  }[];
  user:
    | {
        _id: string;
        phone: string;
        role: RolesEnum;
        createdAt: string;
        updatedAt: string;
      }
    | string;
  gender: Gender;
  createdAt: string;
  updatedAt: string;
};
