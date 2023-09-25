import { prisma } from "@/lib/db";
import { PoolTable, columns } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<PoolTable[]> {
  try {
    const poolTable = await prisma.poolTable.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        deviceId: true,
        status: true,
        active: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return poolTable;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch pool table data");
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
