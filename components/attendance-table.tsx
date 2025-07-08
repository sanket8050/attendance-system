"use client"

import { useState } from "react"
import { DownloadIcon, FileDown, Search, SlidersHorizontal } from "lucide-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type Attendance = {
  id: string
  name: string
  timeIn: string
  status: "On-time" | "Late" | "Early Leave"
  confidenceScore: number
  location: string
  role: string
}

interface AttendanceTableProps {
  data: Attendance[]
}

export function AttendanceTable({ data }: AttendanceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns: ColumnDef<Attendance>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const name = row.getValue("name") as string
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${initials}`} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span>{name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "timeIn",
      header: "Time In",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string

        return (
          <Badge variant={status === "On-time" ? "default" : status === "Late" ? "destructive" : "outline"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "confidenceScore",
      header: "Confidence",
      cell: ({ row }) => {
        const score = row.getValue("confidenceScore") as number

        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full ${score >= 90 ? "bg-green-500" : score >= 75 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-xs">{score}%</span>
          </div>
        )
      },
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search attendance records..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="h-9">
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}

