"use client";

import { getUser, subscribeAuth, User } from "@/lib/AuthToken";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  ArrowRightIcon,
  MapPinIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

// Component Landing Page cho người chưa đăng nhập
function LandingPage() {
  const features = [
    {
      icon: HomeIcon,
      title: "Quản lý hộ khẩu",
      description:
        "Theo dõi và quản lý thông tin hộ khẩu, tách hộ, nhập hộ một cách dễ dàng",
    },
    {
      icon: UsersIcon,
      title: "Quản lý nhân khẩu",
      description:
        "Quản lý thông tin cư dân, đăng ký mới sinh, thống kê dân số",
    },
    {
      icon: CurrencyDollarIcon,
      title: "Thu phí & Đóng góp",
      description:
        "Quản lý các khoản thu bắt buộc và tự nguyện, minh bạch và hiệu quả",
    },
    {
      icon: DocumentTextIcon,
      title: "Phiếu thu điện tử",
      description: "Tạo và quản lý phiếu thu, theo dõi tình trạng nộp phí",
    },
    {
      icon: MapPinIcon,
      title: "Tạm trú - Tạm vắng",
      description: "Quản lý đăng ký tạm trú, tạm vắng của cư dân",
    },
    {
      icon: ChartBarIcon,
      title: "Thống kê báo cáo",
      description: "Báo cáo chi tiết với biểu đồ trực quan, dễ theo dõi",
    },
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
                Phần mềm quản lý tổ dân phố
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                Ban quản lý{" "}
                <span className="bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Tổ dân phố 7
                </span>
                <br />
                <span className="text-3xl lg:text-4xl text-stone-300">
                  Phường La Khê
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-stone-300 mb-8 leading-relaxed">
                Giải pháp phần mềm quản lý thông tin khu dân cư toàn diện, giúp
                công tác quản lý hộ khẩu, nhân khẩu và thu phí được thực hiện dễ
                dàng, minh bạch và hiệu quả.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth/login"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-blue-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
                >
                  Đăng nhập
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-stone-700 text-white font-semibold rounded-xl border border-stone-600">
                  <span className="text-stone-400">Liên hệ:</span>
                  <span>0123 456 789</span>
                </div>
              </div>
            </div>

            {/* Right - Info Card */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Building Card */}
                <div className="absolute inset-0 bg-linear-to-br from-stone-700 to-stone-800 rounded-3xl border border-stone-600 shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex flex-col h-full">
                    {/* Building Top */}
                    <div className="flex justify-center mb-6">
                      <BuildingOffice2Icon className="w-20 h-20 text-blue-400" />
                    </div>

                    {/* Building Info */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Tổ dân phố 7
                      </h3>
                      <p className="text-stone-400">
                        Phường La Khê, Quận Hà Đông
                      </p>
                      <p className="text-stone-500 text-sm">Thành phố Hà Nội</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <div className="bg-stone-600/50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-white">🏠</p>
                        <p className="text-sm text-stone-400">Hộ khẩu</p>
                      </div>
                      <div className="bg-stone-600/50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-white">👥</p>
                        <p className="text-sm text-stone-400">Nhân khẩu</p>
                      </div>
                      <div className="bg-stone-600/50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-white">💰</p>
                        <p className="text-sm text-stone-400">Thu phí</p>
                      </div>
                      <div className="bg-stone-600/50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-white">📋</p>
                        <p className="text-sm text-stone-400">Tạm trú/vắng</p>
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

      {/* Features Section */}
      <section className="py-24 border-t border-stone-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-stone-400 text-lg max-w-2xl mx-auto">
              Hệ thống quản lý toàn diện với đầy đủ tính năng phục vụ công tác
              quản lý tổ dân phố
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
            Sẵn sàng sử dụng?
          </h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            Đăng nhập ngay để sử dụng hệ thống quản lý tổ dân phố với đầy đủ
            tính năng.
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
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                T7
              </div>
              <span className="text-white font-bold">
                TDP7<span className="text-stone-400"> La Khê</span>
              </span>
            </div>
            <p className="text-stone-500 text-sm">
              © 2025 Ban quản lý Tổ dân phố 7 - Phường La Khê
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Component Dashboard cho người đã đăng nhập
function Dashboard() {
  // Fetch thống kê hộ khẩu
  const { data: hoKhauStats } = useQuery({
    queryKey: ["hoKhauThongKe"],
    queryFn: async () => {
      const res = await api.get("/ho-khau/thong-ke");
      return res.data;
    },
  });

  // Fetch thống kê nhân khẩu
  const { data: nhanKhauStats } = useQuery({
    queryKey: ["nhanKhauTongQuan"],
    queryFn: async () => {
      const res = await api.get("/nhan-khau/thong-ke/tong-quan");
      return res.data;
    },
  });

  // Fetch thống kê giới tính
  const { data: gioiTinhStats } = useQuery({
    queryKey: ["nhanKhauGioiTinh"],
    queryFn: async () => {
      const res = await api.get("/nhan-khau/thong-ke/gioi-tinh");
      // API trả về mảng [{_id: "Nam", soLuong: X}, {_id: "Nữ", soLuong: Y}]
      const data = res.data as Array<{ _id: string; soLuong: number }>;
      const nam = data.find((item) => item._id === "Nam")?.soLuong ?? 0;
      const nu = data.find((item) => item._id === "Nữ")?.soLuong ?? 0;
      return { nam, nu };
    },
  });

  // Fetch tuổi trung bình
  const { data: tuoiTrungBinh } = useQuery({
    queryKey: ["tuoiTrungBinh"],
    queryFn: async () => {
      const res = await api.get("/nhan-khau/thong-ke/tuoi-trung-binh");
      return res.data;
    },
  });

  // Fetch thống kê tạm trú tạm vắng
  const { data: tamTruTamVangStats } = useQuery({
    queryKey: ["tamTruTamVangThongKe"],
    queryFn: async () => {
      const res = await api.get("/tam-tru-tam-vang/thong-ke");
      return res.data;
    },
  });

  // Fetch thống kê thu phí năm hiện tại
  const currentYear = new Date().getFullYear();
  const { data: thuPhiStats } = useQuery({
    queryKey: ["thuPhiThongKe", currentYear],
    queryFn: async () => {
      const res = await api.get(`/thu-phi/thong-ke/nam/${currentYear}`);
      return res.data;
    },
  });

  // Fetch danh sách khoản thu active
  const { data: khoanThuActive } = useQuery({
    queryKey: ["khoanThuActive"],
    queryFn: async () => {
      const res = await api.get("/khoan-thu/active");
      return res.data;
    },
  });

  const quickActions = [
    {
      title: "Quản lý hộ khẩu",
      description: "Xem, thêm, sửa hộ khẩu",
      icon: "🏠",
      href: "/ho-khau",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Quản lý nhân khẩu",
      description: "Quản lý thông tin cư dân",
      icon: "👥",
      href: "/nhan-khau",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Thu phí & Khoản thu",
      description: "Quản lý các khoản thu",
      icon: "💵",
      href: "/thu-phi",
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Tạm trú - Tạm vắng",
      description: "Quản lý đăng ký",
      icon: "📋",
      href: "/tam-tru-tam-vang",
      color: "from-rose-500 to-rose-600",
    },
    {
      title: "Thống kê",
      description: "Báo cáo tổng hợp",
      icon: "📊",
      href: "/thong-ke",
      color: "from-cyan-500 to-cyan-600",
    },
  ];

  const formatCurrency = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)} tỷ`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(0)} triệu`;
    }
    return new Intl.NumberFormat("vi-VN").format(num) + "đ";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">
              Tổ dân phố 7 - Phường La Khê 🏘️
            </h1>
            <p className="text-stone-500 mt-1">
              Hệ thống quản lý thông tin khu dân cư
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-500">Hôm nay</p>
            <p className="text-lg font-semibold text-stone-700">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Hộ khẩu */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-500">Tổng hộ khẩu</p>
              <p className="text-3xl font-bold text-stone-800 mt-1">
                {hoKhauStats?.tong ?? "..."}
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-emerald-600 font-medium">
                  {hoKhauStats?.dangHoatDong ?? 0} đang hoạt động
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              🏠
            </div>
          </div>
        </div>

        {/* Nhân khẩu */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-500">
                Tổng nhân khẩu
              </p>
              <p className="text-3xl font-bold text-stone-800 mt-1">
                {nhanKhauStats?.tong ?? "..."}
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-stone-500">
                <span>Nam: {gioiTinhStats?.nam ?? 0}</span>
                <span>•</span>
                <span>Nữ: {gioiTinhStats?.nu ?? 0}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
        </div>

        {/* Thu phí năm */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-500">
                Thu năm {currentYear}
              </p>
              <p className="text-2xl font-bold text-stone-800 mt-1">
                {thuPhiStats?.tongThu
                  ? formatCurrency(thuPhiStats.tongThu)
                  : "..."}
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-emerald-600 font-medium">
                  {thuPhiStats?.soPhieuThu ?? 0} phiếu đã thu
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
              💰
            </div>
          </div>
        </div>

        {/* Tạm trú tạm vắng */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-500">Tạm trú/vắng</p>
              <p className="text-3xl font-bold text-stone-800 mt-1">
                {(tamTruTamVangStats?.tamTru ?? 0) +
                  (tamTruTamVangStats?.tamVang ?? 0)}
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-stone-500">
                <span className="text-blue-600">
                  Trú: {tamTruTamVangStats?.tamTru ?? 0}
                </span>
                <span>•</span>
                <span className="text-orange-600">
                  Vắng: {tamTruTamVangStats?.tamVang ?? 0}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
          </div>
        </div>
      </div>

      {/* Chi tiết thống kê */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin nhân khẩu chi tiết */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-linear-to-r from-emerald-50 to-teal-50">
            <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-emerald-600" />
              Thống kê nhân khẩu
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Tuổi trung bình</span>
              <span className="font-semibold text-stone-800">
                {tuoiTrungBinh?.tuoiTrungBinh
                  ? `${tuoiTrungBinh.tuoiTrungBinh.toFixed(1)} tuổi`
                  : "..."}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Tổng nam giới</span>
              <span className="font-semibold text-blue-600">
                {gioiTinhStats?.nam ?? 0} người
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Tổng nữ giới</span>
              <span className="font-semibold text-pink-600">
                {gioiTinhStats?.nu ?? 0} người
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Tỷ lệ nam/nữ</span>
              <span className="font-semibold text-stone-800">
                {gioiTinhStats?.nam && gioiTinhStats?.nu
                  ? `${((gioiTinhStats.nam / gioiTinhStats.nu) * 100).toFixed(
                      0
                    )}%`
                  : "..."}
              </span>
            </div>
            <Link
              href="/nhan-khau"
              className="block text-center py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-4"
            >
              Xem chi tiết →
            </Link>
          </div>
        </div>

        {/* Thống kê hộ khẩu */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-linear-to-r from-blue-50 to-indigo-50">
            <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
              <HomeIcon className="w-5 h-5 text-blue-600" />
              Thống kê hộ khẩu
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Tổng số hộ</span>
              <span className="font-semibold text-stone-800">
                {hoKhauStats?.tong ?? 0} hộ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Đang hoạt động</span>
              <span className="font-semibold text-emerald-600">
                {hoKhauStats?.dangHoatDong ?? 0} hộ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Đã tách hộ</span>
              <span className="font-semibold text-amber-600">
                {hoKhauStats?.daTachHo ?? 0} hộ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Đã xóa</span>
              <span className="font-semibold text-stone-400">
                {hoKhauStats?.daXoa ?? 0} hộ
              </span>
            </div>
            <Link
              href="/ho-khau"
              className="block text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-4"
            >
              Xem chi tiết →
            </Link>
          </div>
        </div>

        {/* Khoản thu đang hoạt động */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-linear-to-r from-amber-50 to-orange-50">
            <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-amber-600" />
              Khoản thu đang hoạt động
            </h2>
          </div>
          <div className="p-4">
            {khoanThuActive && khoanThuActive.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {khoanThuActive.slice(0, 5).map((kt: any, index: number) => (
                  <div
                    key={kt._id || index}
                    className="flex justify-between items-center p-3 bg-stone-50 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-700 truncate text-sm">
                        {kt.tenKhoanThu}
                      </p>
                      <p className="text-xs text-stone-500">
                        {kt.loaiKhoanThu === "bat_buoc"
                          ? "Bắt buộc"
                          : "Tự nguyện"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-amber-600 ml-2">
                      {kt.soTien ? formatCurrency(kt.soTien) : "Tùy tâm"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-stone-500 py-4 text-sm">
                Chưa có khoản thu nào
              </p>
            )}
            <Link
              href="/thu-phi"
              className="block text-center py-2 text-sm text-amber-600 hover:text-amber-700 font-medium mt-2"
            >
              Quản lý khoản thu →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-800">
            Truy cập nhanh
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-stone-50 transition-colors group text-center"
              >
                <div
                  className={`w-12 h-12 bg-linear-to-br ${action.color} rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform`}
                >
                  {action.icon}
                </div>
                <div>
                  <p className="font-medium text-stone-700 text-sm">
                    {action.title}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
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
