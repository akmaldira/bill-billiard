"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next13-progressbar";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const FormSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Nama harus diisi")
    .max(100, "Nama maksimal 100 karakter"),
  price: z.string().min(1, "Harga harus diisi"),
  deviceId: z.string().min(1, "Device ID harus diisi"),
  status: z.enum(["available", "unavailable"]).default("available"),
  active: z.enum(["true", "false"]).default("true"),
});

export function AddData({ dataValue }: { dataValue?: any }) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: dataValue ?? {
      name: "",
      price: "",
      deviceId: "",
      status: "available",
      active: "true",
    },
  });

  const router = useRouter();

  const { toast } = useToast();

  useEffect(() => {
    if (showDialog) {
      form.reset(
        dataValue ?? {
          name: "",
          price: "",
          deviceId: "",
          status: "available",
          active: "true",
        }
      );
    }
  }, [showDialog, form, dataValue]);

  const addData = async (values: z.infer<typeof FormSchema>) => {
    const res = await fetch("/api/meja", {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        price: Number(values.price),
        deviceId: values.deviceId,
        status: values.status,
        active: values.active == "true",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast({
        title: "Gagal menambahkan meja",
        description: data.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil menambahkan meja",
        description: "Meja berhasil ditambahkan",
        variant: "default",
      });
    }
  };

  const editData = async (values: z.infer<typeof FormSchema>) => {
    const res = await fetch("/api/meja", {
      method: "PUT",
      body: JSON.stringify({
        id: values.id,
        name: values.name,
        price: Number(values.price),
        deviceId: values.deviceId,
        status: values.status,
        active: values.active == "true",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast({
        title: "Gagal",
        description: data.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Meja berhasil diedit",
        variant: "default",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true);
    if (dataValue) {
      await editData(values);
    } else {
      await addData(values);
    }
    router.refresh();
    form.reset();
    setLoading(false);
    setShowDialog(false);
  };

  return (
    <Dialog onOpenChange={setShowDialog} open={showDialog}>
      <DialogTrigger asChild>
        <Button variant="default">{dataValue ? "Edit" : "Tambah Meja"}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {dataValue ? "Edit" : "Tambah"} Meja Billiard
          </DialogTitle>
          <DialogDescription>
            Pastikan data yang dikirim sudah benar
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Meja</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama meja" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Per-Jam</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan harga per-jam"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan Device ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Meja Bisa Digunakan?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="true" />
                          </FormControl>
                          <FormLabel className="font-normal">Bisa</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Tidak Bisa
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button className="w-full mt-6" type="submit">
              {loading ? "Loading..." : dataValue ? "Edit Meja" : "Tambah Meja"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
