import { PoolTableData } from "@/app/page";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimerReset } from "lucide-react";
import { useRouter } from "next13-progressbar";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "./ui/button";
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
});

type UseTableProps = {
  poolTable: PoolTableData;
  afterSubmit: () => void;
};

export default function AddMoreTime({ poolTable, afterSubmit }: UseTableProps) {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      poolTableId: poolTable.id,
      costumerName: "",
      duration: 0,
    },
  });

  useEffect(() => {
    if (poolTable.orderId && !poolTable.timeOut) {
      setLoading(true);
      const fetchOrder = async () => {
        const res = await fetch(`/api/order?id=${poolTable.orderId}`);
        const { order } = await res.json();

        form.setValue("orderId", order.id);
        form.setValue("poolTableId", poolTable.id);
        form.setValue("costumerName", order.costumerName);
        setLoading(false);
      };

      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const router = useRouter();

  const { toast } = useToast();

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const res = await fetch("/api/order", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const { message } = await res.json();

    if (res.ok) {
      toast({
        title: "Berhasil",
        description: message,
        variant: "default",
        duration: 5000,
      });
      setDialogOpen(false);
      afterSubmit();
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
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div className="flex gap-1 items-center">
          <TimerReset className="mr-2 h-4 w-4" />
          <span>Tambah Durasi</span>
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
              <DialogTitle>Tambah Durasi</DialogTitle>
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
                </div>
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tambahan Durasi (/jam)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan durasi"
                          type="number"
                          {...field}
                          {...form.register("duration", {
                            setValueAs: (value) => Number(value) || "",
                            min: 1,
                          })}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full mt-6" type="submit">
                  {loading ? "Loading..." : "Tambah Durasi"}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
