"use client";
import {
  CandlestickChart,
  ChevronDown,
  ConciergeBell,
  ListOrdered,
  LogOut,
  Tablets,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next13-progressbar";

interface UserNavbarProps {
  user: User;
}

export function UserNavbar({ user }: UserNavbarProps) {
  const handleLogout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: `${window.location.origin + "/"}`,
    });
  };

  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" className="flex justify-center gap-3">
          <p>{user.name ?? user.email?.split("@")[0]}</p>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-primary text-primary-foreground">
        {user.role === "ADMIN" && (
          <>
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => router.push("/admin")}
            >
              <CandlestickChart className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => router.push("/admin/meja")}
            >
              <Tablets className="mr-2 h-4 w-4" />
              <span>Data Meja</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => router.push("/admin/f&b")}
            >
              <UtensilsCrossed className="mr-2 h-4 w-4" />
              <span>Data F&B</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => router.push("/admin/order")}
            >
              <ListOrdered className="mr-2 h-4 w-4" />
              <span>Data Orderan</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => router.push("/admin/pengguna")}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Data Pengguna</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => router.push("/")}
            >
              <ConciergeBell className="mr-2 h-4 w-4" />
              <span>Kasir</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
