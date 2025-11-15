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

  // Không hiển thị sidebar trên trang auth
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700 mt-4">
        <div className="text-xs text-gray-400">
          <p>Phiên bản 1.0.0</p>
          <p className="mt-1">© 2025 Quản lý nhân khẩu</p>
        </div>
      </div>
    </aside>
  );
}
