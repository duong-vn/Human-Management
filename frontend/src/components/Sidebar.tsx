"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
  {
    title: "Trang chủ",
    href: "/",
    icon: HomeIcon,
  },
  {
    title: "Quản lý hộ khẩu",
    href: "/ho-khau",
    icon: UserGroupIcon,
  },
  {
    title: "Quản lý nhân khẩu",
    href: "/nhan-khau",
    icon: UsersIcon,
  },
  {
    title: "Quản lý thu phí",
    href: "/thu-phi",
    icon: CurrencyDollarIcon,
  },
  {
    title: "Quản lý phiếu thu",
    href: "/phieu-thu",
    icon: DocumentTextIcon,
  },
  {
    title: "Thống kê báo cáo",
    href: "/thong-ke",
    icon: ChartBarIcon,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <aside className="bg-stone-800 text-stone-300 w-64 min-h-screen fixed left-0 top-16 bottom-0 overflow-y-auto border-r border-stone-700">
      <nav className="p-4">
        <div className="mb-6">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 mb-2">
            Menu chính
          </p>
        </div>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-stone-700 text-white shadow-sm"
                      : "hover:bg-stone-700/50 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-stone-300" : ""}`}
                  />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-700 bg-stone-800">
        <div className="text-xs text-stone-500">
          <p className="font-medium">BlueMoon v1.0.0</p>
          <p className="mt-1">© 2025 Quản lý chung cư</p>
        </div>
      </div>
    </aside>
  );
}
