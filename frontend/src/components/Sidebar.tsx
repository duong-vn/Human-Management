"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react"; // 1. Import useState
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChevronDownIcon, // 2. Import icon mũi tên
} from "@heroicons/react/24/outline";

// ... (Các import giữ nguyên)

// 3. Cấu trúc menu hỗ trợ submenu (ĐÃ SỬA: XÓA MỤC TRÙNG)
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
  // --- CHỈ GIỮ LẠI 1 MỤC NÀY THÔI ---
  {
    title: "Quản lý thu phí",
    href: "/thu-phi",
    icon: CurrencyDollarIcon,
    submenu: [
      { title: "Tổng quan", href: "/thu-phi" },
      { title: "Khoản phí cố định", href: "/thu-phi/ve-sinh" },
      { title: "Đóng góp / Ủng hộ", href: "/thu-phi/dong-gop" },
    ],
  },
  // ----------------------------------
  {
    title: "Quản lý phiếu thu",
    href: "/phieu-thu",
    icon: DocumentTextIcon,
  },
  {
    title: "Tạm trú tạm vắng",
    href: "/tam-tru-tam-vang",
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
  // State lưu danh sách menu đang mở (lưu theo href của cha)
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Tự động mở menu cha nếu đang đứng ở trang con (khi reload trang)
  useEffect(() => {
    const activeParent = menuItems.find(
      (item) =>
        item.submenu && item.submenu.some((sub) => sub.href === pathname)
    );
    if (activeParent) {
      setOpenMenu(activeParent.href);
    }
  }, [pathname]);

  // Hàm toggle đóng mở
  const handleToggle = (href: string) => {
    if (openMenu === href) {
      setOpenMenu(null); // Đóng nếu đang mở
    } else {
      setOpenMenu(href); // Mở menu mới
    }
  };

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
            // Logic kiểm tra active
            const isActive = pathname === item.href;
            // Kiểm tra xem item này có submenu không
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            // Kiểm tra xem menu này có đang mở không
            const isOpen = openMenu === item.href;
            // Kiểm tra nếu đang ở trong trang con của menu này
            const isParentActive =
              hasSubmenu && item.submenu?.some((sub) => sub.href === pathname);

            return (
              <li key={item.title}>
                {hasSubmenu ? (
                  /* TRƯỜNG HỢP 1: CÓ SUBMENU (VD: QUẢN LÝ THU PHÍ) */
                  <div>
                    <button
                      onClick={() => handleToggle(item.href)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                        isOpen || isParentActive
                          ? "bg-stone-700 text-white"
                          : "hover:bg-stone-700/50 text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 ${
                            isOpen || isParentActive ? "text-stone-300" : ""
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                      </div>
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Danh sách con sổ xuống */}
                    {isOpen && (
                      <ul className="mt-1 space-y-1 bg-stone-900/30 rounded-lg overflow-hidden">
                        {item.submenu?.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <li key={subItem.title}>
                              <Link
                                href={subItem.href}
                                className={`block pl-12 pr-4 py-2 text-sm transition-colors ${
                                  isSubActive
                                    ? "text-blue-400 font-medium bg-stone-800/50"
                                    : "text-stone-500 hover:text-stone-300 hover:bg-stone-800/30"
                                }`}
                              >
                                {subItem.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  /* TRƯỜNG HỢP 2: LINK BÌNH THƯỜNG KHÔNG CÓ SUBMENU */
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
                )}
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
