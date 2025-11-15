"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<{ name: string } | null>(null); // Giả lập user state

  return (
    <nav className="bg-blue-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-xl font-bold hover:text-blue-200 transition"
          >
            🏠 Quản Lý Nhân Khẩu
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm">Xin chào, {user.name}</span>
              <button
                onClick={() => setUser(null)}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded transition font-medium"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
