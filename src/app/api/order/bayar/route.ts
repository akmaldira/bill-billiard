import { authOption } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOption);
    const user = session?.user;
    if (!user || !user.email) throw new Error("Unauthorized");

    const { orderId, note } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error("Pesanan tidak ditemukan");

    if (order.paid === true) throw new Error("Pesanan sudah dibayar");

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paid: true,
        note,
      },
    });

    return NextResponse.json(
      {
        message: "Pesanan berhasil dibayar",
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      console.log(error);
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    } else {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: 400 }
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}
