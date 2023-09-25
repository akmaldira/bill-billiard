import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const monthString = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export async function GET(req: Request) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        poolTable: {
          select: {
            name: true,
            price: true,
          },
        },
        orderItems: {
          select: {
            item: {
              select: {
                name: true,
                price: true,
              },
            },
            quantity: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const summary: {
      name: string;
      totalPaidOrder: number;
      totalUnpaidOrder: number;
      totalPaidFnb: number;
      totalUnpaidFnb: number;
    }[] = [];
    orders.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      const monthYear = `${monthString[month]}`;
      const index = summary.findIndex((item) => item.name === monthYear);
      if (index === -1) {
        if (!order.paid) {
          summary.push({
            name: monthYear,
            totalPaidOrder: 0,
            totalPaidFnb: 0,
            totalUnpaidOrder: order.poolTable.price * order.duration,
            totalUnpaidFnb: order.orderItems.reduce((acc, item) => {
              return acc + item.quantity * item.item.price;
            }, 0),
          });
        } else {
          summary.push({
            name: monthYear,
            totalPaidOrder: order.poolTable.price * order.duration,
            totalPaidFnb: order.orderItems.reduce((acc, item) => {
              return acc + item.quantity * item.item.price;
            }, 0),
            totalUnpaidOrder: 0,
            totalUnpaidFnb: 0,
          });
        }
      } else {
        if (!order.paid) {
          summary[index].totalUnpaidOrder +=
            order.poolTable.price * order.duration;
          summary[index].totalUnpaidFnb += order.orderItems.reduce(
            (acc, item) => {
              return acc + item.quantity * item.item.price;
            },
            0
          );
        } else {
          summary[index].totalPaidOrder +=
            order.poolTable.price * order.duration;
          summary[index].totalPaidFnb += order.orderItems.reduce(
            (acc, item) => {
              return acc + item.quantity * item.item.price;
            },
            0
          );
        }
      }
    });

    return NextResponse.json({ summary }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
