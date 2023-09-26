import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authOption } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import OrderContentComponents from "../components/Order/page";
import CardContentComponents from "./card-content";
import FoodAndBeverageComponent from "./fnb-content";

export type PoolTable = {
  id: string;
  name: string;
  price: number;
  deviceId: string;
  status: "available" | "unavailable";
};

export type FoodAndBeverage = {
  id: string;
  image?: string | null;
  name: string;
  price: number;
  stock: number;
  category: "food" | "beverage" | "other";
};

export type PoolTableData = PoolTable & {
  orderId?: string;
  timeOut?: boolean;
  start?: Date;
  end?: Date;
};

const getPoolTables = async (): Promise<PoolTableData[]> => {
  try {
    const poolTable = await prisma.poolTable.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        deviceId: true,
        status: true,
        order: {
          where: {
            timeOut: false,
          },
        },
      },
      where: {
        active: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const result = poolTable.map((table) => {
      if (table.order.length == 1) {
        const end = new Date(table.order[0].createdAt);
        end.setHours(end.getHours() + table.order[0].duration);
        return {
          ...table,
          orderId: table.order[0].id,
          timeOut: table.order[0].timeOut,
          start: table.order[0].createdAt,
          end,
        };
      } else {
        return table;
      }
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch pool table data");
  } finally {
    await prisma.$disconnect();
  }
};

const getFoodAndBeverage = async (): Promise<FoodAndBeverage[]> => {
  try {
    const foodAndBeverage = await prisma.foodAndBeverage.findMany({
      select: {
        id: true,
        image: true,
        name: true,
        price: true,
        stock: true,
        category: true,
      },
      where: {
        active: true,
        stock: {
          gt: 0,
        },
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
};

export default async function Home() {
  const poolTables = await getPoolTables();
  const foodAndBeverages = await getFoodAndBeverage();

  const session = await getServerSession(authOption);
  if (!session?.user) {
    return redirect("/masuk");
  }

  return (
    <div className="container flex flex-col">
      <Tabs defaultValue="biling" className="space-y-4">
        <TabsList className="gap-2">
          <TabsTrigger value="biling">Biling</TabsTrigger>
          <TabsTrigger value="fnb">F&B</TabsTrigger>
          <TabsTrigger value="order">Order</TabsTrigger>
        </TabsList>
        <TabsContent value="biling" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {poolTables.map((poolTable) => (
              <CardContentComponents
                key={poolTable.id}
                poolTable={poolTable}
                foodAndBeverages={foodAndBeverages}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="fnb" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {foodAndBeverages.map((foodAndBeverage) => (
              <FoodAndBeverageComponent
                key={foodAndBeverage.id}
                foodAndBeverage={foodAndBeverage}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="order">
          <OrderContentComponents />
        </TabsContent>
      </Tabs>
    </div>
  );
}
