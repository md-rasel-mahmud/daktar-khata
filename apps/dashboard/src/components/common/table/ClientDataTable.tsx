import { useMemo, useState } from "react"
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table"
import { cn } from "@/lib/utils"

import {
  type DataTableColumn,
  type DataTableSortDirection,
  type DataTableSortState,
} from "./types"

type ClientDataTableProps<TData> = {
  data: TData[]
  columns: DataTableColumn<TData>[]
  getRowId: (row: TData, index: number) => string
  emptyMessage?: string
  className?: string
  pageSizeOptions?: number[]
  initialPageSize?: number
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchKeys?: Array<(row: TData) => string | number | null | undefined>
  defaultSort?: DataTableSortState
}

const normalizeText = (value: string | number | null | undefined): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()

const comparePrimitive = (
  left: string | number | boolean | Date | null | undefined,
  right: string | number | boolean | Date | null | undefined,
  direction: DataTableSortDirection
): number => {
  const leftComparable =
    left instanceof Date
      ? left.getTime()
      : typeof left === "boolean"
        ? Number(left)
        : (left ?? "")
  const rightComparable =
    right instanceof Date
      ? right.getTime()
      : typeof right === "boolean"
        ? Number(right)
        : (right ?? "")

  const result =
    typeof leftComparable === "number" && typeof rightComparable === "number"
      ? leftComparable - rightComparable
      : String(leftComparable).localeCompare(
          String(rightComparable),
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          }
        )

  return direction === "asc" ? result : result * -1
}

export function ClientDataTable<TData>({
  data,
  columns,
  getRowId,
  emptyMessage = "No data found.",
  className,
  pageSizeOptions = [5, 10, 20],
  initialPageSize = 10,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  searchKeys = [],
  defaultSort,
}: ClientDataTableProps<TData>) {
  const { t } = useTranslation()
  const [internalSearch, setInternalSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [sortState, setSortState] = useState<DataTableSortState | null>(
    defaultSort ?? null
  )

  const query = searchValue ?? internalSearch

  const filteredRows = useMemo(() => {
    if (!query.trim()) {
      return data
    }

    const normalizedQuery = normalizeText(query)

    return data.filter((row) =>
      searchKeys.some((keyGetter) =>
        normalizeText(keyGetter(row)).includes(normalizedQuery)
      )
    )
  }, [data, query, searchKeys])

  const sortedRows = useMemo(() => {
    if (!sortState) {
      return filteredRows
    }

    const activeColumn = columns.find(
      (column) => column.id === sortState.columnId
    )
    if (!activeColumn?.sortable) {
      return filteredRows
    }

    const getSortValue =
      activeColumn.sortValue ??
      ((row: TData) => {
        const value = activeColumn.cell(row)
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          return value
        }
        return ""
      })

    return [...filteredRows].sort((left, right) =>
      comparePrimitive(
        getSortValue(left),
        getSortValue(right),
        sortState.direction
      )
    )
  }, [columns, filteredRows, sortState])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const pagedRows = sortedRows.slice(start, start + pageSize)

  const onQueryChange = (value: string) => {
    setPage(1)
    if (onSearchChange) {
      onSearchChange(value)
      return
    }
    setInternalSearch(value)
  }

  const onSortToggle = (column: DataTableColumn<TData>) => {
    if (!column.sortable) {
      return
    }

    setPage(1)
    setSortState((previous) => {
      if (!previous || previous.columnId !== column.id) {
        return { columnId: column.id, direction: "asc" }
      }

      if (previous.direction === "asc") {
        return { columnId: column.id, direction: "desc" }
      }

      return null
    })
  }

  const onPageSizeChange = (value: string) => {
    const nextSize = Number(value)
    if (!Number.isFinite(nextSize) || nextSize <= 0) {
      return
    }
    setPageSize(nextSize)
    setPage(1)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-full sm:max-w-sm"
        />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t("rows per page")}</span>
          <select
            className="h-9 rounded-md border bg-background px-2 text-foreground"
            value={pageSize}
            onChange={(event) => onPageSizeChange(event.target.value)}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.headerClassName}>
                {column.sortable ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="-ml-2 h-8 px-2"
                    onClick={() => onSortToggle(column)}
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
          {pagedRows.length ? (
            pagedRows.map((row, index) => (
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
            start: sortedRows.length ? start + 1 : 0,
            end: Math.min(start + pageSize, sortedRows.length),
            total: sortedRows.length,
          })}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
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
            onClick={() =>
              setPage((previous) => Math.min(previous + 1, totalPages))
            }
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
