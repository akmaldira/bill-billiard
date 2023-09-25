"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Summary } from "./card";

type OverviewProps = {
  summary: Summary[];
};

export default function Overview({ summary }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        width={500}
        height={300}
        data={summary}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            new Intl.NumberFormat("id-ID").format(value)
          }
        />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="totalPaidOrder"
          name="Meja Dibayar"
          stackId="a"
          fill="#18e733"
        />
        <Bar
          dataKey="totalUnpaidOrder"
          name="Meja Belum Dibayar"
          stackId="a"
          fill="#db321c"
        />
        <Bar
          dataKey="totalPaidFnb"
          name="F&B Dibayar"
          stackId="a"
          fill="#fbff00"
        />
        <Bar
          dataKey="totalUnpaidFnb"
          name="F&B belum Dibayar"
          stackId="a"
          fill="#ffaa00"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
