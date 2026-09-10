import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { type DataTableColumn, type DataTableSortState } from "./types"

type ServerDataTableProps<TData> = {
  data: TData[]
  columns: DataTableColumn<TData>[]
  getRowId: (row: TData, index: number) => string
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  emptyMessage?: string
  isLoading?: boolean
  className?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  sortState?: DataTableSortState | null
  onSortChange?: (nextSort: DataTableSortState | null) => void
}

export function ServerDataTable<TData>({
  data,
  columns,
  getRowId,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  emptyMessage = "No data found.",
  isLoading = false,
  className,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  sortState,
  onSortChange,
}: ServerDataTableProps<TData>) {
  const { t } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)

  const toggleSort = (columnId: string, isSortable?: boolean) => {
    if (!onSortChange || !isSortable) {
      return
    }

    if (!sortState || sortState.columnId !== columnId) {
      onSortChange({ columnId, direction: "asc" })
      return
    }

    if (sortState.direction === "asc") {
      onSortChange({ columnId, direction: "desc" })
      return
    }

    onSortChange(null)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onSearchChange ? (
          <Input
            type="search"
            value={searchValue ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full sm:max-w-sm"
          />
        ) : (
          <div />
        )}

        {onPageSizeChange ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("rows per page")}</span>
            <select
              className="h-9 rounded-md border bg-background px-2 text-foreground"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.headerClassName}>
                {column.sortable && onSortChange ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="-ml-2 h-8 px-2"
                    onClick={() => toggleSort(column.id, column.sortable)}
                  >
                    {column.header}
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                {t("loading")}
              </TableCell>
            </TableRow>
          ) : data.length ? (
            data.map((row, index) => (
              <TableRow key={getRowId(row, index)}>
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          {t("showing range of total", {
            start: (safePage - 1) * pageSize + (data.length ? 1 : 0),
            end: (safePage - 1) * pageSize + data.length,
            total,
          })}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(safePage - 1, 1))}
            disabled={safePage <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("previous")}
          </Button>
          <span className="text-muted-foreground">
            {t("page x of y", { page: safePage, totalPages })}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(safePage + 1, totalPages))}
            disabled={safePage >= totalPages}
          >
            {t("next")}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
