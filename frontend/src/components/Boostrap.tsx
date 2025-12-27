"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios"; // Đường dẫn axios của bạn
import { getAT, setAT, setUserFromToken, clearUser, getUser } from "@/lib/AuthToken"; // Import các hàm này từ file AuthToken

export default function Bootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // 1. Kiểm tra xem có token trong máy không trước đã
        const token = getAT();

        // Nếu không có token thì thôi, không gọi API nữa để tránh lỗi 400
        if (!token) {
          console.log("Không tìm thấy token, vào chế độ khách.");
          setReady(true); // Cho hiện web luôn
          return;
        }

        // 2. Nếu có token thì mới gọi refresh
        const res = await api.post("/auth/refresh"); // Hoặc "/api/auth/refresh" tùy config backend

        if (res.status === 201 || res.status === 200) {
          setAT(res.data.access_token);
          setUserFromToken(res.data.access_token);
          console.log("Đã làm mới phiên đăng nhập:", getUser());
        }

      } catch (error) {
        // 3. Nếu lỗi (ví dụ token hết hạn, backend lỗi 400/401...)
        console.log("Phiên đăng nhập lỗi hoặc hết hạn:", error);

        // Xóa sạch dữ liệu cũ để tránh lỗi tiếp
        setAT(null);
        clearUser();

      } finally {
        // 4. [QUAN TRỌNG NHẤT] Dù thành công hay thất bại, LUÔN LUÔN cho hiện web
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    // Bạn có thể return một cái loading spinner xoay xoay ở đây cho đẹp thay vì null
    return <div className="p-10 text-center">Đang tải ứng dụng...</div>;
  }

  return <>{children}</>;
}
