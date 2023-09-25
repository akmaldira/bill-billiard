import Navbar from "@/components/Navbar";
import NextProgressBar from "@/components/NextProgress";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Arcadia",
  description: "For management of Arcadia Billing System",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <main className="h-screen flex flex-col">
          <NextProgressBar>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <Navbar />
              <div className="flex-1 pt-20 items-center">{children}</div>
              <Toaster />
            </ThemeProvider>
          </NextProgressBar>
        </main>
      </body>
    </html>
  );
}
