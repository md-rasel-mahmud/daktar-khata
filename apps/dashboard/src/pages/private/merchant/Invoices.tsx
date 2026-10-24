import React, { useMemo, useState } from "react"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"
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
import { Printer } from "lucide-react"
import {
  InvoicePrintModal,
  type InvoicePrintData,
} from "@/components/common/print"

const MerchantInvoices: React.FC = () => {
  const { t } = useTranslation()
  const { data: invoices = [], isLoading } = useGetInvoicesQuery(undefined)
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] =
    useState<InvoicePrintData | null>(null)

  const columns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: "invoiceNo",
        header: t("invoice_no") || "Invoice No",
        sortable: true,
        sortValue: (row) => row.invoiceNo,
        cell: (row) => (
          <span className="font-bold text-foreground">
            {row.invoiceNo || "-"}
          </span>
        ),
      },
      {
        id: "transactionType",
        header: t("type") || "Type",
        sortable: true,
        sortValue: (row) => row.transactionType,
        cell: (row) => (
          <Badge variant="outline">{row.transactionType || "-"}</Badge>
        ),
      },
      {
        id: "category",
        header: t("category") || "Category",
        sortable: true,
        sortValue: (row) => row.category,
        cell: (row) => row.category,
      },
      {
        id: "party",
        header: t("patient") || "Party / Patient",
        sortable: true,
        sortValue: (row) => row.partyName,
        cell: (row) => (
          <div>
            <div className="font-medium text-foreground">
              {row.partyName || "Counter Customer"}
            </div>
            {row.partyMobile && (
              <div className="text-xs text-muted-foreground">
                {row.partyMobile}
              </div>
            )}
          </div>
        ),
      },
      {
        id: "date",
        header: t("date") || "Date",
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
        header: t("amount") || "Amount",
        sortable: true,
        sortValue: (row) => Number(row.totalAmount || row.amount || 0),
        className: "font-medium",
        cell: (row) => (
          <span className="font-bold text-foreground">
            ৳{Number(row.totalAmount || row.amount || 0).toLocaleString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: t("action") || "Action",
        className: "text-right",
        cell: (row) => {
          const totalAmt = Number(row.totalAmount || row.amount || 0)
          const discountAmt = Number(row.discount || 0)
          const subTotalAmt = Number(row.subTotal || totalAmt + discountAmt)
          const items =
            row.lineItems && row.lineItems.length > 0
              ? row.lineItems.map((item: any) => ({
                  serviceName: item.itemName || item.name || item.serviceName || "Service Item",
                  category: item.category || row.category || "Service",
                  quantity: item.quantity || 1,
                  unitPrice: Number(item.unitPrice || item.rate || totalAmt),
                  total: Number(item.total || item.amount || totalAmt),
                }))
              : [
                  {
                    serviceName: row.category || "General Service / Invoice",
                    category: row.transactionType || "Billing",
                    quantity: 1,
                    unitPrice: subTotalAmt,
                    total: subTotalAmt,
                  },
                ]

          return (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setSelectedInvoiceForPrint({
                    invoiceNumber: row.invoiceNo || "INV-COUNTER",
                    date: row.invoiceDate || row.date || new Date(),
                    lineItems: items,
                    subtotal: subTotalAmt,
                    totalDiscount: discountAmt,
                    grandTotal: totalAmt,
                    paidAmount: totalAmt,
                    dueAmount: 0,
                    paymentMethod: row.paymentMethod || "CASH",
                    patient: {
                      name: row.partyName || "Counter Customer",
                      mobile: row.partyMobile || "N/A",
                    },
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:bg-muted text-xs font-semibold transition"
                title={t("print_invoice")}
              >
                <Printer className="h-3.5 w-3.5 text-primary" />
                {t("print_invoice")}
              </button>
            </div>
          )
        },
      },
    ],
    [t]
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("billing_and_invoices") || "Billing & Invoices"}
        </h1>
        <p className="text-muted-foreground">
          {t("invoices_unified_desc") ||
            "Unified invoice register from transactions, admissions, and counter services"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("invoice_register") || "Invoice Register"}</CardTitle>
          <CardDescription>
            {t("all_invoices_one_place") || "All merchant invoices in one place (A4 & POS thermal print ready)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">{t("loading") || "Loading invoices..."}</p>
          ) : (
            <ClientDataTable
              data={invoices as any[]}
              columns={columns}
              getRowId={(row) => row._id}
              emptyMessage={t("no_invoices_found") || "No invoices found"}
              searchKeys={[
                (row) => row.invoiceNo,
                (row) => row.partyName,
                (row) => row.category,
              ]}
            />
          )}
        </CardContent>
      </Card>

      {/* Invoice Print Modal (A4 & POS) */}
      <InvoicePrintModal
        open={Boolean(selectedInvoiceForPrint)}
        onClose={() => setSelectedInvoiceForPrint(null)}
        data={selectedInvoiceForPrint}
      />
    </div>
  )
}

export default MerchantInvoices
