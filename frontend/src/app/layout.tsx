import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";
import { Toaster } from "sonner";
import Boostrap from "@/components/Boostrap";
import Providers from "./Providers";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TDP7 La Khê | Quản lý Tổ dân phố",
  description:
    "Hệ thống quản lý hộ khẩu, nhân khẩu và thu phí - Tổ dân phố 7 Phường La Khê",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${nunito.variable} ${nunito.className} antialiased`}>
        <Providers>
          <Toaster position="top-left" richColors closeButton />

          <Boostrap>
            <MainLayout>{children}</MainLayout>
          </Boostrap>
        </Providers>
      </body>
    </html>
  );
}
