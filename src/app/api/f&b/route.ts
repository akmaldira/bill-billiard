import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import * as z from "zod";

const fnbSchema = z.object({
  id: z.string().optional(),
  image: z.string().nullable(),
  name: z
    .string()
    .min(1, "Nama harus diisi")
    .max(100, "Nama maksimal 100 karakter"),
  price: z.z.number().min(1, "Harga harus diisi"),
  stock: z.number().min(1, "Device ID harus diisi"),
  category: z.enum(["food", "beverage", "other"]).default("other"),
  active: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { image, name, price, stock, category, active } =
      fnbSchema.parse(body);

    await prisma.foodAndBeverage.create({
      data: {
        image,
        name,
        price,
        category,
        stock,
        active,
      },
    });
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: error.issues[0].message,
        },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const { id, image, name, price, stock, category, active } =
      fnbSchema.parse(body);

    const fnb = await prisma.foodAndBeverage.findUnique({
      where: {
        id,
      },
    });

    if (!fnb) {
      return NextResponse.json(
        {
          message: "Produk belum terdaftar",
        },
        { status: 400 }
      );
    }

    await prisma.foodAndBeverage.update({
      where: {
        id,
      },
      data: {
        image,
        name,
        price,
        stock,
        category,
        active,
      },
    });
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: error.issues[0].message,
        },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        {
          message: "ID harus diisi",
        },
        { status: 400 }
      );
    }

    await prisma.foodAndBeverage.delete({
      where: {
        id: body.id,
      },
    });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: error.issues[0].message,
        },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
