"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next13-progressbar";

export default function Forbidden() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="w-full h-full flex justify-center items-center flex-col gap-6">
      <p>Kamu tidak memiliki akses kesini</p>
      <Button variant="default" onClick={handleBack}>
        Kembali
      </Button>
    </div>
  );
}
