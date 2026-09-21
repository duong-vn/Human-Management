"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, Users, Building2, CreditCard, FileCheck, BarChart3, ShieldCheck, ChevronDown, X, LogOut } from "lucide-react";
import { toast } from "sonner";
import { clearUser, getUser, setAT, subscribeAuth, User } from "@/lib/AuthToken";
import api from "@/lib/axios";
import { useSidebar } from "./SidebarContext";

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  adminOnly?: boolean;
  submenu?: { title: string; href: string }[];
}

const menuItems: MenuItem[] = [
  { title: "Tổng quan", href: "/", icon: LayoutDashboard, group: "Không gian làm việc" },
  { title: "Hộ khẩu", href: "/ho-khau", icon: Building2, group: "Quản lý dân cư", submenu: [
    { title: "Danh sách hộ khẩu", href: "/ho-khau" },
    { title: "Thống kê quy mô hộ", href: "/ho-khau/thong-ke" },
  ] },
  { title: "Nhân khẩu", href: "/nhan-khau", icon: Users, group: "Quản lý dân cư" },
  { title: "Tạm trú / Tạm vắng", href: "/tam-tru-tam-vang", icon: FileCheck, group: "Quản lý dân cư" },
  { title: "Thu phí & Đóng góp", href: "/thu-phi", icon: CreditCard, group: "Tài chính & Báo cáo", submenu: [
    { title: "Tổng quan đợt thu", href: "/thu-phi" },
    { title: "Phí vệ sinh & cố định", href: "/thu-phi/ve-sinh" },
    { title: "Đóng góp & ủng hộ", href: "/thu-phi/dong-gop" },
  ] },
  { title: "Báo cáo & Thống kê", href: "/thong-ke", icon: BarChart3, group: "Tài chính & Báo cáo" },
  { title: "Quản trị cán bộ", href: "/user", icon: ShieldCheck, group: "Hệ thống", adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [user, setUser] = useState<User>(getUser());
  const { isOpen: isMobileOpen, close: closeMobile } = useSidebar();
  const drawerRef = useRef<HTMLDialogElement>(null);

  const handleLogout = async () => {
    closeMobile();
    clearUser();
    setAT(null);
    setUser(null);
    try {
      const res = await api.post("/auth/logout");
      if (res.status === 201) toast.success("Đăng xuất thành công!");
      else toast.error("Đăng xuất thất bại!");
    } catch {
      toast.error("Đăng xuất thất bại!");
    }
    router.push("/");
  };

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    const unsubscribe = subscribeAuth(sync);
    return () => { unsubscribe(); };
  }, []);

  useEffect(() => {
    const activeParent = menuItems.find((item) => item.submenu?.some((sub) => sub.href === pathname));
    setOpenMenu(activeParent?.href ?? null);
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!isMobileOpen || !drawer) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    drawer.showModal();
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 768px)");
    const handleResize = () => { if (desktop.matches) closeMobile(); };
    desktop.addEventListener("change", handleResize);
    return () => {
      drawer.close();
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", handleResize);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [isMobileOpen, closeMobile]);

  if (pathname?.startsWith("/auth") || !user) return null;
  const visibleItems = menuItems.filter((item) => !item.adminOnly || user.role === "admin");

  const navContent = (mobile: boolean) => (
    <div className="flex h-full flex-col">
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <Link href="/" onClick={closeMobile} className="flex min-w-0 items-center gap-3 text-white">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5"><Building2 className="h-5 w-5" /></span>
          <span><span className="block text-base font-extrabold tracking-tight">TỔ DÂN PHỐ 7</span><span className="mt-0.5 block text-xs text-slate-400">Phường La Khê</span></span>
        </Link>
        {mobile && <button type="button" onClick={closeMobile} className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10" aria-label="Đóng menu"><X className="h-5 w-5" /></button>}
      </div>
      <nav aria-label="Điều hướng chính" className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {visibleItems.map((item, index) => {
            const Icon = item.icon;
            const expanded = openMenu === item.href;
            const active = pathname === item.href || item.submenu?.some((sub) => sub.href === pathname);
            const submenuId = `${mobile ? "mobile" : "desktop"}-menu-${index}`;
            const style = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold ${active ? "bg-[#274669] text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`;
            return (
              <li key={item.href}>
                {(index === 0 || item.group !== visibleItems[index - 1].group) && <p className={`${index ? "mt-6" : ""} mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400`}>{item.group}</p>}
                {item.submenu ? <>
                  <button type="button" className={style} aria-expanded={expanded} aria-controls={submenuId} onClick={() => setOpenMenu(expanded ? null : item.href)}>
                    <Icon className="h-[18px] w-[18px] shrink-0" /><span>{item.title}</span><ChevronDown className={`ml-auto h-3.5 w-3.5 ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  <ul id={submenuId} hidden={!expanded} className="my-1 ml-5 space-y-0.5 border-l border-white/15 pl-3">
                    {item.submenu.map((sub) => <li key={sub.href}><Link href={sub.href} onClick={closeMobile} aria-current={pathname === sub.href ? "page" : undefined} className={`block rounded-md px-3 py-2 text-xs ${pathname === sub.href ? "bg-white/10 font-bold text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>{sub.title}</Link></li>)}
                  </ul>
                </> : <Link href={item.href} onClick={closeMobile} aria-current={pathname === item.href ? "page" : undefined} className={style}><Icon className="h-[18px] w-[18px] shrink-0" /><span>{item.title}</span></Link>}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-white/5 p-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {user.username?.charAt(0).toUpperCase() || "U"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">{user.username}</p>
            <p className="truncate text-[11px] text-slate-400">{user.role === "admin" ? "Quản trị viên" : "Cán bộ"}</p>
          </div>
          {user.role === "admin" && (
            <Link
              href="/user"
              onClick={closeMobile}
              className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              title="Quản trị cán bộ"
              aria-label="Quản trị cán bộ"
            >
              <ShieldCheck className="h-4 w-4" />
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded p-1 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
            title="Đăng xuất"
            aria-label="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return <>
    <aside className="app-sidebar fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] bg-[var(--sidebar)] md:block">{navContent(false)}</aside>
    {isMobileOpen && <dialog ref={drawerRef} id="mobile-navigation" className="navigation-drawer" aria-label="Danh mục điều hướng" onCancel={(event) => { event.preventDefault(); closeMobile(); }} onClick={(event) => { if (event.target === event.currentTarget && event.clientX > event.currentTarget.getBoundingClientRect().right) closeMobile(); }}>{navContent(true)}</dialog>}
  </>;
}
