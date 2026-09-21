"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/axios";
import {
  setAT,
  setUserFromToken,
  clearUser,
  getUser,
  subscribeAuth,
  User,
} from "@/lib/AuthToken";

export default function Bootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User>(getUser());
  const pathname = usePathname();
  const router = useRouter();

  // 1. Theo dõi trạng thái AuthToken
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

  // 2. Khởi tạo phiên làm việc (Refresh Token)
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const res = await api.post("/auth/refresh");

        if (res.status === 200 || res.status === 201) {
          setAT(res.data.access_token);
          setUserFromToken(res.data.access_token);
        } else {
          setAT(null);
          clearUser();
        }
      } catch {
        setAT(null);
        clearUser();
      } finally {
        if (mounted) setReady(true);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const isAuthPage = pathname?.startsWith("/auth");
  const isProtectedPage = pathname !== "/" && !isAuthPage;

  // 3. Route Guard: Chuyển hướng khi không thỏa mãn điều kiện xác thực
  useEffect(() => {
    if (!ready) return;

    if (!user && isProtectedPage) {
      router.replace("/auth/login");
    } else if (user && isAuthPage) {
      router.replace("/");
    }
  }, [ready, user, pathname, isProtectedPage, isAuthPage, router]);

  // Hiển thị trạng thái tải / chuyển hướng để tránh render trang bảo vệ khi chưa đăng nhập
  if (!ready || (!user && isProtectedPage) || (user && isAuthPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-stone-200">
          <div className="w-8 h-8 border-4 border-stone-400 border-t-stone-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600 font-medium">
            {!ready ? "Đang tải ứng dụng..." : "Đang chuyển hướng..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
