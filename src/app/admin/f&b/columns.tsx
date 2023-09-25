"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Beer, Sandwich, UtensilsCrossed } from "lucide-react";
import { AddData } from "./add-data";
import { DeleteData } from "./delete-data";

export type FoodAndBeverage = {
  id: string;
  image?: string | null;
  name: string;
  price: number;
  stock: number;
  category: "food" | "beverage" | "other";
  active: boolean;
};

export const columns: ColumnDef<FoodAndBeverage>[] = [
  {
    accessorKey: "image",
    header: "Foto",
    cell: ({ row }) => {
      const image = row.getValue("image") as string | null;
      const category = row.getValue("category") as
        | "food"
        | "beverage"
        | "other";
      const categoryIdLang = {
        food: <Sandwich />,
        beverage: <Beer />,
        other: <UtensilsCrossed />,
      };
      return image ? (
        <div className="flex items-center justify-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={image} alt="img" />
            <AvatarFallback>{categoryIdLang[category]}</AvatarFallback>
          </Avatar>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {categoryIdLang[category]}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Nama Produk",
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Harga
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
    accessorKey: "stock",
    header: "Stok",
  },
  {
    accessorKey: "category",
    header: "Kategori",
    cell: ({ row }) => {
      const categoryIdLang = {
        food: "Makanan",
        beverage: "Minuman",
        other: "Lainnya",
      };
      const category = row.getValue("category") as
        | "food"
        | "beverage"
        | "other";

      return <div>{categoryIdLang[category]}</div>;
    },
  },
  {
    accessorKey: "active",
    header: "Dipasarkan?",
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean;

      return <div>{active ? "Ya" : "Tidak"}</div>;
    },
  },
  {
    accessorKey: "id",
    header: "Aksi",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      const image = row.getValue("image") as string | null;
      const name = row.getValue("name") as string;
      const price = (row.getValue("price") + "") as string;
      const stock = (row.getValue("stock") + "") as string;
      const category = (row.getValue("category") + "") as
        | "food"
        | "beverage"
        | "other";
      const active = row.getValue("active") ? "true" : "false";
      const dataValue = { id, image, name, price, stock, category, active };
      return (
        <div className="flex justify-center gap-4">
          <AddData dataValue={dataValue} />
          <DeleteData id={id} name={name} />
        </div>
      );
    },
  },
];
