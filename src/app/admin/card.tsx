"use client";
import { CalendarDateRangePicker } from "@/components/DateRangePicker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { endOfMonth, startOfMonth } from "date-fns";
import { Coins, ListOrdered, Users, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import Overview from "./overview";
import { UnPaidOrder } from "./unpaid-order";

export type PoolTable = {
  name: string;
  price: number;
};

export type Item = {
  name: string;
  price: number;
};

export type OrderItem = {
  item: Item;
  quantity: number;
};

export type CreatedBy = {
  name: string;
  email: string;
};

export type Order = {
  costumerName: string;
  duration: number;
  poolTable: PoolTable;
  orderItems: OrderItem[];
  paid: boolean;
  timeOut: boolean;
  note?: string | null;
  createdAt: string | Date;
  createdBy: CreatedBy;
  pausedAt?: Date | string | null;
};

export type User = {
  name: string;
  email: string;
  role: string;
  createdAt: string | string;
};

export type Summary = {
  name: string;
  totalPaidOrder: number;
  totalUnpaidOrder: number;
  totalPaidFnb: number;
  totalUnpaidFnb: number;
};

const getOrders = async (date: DateRange): Promise<Order[]> => {
  const res = await fetch(
    `/api/dashboard/order?from=${date?.from}&to=${date?.to}`
  );
  const { orders } = await res.json();
  return orders;
};

const getUsers = async (): Promise<User[]> => {
  const res = await fetch(`/api/dashboard/pengguna`);
  const { users } = await res.json();
  return users;
};

const getSummary = async (): Promise<Summary[]> => {
  const res = await fetch(`/api/dashboard/summary`);
  const { summary } = await res.json();
  return summary;
};

export default function AdminCard() {
  const [loading, setLoading] = useState<boolean>(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [paidOrders, setPaidOrders] = useState<Order[]>([]);
  const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([]);
  const [totalPaidOrders, setTotalPaidOrders] = useState<number>(0);
  const [totalUnpaidOrders, setTotalUnpaidOrders] = useState<number>(0);
  const [totalPaidFnb, setTotalPaidFnb] = useState<number>(0);
  const [totalUnpaidFnb, setTotalUnpaidFnb] = useState<number>(0);
  const [totalSummary, setTotalSummary] = useState<Summary[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const numberOfPaidOrders = paidOrders.length;
  const numberOfUnpaidOrders = unpaidOrders.length;

  const getAllData = async (date: DateRange | undefined) => {
    setLoading(true);
    const [orders, users, summary] = await Promise.all([
      getOrders(date!),
      getUsers(),
      getSummary(),
    ]);
    setOrders(orders);
    setTotalPaidOrders(
      orders.reduce((acc, order) => {
        if (!order.paid) {
          return acc;
        }
        return acc + order.poolTable.price * order.duration;
      }, 0)
    );
    setTotalUnpaidOrders(
      orders.reduce((acc, order) => {
        if (order.paid) {
          return acc;
        }
        return acc + order.poolTable.price * order.duration;
      }, 0)
    );
    setUnpaidOrders(orders.filter((order) => !order.paid));
    setPaidOrders(orders.filter((order) => order.paid));
    setTotalPaidFnb(
      orders.reduce((acc, order) => {
        if (!order.paid) {
          return acc;
        }
        return (
          acc +
          order.orderItems.reduce((acc, item) => {
            return acc + item.quantity * item.item.price;
          }, 0)
        );
      }, 0)
    );
    setTotalUnpaidFnb(
      orders.reduce((acc, order) => {
        if (order.paid) {
          return acc;
        }
        return (
          acc +
          order.orderItems.reduce((acc, item) => {
            return acc + item.quantity * item.item.price;
          }, 0)
        );
      }, 0)
    );
    setUsers(users);
    setTotalSummary(summary);
    setLoading(false);
  };

  useEffect(() => {
    getAllData(date);
  }, [date]);

  return (
    <div className="flex-1 space-y-4 py-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker date={date} setDate={setDate} />
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pendapatan Meja
              </CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(totalPaidOrders) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Belum dibayar{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(totalUnpaidOrders) || 0}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Penjualan F&B
              </CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(totalPaidFnb) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Belum dibayar{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(totalUnpaidFnb) || 0}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jumlah Order
              </CardTitle>
              <ListOrdered className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{numberOfPaidOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Belum dibayar {numberOfUnpaidOrders}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jumlah Pengguna
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Admin {users.filter((user) => user.role === "ADMIN").length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kasir{" "}
                    {users.filter((user) => user.role === "CASHIER").length}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview summary={totalSummary} />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Order yang belum dibayar</CardTitle>
              <CardDescription>
                Orderan dibawah ini adalah orderan yang belum diklik bayar oleh
                kasir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnPaidOrder orders={unpaidOrders} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
