"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order, PoolTable } from "../card";

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "createdAt",
    header: "Tanggal",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;

      return (
        <div>
          {new Intl.DateTimeFormat("id-ID", {
            dateStyle: "full",
          }).format(new Date(createdAt))}
        </div>
      );
    },
  },
  {
    accessorKey: "costumerName",
    header: "Nama Kostumer",
  },
  {
    accessorKey: "duration",
    header: "Durasi",
  },
  {
    accessorKey: "poolTable",
    header: "Meja",
    cell: ({ row }) => {
      const poolTable = row.getValue("poolTable") as PoolTable;

      return <div>{poolTable.name}</div>;
    },
  },
  {
    accessorKey: "paid",
    header: "Dibayar",
    cell: ({ row }) => {
      const paid = row.getValue("paid") as boolean;

      return <div>{paid ? "Sudah" : "Belum"}</div>;
    },
  },
  {
    accessorKey: "id",
    header: "Total Pembayaran",
    cell: ({ row }) => {
      const order = row.original;
      const totalOrderFormatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(order.totalPrice);

      return <div>{totalOrderFormatted}</div>;
    },
  },
  {
    accessorKey: "note",
    header: "Catatan Kasir",
    cell: ({ row }) => {
      const note = row.getValue("note") as string;

      return <div>{note ? note : "Tidak ada"}</div>;
    },
  },
];
