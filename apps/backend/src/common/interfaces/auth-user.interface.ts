import { Types } from "mongoose";

export interface IAuthUser {
  _id: Types.ObjectId;
  admin?: Types.ObjectId;
  role?: string;
  merchant?: Types.ObjectId;
  phone?: string;
  email?: string;
  permissions?: string[];
  staffRole?: string;
  customRoleName?: string;
  staffName?: string;
}
