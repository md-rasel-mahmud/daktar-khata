import React, { useMemo, useState } from "react"
import { format } from "date-fns"
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
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ClientDataTable,
  type DataTableColumn,
} from "@/components/common/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const SALE_CATEGORIES = [
  "CONSULTATION_FEE",
  "SURGERY_FEE",
  "CABIN_RENT",
  "TEST_FEE",
  "MEDICINE_SALE",
  "OTHER",
]

const MerchantSales: React.FC = () => {
  const { data: sales = [], isLoading } = useGetSalesListQuery(undefined)
  const [createSale, { isLoading: isCreating }] = useCreateSaleMutation()
  const [updateIncome, { isLoading: isUpdating }] = useUpdateIncomeMutation()
  const [deleteIncome, { isLoading: isDeleting }] = useDeleteIncomeMutation()

  const [editingId, setEditingId] = useState<string>("")
  const [lineItems, setLineItems] = useState<
    Array<{ name: string; quantity: number; unitPrice: number; total: number }>
  >([])
  const [itemDraft, setItemDraft] = useState({
    name: "",
    quantity: "1",
    unitPrice: "0",
  })
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

    if (!form.amount) return

    const computedAmount = lineItems.length > 0 ? subTotal : Number(form.amount)

    const body = {
      amount: computedAmount,
      category: form.category,
      date: form.date || undefined,
      invoiceDate: form.date || undefined,
      invoiceNo: form.invoiceNo || undefined,
      partyName: form.partyName || undefined,
      note: form.note || undefined,
      lineItems,
      subTotal,
      totalAmount: computedAmount,
    }

    try {
      if (editingId) {
        await updateIncome({ incomeId: editingId, body }).unwrap()
        toast.success("Sale updated")
      } else {
        await createSale(body).unwrap()
        toast.success("Sale added")
      }

      resetForm()
    } catch (error: any) {
      toast.error("Failed", {
        description: error?.data?.message || "Could not save sale",
      })
    }
  }

  const onEdit = (sale: any) => {
    setEditingId(sale._id)
    setForm({
      amount: String(sale.totalAmount || sale.amount || ""),
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
    setLineItems(Array.isArray(sale.lineItems) ? sale.lineItems : [])
  }

  const onDelete = async (id: string) => {
    try {
      await deleteIncome(id).unwrap()
      toast.success("Sale deleted")
      if (editingId === id) {
        resetForm()
      }
    } catch (error: any) {
      toast.error("Delete failed", {
        description: error?.data?.message || "Could not delete sale",
      })
    }
  }

  const columns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: "invoiceNo",
        header: "Invoice",
        cell: (row) => row.invoiceNo || "-",
      },
      {
        id: "date",
        header: "Date",
        cell: (row) =>
          row.invoiceDate
            ? format(new Date(row.invoiceDate), "MMM dd, yyyy")
            : row.date
              ? format(new Date(row.date), "MMM dd, yyyy")
              : "-",
      },
      {
        id: "category",
        header: "Category",
        cell: (row) => <Badge variant="outline">{row.category}</Badge>,
      },
      {
        id: "party",
        header: "Customer",
        cell: (row) => row.partyName || "-",
      },
      {
        id: "amount",
        header: "Amount",
        className: "font-medium text-emerald-700",
        cell: (row) =>
          `৳${Number(row.totalAmount || row.amount || 0).toLocaleString()}`,
      },
      {
        id: "items",
        header: "Items",
        cell: (row) => `${(row.lineItems || []).length}`,
      },
      {
        id: "actions",
        header: "Actions",
        cell: (row) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(row._id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [editingId]
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
        <p className="text-muted-foreground">Sales CRUD with invoice support</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Update Sale" : "Add Sale"}</CardTitle>
          <CardDescription>
            Create and update merchant sales entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
            <Input
              type="number"
              placeholder="Amount (optional when line items used)"
              value={form.amount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, amount: e.target.value }))
              }
            />

            <select
              className="h-10 rounded-md border bg-background px-3"
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

            <Input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
            />

            <Input
              placeholder="Invoice No"
              value={form.invoiceNo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, invoiceNo: e.target.value }))
              }
            />

            <Input
              placeholder="Customer Name"
              value={form.partyName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, partyName: e.target.value }))
              }
            />

            <Input
              placeholder="Note"
              value={form.note}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, note: e.target.value }))
              }
            />

            <div className="space-y-2 rounded-md border p-3 md:col-span-3">
              <p className="text-sm font-medium">Invoice Line Items</p>

              <div className="grid gap-2 md:grid-cols-4">
                <Input
                  placeholder="Item name"
                  value={itemDraft.name}
                  onChange={(e) =>
                    setItemDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Qty"
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
                  placeholder="Unit price"
                  value={itemDraft.unitPrice}
                  onChange={(e) =>
                    setItemDraft((prev) => ({
                      ...prev,
                      unitPrice: e.target.value,
                    }))
                  }
                />
                <Button type="button" variant="outline" onClick={addLineItem}>
                  Add Item
                </Button>
              </div>

              {lineItems.length > 0 ? (
                <div className="space-y-2">
                  {lineItems.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                    >
                      <span>
                        {item.name} · {item.quantity} x {item.unitPrice}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          ৳{item.total.toLocaleString()}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <p className="text-right text-sm font-medium">
                    Subtotal: ৳{subTotal.toLocaleString()}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2 md:col-span-3">
              <Button type="submit" disabled={isCreating || isUpdating}>
                {editingId ? "Update" : "Create"}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading sales...</p>
          ) : (
            <ClientDataTable
              data={sales as any[]}
              columns={columns}
              getRowId={(row) => row._id}
              emptyMessage="No sales found"
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
