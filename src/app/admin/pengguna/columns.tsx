"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AddData } from "./add-data";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CASHIER" | "USER";
  createdAt: Date;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Nama Pengguna",
  },
  {
    accessorKey: "email",
    header: "Email Pengguna",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;

      return <div>{role === "ADMIN" ? "Admin" : "Kasir"}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal Didaftarkan",
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
    accessorKey: "id",
    header: "Aksi",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;

      return (
        <div>
          <AddData
            dataValue={{
              id: id,
              name: row.getValue("name") as string,
              email: row.getValue("email") as string,
              role: row.getValue("role") as string,
            }}
          />
        </div>
      );
    },
  },
];
