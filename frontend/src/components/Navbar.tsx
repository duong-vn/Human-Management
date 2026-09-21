"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, User as UserIcon, ShieldCheck, ChevronDown, Building2 } from "lucide-react";
import { toast } from "sonner";
import { clearUser, getUser, setAT, subscribeAuth, User } from "@/lib/AuthToken";
import api from "@/lib/axios";
import { useSidebar } from "./SidebarContext";

const sectionNames: Record<string, string> = {
  "ho-khau": "Quản lý hộ khẩu", "nhan-khau": "Quản lý nhân khẩu", "thu-phi": "Thu phí & Đóng góp",
  "tam-tru-tam-vang": "Tạm trú / Tạm vắng", "thong-ke": "Báo cáo & Thống kê", user: "Quản trị cán bộ",
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User>(getUser());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);
  const { toggle, isOpen } = useSidebar();

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    const unsubscribe = subscribeAuth(sync);
    return () => { unsubscribe(); };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dropdownOpen) { setDropdownOpen(false); accountButton.current?.focus(); }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => { document.removeEventListener("mousedown", handleClickOutside); document.removeEventListener("keydown", handleEscape); };
  }, [dropdownOpen]);

  if (pathname?.startsWith("/auth")) return null;

  const handleLogout = async () => {
    setDropdownOpen(false);
    clearUser();
    setAT(null);
    setUser(null);
    try {
      const res = await api.post("/auth/logout");
      if (res.status === 201) toast.success("Đăng xuất thành công!");
      else toast.error("Đăng xuất thất bại!");
    } catch { toast.error("Đăng xuất thất bại!"); }
    router.push("/");
  };

  const roleLabel = user?.role === "admin" ? "Quản trị viên" : user?.role ? "Cán bộ quản lý" : "Cán bộ";
  const section = sectionNames[pathname.split("/")[1]] || "Tổng quan";

  return (
    <header className={`app-navbar fixed inset-x-0 top-0 z-30 h-[var(--header-height)] border-b border-slate-200 bg-white ${user ? "md:left-[var(--sidebar-width)]" : ""}`}>
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {user ? <>
            <button type="button" onClick={toggle} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden" aria-label="Mở danh mục điều hướng" aria-expanded={isOpen} aria-controls={isOpen ? "mobile-navigation" : undefined}><Menu className="h-5 w-5" /></button>
            <div className="min-w-0"><p className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:block">Không gian quản trị</p><p className="truncate text-sm font-bold text-slate-800">{section}</p></div>
          </> : <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--sidebar)] text-white"><Building2 className="h-5 w-5" /></span>
            <span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Phường La Khê</span><span className="block truncate text-sm font-extrabold text-slate-900">Tổ dân phố 7</span></span>
          </Link>}
        </div>
        {user ? (
          <div className="relative shrink-0" ref={dropdownRef} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDropdownOpen(false); }}>
            <button ref={accountButton} type="button" onClick={() => setDropdownOpen((previous) => !previous)} className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-50" aria-label={`Tài khoản ${user.username}`} aria-expanded={dropdownOpen} aria-controls={dropdownOpen ? "account-panel" : undefined}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-xs font-bold text-blue-800">{user.username?.charAt(0).toUpperCase() || "U"}</span>
              <span className="hidden max-w-40 text-left sm:block"><span className="block truncate text-xs font-bold text-slate-800">{user.username}</span><span className="block text-[11px] text-slate-500">{roleLabel}</span></span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && <div id="account-panel" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3"><p className="truncate text-sm font-bold text-slate-900">{user.username}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="h-3.5 w-3.5" />{roleLabel}</p></div>
              <div className="p-1.5">
                {user.role === "admin" && <Link href="/user" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><UserIcon className="h-4 w-4" />Quản trị tài khoản</Link>}
                <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-rose-700 hover:bg-rose-50"><LogOut className="h-4 w-4" />Đăng xuất hệ thống</button>
              </div>
            </div>}
          </div>
        ) : <Link href="/auth/login" className="shrink-0 rounded-lg bg-primary px-3 py-2.5 text-xs font-bold text-white hover:bg-primary-dark sm:px-4">Đăng nhập cán bộ</Link>}
      </div>
    </header>
  );
}
