import { FoodAndBeverage, PoolTableData } from "@/app/page";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Salad, Trash } from "lucide-react";
import { useRouter } from "next13-progressbar";
import { useEffect, useState } from "react";
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useToast } from "./ui/use-toast";

const FormSchema = z.object({
  orderId: z.optional(z.string()),
  poolTableId: z.string(),
  costumerName: z
    .string()
    .min(1, "Nama harus diisi")
    .max(100, "Nama maksimal 100 karakter"),
  duration: z
    .number({
      errorMap: (error) => ({
        message: `Durasi harus diisi`,
      }),
    })
    .min(1, "Durasi harus diisi"),
  price: z.optional(z.number()),
  foodAndBeverage: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, "F&B harus diisi"),
        quantity: z
          .number({
            errorMap: (error) => ({
              message: `Qty harus diisi`,
            }),
          })
          .min(1, "Qty harus diisi"),
        originalPrice: z.number(),
        totalPrice: z.optional(z.number()),
      })
    )
    .refine(
      (items) =>
        items.find(
          (item) => items.filter((i) => i.name === item.name).length > 1
        ) === undefined,
      {
        message: "Gunakan qty untuk item yang sama",
        path: [0, "name"],
      }
    ),
});

type UseTableProps = {
  poolTable: PoolTableData;
  foodAndBeverages: FoodAndBeverage[];
  afterSubmit: () => void;
};

function TotalAmout({
  control,
}: {
  control: Control<z.infer<typeof FormSchema>>;
}) {
  let total = 0;
  const table = useWatch({
    control,
    name: "price",
  });

  total += table || 0;

  const fnbItem = useWatch({
    control,
    name: "foodAndBeverage",
  });

  fnbItem.forEach((item: any) => {
    total += item.totalPrice || 0;
  });

  return (
    <FormItem>
      <FormLabel>Harga</FormLabel>
      <FormControl>
        <Input
          value={new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(total)}
          disabled
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

export default function EditUseTable({
  poolTable,
  foodAndBeverages,
  afterSubmit,
}: UseTableProps) {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      poolTableId: poolTable.id,
      costumerName: "",
      duration: 0,
      price: 0,
    },
  });

  useEffect(() => {
    if (poolTable.orderId && !poolTable.timeOut) {
      setLoading(true);
      const fetchOrder = async () => {
        const res = await fetch(`/api/order?id=${poolTable.orderId}`);
        const { order } = await res.json();

        const items = order.orderItems.map((item: any) => {
          return {
            id: item.item.id,
            name: item.item.name,
            originalPrice: item.item.price,
            totalPrice: item.item.price * item.quantity,
            quantity: item.quantity,
          };
        });

        form.setValue("orderId", order.id);
        form.setValue("poolTableId", poolTable.id);
        form.setValue("costumerName", order.costumerName);
        form.setValue("duration", order.duration);
        form.setValue("price", order.poolTable.price * order.duration);
        form.setValue("foodAndBeverage", items);
        setLoading(false);
      };

      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { fields, append, remove } = useFieldArray({
    name: "foodAndBeverage",
    control: form.control,
  });

  const router = useRouter();

  const { toast } = useToast();

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const res = await fetch("/api/order", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: values.orderId,
        foodAndBeverage: values.foodAndBeverage,
      }),
    });

    const { message } = await res.json();
    if (!res.ok) {
      toast({
        title: "Gagal",
        description: message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: message,
        variant: "default",
      });
    }
    setDialogOpen(false);
    afterSubmit();
    router.refresh();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div className="flex gap-1 items-center">
          <Salad className="mr-2 h-4 w-4" />
          <span>Tambah F&B</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] sm:max-w-[425px] max-h-[80vh] overflow-y-scroll overflow-x-hidden">
        {loading ? (
          <div className="w-full h-full items-center justify-center">
            Loading...
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Tambah F&B</DialogTitle>
              <DialogDescription>
                Pastikan data yang diisi sudah benar
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="costumerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Kostumer</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan nama kostumer"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durasi (/jam)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan durasi"
                            type="number"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end w-full gap-2">
                      <div>
                        <FormLabel className={cn(index !== 0 && "sr-only")}>
                          F&B
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name={`foodAndBeverage.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className={cn(
                                        "w-[200px] justify-between",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value
                                        ? foodAndBeverages.find(
                                            (foodAndBeverage) =>
                                              foodAndBeverage.name ===
                                              field.value
                                          )?.name
                                        : "Pilih F&B"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                  <Command>
                                    <CommandInput placeholder="Cari f&b..." />
                                    <CommandEmpty>Tidak ada F&B.</CommandEmpty>
                                    <CommandGroup>
                                      {foodAndBeverages.map(
                                        (foodAndBeverage) => (
                                          <CommandItem
                                            value={foodAndBeverage.name}
                                            key={foodAndBeverage.id}
                                            onSelect={() => {
                                              form.clearErrors(
                                                `foodAndBeverage.${index}.name`
                                              );
                                              form.setValue(
                                                `foodAndBeverage.${index}.id`,
                                                foodAndBeverage.id
                                              );
                                              form.setValue(
                                                `foodAndBeverage.${index}.name`,
                                                foodAndBeverage.name
                                              );
                                              const qty = form.getValues(
                                                `foodAndBeverage.${index}.quantity`
                                              );

                                              form.setValue(
                                                `foodAndBeverage.${index}.originalPrice`,
                                                foodAndBeverage.price
                                              );

                                              form.setValue(
                                                `foodAndBeverage.${index}.totalPrice`,
                                                foodAndBeverage.price * qty
                                              );
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                foodAndBeverage.name ===
                                                  field.value
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {foodAndBeverage.name}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div>
                        <FormLabel className={cn(index !== 0 && "sr-only")}>
                          Qty
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name={`foodAndBeverage.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="w-10"
                                  {...field}
                                  {...form.register(
                                    `foodAndBeverage.${index}.quantity`,
                                    {
                                      setValueAs: (value) =>
                                        Number(value) || "",
                                      min: 1,
                                      onChange(event) {
                                        let price = form.getValues(
                                          `foodAndBeverage.${index}.originalPrice`
                                        );
                                        form.setValue(
                                          `foodAndBeverage.${index}.totalPrice`,
                                          price * event.target.value
                                        );
                                      },
                                    }
                                  )}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash width={20} height={20} />
                      </Button>
                      {form.getValues(`foodAndBeverage.${index}.totalPrice`) ||
                        0}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-10"
                    onClick={() =>
                      append({
                        id: "",
                        name: "",
                        quantity: 1,
                        originalPrice: 0,
                      })
                    }
                  >
                    Tambah F&B
                  </Button>
                  <TotalAmout control={form.control} />
                </div>
                <Button className="w-full mt-6" type="submit">
                  {loading ? "Loading..." : "Tambah F&B"}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
