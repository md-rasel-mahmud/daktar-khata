import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Types, Connection } from "mongoose";
import { collectionsName } from "../../constant";
import { BedAllocationDocument } from "./schema/bed-allocation.schema";
import { AllocateBedDto } from "./dto/allocate-bed.dto";
import { BedDocument } from "../bed/schema/bed.schema";
import { BedStatus } from "../../constant/enums/status.enum";

@Injectable()
export class BedAllocationService {
  constructor(
    @InjectModel(collectionsName.bedAllocation)
    private readonly allocationModel: Model<BedAllocationDocument>,
    @InjectModel(collectionsName.bed)
    private readonly bedModel: Model<BedDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async allocate(dto: AllocateBedDto, userId: Types.ObjectId, merchantId: Types.ObjectId) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      // Check bed is available
      const bed = await this.bedModel.findById(new Types.ObjectId(dto.bed)).session(session);
      if (!bed) throw new NotFoundException("Bed not found");
      if (bed.status !== BedStatus.AVAILABLE) {
        throw new BadRequestException(
          `Bed is currently ${bed.status}. Only AVAILABLE beds can be allocated.`,
        );
      }

      // Mark bed as occupied
      bed.status = BedStatus.OCCUPIED;
      await bed.save({ session });

      // Create allocation record
      const [allocation] = await this.allocationModel.create(
        [
          {
            bed: bed._id,
            patient: new Types.ObjectId(dto.patient),
            ...(dto.admission && { admission: new Types.ObjectId(dto.admission) }),
            merchant: merchantId,
            allocatedBy: userId,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return allocation;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async release(allocationId: string, userId: Types.ObjectId) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const allocation = await this.allocationModel
        .findById(new Types.ObjectId(allocationId))
        .session(session);
      if (!allocation) throw new NotFoundException("Bed allocation not found");
      if (!allocation.isActive) {
        throw new BadRequestException("This allocation is already released");
      }

      // Release allocation
      allocation.isActive = false;
      allocation.releasedAt = new Date();
      allocation.releasedBy = userId;
      await allocation.save({ session });

      // Set bed back to available
      await this.bedModel.findByIdAndUpdate(
        allocation.bed,
        { status: BedStatus.AVAILABLE },
        { session },
      );

      await session.commitTransaction();
      return { message: "Bed released successfully", allocation };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async transfer(allocationId: string, newBedId: string, userId: Types.ObjectId, merchantId: Types.ObjectId) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      // Get current allocation
      const oldAllocation = await this.allocationModel
        .findById(new Types.ObjectId(allocationId))
        .session(session);
      if (!oldAllocation) throw new NotFoundException("Bed allocation not found");
      if (!oldAllocation.isActive) {
        throw new BadRequestException("This allocation is already released");
      }

      // Check new bed is available
      const newBed = await this.bedModel.findById(new Types.ObjectId(newBedId)).session(session);
      if (!newBed) throw new NotFoundException("New bed not found");
      if (newBed.status !== BedStatus.AVAILABLE) {
        throw new BadRequestException(
          `New bed is currently ${newBed.status}. Only AVAILABLE beds can be allocated.`,
        );
      }

      // Release old bed
      oldAllocation.isActive = false;
      oldAllocation.releasedAt = new Date();
      oldAllocation.releasedBy = userId;
      await oldAllocation.save({ session });

      await this.bedModel.findByIdAndUpdate(
        oldAllocation.bed,
        { status: BedStatus.AVAILABLE },
        { session },
      );

      // Allocate new bed
      newBed.status = BedStatus.OCCUPIED;
      await newBed.save({ session });

      const [newAllocation] = await this.allocationModel.create(
        [
          {
            bed: newBed._id,
            patient: oldAllocation.patient,
            admission: oldAllocation.admission,
            merchant: merchantId,
            allocatedBy: userId,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return { message: "Bed transferred successfully", newAllocation };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getByPatient(patientId: string) {
    return this.allocationModel
      .find({ patient: new Types.ObjectId(patientId) })
      .sort({ allocatedAt: -1 })
      .populate("bed", "bedNumber")
      .populate("allocatedBy releasedBy", "name");
  }
}
