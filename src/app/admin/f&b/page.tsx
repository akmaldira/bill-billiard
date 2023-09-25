import { prisma } from "@/lib/db";
import { FoodAndBeverage, columns } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<FoodAndBeverage[]> {
  try {
    const foodAndBeverage = await prisma.foodAndBeverage.findMany({
      select: {
        id: true,
        image: true,
        name: true,
        price: true,
        stock: true,
        category: true,
        active: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return foodAndBeverage;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch pool table data");
  } finally {
    await prisma.$disconnect();
  }
}

export default async function FoodAndBeverage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
