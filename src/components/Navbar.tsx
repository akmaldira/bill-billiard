import { authOption } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { UserNavbar } from "./NavbarUser";
import { ThemeToggle } from "./ThemeToggle";
import { buttonVariants } from "./ui/button";

const Navbar = async () => {
  const session = await getServerSession(authOption);
  const user = session?.user;

  return (
    <div className="bg-secondary h-16 border-b border-s-zinc-200 fixed w-full z-10 top-0 flex">
      <div className="container flex items-center justify-between">
        <Link href="/">
          <Image
            className="block dark:hidden"
            src="/logo.png"
            alt="logo"
            height={45}
            width={130}
          />
          <Image
            className="hidden dark:block"
            src="/logo-dark.png"
            alt="logo"
            height={45}
            width={130}
          />
        </Link>
        <div className="flex gap-2">
          <ThemeToggle />
          {user ? (
            <UserNavbar user={user} />
          ) : (
            <Link className={buttonVariants()} href="/masuk">
              Masuk
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
