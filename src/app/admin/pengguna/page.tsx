import { prisma } from "@/lib/db";
import { User, columns } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<User[]> {
  try {
    const user = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch user data");
  } finally {
    await prisma.$disconnect();
  }
}

export default async function PoolTable() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
