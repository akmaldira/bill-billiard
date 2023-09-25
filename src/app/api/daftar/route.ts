import { prisma } from "@/lib/db";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import * as z from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Nama harus diisi").max(100),
  email: z.string().min(1, "Email harus diisi").email("Email tidak valid"),
  password: z
    .string()
    .min(1, "Password harus diisi")
    .min(8, "Password minimal 8 karakter"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body);

    const { email, password, name } = registerSchema.parse(body);

    const userExist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExist) {
      return NextResponse.json(
        {
          message: "Email sudah terdaftar",
        },
        { status: 400 }
      );
    }

    await prisma.user.create({
      data: {
        email,
        password: await hash(password, 10),
        name,
      },
    });
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: error.issues[0].message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
