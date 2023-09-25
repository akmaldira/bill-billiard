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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { DatePicker } from "../DatePicker";
import { buttonVariants } from "../ui/button";
import { Order } from "./page";
import PaidOrder from "./paid-order";

interface DataTableProps {
  data: Order[];
  loading: boolean;
  onDateChange: (date: Date | undefined) => void;
  afterPay: () => void;
}

export function DataTable({
  data,
  loading,
  onDateChange,
  afterPay,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "createdAt",
      header: "Waktu Mulai",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        const formattedDate = new Intl.DateTimeFormat("id-ID", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
          timeZone: "Asia/Jakarta",
        }).format(new Date(createdAt));
        return <div>{formattedDate}</div>;
      },
    },
    {
      accessorKey: "costumerName",
      header: "Nama Kostumer",
    },
    {
      accessorKey: "poolTableName",
      header: "Nama Meja",
    },
    {
      accessorKey: "duration",
      header: "Durasi",
      cell: ({ row }) => {
        const duration = row.getValue("duration");

        return <div>{duration + " Jam"}</div>;
      },
    },
    {
      accessorKey: "timeOut",
      header: "Berlangsung?",
      cell: ({ row }) => {
        const order = row.original;
        const now = new Date();

        const createdAt = order.createdAt;
        const duration = order.duration;
        const pausedAt = order.pausedAt;

        const timeStart = new Date(createdAt);
        timeStart.setHours(timeStart.getHours() + duration);

        const remainingTime = timeStart.getTime() - now.getTime();

        return (
          <div
            className={
              !pausedAt && remainingTime > 0
                ? "!bg-available !text-primary " +
                  buttonVariants({
                    variant: pausedAt
                      ? "destructive"
                      : remainingTime <= 0
                      ? "secondary"
                      : "default",
                  })
                : buttonVariants({
                    variant: pausedAt
                      ? "destructive"
                      : remainingTime <= 0
                      ? "secondary"
                      : "default",
                  })
            }
          >
            {pausedAt
              ? "Di Matikan"
              : remainingTime <= 0
              ? "Waktu Habis"
              : "Berlangsung"}
          </div>
        );
      },
    },
    {
      accessorKey: "paid",
      header: "Sudah DIbayar?",
      cell: ({ row }) => {
        const active = row.getValue("paid") as boolean;

        return <div>{active ? "Sudah" : "Belum"}</div>;
      },
    },
    {
      accessorKey: "id",
      header: "Aksi",
      cell: ({ row }) => {
        const order = row.original;
        let price = 0;
        order.note = order.note || "";
        price += order.poolTablePrice * order.duration;

        order.orderItems.forEach((item) => {
          price += item.price * item.quantity;
        });

        order.totalPrice = price;

        return (
          <div className="flex justify-center gap-4">
            {loading ? (
              "Loading..."
            ) : (
              <PaidOrder order={order} afterPay={afterPay} />
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable<Order>({
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

  return (
    <div>
      <div className="flex items-center py-4 gap-6 justify-between">
        <div className="flex w-full justify-between">
          <Input
            placeholder="Filter nama kostumer..."
            value={
              (table.getColumn("costumerName")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("costumerName")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DatePicker onDateChange={onDateChange} />
        </div>
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
