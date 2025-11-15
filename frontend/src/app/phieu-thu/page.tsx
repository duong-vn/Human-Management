"use client";

import { useState } from "react";

export default function PhieuThuPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dữ liệu giả lập
  const phieuThuList = [
    {
      _id: "1",
      maPhieuThu: "PT202301001",
      tenKhoanThu: "Phí vệ sinh hàng tháng",
      hoKhau: "HK001 - Nguyễn Văn A",
      soTien: 50000,
      ngayThu: "25/01/2023",
      kyThu: "Tháng 01/2023",
      trangThai: "Đã thu",
    },
    {
      _id: "2",
      maPhieuThu: "PT202301002",
      tenKhoanThu: "Phí bảo vệ khu phố",
      hoKhau: "HK002 - Trần Thị B",
      soTien: 100000,
      ngayThu: "26/01/2023",
      kyThu: "Tháng 01/2023",
      trangThai: "Đã thu",
    },
    {
      _id: "3",
      maPhieuThu: "PT202302001",
      tenKhoanThu: "Phí vệ sinh hàng tháng",
      hoKhau: "HK003 - Lê Văn C",
      soTien: 50000,
      ngayThu: null,
      kyThu: "Tháng 02/2023",
      trangThai: "Chưa thu",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Quản lý Phiếu thu
            </h1>
            <p className="text-gray-600">Danh sách phiếu thu và thanh toán</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md">
            ➕ Lập phiếu thu mới
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm mã phiếu, hộ khẩu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="">Tất cả trạng thái</option>
            <option value="paid">Đã thu</option>
            <option value="unpaid">Chưa thu</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="">Tất cả kỳ thu</option>
            <option value="202301">Tháng 01/2023</option>
            <option value="202302">Tháng 02/2023</option>
            <option value="202303">Tháng 03/2023</option>
          </select>
          <input
            type="date"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Tổng phiếu thu</p>
          <p className="text-2xl font-bold text-purple-600">1,234</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Đã thu</p>
          <p className="text-2xl font-bold text-green-600">1,100</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Chưa thu</p>
          <p className="text-2xl font-bold text-red-600">134</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Tổng tiền thu</p>
          <p className="text-2xl font-bold text-blue-600">55M đ</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Mã phiếu thu
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Khoản thu
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Hộ khẩu
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Kỳ thu
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ngày thu
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {phieuThuList.map((phieuThu) => (
                <tr key={phieuThu._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-purple-600 font-mono text-sm">
                      {phieuThu.maPhieuThu}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-800">
                      {phieuThu.tenKhoanThu}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600 text-sm">
                      {phieuThu.hoKhau}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-gray-800">
                      {phieuThu.soTien.toLocaleString("vi-VN")} đ
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">{phieuThu.kyThu}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">
                      {phieuThu.ngayThu || "---"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        phieuThu.trangThai === "Đã thu"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {phieuThu.trangThai}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {phieuThu.trangThai === "Chưa thu" ? (
                      <button className="text-green-600 hover:text-green-800 mr-3 font-semibold">
                        💰 Thu tiền
                      </button>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-800 mr-3">
                        👁️ Xem
                      </button>
                    )}
                    <button className="text-purple-600 hover:text-purple-800 mr-3">
                      🖨️ In
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold">1-10</span> trong tổng số{" "}
            <span className="font-semibold">1,234</span> phiếu thu
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              ← Trước
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              3
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              Sau →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
