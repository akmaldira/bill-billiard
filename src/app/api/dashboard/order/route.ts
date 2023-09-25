import { prisma } from "@/lib/db";
import { endOfMonth, startOfMonth } from "date-fns";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    let from = url.searchParams.get("from") as Date | string | null | undefined;
    let to = url.searchParams.get("to") as Date | string | null | undefined;

    if (!from || isNaN(new Date(from).getTime())) {
      from = startOfMonth(new Date());
    }

    if (!to || isNaN(new Date(to).getTime())) {
      to = endOfMonth(new Date());
    }

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
      where: {
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
