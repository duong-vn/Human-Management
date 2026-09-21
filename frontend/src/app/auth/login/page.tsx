"use client";

import { setAT, setUserFromToken } from "@/lib/AuthToken";
import api from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Badge } from "@/components/ui";
import {
  Building2,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", formData);
      if (response.status === 201) {
        setIsLoading(false);
        setAT(response.data.access_token);
        toast.success("Đăng nhập thành công!");
        setUserFromToken(response.data.access_token);
        router.replace("/");
        return;
      } else {
        setIsLoading(false);
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch {
      setIsLoading(false);
      toast.error(
        "Đăng nhập thất bại. Tên đăng nhập hoặc mật khẩu không chính xác."
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left Column: Civic Overview (Desktop) */}
      <div className="hidden lg:flex flex-1 bg-slate-900 border-r border-slate-800 text-white p-12 flex-col justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-blue-700 border border-blue-500/40 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Tổ Dân Phố 7 — Phường La Khê
              </p>
              <h2 className="text-base font-bold text-white tracking-tight">
                Hệ Thống Quản Lý Dân Cư
              </h2>
            </div>
          </Link>
        </div>

        {/* Center Content */}
        <div className="max-w-md space-y-5">
          <Badge variant="primary" size="sm">
            Cổng Dịch Vụ Cán Bộ Quản Lý
          </Badge>

          <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Quản trị dữ liệu dân cư văn minh, minh bạch và an toàn
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Hệ thống hỗ trợ cán bộ tổ dân phố quản lý hồ sơ hộ tịch, theo dõi
            biến động nhân khẩu, công khai minh bạch các nguồn quỹ và phục vụ
            nhân dân chuẩn xác, nhanh chóng.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Bảo mật thông tin nhân thân và số định danh công dân",
              "Quản lý sổ hộ khẩu điện tử và biến động thường trú, tạm trú",
              "Lập phiếu thu, xuất biên lai và đối soát công khai các quỹ dân cư",
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-xs text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-400">
          UBND Phường La Khê — Ban Quản Lý Tổ Dân Phố 7
        </div>
      </div>

      {/* Right Column: Clean Civic Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-xs">
          {/* Mobile emblem */}
          <div className="lg:hidden mb-6 flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Tổ Dân Phố 7 — Phường La Khê
              </p>
              <h2 className="text-sm font-bold text-slate-900">
                Hệ Thống Quản Lý Dân Cư
              </h2>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Đăng nhập hệ thống
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Sử dụng tài khoản cán bộ được cấp để truy cập bảng điều khiển
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Tên đăng nhập hoặc Email cán bộ
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-700 focus:ring-1 focus:ring-blue-700 transition-all outline-none"
                  placeholder="admin hoặc email cán bộ"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Mật khẩu
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-700 focus:ring-1 focus:ring-blue-700 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 font-semibold shadow-xs"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Đăng nhập vào hệ thống
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link
              href="/"
              className="hover:text-blue-700 font-medium transition-colors"
            >
              ← Cổng thông tin TDP 7
            </Link>
            <Link
              href="/auth/register"
              className="hover:text-blue-700 font-medium transition-colors"
            >
              Cấp tài khoản cán bộ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
