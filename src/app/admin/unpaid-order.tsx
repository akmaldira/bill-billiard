import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Order } from "./card";

type UnPaidOrderProps = {
  orders: Order[];
};

export function UnPaidOrder({ orders }: UnPaidOrderProps) {
  return (
    <ScrollArea className="h-[32vh]">
      <div className="space-y-8">
        {orders.map((order, i) => (
          <div className="flex items-center" key={i}>
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {order.costumerName.split(" ")[1] == undefined
                  ? order.costumerName[0] +
                    order.costumerName[order.costumerName.length - 1]
                  : order.costumerName.split(" ")[0][0] +
                    order.costumerName.split(" ")[1][0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {order.costumerName}
              </p>
              <div className="flex gap-2">
                <p className="text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  }).format(new Date(order.createdAt))}
                </p>
                <p className="text-sm text-muted-foreground font-bold">
                  {`[${order.poolTable.name}]`}
                </p>
              </div>
            </div>
            <div className="ml-auto font-medium">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(
                order.poolTable.price * order.duration +
                  order.orderItems.reduce((acc, item) => {
                    return acc + item.quantity * item.item.price;
                  }, 0)
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
