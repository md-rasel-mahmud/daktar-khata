import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { collectionsName } from "../../constant";
import {
  ContactMessage,
  ContactMessageDocument,
} from "./schema/contact-message.schema";
import {
  CreateContactMessageDto,
  UpdateContactMessageStatusDto,
} from "./dto/contact-message.dto";

@Injectable()
export class ContactMessageService {
  constructor(
    @InjectModel(collectionsName.contactMessage)
    private readonly contactMessageModel: Model<ContactMessageDocument>,
  ) {}

  async create(dto: CreateContactMessageDto): Promise<ContactMessage> {
    const created = new this.contactMessageModel(dto);
    return created.save();
  }

  async findAll(status?: string): Promise<ContactMessage[]> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    return this.contactMessageModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ContactMessage> {
    const msg = await this.contactMessageModel.findById(id).exec();
    if (!msg) {
      throw new NotFoundException("Contact message not found");
    }
    return msg;
  }

  async updateStatus(
    id: string,
    dto: UpdateContactMessageStatusDto,
  ): Promise<ContactMessage> {
    const updated = await this.contactMessageModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException("Contact message not found");
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.contactMessageModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException("Contact message not found");
    }
    return { message: "Contact message deleted successfully" };
  }
}
