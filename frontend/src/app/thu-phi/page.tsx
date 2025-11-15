"use client";

import { useState } from "react";

export default function ThuPhiPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dữ liệu giả lập
  const thuPhiList = [
    {
      _id: "1",
      tenKhoanThu: "Phí vệ sinh hàng tháng",
      loaiPhi: "Định kỳ",
      mucPhi: 50000,
      doiTuongApDung: "Hộ khẩu",
      trangThai: "Đang áp dụng",
      ngayBatDau: "01/01/2023",
    },
    {
      _id: "2",
      tenKhoanThu: "Phí bảo vệ khu phố",
      loaiPhi: "Định kỳ",
      mucPhi: 100000,
      doiTuongApDung: "Hộ khẩu",
      trangThai: "Đang áp dụng",
      ngayBatDau: "01/01/2023",
    },
    {
      _id: "3",
      tenKhoanThu: "Đóng góp tết thiếu nhi",
      loaiPhi: "Đột xuất",
      mucPhi: 200000,
      doiTuongApDung: "Hộ khẩu",
      trangThai: "Kết thúc",
      ngayBatDau: "01/05/2023",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Quản lý Thu phí
            </h1>
            <p className="text-gray-600">
              Danh sách các khoản thu phí và đóng góp
            </p>
          </div>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md">
            ➕ Tạo khoản thu mới
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm khoản thu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
            <option value="">Tất cả loại phí</option>
            <option value="periodic">Định kỳ</option>
            <option value="onetime">Đột xuất</option>
            <option value="donation">Đóng góp</option>
          </select>
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang áp dụng</option>
            <option value="inactive">Kết thúc</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Tổng khoản thu</p>
          <p className="text-2xl font-bold text-yellow-600">15</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Đang áp dụng</p>
          <p className="text-2xl font-bold text-green-600">8</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Đã kết thúc</p>
          <p className="text-2xl font-bold text-gray-600">7</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Tổng thu/tháng</p>
          <p className="text-2xl font-bold text-blue-600">45M đ</p>
        </div>
      </div>

      {/* Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {thuPhiList.map((thuPhi) => (
          <div
            key={thuPhi._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 text-white">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{thuPhi.tenKhoanThu}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    thuPhi.trangThai === "Đang áp dụng"
                      ? "bg-green-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {thuPhi.trangThai}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Loại phí:</span>
                <span className="font-semibold text-gray-800">
                  {thuPhi.loaiPhi}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Mức phí:</span>
                <span className="font-bold text-yellow-600 text-lg">
                  {thuPhi.mucPhi.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Đối tượng:</span>
                <span className="font-semibold text-gray-800">
                  {thuPhi.doiTuongApDung}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Ngày bắt đầu:</span>
                <span className="text-gray-800">{thuPhi.ngayBatDau}</span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-gray-50 px-4 py-3 flex justify-between border-t border-gray-200">
              <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                👁️ Chi tiết
              </button>
              <button className="text-green-600 hover:text-green-800 font-semibold text-sm">
                ✏️ Chỉnh sửa
              </button>
              <button className="text-red-600 hover:text-red-800 font-semibold text-sm">
                🗑️ Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add More Button */}
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <button className="text-yellow-600 hover:text-yellow-700 font-semibold">
          ↓ Xem thêm khoản thu
        </button>
      </div>
    </div>
  );
}
