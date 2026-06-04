import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Voxion Ads - Admin Dashboard",
  description: "Next-gen Meta Ads analytics and automation dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={cn(inter.className, "min-h-screen bg-slate-950 text-slate-50 antialiased")}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
