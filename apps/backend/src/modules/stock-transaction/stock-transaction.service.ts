import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Types, Connection } from "mongoose";
import { collectionsName } from "../../constant";
import { StockTransactionDocument } from "./schema/stock-transaction.schema";
import { InventoryItemDocument } from "../inventory-item/schema/inventory-item.schema";
import { CreateStockTransactionDto } from "./dto/create-stock-transaction.dto";
import {
  StockTransactionType,
  SupplySource,
} from "../../constant/enums/status.enum";

@Injectable()
export class StockTransactionService {
  constructor(
    @InjectModel(collectionsName.stockTransaction)
    private readonly stockTxnModel: Model<StockTransactionDocument>,
    @InjectModel(collectionsName.inventoryItem)
    private readonly itemModel: Model<InventoryItemDocument>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  private isStockIn(type: StockTransactionType): boolean {
    return (
      type === StockTransactionType.PURCHASE ||
      type === StockTransactionType.RETURN
    );
  }

  private isStockOut(type: StockTransactionType): boolean {
    return (
      type === StockTransactionType.SALE ||
      type === StockTransactionType.ISSUE_TO_PATIENT ||
      type === StockTransactionType.ISSUE_TO_OPERATION ||
      type === StockTransactionType.ISSUE_TO_DEPARTMENT ||
      type === StockTransactionType.EXPIRED ||
      type === StockTransactionType.DAMAGED
    );
  }

  async create(
    dto: CreateStockTransactionDto,
    merchantId: Types.ObjectId,
    performedById?: Types.ObjectId,
  ) {
    const item = await this.itemModel.findById(new Types.ObjectId(dto.item));
    if (!item || !item.isActive) {
      throw new NotFoundException("Inventory item not found");
    }

    const supplySource = dto.supplySource || SupplySource.CLINIC_STOCK;
    const unitPrice =
      dto.unitPrice !== undefined ? dto.unitPrice : item.purchasePrice;
    const totalPrice = dto.quantity * unitPrice;

    // Reason validation for adjustments
    if (
      dto.transactionType === StockTransactionType.ADJUSTMENT &&
      !dto.reason
    ) {
      throw new BadRequestException(
        "A reason is required for stock adjustments",
      );
    }

    if (supplySource === SupplySource.CLINIC_STOCK) {
      const stockIn = this.isStockIn(dto.transactionType);
      const stockOut = this.isStockOut(dto.transactionType);

      if (stockOut && item.currentStock < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock available. Current stock: ${item.currentStock} ${item.unit}`,
        );
      }

      const session = await this.connection.startSession();
      session.startTransaction();

      try {
        const stockDelta = stockIn
          ? dto.quantity
          : stockOut
          ? -dto.quantity
          : 0;

        if (stockDelta !== 0) {
          await this.itemModel.findByIdAndUpdate(
            item._id,
            { $inc: { currentStock: stockDelta } },
            { session },
          );
        }

        const [createdTxn] = await this.stockTxnModel.create(
          [
            {
              item: item._id,
              transactionType: dto.transactionType,
              supplySource,
              quantity: dto.quantity,
              unitPrice,
              totalPrice,
              batchNumber: dto.batchNumber || "",
              expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
              reason: dto.reason || "",
              patient: dto.patient ? new Types.ObjectId(dto.patient) : null,
              admission: dto.admission
                ? new Types.ObjectId(dto.admission)
                : null,
              operation: dto.operation
                ? new Types.ObjectId(dto.operation)
                : null,
              performedBy: performedById || null,
              merchant: merchantId,
              isActive: true,
            },
          ],
          { session },
        );

        await session.commitTransaction();
        return createdTxn;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      // Non-clinic stock (e.g. PATIENT_PROVIDED or EXTERNAL_PURCHASE)
      return this.stockTxnModel.create({
        item: item._id,
        transactionType: dto.transactionType,
        supplySource,
        quantity: dto.quantity,
        unitPrice,
        totalPrice,
        batchNumber: dto.batchNumber || "",
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        reason: dto.reason || "",
        patient: dto.patient ? new Types.ObjectId(dto.patient) : null,
        admission: dto.admission ? new Types.ObjectId(dto.admission) : null,
        operation: dto.operation ? new Types.ObjectId(dto.operation) : null,
        performedBy: performedById || null,
        merchant: merchantId,
        isActive: true,
      });
    }
  }

  async findAll(
    merchantId?: string,
    itemId?: string,
    type?: StockTransactionType,
    source?: SupplySource,
    patientId?: string,
    operationId?: string,
  ) {
    const filter: any = { isActive: true };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);
    if (itemId) filter.item = new Types.ObjectId(itemId);
    if (type) filter.transactionType = type;
    if (source) filter.supplySource = source;
    if (patientId) filter.patient = new Types.ObjectId(patientId);
    if (operationId) filter.operation = new Types.ObjectId(operationId);

    return this.stockTxnModel
      .find(filter)
      .populate("item", "name genericName category unit currentStock")
      .populate("patient", "name phone")
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 });
  }

  async findByItem(itemId: string, merchantId?: string) {
    const filter: any = {
      item: new Types.ObjectId(itemId),
      isActive: true,
    };
    if (merchantId) filter.merchant = new Types.ObjectId(merchantId);

    return this.stockTxnModel
      .find(filter)
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const txn = await this.stockTxnModel
      .findById(new Types.ObjectId(id))
      .populate("item", "name genericName category unit currentStock")
      .populate("patient", "name phone")
      .populate("admission", "admissionNumber")
      .populate("operation", "caseNumber procedureName")
      .populate("performedBy", "name role");

    if (!txn) throw new NotFoundException("Stock transaction not found");
    return txn;
  }
}
