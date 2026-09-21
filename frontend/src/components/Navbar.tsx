"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Building2 } from "lucide-react";
import { getUser, subscribeAuth, User } from "@/lib/AuthToken";
import { useSidebar } from "./SidebarContext";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User>(getUser());
  const { toggle, isOpen } = useSidebar();

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    const unsubscribe = subscribeAuth(sync);
    return () => { unsubscribe(); };
  }, []);

  if (pathname?.startsWith("/auth")) return null;

  if (user) {
    return (
      <header className="app-navbar fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Mở danh mục điều hướng"
          aria-expanded={isOpen}
          aria-controls={isOpen ? "mobile-navigation" : undefined}
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold text-slate-800">Tổ Dân Phố 7</span>
        <div className="w-9" aria-hidden="true" />
      </header>
    );
  }

  return (
    <header className="app-navbar fixed inset-x-0 top-0 z-30 h-[var(--header-height)] border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--sidebar)] text-white">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Phường La Khê</span>
              <span className="block truncate text-sm font-extrabold text-slate-900">Tổ dân phố 7</span>
            </span>
          </Link>
        </div>
        <Link
          href="/auth/login"
          className="shrink-0 rounded-lg bg-primary px-3 py-2.5 text-xs font-bold text-white hover:bg-primary-dark sm:px-4"
        >
          Đăng nhập cán bộ
        </Link>
      </div>
    </header>
  );
}
