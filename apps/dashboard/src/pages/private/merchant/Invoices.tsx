import React, { useMemo } from "react"
import { format } from "date-fns"
import { useGetInvoicesQuery } from "@/lib/store/api/services/finance.service"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import {
  ClientDataTable,
  type DataTableColumn,
} from "@/components/common/table"
import { Badge } from "@repo/ui/badge"

const MerchantInvoices: React.FC = () => {
  const { data: invoices = [], isLoading } = useGetInvoicesQuery(undefined)

  const columns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: "invoiceNo",
        header: "Invoice No",
        sortable: true,
        sortValue: (row) => row.invoiceNo,
        cell: (row) => row.invoiceNo || "-",
      },
      {
        id: "transactionType",
        header: "Type",
        sortable: true,
        sortValue: (row) => row.transactionType,
        cell: (row) => (
          <Badge variant="outline">{row.transactionType || "-"}</Badge>
        ),
      },
      {
        id: "category",
        header: "Category",
        sortable: true,
        sortValue: (row) => row.category,
        cell: (row) => row.category,
      },
      {
        id: "party",
        header: "Party",
        sortable: true,
        sortValue: (row) => row.partyName,
        cell: (row) => row.partyName || "-",
      },
      {
        id: "date",
        header: "Date",
        sortable: true,
        sortValue: (row) => new Date(row.invoiceDate || row.date),
        cell: (row) =>
          row.invoiceDate
            ? format(new Date(row.invoiceDate), "MMM dd, yyyy")
            : row.date
              ? format(new Date(row.date), "MMM dd, yyyy")
              : "-",
      },
      {
        id: "amount",
        header: "Amount",
        sortable: true,
        sortValue: (row) => Number(row.totalAmount || row.amount || 0),
        className: "font-medium",
        cell: (row) =>
          `৳${Number(row.totalAmount || row.amount || 0).toLocaleString()}`,
      },
      {
        id: "itemCount",
        header: "Items",
        sortable: true,
        sortValue: (row) => (row.lineItems || []).length,
        cell: (row) => `${(row.lineItems || []).length}`,
      },
    ],
    []
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">
          Unified invoice list from purchase and sale transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Register</CardTitle>
          <CardDescription>All merchant invoices in one place</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading invoices...</p>
          ) : (
            <ClientDataTable
              data={invoices as any[]}
              columns={columns}
              getRowId={(row) => row._id}
              emptyMessage="No invoices found"
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

export default MerchantInvoices
