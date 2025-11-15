"use client";

import Link from "next/link";

export default function Home() {
  // Dữ liệu thống kê giả lập
  const stats = [
    {
      title: "Tổng hộ khẩu",
      value: "1,234",
      icon: "🏠",
      color: "bg-blue-500",
      link: "/ho-khau",
    },
    {
      title: "Tổng nhân khẩu",
      value: "4,567",
      icon: "👥",
      color: "bg-green-500",
      link: "/nhan-khau",
    },
    {
      title: "Khoản thu tháng này",
      value: "45,000,000 đ",
      icon: "💰",
      color: "bg-yellow-500",
      link: "/thu-phi",
    },
    {
      title: "Phiếu thu chưa thanh toán",
      value: "23",
      icon: "📄",
      color: "bg-red-500",
      link: "/phieu-thu",
    },
  ];

  const recentActivities = [
    {
      action: "Thêm hộ khẩu mới",
      detail: "Hộ khẩu HK001 - Nguyễn Văn A",
      time: "2 giờ trước",
    },
    {
      action: "Cập nhật nhân khẩu",
      detail: "Trần Thị B - Thay đổi địa chỉ",
      time: "5 giờ trước",
    },
    {
      action: "Thu phí thành công",
      detail: "Phiếu thu PT202301001 - 50,000đ",
      time: "1 ngày trước",
    },
    {
      action: "Thêm khoản thu mới",
      detail: "Phí vệ sinh hàng tháng",
      time: "2 ngày trước",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Chào mừng đến với Hệ thống Quản lý Nhân khẩu
        </h1>
        <p className="text-gray-600">
          Quản lý hộ khẩu, nhân khẩu và các khoản thu phí một cách hiệu quả
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link
            key={index}
            href={stat.link}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div
                className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Hoạt động gần đây
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-semibold text-gray-800">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.detail}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/ho-khau"
              className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition text-center"
            >
              <div className="text-3xl mb-2">➕</div>
              <p className="text-sm font-semibold text-gray-700">
                Thêm hộ khẩu
              </p>
            </Link>
            <Link
              href="/nhan-khau"
              className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition text-center"
            >
              <div className="text-3xl mb-2">👤</div>
              <p className="text-sm font-semibold text-gray-700">
                Thêm nhân khẩu
              </p>
            </Link>
            <Link
              href="/thu-phi"
              className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg transition text-center"
            >
              <div className="text-3xl mb-2">💵</div>
              <p className="text-sm font-semibold text-gray-700">
                Tạo khoản thu
              </p>
            </Link>
            <Link
              href="/phieu-thu"
              className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition text-center"
            >
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm font-semibold text-gray-700">
                Lập phiếu thu
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📊 Báo cáo thống kê</h2>
        <p className="mb-4">
          Xem báo cáo chi tiết về hộ khẩu, nhân khẩu và các khoản thu phí
        </p>
        <Link
          href="/thong-ke"
          className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition inline-block"
        >
          Xem báo cáo →
        </Link>
      </div>
    </div>
  );
}
