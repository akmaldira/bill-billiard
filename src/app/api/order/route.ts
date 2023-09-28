import { authOption } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { turnOff, turnOn } from "@/lib/mqtt";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

const orderSchema = z.object({
  orderId: z.optional(z.string()),
  poolTableId: z.string().min(1, "Meja harus diisi"),
  costumerName: z
    .string()
    .min(1, "Nama harus diisi")
    .max(100, "Nama maksimal 100 karakter"),
  duration: z
    .number({
      errorMap: (error) => ({
        message: `Durasi harus diisi`,
      }),
    })
    .min(1, "Durasi harus diisi"),
  foodAndBeverage: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "F&B harus diisi"),
      quantity: z
        .number({
          errorMap: (error) => ({
            message: `Qty harus diisi`,
          }),
        })
        .min(1, "Qty harus diisi"),
    })
  ),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const id = url.searchParams.get("id") as string;

    if (id) {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          poolTable: true,
          orderItems: {
            select: {
              item: true,
              quantity: true,
            },
          },
        },
      });

      return NextResponse.json({ order }, { status: 200 });
    }

    let date = url.searchParams.get("date") as Date | string;

    if (!isNaN(new Date(date ?? "").getTime())) {
      date = new Date(date);
    } else {
      date = new Date();
    }

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const orders = await prisma.order.findMany({
      select: {
        id: true,
        poolTableId: true,
        poolTable: {
          select: {
            name: true,
            price: true,
          },
        },
        costumerName: true,
        duration: true,
        paid: true,
        createdAt: true,
        note: true,
        pausedAt: true,
        orderItems: {
          select: {
            item: true,
            quantity: true,
          },
        },
      },
      where: {
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(
      {
        orders: orders.map((order) => ({
          ...order,
          poolTableName: order.poolTable.name,
          poolTablePrice: order.poolTable.price,
          createdAt: new Date(order.createdAt),
          orderItems: order.orderItems.map((orderItem) => ({
            ...orderItem,
            name: orderItem.item.name,
            price: orderItem.item.price,
          })),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Terjadi error saat mengambil data",
      },
      { status: 400 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOption);
    const user = session?.user;
    if (!user || !user.email) throw new Error("Unauthorized");

    const body = await req.json();

    const { poolTableId, costumerName, duration, foodAndBeverage } =
      orderSchema.parse(body);

    const poolTable = await prisma.poolTable.findUnique({
      where: { id: poolTableId },
    });

    if (!poolTable) throw new Error("Meja tidak ditemukan");
    if (poolTable.status !== "available")
      throw new Error("Meja sedang digunakan");

    const orderItemsWithQuantity = foodAndBeverage.map((item) => {
      const quantity = foodAndBeverage.find((i) => i.id === item.id)
        ?.quantity as number;
      return {
        item: {
          connect: { id: item.id },
        },
        quantity,
      };
    });

    for await (const item of foodAndBeverage) {
      await prisma.foodAndBeverage.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    const order = await prisma.order.create({
      data: {
        poolTable: {
          connect: { id: poolTableId },
        },
        costumerName,
        duration,
        orderItems: {
          create: orderItemsWithQuantity,
        },
        createdBy: {
          connect: { email: user.email },
        },
      },
    });

    await prisma.poolTable.update({
      where: { id: poolTableId },
      data: {
        status: "unavailable",
        order: { connect: { id: order.id } },
      },
    });

    turnOn(poolTable.deviceId);

    return NextResponse.json(
      {
        message: "Order berhasil",
        data: order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error);
    if (error.message == "Unauthorized") {
      return NextResponse.json(
        { message: "Unauthorized", data: null },
        { status: 401 }
      );
    } else {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request) {
  try {
    const { orderId, stopAt } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { poolTable: true },
    });

    if (!order) throw new Error("Order tidak ditemukan");

    await prisma.order.update({
      where: { id: orderId },
      data: {
        timeOut: true,
        poolTable: {
          update: {
            status: "available",
          },
        },
        pausedAt: stopAt ? stopAt : null,
      },
    });

    turnOff(order.poolTable.deviceId);

    return NextResponse.json(
      {
        message: "Meja Kosong",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      { message: "Terjadi error saat memperbarui meja" },
      { status: 400 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { orderId, foodAndBeverage, duration } = data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) throw new Error("Order tidak ditemukan");

    if (duration) {
      const oldDuration = order.duration;
      const newDuration = oldDuration + duration;
      await prisma.order.update({
        where: { id: orderId },
        data: {
          duration: newDuration,
        },
      });
      return NextResponse.json(
        { message: "Berhasil menambah durasi" },
        { status: 200 }
      );
    }

    const deleteOrderItems = prisma.orderItems.deleteMany({
      where: {
        orderId,
      },
    });

    const newItems = foodAndBeverage.map(
      (item: { id: string; name: string; quantity: number }) => ({
        orderId,
        itemId: item.id,
        quantity: item.quantity,
      })
    );

    const createOrderItems = prisma.orderItems.createMany({
      data: newItems,
    });

    const [deleteRes, createRes] = await prisma.$transaction([
      deleteOrderItems,
      createOrderItems,
    ]);

    return NextResponse.json(
      {
        message: "Berhasil update order",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Terjadi error saat mengupdate order",
      },
      { status: 400 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);

    const id = url.searchParams.get("id") as string;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { poolTable: true },
    });

    if (!order) throw new Error("Order tidak ditemukan");

    await prisma.order.update({
      where: { id },
      data: {
        timeOut: true,
        poolTable: {
          update: {
            status: "available",
          },
        },
      },
    });

    turnOff(order.poolTable.deviceId);

    return NextResponse.json(
      {
        message: "Meja Kosong",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      { message: "Terjadi error saat memperbarui meja" },
      { status: 400 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
