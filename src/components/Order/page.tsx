"use client";
import { startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  poolTableId: string;
  poolTableName: string;
  poolTablePrice: number;
  costumerName: string;
  duration: number;
  paid: boolean;
  note?: string;
  pausedAt?: Date;
  orderItems: OrderItem[];
  createdAt: Date;
  totalPrice?: number;
};

export default function OrderContentComponents() {
  const [data, setData] = useState<Order[]>([]);
  const [date, setDate] = useState(startOfDay(new Date()));
  const [loading, setLoading] = useState(true);

  const getOrders = async () => {
    setLoading(true);
    const res = await fetch(`/api/order?date=${date}`);
    const { orders } = await res.json();
    return orders;
  };

  useEffect(() => {
    getOrders().then((orders) => {
      setLoading(false);
      setData(orders);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const afterPay = () => {
    setLoading(true);
    getOrders().then((orders) => {
      setLoading(false);
      setData(orders);
    });
  };

  return (
    <div className="mx-auto">
      <DataTable
        data={data}
        loading={loading}
        afterPay={afterPay}
        onDateChange={(date) => setDate(date ?? startOfDay(new Date()))}
      />
    </div>
  );
}
