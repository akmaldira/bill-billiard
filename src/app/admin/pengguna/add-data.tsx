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
  email: z.string().min(1, "Email harus diisi").email("Email tidak valid"),
  password: z.string().optional(),
  role: z.enum(["ADMIN", "CASHIER", "USER"]),
});

export function AddData({ dataValue }: { dataValue?: any }) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: dataValue ?? {
      name: "",
      email: "",
      role: "USER",
    },
  });

  const router = useRouter();

  const { toast } = useToast();

  useEffect(() => {
    if (showDialog) {
      form.reset(
        dataValue ?? {
          name: "",
          email: "",
          role: "USER",
        }
      );
    }
  }, [showDialog, form, dataValue]);

  const addData = async (values: z.infer<typeof FormSchema>) => {
    const res = await fetch("/api/daftar", {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
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
        description: "Pengguna berhasil ditambahkan",
        variant: "default",
      });
    }
  };

  const editData = async (values: z.infer<typeof FormSchema>) => {
    const res = await fetch("/api/user", {
      method: "PUT",
      body: JSON.stringify({
        id: values.id,
        name: values.name,
        email: values.email,
        role: values.role,
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
        description: "Pengguna berhasil diedit",
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
          {dataValue ? "Edit" : "Tambah Pengguna"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dataValue ? "Edit" : "Tambah"} Pengguna</DialogTitle>
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
                    <FormLabel>Nama Pengguna</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama pengguna" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan email pengguna" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!dataValue && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan password pengguna"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ADMIN" />
                          </FormControl>
                          <FormLabel className="font-normal">Admin</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="CASHIER" />
                          </FormControl>
                          <FormLabel className="font-normal">Kasir</FormLabel>
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
                ? "Edit Role"
                : "Tambah Pengguna"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
