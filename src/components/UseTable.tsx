import { FoodAndBeverage, PoolTableData } from "@/app/page";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Trash, UserPlus } from "lucide-react";
import { useRouter } from "next13-progressbar";
import { useState } from "react";
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

export default function UseTable({
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
  const { fields, append, remove } = useFieldArray({
    name: "foodAndBeverage",
    control: form.control,
  });

  const router = useRouter();

  const { toast } = useToast();

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const res = await fetch("/api/order", {
      method: "POST",
      body: JSON.stringify(values),
    });
    const { message } = await res.json();
    if (res.ok) {
      toast({
        title: "Berhasil",
        description: "Berhasil mengisi meja",
        variant: "default",
      });
      router.refresh();
    } else {
      toast({
        title: "Gagal",
        description: message,
        variant: "destructive",
      });
    }
    afterSubmit();
    router.refresh();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div className="flex gap-1 items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          <span>Isi Meja</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] sm:max-w-[425px] max-h-[80vh] overflow-y-scroll overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Isi Meja Billiard</DialogTitle>
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
                      <Input placeholder="Masukkan nama kostumer" {...field} />
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
                        {...form.register("duration", {
                          setValueAs: (value) => Number(value) || "",
                          onChange(event) {
                            form.setValue(
                              "price",
                              event.target.value * poolTable.price
                            );
                          },
                          min: 1,
                        })}
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
                                          foodAndBeverage.name === field.value
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
                                  {foodAndBeverages.map((foodAndBeverage) => (
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
                                          foodAndBeverage.name === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {foodAndBeverage.name}
                                    </CommandItem>
                                  ))}
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
                                  setValueAs: (value) => Number(value) || "",
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
                  {form.getValues(`foodAndBeverage.${index}.totalPrice`) || 0}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-10"
                onClick={() =>
                  append({ id: "", name: "", quantity: 1, originalPrice: 0 })
                }
              >
                Tambah F&B
              </Button>
              <TotalAmout control={form.control} />
            </div>
            <Button className="w-full mt-6" type="submit">
              {loading ? "Loading..." : "Isi Meja"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
