"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { AddData } from "./add-data";
import { DeleteData } from "./delete-data";

export type PoolTable = {
  id: string;
  name: string;
  price: number;
  deviceId: string;
  status: "available" | "unavailable";
  active: boolean;
};

export const columns: ColumnDef<PoolTable>[] = [
  {
    accessorKey: "name",
    header: "Nama Meja",
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Harga Per-Jam
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(price);

      return <div className="text-center">{formatted}</div>;
    },
  },
  {
    accessorKey: "deviceId",
    header: "IoT Device ID",
  },
  {
    accessorKey: "status",
    header: "Status Ketersediaan",
    cell: ({ row }) => {
      const status = row.getValue("status") as "available" | "unavailable";

      return <div>{status == "available" ? "Tersedia" : "Tidak Tersedia"}</div>;
    },
  },
  {
    accessorKey: "active",
    header: "Bisa Digunakan?",
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean;

      return <div>{active ? "Bisa" : "Tidak Bisa"}</div>;
    },
  },
  {
    accessorKey: "id",
    header: "Aksi",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      const name = row.getValue("name") as string;
      const price = (row.getValue("price") + "") as string;
      const deviceId = row.getValue("deviceId") as string;
      const status = row.getValue("status") as "available" | "unavailable";
      const active = row.getValue("active") ? "true" : "false";
      const dataValue = { id, name, price, deviceId, status, active };

      return (
        <div className="flex justify-center gap-4">
          <AddData dataValue={dataValue} />
          <DeleteData id={id} name={name} />
        </div>
      );
    },
  },
];
