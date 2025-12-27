"use client";
import { clearUser, getUser, setAT, setUserFromToken } from "@/lib/AuthToken";
import api from "@/lib/axios";
import { useEffect, useState } from "react";

export default function Boostrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      const res = await api.post("/auth/refresh");
      if (res.status === 201) {
        setAT(res.data.access_token);
        setUserFromToken(res.data.access_token);
        console.log(getUser());
        console.log("Đã làm mới phiên đăng nhập");
        setReady(true);
      } else {
        setAT(null);
        clearUser();
        console.log("Phiên đăng nhập đã hết hạn");
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return null;
  }
  return <>{children}</>;
}
