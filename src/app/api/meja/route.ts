import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import * as z from "zod";

const poolTableSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Nama harus diisi")
    .max(100, "Nama maksimal 100 karakter"),
  price: z.number().min(1, "Harga harus diisi"),
  deviceId: z.string().min(1, "Device ID harus diisi"),
  status: z.enum(["available", "unavailable"]).default("available"),
  active: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, price, deviceId, status, active } =
      poolTableSchema.parse(body);

    const poolTableExist = await prisma.poolTable.findUnique({
      where: {
        deviceId,
      },
    });

    if (poolTableExist) {
      return NextResponse.json(
        {
          message: "Device ID sudah terdaftar",
        },
        { status: 400 }
      );
    }

    await prisma.poolTable.create({
      data: {
        name,
        price,
        deviceId,
        status,
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

    const { id, name, price, deviceId, status, active } =
      poolTableSchema.parse(body);

    const poolTableNotExist = await prisma.poolTable.findUnique({
      where: {
        id,
      },
    });

    if (!poolTableNotExist) {
      return NextResponse.json(
        {
          message: "Meja belum terdaftar",
        },
        { status: 400 }
      );
    }

    await prisma.poolTable.update({
      where: {
        id,
      },
      data: {
        name,
        price,
        deviceId,
        status,
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

    await prisma.poolTable.delete({
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
