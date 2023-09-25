"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next13-progressbar";
import { useState } from "react";

type DeleteDataProps = {
  id: string;
  name: string;
};

export function DeleteData({ id, name }: DeleteDataProps) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const { toast } = useToast();

  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch("/api/f&b", {
      method: "DELETE",
      body: JSON.stringify({
        id,
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
        description: "Produk berhasil dihapus",
        variant: "default",
      });
    }
    setLoading(false);
    router.refresh();
    setShowDialog(false);
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogTrigger className={buttonVariants({ variant: "outline" })}>
        Hapus
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Apakah anda yakin ingin menghapus{" "}
            <span className="font-extrabold underline">{name}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Aksi ini akan menghapus data secara permanen, data yang telah
            dihapus tidak bisa di kembalikan lagi!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-end">
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            {loading ? "Loading..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
