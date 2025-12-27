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
    <div className="min-h-screen bg-stone-100">
      <Navbar />
      {!isAuthPage && <Sidebar />}
      <main className={`pt-16 ${!isAuthPage ? "ml-64" : ""} min-h-screen`}>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
