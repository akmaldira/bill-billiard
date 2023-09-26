"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";

import { DataTablePagination } from "@/components/DataTablePagination";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useExcelDownloder } from "react-xls";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });
  const { ExcelDownloder, Type } = useExcelDownloder();

  return (
    <div>
      <div className="flex items-center py-4 gap-6 justify-between">
        <Input
          placeholder="Filter nama kostumer..."
          value={
            (table.getColumn("costumerName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("costumerName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <ExcelDownloder
          className={buttonVariants()}
          data={{
            Order: data
              .filter((order: any) => order.paid)
              .map((order: any) => ({
                "Nama Kostumer": order.costumerName,
                "Nama Kasir": order.createdBy.name,
                Durasi: order.duration,
                Meja: order.poolTable.name,
                "Waktu Order": order.createdAt,
                "Total Harga": order.totalPrice,
                "Catatan Kasir": order.note,
              })),
          }}
          filename={"order"}
          type={Type.Button}
        >
          Download
        </ExcelDownloder>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
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
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-6">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
