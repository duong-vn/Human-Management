"use client";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {!isAuthPage && <Sidebar />}
      <main className={`pt-16 ${!isAuthPage ? "ml-64" : ""}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
