import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";
import { Toaster } from "sonner";
import Boostrap from "@/components/Boostrap";
import Providers from "./Providers"; // Bạn đã import ở đây rồi

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlueMoon | Quản Lý Chung Cư",
  description:
    "Hệ thống quản lý hộ khẩu, nhân khẩu và thu phí chung cư BlueMoon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* --- SỬA Ở ĐÂY: Bọc Providers ra ngoài cùng --- */}
        <Providers>
          <Toaster position="top-left" richColors closeButton />

          <Boostrap>
            <MainLayout>{children}</MainLayout>
          </Boostrap>
        </Providers>
        {/* ----------------------------------------------- */}
      </body>
    </html>
  );
}
