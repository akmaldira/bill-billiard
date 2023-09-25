"use client";
import EditUseTable from "@/components/AddFnB";
import AddMoreTime from "@/components/AddMoreTime";
import { useCountdown } from "@/components/CountDown";
import { ShowCounter } from "@/components/ShowCounter";
import UseTable from "@/components/UseTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, TimerOff } from "lucide-react";
import { useRouter } from "next13-progressbar";
import { useEffect, useState } from "react";
import { FoodAndBeverage, PoolTableData } from "./page";

type CardContentProps = {
  poolTable: PoolTableData;
  foodAndBeverages: FoodAndBeverage[];
};

export default function CardContentComponents({
  poolTable,
  foodAndBeverages,
}: CardContentProps) {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  let [days, hours, minutes, seconds] = useCountdown(
    poolTable.end ?? new Date()
  );

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (days + hours + minutes + seconds <= 0) {
      if (poolTable.orderId && !poolTable.timeOut) {
        fetch(`/api/order?id=${poolTable.orderId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(async (res) => {
            const { message } = await res.json();
            if (res.ok) {
              return;
            } else {
              throw new Error(message);
            }
          })
          .catch((err) => {
            return toast({
              title: "Error",
              description: err.message,
              variant: "destructive",
              duration: 5000,
            });
          });
        router.refresh();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, hours, minutes, seconds]);

  const handleTimerStop = async () => {
    const stopAt = new Date();
    const res = await fetch("/api/order", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: poolTable.orderId,
        stopAt,
      }),
    });

    const { message } = await res.json();

    router.refresh();
    if (res.ok) {
      toast({
        title: "Success",
        description: message,
        variant: "default",
        duration: 5000,
      });
    } else {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <Card
      className={`${
        days + hours + minutes + seconds <= 0
          ? "bg-available"
          : minutes <= 5 && hours === 0 && days === 0
          ? "bg-amber-600"
          : "bg-available-foreground"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <p className="text-xl font-bold">{poolTable.name}</p>
        </CardTitle>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="flex justify-center gap-3 h-8">
              <p>Aksi</p>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-primary text-primary-foreground">
            {days + hours + minutes + seconds <= 0 ? (
              <>
                <div className="hover:cursor-pointer hover:bg-secondary hover:text-primary items-center relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <UseTable
                    poolTable={poolTable}
                    foodAndBeverages={foodAndBeverages}
                    afterSubmit={() => {
                      setOpen(false);
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="hover:cursor-pointer hover:bg-secondary hover:text-primary items-center relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <EditUseTable
                    poolTable={poolTable}
                    foodAndBeverages={foodAndBeverages}
                    afterSubmit={() => {
                      setOpen(false);
                    }}
                  />
                </div>
                <div className="hover:cursor-pointer hover:bg-secondary hover:text-primary items-center relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <AddMoreTime
                    poolTable={poolTable}
                    afterSubmit={() => {
                      setOpen(false);
                      router.refresh();
                    }}
                  />
                </div>
                <div
                  className="hover:cursor-pointer hover:bg-secondary hover:text-primary items-center relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  onClick={handleTimerStop}
                >
                  <div className="flex gap-1 items-center">
                    <TimerOff className="mr-2 h-4 w-4" />
                    <span>Stop Waktu</span>
                  </div>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            "Loading..."
          ) : days + hours + minutes + seconds <= 0 ? (
            "Kosong"
          ) : (
            <ShowCounter
              days={days}
              hours={hours}
              minutes={minutes}
              seconds={seconds}
            />
          )}
        </div>
        <p className="text-xs">
          Harga Per-Jam{" "}
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(poolTable.price)}
        </p>
      </CardContent>
    </Card>
  );
}
