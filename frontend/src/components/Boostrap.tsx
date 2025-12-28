"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios"; // Đường dẫn axios của bạn
import {
  getAT,
  setAT,
  setUserFromToken,
  clearUser,
  getUser,
} from "@/lib/AuthToken"; // Import các hàm này từ file AuthToken

export default function Bootstrap({ children }: { children: React.ReactNode }) {
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
    // Bạn có thể return một cái loading spinner xoay xoay ở đây cho đẹp thay vì null
    return <div className="p-10 text-center">Đang tải ứng dụng...</div>;
  }

  return <>{children}</>;
}
