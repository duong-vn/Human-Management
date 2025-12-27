"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }
    setIsLoading(true);
    // TODO: Xử lý đăng ký sau khi kết nối API
    console.log("Đăng ký:", formData);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen flex bg-stone-100">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-stone-800 relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white w-full">
          <div className="text-7xl mb-8">🌟</div>
          <h2 className="text-3xl font-bold mb-4 text-center">
            Tham gia BlueMoon
          </h2>
          <p className="text-lg text-stone-300 text-center max-w-md mb-10">
            Đăng ký ngay để trải nghiệm hệ thống quản lý chung cư hiện đại
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            <div className="bg-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">🏠</div>
              <div className="text-sm text-stone-200">Quản lý hộ khẩu</div>
            </div>
            <div className="bg-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-sm text-stone-200">Quản lý cư dân</div>
            </div>
            <div className="bg-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-sm text-stone-200">Thu phí dễ dàng</div>
            </div>
            <div className="bg-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm text-stone-200">Báo cáo chi tiết</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
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
              Tạo tài khoản mới
            </h1>
            <p className="text-stone-500">
              Nhập thông tin để đăng ký tài khoản
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-stone-700 mb-2"
              >
                Họ và tên
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent transition outline-none"
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent transition outline-none"
                placeholder="name@example.com"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-stone-700 mb-2"
              >
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent transition outline-none"
                placeholder="0912 345 678"
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
                placeholder="Tối thiểu 6 ký tự"
                required
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-stone-700 mb-2"
              >
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent transition outline-none"
                placeholder="Nhập lại mật khẩu"
                required
                minLength={6}
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreeTerms: e.target.checked })
                }
                className="w-4 h-4 mt-1 text-stone-600 border-stone-300 rounded focus:ring-stone-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-stone-600">
                Tôi đồng ý với{" "}
                <Link
                  href="/terms"
                  className="text-stone-800 hover:text-stone-600 font-medium"
                >
                  Điều khoản sử dụng
                </Link>{" "}
                và{" "}
                <Link
                  href="/privacy"
                  className="text-stone-800 hover:text-stone-600 font-medium"
                >
                  Chính sách bảo mật
                </Link>
              </label>
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
                "Đăng ký"
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-stone-600">
            Đã có tài khoản?{" "}
            <Link
              href="/auth/login"
              className="text-stone-800 hover:text-stone-600 font-semibold"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
