"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, CheckCircle, ChevronDown, Clock, Edit, MoreHorizontal, Plus, Trash2, XCircle } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pembayaran, Rekening, Siswa } from "@/types"
import { PembayaranStatusDialog } from "./pembayaran-status-dialog"

interface DataTableProps {
  data: Pembayaran[]
  onEdit: (pembayaran: Pembayaran) => void
  onDelete: (pembayaranId: number) => void
  onAdd: () => void
}

// Format currency to Indonesian Rupiah
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Get amount by jenis pembayaran kode
const getAmountByJenis = (pembayaran: Pembayaran, kode: string) => {
  if (!pembayaran.details) {
    return 0
  }
  
  const detail = pembayaran.details.find(d => {
    // Access jenis_pembayaran using snake_case as received from Laravel
    const jenisPembayaran = (d as any).jenis_pembayaran
    return jenisPembayaran?.kode === kode
  })
  
  return detail ? Number(detail.jumlah) : 0
}

export function PembayaranDataTable({ data, onEdit, onDelete, onAdd }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)
  const [selectedPembayaran, setSelectedPembayaran] = React.useState<Pembayaran | null>(null)

  const columns: ColumnDef<Pembayaran>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-2"
          >
            NO
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium text-center">{row.getValue("id")}</div>,
    },
    {
      id: "siswa_nama",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            NAMA
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.siswa?.nama || '-'}
        </div>
      ),
    },
    {
      accessorKey: "siswa.kelas",
      header: "KELAS",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {row.original.siswa?.kelas || '-'}
        </Badge>
      ),
    },
    {
      id: "psb",
      header: "PSB",
      cell: ({ row }) => {
        const amount = getAmountByJenis(row.original, 'PSB')
        return (
          <div className="text-center">
            {amount > 0 ? (
              <span className="text-green-600 font-medium">
                {formatCurrency(amount)}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        )
      },
    },
    {
      id: "spp", 
      header: "SPP",
      cell: ({ row }) => {
        const amount = getAmountByJenis(row.original, 'SPP')
        return (
          <div className="text-center">
            {amount > 0 ? (
              <span className="text-blue-600 font-medium">
                {formatCurrency(amount)}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        )
      },
    },
    {
      id: "gerak",
      header: "GERAK", 
      cell: ({ row }) => {
        const amount = getAmountByJenis(row.original, 'GERAK')
        return (
          <div className="text-center">
            {amount > 0 ? (
              <span className="text-orange-600 font-medium">
                {formatCurrency(amount)}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        )
      },
    },
    {
      id: "ujian",
      header: "UJIAN",
      cell: ({ row }) => {
        const amount = getAmountByJenis(row.original, 'UJIAN')
        return (
          <div className="text-center">
            {amount > 0 ? (
              <span className="text-purple-600 font-medium">
                {formatCurrency(amount)}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "jumlah",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            JUMLAH
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-bold text-green-600">
          {formatCurrency(Number(row.getValue("jumlah")))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "AKSI",
      enableHiding: false,
      cell: ({ row }) => {
        const pembayaran = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(pembayaran.id.toString())}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(pembayaran)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPembayaran(pembayaran)
                  setStatusDialogOpen(true)
                }}
              >
                {pembayaran.status === 'pending' && <Clock className="mr-2 h-4 w-4 text-yellow-500" />}
                {pembayaran.status === 'disetujui' && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                {pembayaran.status === 'ditolak' && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                Update Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(pembayaran.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Cari nama siswa..."
          value={(table.getColumn("siswa_nama")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("siswa_nama")?.setFilterValue(event.target.value)
          }
          className="max-w-sm focus:ring-green-500 focus:border-green-500"
        />
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
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
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            onClick={onAdd}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Data
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold text-gray-700">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <PembayaranStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        pembayaran={selectedPembayaran}
      />
    </div>
  )
}

// Export interfaces for use in other components
export type { Pembayaran, Rekening, Siswa }

