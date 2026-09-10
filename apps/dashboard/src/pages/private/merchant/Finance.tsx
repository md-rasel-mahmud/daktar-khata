import React, { useMemo, useState } from "react"
import { format } from "date-fns"
import {
  useCreateExpenseMutation,
  useCreateIncomeMutation,
  useGetDashboardFinanceQuery,
  useGetExpenseListQuery,
  useGetIncomeListQuery,
  useGetMonthlyReportQuery,
} from "@/lib/store/api/services/finance.service"
import { type FormInputConfig } from "@/components/common/form/FormInput"
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
import { toast } from "sonner"
import { Badge } from "@repo/ui/badge"
import { type FieldValues, useForm } from "react-hook-form"
import FinanceEntryDialog from "@/features/merchant/components/finance/FinanceEntryDialog"

const INCOME_CATEGORY_OPTIONS = [
  "CONSULTATION_FEE",
  "SURGERY_FEE",
  "CABIN_RENT",
  "TEST_FEE",
  "MEDICINE_SALE",
  "OTHER",
]

const EXPENSE_CATEGORY_OPTIONS = [
  "SALARY",
  "RENT",
  "ELECTRICITY",
  "MEDICINE_PURCHASE",
  "MAINTENANCE",
  "OTHER",
]

const MerchantFinance: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState<number>(currentYear)

  const { data: dashboard = {} } = useGetDashboardFinanceQuery(undefined)
  const { data: monthlyReport = { byMonth: [] } } =
    useGetMonthlyReportQuery(year)
  const { data: incomeList = [] } = useGetIncomeListQuery(undefined)
  const { data: expenseList = [] } = useGetExpenseListQuery(undefined)

  const [createIncome, { isLoading: isCreatingIncome }] =
    useCreateIncomeMutation()
  const [createExpense, { isLoading: isCreatingExpense }] =
    useCreateExpenseMutation()

  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)

  const incomeDefaultValues = {
    amount: 0,
    category: "CONSULTATION_FEE",
    date: "",
  }

  const expenseDefaultValues = {
    amount: 0,
    category: "SALARY",
    date: "",
  }

  const {
    control: incomeControl,
    handleSubmit: handleIncomeSubmit,
    reset: resetIncomeForm,
  } = useForm({
    defaultValues: incomeDefaultValues,
    mode: "all",
  })

  const {
    control: expenseControl,
    handleSubmit: handleExpenseSubmit,
    reset: resetExpenseForm,
  } = useForm({
    defaultValues: expenseDefaultValues,
    mode: "all",
  })

  const recentIncome = useMemo(
    () => (incomeList as any[]).slice(0, 8),
    [incomeList]
  )
  const recentExpense = useMemo(
    () => (expenseList as any[]).slice(0, 8),
    [expenseList]
  )

  const recentIncomeColumns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: "date",
        header: "Date",
        sortable: true,
        sortValue: (item) => (item.date ? new Date(item.date) : null),
        cell: (item) =>
          item.date ? format(new Date(item.date), "MMM dd, yyyy") : "-",
      },
      {
        id: "category",
        header: "Category",
        sortable: true,
        sortValue: (item) => item.category,
        cell: (item) => <Badge variant="outline">{item.category}</Badge>,
      },
      {
        id: "amount",
        header: "Amount",
        sortable: true,
        sortValue: (item) => Number(item.amount || 0),
        className: "font-medium text-emerald-700",
        cell: (item) => `৳${Number(item.amount || 0).toLocaleString()}`,
      },
    ],
    []
  )

  const recentExpenseColumns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: "date",
        header: "Date",
        sortable: true,
        sortValue: (item) => (item.date ? new Date(item.date) : null),
        cell: (item) =>
          item.date ? format(new Date(item.date), "MMM dd, yyyy") : "-",
      },
      {
        id: "category",
        header: "Category",
        sortable: true,
        sortValue: (item) => item.category,
        cell: (item) => <Badge variant="outline">{item.category}</Badge>,
      },
      {
        id: "amount",
        header: "Amount",
        sortable: true,
        sortValue: (item) => Number(item.amount || 0),
        className: "font-medium text-rose-700",
        cell: (item) => `৳${Number(item.amount || 0).toLocaleString()}`,
      },
    ],
    []
  )

  const monthlyReportColumns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: "month",
        header: "Month",
        sortable: true,
        sortValue: (row) => row.month,
        cell: (row) => row.month,
      },
      {
        id: "income",
        header: "Income",
        sortable: true,
        sortValue: (row) => Number(row.totalIncome || 0),
        cell: (row) => `৳${Number(row.totalIncome || 0).toLocaleString()}`,
      },
      {
        id: "expense",
        header: "Expense",
        sortable: true,
        sortValue: (row) => Number(row.totalExpense || 0),
        cell: (row) => `৳${Number(row.totalExpense || 0).toLocaleString()}`,
      },
      {
        id: "net",
        header: "Net",
        sortable: true,
        sortValue: (row) => Number(row.netProfit || 0),
        className: "font-medium",
        cell: (row) => (
          <span
            className={
              Number(row.netProfit || 0) >= 0
                ? "text-blue-700"
                : "text-rose-700"
            }
          >
            ৳{Number(row.netProfit || 0).toLocaleString()}
          </span>
        ),
      },
    ],
    []
  )

  const incomeFormData: FormInputConfig[] = [
    {
      name: "amount",
      label: "Amount",
      type: "number",
      required: true,
      placeholder: "Enter amount",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: INCOME_CATEGORY_OPTIONS.map((category) => ({
        label: category,
        value: category,
      })),
    },
    {
      name: "date",
      label: "Date",
      type: "date",
      placeholder: "Select date",
    },
  ]

  const expenseFormData: FormInputConfig[] = [
    {
      name: "amount",
      label: "Amount",
      type: "number",
      required: true,
      placeholder: "Enter amount",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: EXPENSE_CATEGORY_OPTIONS.map((category) => ({
        label: category,
        value: category,
      })),
    },
    {
      name: "date",
      label: "Date",
      type: "date",
      placeholder: "Select date",
    },
  ]

  const handleCreateIncome = async (values: FieldValues) => {
    try {
      await createIncome({
        amount: Number(values.amount),
        category: values.category,
        date: values.date || undefined,
      }).unwrap()

      toast.success("Income added")
      setIsIncomeDialogOpen(false)
      resetIncomeForm(incomeDefaultValues)
    } catch (error: any) {
      toast.error("Income failed", {
        description: error?.data?.message || "Could not add income",
      })
    }
  }

  const handleCreateExpense = async (values: FieldValues) => {
    try {
      await createExpense({
        amount: Number(values.amount),
        category: values.category,
        date: values.date || undefined,
      }).unwrap()

      toast.success("Expense added")
      setIsExpenseDialogOpen(false)
      resetExpenseForm(expenseDefaultValues)
    } catch (error: any) {
      toast.error("Expense failed", {
        description: error?.data?.message || "Could not add expense",
      })
    }
  }

  const totalIncome = Number(dashboard?.totalIncome || 0)
  const totalExpense = Number(dashboard?.totalExpense || 0)
  const netProfit = Number(dashboard?.netProfit || 0)

  return (
    <div className="fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">
            Track income, expense, and profitability.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsIncomeDialogOpen(true)}>
            Add Income
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsExpenseDialogOpen(true)}
          >
            Add Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">
              ৳{totalIncome.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-rose-600">
              ৳{totalExpense.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-bold ${
                netProfit >= 0 ? "text-blue-600" : "text-rose-600"
              }`}
            >
              ৳{netProfit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Income</CardTitle>
            <CardDescription>
              Latest entries from income ledger.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientDataTable
              data={recentIncome}
              columns={recentIncomeColumns}
              getRowId={(item) => item._id}
              emptyMessage="No income data yet."
              searchPlaceholder="Search income by category..."
              searchKeys={[(item) => item.category]}
              pageSizeOptions={[5, 8, 10]}
              initialPageSize={8}
              defaultSort={{ columnId: "date", direction: "desc" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Expense</CardTitle>
            <CardDescription>
              Latest entries from expense ledger.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientDataTable
              data={recentExpense}
              columns={recentExpenseColumns}
              getRowId={(item) => item._id}
              emptyMessage="No expense data yet."
              searchPlaceholder="Search expense by category..."
              searchKeys={[(item) => item.category]}
              pageSizeOptions={[5, 8, 10]}
              initialPageSize={8}
              defaultSort={{ columnId: "date", direction: "desc" }}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Monthly Report</CardTitle>
            <CardDescription>
              Year-wise income vs expense summary.
            </CardDescription>
          </div>
          <Input
            type="number"
            className="md:w-32"
            value={year}
            onChange={(e) => setYear(Number(e.target.value || currentYear))}
          />
        </CardHeader>
        <CardContent>
          <ClientDataTable
            data={monthlyReport.byMonth || []}
            columns={monthlyReportColumns}
            getRowId={(row) => String(row.month)}
            emptyMessage="No report data found."
            searchPlaceholder="Search by month..."
            searchKeys={[(row) => row.month]}
            pageSizeOptions={[6, 12, 24]}
            initialPageSize={12}
            defaultSort={{ columnId: "month", direction: "asc" }}
          />
        </CardContent>
      </Card>

      <FinanceEntryDialog
        open={isIncomeDialogOpen}
        onOpenChange={setIsIncomeDialogOpen}
        title="Add Income"
        description="Create a new income entry."
        submitLabel="Save Income"
        loadingLabel="Saving..."
        isSubmitting={isCreatingIncome}
        onSubmit={handleIncomeSubmit(handleCreateIncome)}
        onReset={() => resetIncomeForm(incomeDefaultValues)}
        control={incomeControl}
        formData={incomeFormData}
      />

      <FinanceEntryDialog
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        title="Add Expense"
        description="Create a new expense entry."
        submitLabel="Save Expense"
        loadingLabel="Saving..."
        isSubmitting={isCreatingExpense}
        onSubmit={handleExpenseSubmit(handleCreateExpense)}
        onReset={() => resetExpenseForm(expenseDefaultValues)}
        control={expenseControl}
        formData={expenseFormData}
      />
    </div>
  )
}

export default MerchantFinance
