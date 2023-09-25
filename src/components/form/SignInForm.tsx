"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next13-progressbar";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

const FormSchema = z.object({
  email: z.string().min(1, "Email harus diisi").email("Email tidak valid"),
  password: z
    .string()
    .min(1, "Password harus diisi")
    .min(8, "Password minimal 8 karakter"),
});

const SignInForm = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const { toast } = useToast();

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setLoading(true);
    const login = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });
    if (!login?.error) {
      router.refresh();
      router.push("/");
    } else {
      toast({
        title: "Gagal masuk",
        description: "Email atau password salah",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="mail@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Masukkan password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button className="w-full mt-6" type="submit">
          {loading ? "Loading..." : "Masuk"}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-2">
        tidak punya akun?&nbsp;
        <Link className="text-blue-500 hover:underline" href="/daftar">
          Daftar
        </Link>
      </p>
    </Form>
  );
};

export default SignInForm;
