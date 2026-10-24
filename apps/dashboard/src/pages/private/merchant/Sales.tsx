import React, { useMemo, useState } from "react"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"
import {
  useCreateSaleMutation,
  useDeleteIncomeMutation,
  useGetSalesListQuery,
  useUpdateIncomeMutation,
} from "@/lib/store/api/services/finance.service"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import {
  ClientDataTable,
  type DataTableColumn,
} from "@/components/common/table"
import { Badge } from "@repo/ui/badge"
import { toast } from "sonner"
import { Percent, Tag } from "lucide-react"

const SALE_CATEGORIES = [
  "CONSULTATION_FEE",
  "SURGERY_FEE",
  "CABIN_RENT",
  "TEST_FEE",
  "MEDICINE_SALE",
  "OTHER",
]

const MerchantSales: React.FC = () => {
  const { t } = useTranslation()
  const { data: sales = [], isLoading } = useGetSalesListQuery(undefined)
  const [createSale, { isLoading: isCreating }] = useCreateSaleMutation()
  const [updateIncome, { isLoading: isUpdating }] = useUpdateIncomeMutation()
  const [deleteIncome] = useDeleteIncomeMutation()

  const [editingId, setEditingId] = useState<string>("")
  const [lineItems, setLineItems] = useState<
    Array<{ name: string; quantity: number; unitPrice: number; total: number }>
  >([])
  const [itemDraft, setItemDraft] = useState({
    name: "",
    quantity: "1",
    unitPrice: "0",
  })
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENTAGE">("FIXED")
  const [discountValue, setDiscountValue] = useState<string>("0")

  const [form, setForm] = useState({
    amount: "",
    category: "MEDICINE_SALE",
    date: "",
    invoiceNo: "",
    partyName: "",
    note: "",
  })

  const resetForm = () => {
    setEditingId("")
    setLineItems([])
    setItemDraft({ name: "", quantity: "1", unitPrice: "0" })
    setDiscountType("FIXED")
    setDiscountValue("0")
    setForm({
      amount: "",
      category: "MEDICINE_SALE",
      date: "",
      invoiceNo: "",
      partyName: "",
      note: "",
    })
  }

  const subTotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [lineItems]
  )

  const rawSubTotal = lineItems.length > 0 ? subTotal : Number(form.amount || 0)
  const numDiscountValue = Number(discountValue || 0)

  const calculatedDiscount =
    discountType === "PERCENTAGE"
      ? Math.round(((rawSubTotal * Math.min(100, Math.max(0, numDiscountValue))) / 100) * 100) / 100
      : Math.min(rawSubTotal, Math.max(0, numDiscountValue))

  const totalAmount = Math.max(0, rawSubTotal - calculatedDiscount)

  const addLineItem = () => {
    if (!itemDraft.name.trim()) return

    const quantity = Math.max(1, Number(itemDraft.quantity || 1))
    const unitPrice = Math.max(0, Number(itemDraft.unitPrice || 0))
    const total = quantity * unitPrice

    setLineItems((prev) => [
      ...prev,
      { name: itemDraft.name.trim(), quantity, unitPrice, total },
    ])
    setItemDraft({ name: "", quantity: "1", unitPrice: "0" })
  }

  const removeLineItem = (index: number) => {
    setLineItems((prev) =>
      prev.filter((_item, itemIndex) => itemIndex !== index)
    )
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.amount && lineItems.length === 0) return

    const body = {
      amount: totalAmount,
      category: form.category,
      date: form.date || undefined,
      invoiceDate: form.date || undefined,
      invoiceNo: form.invoiceNo || undefined,
      partyName: form.partyName || undefined,
      note: form.note || undefined,
      lineItems,
      subTotal: rawSubTotal,
      discount: calculatedDiscount,
      totalAmount,
    }

    try {
      if (editingId) {
        await updateIncome({ incomeId: editingId, body }).unwrap()
        toast.success(t("sale_updated_success") || "Sale updated successfully")
      } else {
        await createSale(body).unwrap()
        toast.success(t("sale_added_success") || "Sale added successfully")
      }

      resetForm()
    } catch (error: any) {
      toast.error(t("failed") || "Failed", {
        description: error?.data?.message || t("could_not_save_sale") || "Could not save sale",
      })
    }
  }

  const onEdit = (sale: any) => {
    setEditingId(sale._id)
    setForm({
      amount: String(sale.subTotal || sale.totalAmount || sale.amount || ""),
      category: sale.category || "MEDICINE_SALE",
      date: sale.invoiceDate
        ? format(new Date(sale.invoiceDate), "yyyy-MM-dd")
        : sale.date
          ? format(new Date(sale.date), "yyyy-MM-dd")
          : "",
      invoiceNo: sale.invoiceNo || "",
      partyName: sale.partyName || "",
      note: sale.note || "",
    })
    setDiscountType("FIXED")
    setDiscountValue(String(sale.discount || 0))
    setLineItems(Array.isArray(sale.lineItems) ? sale.lineItems : [])
  }

  const onDelete = async (id: string) => {
    try {
      await deleteIncome(id).unwrap()
      toast.success(t("sale_deleted_success") || "Sale deleted")
      if (editingId === id) {
        resetForm()
      }
    } catch (error: any) {
      toast.error(t("delete_failed") || "Delete failed", {
        description: error?.data?.message || t("could_not_delete_sale") || "Could not delete sale",
      })
    }
  }

  const columns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: "invoiceNo",
        header: t("invoice_no") || "Invoice",
        cell: (row) => row.invoiceNo || "-",
      },
      {
        id: "date",
        header: t("date") || "Date",
        cell: (row) =>
          row.invoiceDate
            ? format(new Date(row.invoiceDate), "MMM dd, yyyy")
            : row.date
              ? format(new Date(row.date), "MMM dd, yyyy")
              : "-",
      },
      {
        id: "category",
        header: t("category") || "Category",
        cell: (row) => <Badge variant="outline">{row.category}</Badge>,
      },
      {
        id: "party",
        header: t("customer_name") || "Customer",
        cell: (row) => row.partyName || "-",
      },
      {
        id: "amount",
        header: t("net_payable") || "Amount",
        className: "font-medium text-emerald-700",
        cell: (row) =>
          `৳${Number(row.totalAmount || row.amount || 0).toLocaleString()}`,
      },
      {
        id: "discount",
        header: t("discount") || "Discount",
        className: "text-rose-600 font-medium",
        cell: (row) =>
          row.discount ? `-৳${Number(row.discount).toLocaleString()}` : "-",
      },
      {
        id: "items",
        header: t("items") || "Items",
        cell: (row) => `${(row.lineItems || []).length}`,
      },
      {
        id: "actions",
        header: t("actions") || "Actions",
        cell: (row) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
              {t("edit") || "Edit"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(row._id)}
            >
              {t("delete") || "Delete"}
            </Button>
          </div>
        ),
      },
    ],
    [editingId, t]
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("sales") || "Sales"}
        </h1>
        <p className="text-muted-foreground">
          {t("sales_crud_desc") || "Manage counter sales, pharmacy receipts, and discounts"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? t("update_sale") || "Update Sale" : t("add_sale") || "Add Sale"}
          </CardTitle>
          <CardDescription>
            {t("create_update_sales_desc") || "Create and update merchant sales entries"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("amount") || "Amount (৳)"} {lineItems.length > 0 && `(${t("optional_when_items_used") || "auto from items"})`}
              </label>
              <Input
                type="number"
                placeholder={t("enter_amount") || "Enter base amount"}
                value={form.amount}
                disabled={lineItems.length > 0}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("category") || "Category"}
              </label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                {SALE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("date") || "Date"}
              </label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("invoice_no") || "Invoice No"}
              </label>
              <Input
                placeholder={t("invoice_no_placeholder") || "e.g. INV-9812"}
                value={form.invoiceNo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, invoiceNo: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("customer_name") || "Customer Name"}
              </label>
              <Input
                placeholder={t("customer_name_placeholder") || "e.g. Walk-in Customer"}
                value={form.partyName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, partyName: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("notes") || "Note"}
              </label>
              <Input
                placeholder={t("note_placeholder") || "e.g. Counter sale"}
                value={form.note}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, note: e.target.value }))
                }
              />
            </div>

            {/* Line items section */}
            <div className="space-y-2 rounded-xl border p-3 md:col-span-3 bg-muted/20">
              <p className="text-xs font-bold text-foreground">
                {t("invoice_line_items") || "Invoice Line Items (Optional)"}
              </p>

              <div className="grid gap-2 md:grid-cols-4">
                <Input
                  placeholder={t("item_name") || "Item name"}
                  value={itemDraft.name}
                  onChange={(e) =>
                    setItemDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <Input
                  type="number"
                  placeholder={t("quantity") || "Qty"}
                  value={itemDraft.quantity}
                  onChange={(e) =>
                    setItemDraft((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                />
                <Input
                  type="number"
                  placeholder={t("unit_price") || "Unit price"}
                  value={itemDraft.unitPrice}
                  onChange={(e) =>
                    setItemDraft((prev) => ({
                      ...prev,
                      unitPrice: e.target.value,
                    }))
                  }
                />
                <Button type="button" variant="outline" onClick={addLineItem}>
                  {t("add_item") || "Add Item"}
                </Button>
              </div>

              {lineItems.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {lineItems.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      <span>
                        {item.name} · {item.quantity} x ৳{item.unitPrice}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold font-mono">
                          ৳{item.total.toLocaleString()}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                        >
                          {t("remove") || "Remove"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  <p className="text-right text-xs font-bold text-muted-foreground">
                    {t("subtotal") || "Subtotal"}: ৳{subTotal.toLocaleString()}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Discount Section (% or Fixed) */}
            <div className="p-3.5 rounded-xl border bg-muted/40 md:col-span-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5 text-primary" />
                  {t("discount") || "Discount"}
                </span>

                <div className="flex bg-background p-0.5 rounded-lg border text-xs">
                  <button
                    type="button"
                    onClick={() => setDiscountType("FIXED")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                      discountType === "FIXED"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ৳ {t("fixed") || "Fixed"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("PERCENTAGE")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                      discountType === "PERCENTAGE"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    % {t("percentage") || "Percent"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-semibold mb-1 text-muted-foreground">
                    {discountType === "PERCENTAGE"
                      ? t("discount_percentage_label") || "Discount Percentage (%)"
                      : t("discount_fixed_label") || "Discount Amount (৳)"}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max={discountType === "PERCENTAGE" ? 100 : rawSubTotal}
                    step="0.01"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={
                      discountType === "PERCENTAGE"
                        ? t("enter_discount_percentage") || "e.g. 10%"
                        : t("enter_discount_fixed") || "e.g. 100 ৳"
                    }
                  />
                </div>

                <div className="text-right text-xs space-y-1">
                  <div className="text-muted-foreground">
                    {t("subtotal") || "Subtotal"}:{" "}
                    <span className="font-semibold text-foreground font-mono">
                      ৳{rawSubTotal.toLocaleString()}
                    </span>
                  </div>
                  {calculatedDiscount > 0 && (
                    <div className="text-rose-600 font-semibold">
                      {t("discount") || "Discount"}:{" "}
                      <span className="font-mono">-৳{calculatedDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="font-bold text-emerald-600 text-sm">
                    {t("net_payable") || "Total Payable"}:{" "}
                    <span className="font-mono">৳{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 md:col-span-3 pt-2">
              <Button type="submit" disabled={isCreating || isUpdating}>
                {editingId
                  ? t("update_sale") || "Update Sale"
                  : t("create_sale") || "Create Sale"}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t("cancel") || "Cancel"}
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sales_list") || "Sales List"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">{t("loading_sales") || "Loading sales..."}</p>
          ) : (
            <ClientDataTable
              data={sales as any[]}
              columns={columns}
              getRowId={(row) => row._id}
              emptyMessage={t("no_sales_found") || "No sales found"}
              searchKeys={[
                (row) => row.invoiceNo,
                (row) => row.partyName,
                (row) => row.category,
              ]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MerchantSales
