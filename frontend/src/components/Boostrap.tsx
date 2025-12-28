"use client";
import { clearUser, getUser, setAT, setUserFromToken } from "@/lib/AuthToken";
import api from "@/lib/axios";
import { useEffect, useState } from "react";

export default function Boostrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const res = await api.post("/auth/refresh");

        if (res.status === 200 || res.status === 201) {
          setAT(res.data.access_token);
          setUserFromToken(res.data.access_token);
          console.log("Đã làm mới phiên đăng nhập");
        } else {
          setAT(null);
          clearUser();
          console.log("Phiên đăng nhập đã hết hạn");
        }
      } catch (err) {
        // refresh fail là chuyện BÌNH THƯỜNG
        setAT(null);
        clearUser();
        console.log("Không có phiên đăng nhập");
      } finally {
        if (mounted) setReady(true); // 👈 CỨU TRẮNG TRANG
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return null;
  }
  return <>{children}</>;
}
