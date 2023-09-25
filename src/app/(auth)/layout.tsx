import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-[90vh] flex flex-col justify-center items-center">
      <div className="bg-secondary p-10 rounded-md">{children}</div>
    </div>
  );
}
