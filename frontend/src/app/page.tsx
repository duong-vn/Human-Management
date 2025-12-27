"use client";

import Link from "next/link";

export default function Home() {
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

  const getActivityColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-emerald-100 border-emerald-300 text-emerald-700";
      case "update":
        return "bg-amber-100 border-amber-300 text-amber-700";
      case "success":
        return "bg-sky-100 border-sky-300 text-sky-700";
      default:
        return "bg-stone-100 border-stone-300 text-stone-700";
    }
  };

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
      <div className="bg-gradient-to-r from-stone-700 to-stone-800 rounded-xl p-6 text-white">
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
