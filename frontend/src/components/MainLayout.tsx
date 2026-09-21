"use client";

import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";
import { usePathname } from "next/navigation";
import { getUser, subscribeAuth, User } from "@/lib/AuthToken";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const [user, setUser] = useState<User>(getUser());

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

  const showSidebar = !isAuthPage && !!user;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
        <a href="#main-content" className="skip-link">Đến nội dung chính</a>
        <Navbar />
        {showSidebar && <Sidebar />}
        <main
          id="main-content"
          tabIndex={-1}
          className={`app-main min-w-0 flex-1 ${
            showSidebar ? "md:ml-[var(--sidebar-width)] pt-14 md:pt-0" : !isAuthPage ? "pt-[var(--header-height)]" : ""
          }`}
        >
          <div className={showSidebar ? "mx-auto w-full min-w-0 p-4 sm:p-6 lg:px-8 lg:py-7" : "w-full"}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
