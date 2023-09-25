import { prisma } from "@/lib/db";
import { Order } from "../card";
import { columns } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        createdBy: true,
        orderItems: {
          include: {
            item: true,
          },
        },
        poolTable: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return orders;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch orders data");
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
