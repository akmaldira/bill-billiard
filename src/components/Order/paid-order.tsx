"use client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Printer } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverTrigger } from "../ui/popover";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { Order } from "./page";

const FormSchema = z.object({
  poolTableId: z.string(),
  poolTableName: z.string(),
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
  paid: z.boolean(),
  orderItems: z.array(
    z.object({
      name: z.string().min(1, "F&B harus diisi"),
      price: z.number().min(1, "Harga harus diisi"),
      quantity: z
        .number({
          errorMap: (error) => ({
            message: `Qty harus diisi`,
          }),
        })
        .min(1, "Qty harus diisi"),
    })
  ),
  note: z.optional(z.string()),
});

type UseTableProps = {
  order: Order;
  afterPay: () => void;
};

export default function PaidOrder({ order, afterPay }: UseTableProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: order,
  });
  const { fields } = useFieldArray({
    name: "orderItems",
    control: form.control,
  });

  const { toast } = useToast();

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true);
    const res = await fetch("/api/order/bayar", {
      method: "POST",
      body: JSON.stringify({
        orderId: order.id,
        note: values.note,
      }),
    });
    afterPay();
    if (res.ok) {
      toast({
        title: "Berhasil membayar dan mencetak struk",
        description: "Silahkan ambil struk di printer",
        variant: "default",
      });
    } else {
      toast({
        title: "Gagal membayar dan mencetak struk",
        description: "Silahkan coba lagi",
        variant: "destructive",
      });
    }
    setLoading(false);
    setOpen(false);
  };

  const setCardOpen = (open: boolean) => {
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={setCardOpen}>
      <DialogTrigger asChild>
        <Button>
          {order.paid ? (
            <>Lihat Struk</>
          ) : (
            <>
              <Printer className="mr-2 h-4 w-4" />
              <span>Bayar & Cetak</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cetak Struk</DialogTitle>
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
                      <Input {...field} disabled />
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
                      <Input type="number" {...field} disabled />
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
                      name={`orderItems.${index}.name`}
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
                                  disabled
                                >
                                  {field.value}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
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
                      name={`orderItems.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input className="w-10" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <FormLabel>Total Harga</FormLabel>
              <Input
                value={new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(order.totalPrice || 0)}
                disabled
              />
            </div>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan"
                      className="resize-none mt-5"
                      {...field}
                      disabled={order.paid}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!order.paid && (
              <Button className="w-full mt-6" type="submit">
                {loading ? "Loading..." : "Bayar dan Cetak"}
              </Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
