"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Beer, Sandwich, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FoodAndBeverage } from "./page";

type CardContentProps = {
  foodAndBeverage: FoodAndBeverage;
};

export default function FoodAndBeverageComponent({
  foodAndBeverage,
}: CardContentProps) {
  const [loading, setLoading] = useState(true);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between space-y-0 pb-2">
        {foodAndBeverage.image ? (
          <div className="w-full h-40 flex items-center justify-center">
            <Image
              src={foodAndBeverage.image!}
              alt="image"
              width={0}
              height={0}
              className="h-40 w-full"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-full h-40 flex items-center justify-center">
            {foodAndBeverage.category == "food" ? (
              <Sandwich className="h-36 w-36" />
            ) : foodAndBeverage.category == "beverage" ? (
              <Beer className="h-36 w-36" />
            ) : (
              <UtensilsCrossed className="h-36 w-36" />
            )}
          </div>
        )}
        <CardTitle className="text-sm font-medium">
          <p className="text-xl font-bold">{foodAndBeverage.name}</p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold"></div>
        <p className="text-xs text-center">
          Harga{" "}
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(foodAndBeverage.price)}
        </p>
      </CardContent>
    </Card>
  );
}
