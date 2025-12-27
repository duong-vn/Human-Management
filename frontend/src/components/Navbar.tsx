"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAT, getUser, User } from "@/lib/AuthToken";
import { get } from "http";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const [user, setUser] = useState<User>(getUser());
  useEffect(() => {
    setUser(getUser());
  }, [getAT()]);
  if (isAuthPage) return null;

  return (
    <nav className="bg-stone-800 text-stone-100 shadow-md fixed top-0 left-0 right-0 z-50 border-b border-stone-700">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-stone-600 to-stone-700 rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:from-stone-500 group-hover:to-stone-600 transition-all">
            B
          </div>
          <span className="text-lg font-bold text-stone-100 group-hover:text-white transition">
            Blue
            <span className="text-stone-400 group-hover:text-stone-300">
              Moon
            </span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-stone-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-stone-300">{user.username}</span>
              </div>
              <button
                onClick={() => setUser(null)}
                className="px-4 py-2 text-sm text-stone-400 hover:text-white hover:bg-stone-700 rounded-lg transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm text-stone-300 hover:text-white hover:bg-stone-700 rounded-lg transition font-medium"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm bg-stone-600 hover:bg-stone-500 text-white rounded-lg transition font-medium"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
