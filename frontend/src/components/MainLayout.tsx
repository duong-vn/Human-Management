"use client";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, subscribeAuth, User } from "@/lib/AuthToken";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const [user, setUser] = useState<User>(getUser());

  // Theo dõi trạng thái auth
  useEffect(() => {
    const sync = () => {
      const nextUser = getUser();
      setUser((prev) => (prev === nextUser ? prev : nextUser));
    };
    sync();
    const unsubscribe = subscribeAuth(sync);
    return () => {
      unsubscribe();
    };
  }, []);

  // Xác định có hiển thị sidebar hay không
  const showSidebar = !isAuthPage && user;

  return (
    <div className="min-h-screen bg-stone-100">
      <Navbar />
      {showSidebar && <Sidebar />}
      <main className={`pt-16 ${showSidebar ? "ml-64" : ""} min-h-screen`}>
        <div className={showSidebar ? "p-8" : ""}>{children}</div>
      </main>
    </div>
  );
}
