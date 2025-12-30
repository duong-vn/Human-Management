"use client";

import { getUser, subscribeAuth, User } from "@/lib/AuthToken";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// Component Landing Page cho người chưa đăng nhập
function LandingPage() {
  const features = [
    {
      icon: HomeIcon,
      title: "Quản lý hộ khẩu",
      description:
        "Theo dõi và quản lý thông tin hộ khẩu một cách dễ dàng và chính xác",
    },
    {
      icon: UsersIcon,
      title: "Quản lý nhân khẩu",
      description: "Quản lý thông tin cư dân, thống kê dân số chi tiết",
    },
    {
      icon: CurrencyDollarIcon,
      title: "Thu phí tự động",
      description: "Hệ thống thu phí thông minh, minh bạch và hiệu quả",
    },
    {
      icon: DocumentTextIcon,
      title: "Phiếu thu điện tử",
      description: "Tạo và quản lý phiếu thu nhanh chóng, tiện lợi",
    },
    {
      icon: ChartBarIcon,
      title: "Thống kê báo cáo",
      description: "Báo cáo chi tiết với biểu đồ trực quan sinh động",
    },
    {
      icon: ShieldCheckIcon,
      title: "Bảo mật cao",
      description: "Dữ liệu được mã hóa và bảo vệ an toàn tuyệt đối",
    },
  ];

  const stats = [
    { value: "1,200+", label: "Hộ khẩu" },
    { value: "4,500+", label: "Cư dân" },
    { value: "98%", label: "Hài lòng" },
    { value: "24/7", label: "Hỗ trợ" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-900 via-stone-800 to-stone-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-700/50 rounded-full text-stone-300 text-sm mb-6 border border-stone-600">
                <SparklesIcon className="w-4 h-4 text-yellow-400" />
                Hệ thống quản lý chung cư hiện đại
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Chào mừng đến với{" "}
                <span className="bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  BlueMoon
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-stone-300 mb-8 leading-relaxed">
                Giải pháp quản lý chung cư toàn diện, giúp ban quản lý và cư dân
                kết nối một cách dễ dàng, minh bạch và hiệu quả.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth/login"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-blue-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
                >
                  Đăng nhập ngay
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-stone-700 text-white font-semibold rounded-xl border border-stone-600 hover:bg-stone-600 hover:border-stone-500 transition-all duration-300"
                >
                  Đăng ký tài khoản
                </Link>
              </div>
            </div>

            {/* Right - Building Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Building Card */}
                <div className="absolute inset-0 bg-linear-to-br from-stone-700 to-stone-800 rounded-3xl border border-stone-600 shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex flex-col h-full">
                    {/* Building Top */}
                    <div className="flex justify-center mb-6">
                      <BuildingOffice2Icon className="w-24 h-24 text-blue-400" />
                    </div>

                    {/* Building Info */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        BlueMoon Tower
                      </h3>
                      <p className="text-stone-400">
                        Chung cư cao cấp hiện đại
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-auto">
                      <div className="bg-stone-600/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">30</p>
                        <p className="text-sm text-stone-400">Tầng</p>
                      </div>
                      <div className="bg-stone-600/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">500+</p>
                        <p className="text-sm text-stone-400">Căn hộ</p>
                      </div>
                      <div className="bg-stone-600/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">5⭐</p>
                        <p className="text-sm text-stone-400">Tiêu chuẩn</p>
                      </div>
                      <div className="bg-stone-600/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">2024</p>
                        <p className="text-sm text-stone-400">Hoàn thành</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 bg-linear-to-r from-blue-500 to-blue-600 rounded-xl px-4 py-3 shadow-lg animate-bounce">
                  <p className="text-white font-semibold text-sm">
                    ✨ Hiện đại
                  </p>
                </div>
                <div
                  className="absolute -bottom-4 -right-4 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl px-4 py-3 shadow-lg animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                >
                  <p className="text-white font-semibold text-sm">🔒 An toàn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-stone-700 bg-stone-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl lg:text-5xl font-bold bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-stone-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-stone-400 text-lg max-w-2xl mx-auto">
              Hệ thống quản lý toàn diện với đầy đủ tính năng phục vụ công tác
              quản lý chung cư
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-stone-800/50 rounded-2xl border border-stone-700 hover:border-stone-600 hover:bg-stone-700/50 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-linear-to-br from-blue-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-stone-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-emerald-600/20"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            Đăng nhập ngay để sử dụng hệ thống quản lý chung cư BlueMoon với đầy
            đủ tính năng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-stone-900 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Bắt đầu ngay
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-stone-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                B
              </div>
              <span className="text-white font-bold">
                Blue<span className="text-stone-400">Moon</span>
              </span>
            </div>
            <p className="text-stone-500 text-sm">
              © 2025 BlueMoon. Hệ thống quản lý chung cư hiện đại.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Component Dashboard cho người đã đăng nhập
function Dashboard() {
  const stats = [
    {
      title: "Tổng hộ khẩu",
      value: "1,234",
      change: "+12",
      changeType: "increase",
      icon: "🏠",
      link: "/ho-khau",
    },
    {
      title: "Tổng nhân khẩu",
      value: "4,567",
      change: "+48",
      changeType: "increase",
      icon: "👥",
      link: "/nhan-khau",
    },
    {
      title: "Khoản thu tháng này",
      value: "45,000,000đ",
      change: "+15%",
      changeType: "increase",
      icon: "💰",
      link: "/thu-phi",
    },
    {
      title: "Phiếu thu chờ xử lý",
      value: "23",
      change: "-5",
      changeType: "decrease",
      icon: "📄",
      link: "/phieu-thu",
    },
  ];

  const recentActivities = [
    {
      action: "Thêm hộ khẩu mới",
      detail: "Hộ khẩu HK001 - Nguyễn Văn A",
      time: "2 giờ trước",
      type: "create",
    },
    {
      action: "Cập nhật nhân khẩu",
      detail: "Trần Thị B - Thay đổi địa chỉ",
      time: "5 giờ trước",
      type: "update",
    },
    {
      action: "Thu phí thành công",
      detail: "Phiếu thu PT202301001 - 50,000đ",
      time: "1 ngày trước",
      type: "success",
    },
    {
      action: "Thêm khoản thu mới",
      detail: "Phí vệ sinh hàng tháng",
      time: "2 ngày trước",
      type: "create",
    },
  ];

  const quickActions = [
    {
      title: "Thêm hộ khẩu",
      description: "Đăng ký hộ khẩu mới",
      icon: "🏠",
      href: "/ho-khau",
    },
    {
      title: "Thêm nhân khẩu",
      description: "Thêm cư dân mới",
      icon: "👤",
      href: "/nhan-khau",
    },
    {
      title: "Tạo khoản thu",
      description: "Lập khoản phí mới",
      icon: "💵",
      href: "/thu-phi",
    },
    {
      title: "Lập phiếu thu",
      description: "Ghi nhận thanh toán",
      icon: "📝",
      href: "/phieu-thu",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Xin chào! 👋</h1>
            <p className="text-stone-500 mt-1">
              Chào mừng bạn đến với hệ thống quản lý chung cư BlueMoon
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-500">Hôm nay</p>
            <p className="text-lg font-semibold text-stone-700">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {stats.map((stat, index) => (
          <Link
            key={index}
            href={stat.link}
            className="animate-fade-in-up opacity-0 bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-lg card-hover group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-500">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-stone-800 mt-1">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span
                    className={`text-xs font-medium ${
                      stat.changeType === "increase"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-stone-400">
                    so với tháng trước
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-stone-200 transition-colors">
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-lg font-semibold text-stone-800">
              Hoạt động gần đây
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "create"
                        ? "bg-emerald-500"
                        : activity.type === "update"
                        ? "bg-amber-500"
                        : "bg-sky-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-700">
                      {activity.action}
                    </p>
                    <p className="text-sm text-stone-500 truncate">
                      {activity.detail}
                    </p>
                  </div>
                  <span className="text-xs text-stone-400 whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/thong-ke"
              className="mt-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition"
            >
              Xem tất cả hoạt động
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-lg font-semibold text-stone-800">
              Thao tác nhanh
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center text-xl group-hover:bg-stone-200 transition-colors">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-700 text-sm">
                      {action.title}
                    </p>
                    <p className="text-xs text-stone-400">
                      {action.description}
                    </p>
                  </div>
                  <span className="text-stone-300 group-hover:text-stone-500 transition">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Banner */}
      <div className="bg-linear-to-r from-stone-700 to-stone-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-3xl">
              📊
            </div>
            <div>
              <h2 className="text-xl font-bold">Báo cáo & Thống kê</h2>
              <p className="text-stone-300 mt-1">
                Xem báo cáo chi tiết về hộ khẩu, nhân khẩu và thu phí
              </p>
            </div>
          </div>
          <Link
            href="/thong-ke"
            className="px-5 py-2.5 bg-white text-stone-700 rounded-lg font-medium hover:bg-stone-100 transition-colors"
          >
            Xem báo cáo →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main Home Component
export default function Home() {
  const [user, setUser] = useState<User>(getUser());

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

  // Nếu chưa đăng nhập: hiển thị Landing Page
  // Nếu đã đăng nhập: hiển thị Dashboard
  return user ? <Dashboard /> : <LandingPage />;
}
