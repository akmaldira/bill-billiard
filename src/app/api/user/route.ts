import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const { email, role } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan", data: null },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { email },
      data: {
        role,
      },
    });

    return NextResponse.json(
      { message: "Berhasil mengubah role", data: null },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error", data: null },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
