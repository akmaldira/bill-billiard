"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next13-progressbar";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const FormSchema = z.object({
  id: z.string().optional(),
  image: z.string().nullable(),
  name: z
    .string()
    .min(1, "Nama harus diisi")
    .max(100, "Nama maksimal 100 karakter"),
  price: z.z.string().min(1, "Harga harus diisi"),
  stock: z.string().min(1, "Stok harus diisi"),
  category: z.enum(["food", "beverage", "other"]).default("other"),
  active: z.enum(["true", "false"]).default("true"),
});

export function AddData({ dataValue }: { dataValue?: any }) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: dataValue ?? {
      image: null,
      name: "",
      price: "",
      stock: "",
      category: "other",
      active: "true",
    },
  });

  const router = useRouter();

  const { toast } = useToast();

  useEffect(() => {
    if (showDialog) {
      form.reset(
        dataValue ?? {
          image: "",
          name: "",
          price: "",
          stock: "",
          active: "true",
        }
      );
    }
  }, [showDialog, form, dataValue]);

  const addData = async (values: z.infer<typeof FormSchema>) => {
    const res = await fetch("/api/f&b", {
      method: "POST",
      body: JSON.stringify({
        image: values.image,
        name: values.name,
        price: Number(values.price),
        stock: Number(values.stock),
        category: values.category,
        active: values.active == "true",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast({
        title: "Gagal menambahkan produk",
        description: data.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil menambahkan produk",
        description: "Produk berhasil ditambahkan",
        variant: "default",
      });
    }
  };

  const editData = async (values: z.infer<typeof FormSchema>) => {
    const res = await fetch("/api/f&b", {
      method: "PUT",
      body: JSON.stringify({
        id: values.id,
        image: values.image,
        name: values.name,
        price: Number(values.price),
        stock: Number(values.stock),
        category: values.category,
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
        description: "Produk berhasil diedit",
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
        <Button variant="default">
          {dataValue ? "Edit" : "Tambah Produk"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {dataValue ? "Edit" : "Tambah"} Food & Beverage
          </DialogTitle>
          <DialogDescription>
            Pastikan data yang dikirim sudah benar
          </DialogDescription>
        </DialogHeader>
        <div className="w-full flex items-center justify-between mt-4">
          {form.getValues("image") && (
            <Avatar className="h-40 w-40">
              <AvatarImage src={form.getValues("image")!} alt="img" />
              <AvatarFallback>Loading</AvatarFallback>
            </Avatar>
          )}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Produk</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama produk" {...field} />
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
                    <FormLabel>Harga</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan harga produk"
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
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan stok produk"
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="food">Makanan</SelectItem>
                        <SelectItem value="beverage">Minuman</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Pasarkan Produk?</FormLabel>
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
                          <FormLabel className="font-normal">Ya</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">Tidak</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button className="w-full mt-6" type="submit">
              {loading
                ? "Loading..."
                : dataValue
                ? "Edit Produk"
                : "Tambah Produk"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
