"use client";

import { getAT, getUser, setAT, setUserFromToken } from "@/lib/AuthToken";
import api from "@/lib/axios";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
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
        // toast.success(JSON.stringify(getUser()));
        // toast.success(getAT() || ""); // Debug: show the access token
        router.replace("/");
        return;
      } else {
        setIsLoading(false);
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch (err) {
      setIsLoading(false);
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-100">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
              B
            </div>
            <span className="text-xl font-bold text-stone-800">
              Blue<span className="text-stone-500">Moon</span>
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-800 mb-2">
              Chào mừng trở lại
            </h1>
            <p className="text-stone-500">Đăng nhập để tiếp tục quản lý </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700 mb-2"
              >
                Email hoặc tên đăng nhập
              </label>
              <input
                type="text"
                id="email"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent transition outline-none"
                placeholder="name@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700 mb-2"
              >
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent transition outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-stone-600 hover:text-stone-800 font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Contact Info */}
          <p className="mt-8 text-center text-stone-500 text-sm">
            Liên hệ Tổ trưởng:{" "}
            <span className="font-semibold text-stone-700">0123 456 789</span>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-stone-800 relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white w-full">
          <div className="text-7xl mb-8">🏢</div>
          <h2 className="text-3xl font-bold mb-4 text-center">
            Hệ thống quản lý hộ khẩu
          </h2>
          <p className="text-lg text-stone-300 text-center max-w-md mb-10">
            Quản lý hộ khẩu, nhân khẩu và thu phí một cách hiệu quả với BlueMoon
          </p>

          {/* Features */}
          <div className="space-y-4 w-full max-w-sm">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
              <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                ✓
              </span>
              <span className="text-stone-200">Quản lý hộ khẩu dễ dàng</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
              <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                ✓
              </span>
              <span className="text-stone-200">Theo dõi thu phí minh bạch</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
              <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                ✓
              </span>
              <span className="text-stone-200">Báo cáo thống kê chi tiết</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
