"use client";

import { useState } from "react";

export default function HoKhauPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dữ liệu giả lập
  const hoKhauList = [
    {
      _id: "1",
      maHoKhau: "HK001",
      chuHo: { hoTen: "Nguyễn Văn A" },
      diaChi: {
        soNha: "123",
        duong: "Lạc Long Quân",
        phuongXa: "Phường 10",
        quanHuyen: "Quận Tân Bình",
        tinhThanh: "TP Hồ Chí Minh",
      },
      soThanhVien: 4,
      trangThai: "Hoạt động",
    },
    {
      _id: "2",
      maHoKhau: "HK002",
      chuHo: { hoTen: "Trần Thị B" },
      diaChi: {
        soNha: "456",
        duong: "Nguyễn Trãi",
        phuongXa: "Phường 5",
        quanHuyen: "Quận 5",
        tinhThanh: "TP Hồ Chí Minh",
      },
      soThanhVien: 3,
      trangThai: "Hoạt động",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Quản lý Hộ khẩu
            </h1>
            <p className="text-gray-600">Danh sách và quản lý các hộ khẩu</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md">
            ➕ Thêm hộ khẩu mới
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo mã hộ khẩu, chủ hộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm dừng</option>
          </select>
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Tất cả quận/huyện</option>
            <option value="tanbinh">Quận Tân Bình</option>
            <option value="quan5">Quận 5</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Tổng hộ khẩu</p>
          <p className="text-2xl font-bold text-blue-600">1,234</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-600">1,200</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Tạm dừng</p>
          <p className="text-2xl font-bold text-yellow-600">34</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Trung bình TV/hộ</p>
          <p className="text-2xl font-bold text-purple-600">3.7</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Mã hộ khẩu
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Chủ hộ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thành viên
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
              {hoKhauList.map((hoKhau) => (
                <tr key={hoKhau._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-blue-600">
                      {hoKhau.maHoKhau}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-800">{hoKhau.chuHo.hoTen}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600 text-sm">
                      {hoKhau.diaChi.soNha} {hoKhau.diaChi.duong},{" "}
                      {hoKhau.diaChi.phuongXa}, {hoKhau.diaChi.quanHuyen}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-800">
                      {hoKhau.soThanhVien} người
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {hoKhau.trangThai}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                      👁️ Xem
                    </button>
                    <button className="text-green-600 hover:text-green-800 mr-3">
                      ✏️ Sửa
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
            <span className="font-semibold">1,234</span> hộ khẩu
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              ← Trước
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
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
