import { type ReactNode } from "react"

export type DataTableSortDirection = "asc" | "desc"

export type DataTableColumn<TData> = {
  id: string
  header: ReactNode
  cell: (row: TData) => ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
  sortValue?: (
    row: TData
  ) => string | number | boolean | Date | null | undefined
}

export type DataTableSortState = {
  columnId: string
  direction: DataTableSortDirection
}
