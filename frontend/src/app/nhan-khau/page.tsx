"use client";

import { useState } from "react";

export default function NhanKhauPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  // Dữ liệu giả lập mở rộng
  const nhanKhauList = [
    {
      _id: "1",
      hoTen: "Nguyễn Văn A",
      cccd: "123456789012",
      ngaySinh: "20/05/1990",
      tuoi: 35,
      gioiTinh: "Nam",
      ngheNghiep: "Kỹ sư phần mềm",
      noiLamViec: "Công ty TNHH ABC",
      hoKhau: "HK001",
      diaChi: "123 Lạc Long Quân, P.10, Q.Tân Bình",
      soDienThoai: "0901234567",
      email: "nguyenvana@email.com",
      trangThai: "Thường trú",
      avatar: "👨‍💼",
    },
    {
      _id: "2",
      hoTen: "Trần Thị B",
      cccd: "987654321098",
      ngaySinh: "15/08/1992",
      tuoi: 33,
      gioiTinh: "Nữ",
      ngheNghiep: "Giáo viên tiểu học",
      noiLamViec: "Trường TH Nguyễn Du",
      hoKhau: "HK002",
      diaChi: "456 Nguyễn Trãi, P.5, Q.5",
      soDienThoai: "0912345678",
      email: "tranthib@email.com",
      trangThai: "Thường trú",
      avatar: "👩‍🏫",
    },
    {
      _id: "3",
      hoTen: "Lê Văn C",
      cccd: "456789012345",
      ngaySinh: "10/03/1985",
      tuoi: 40,
      gioiTinh: "Nam",
      ngheNghiep: "Bác sĩ",
      noiLamViec: "Bệnh viện Đa khoa",
      hoKhau: "HK003",
      diaChi: "789 Võ Văn Tần, P.6, Q.3",
      soDienThoai: "0923456789",
      email: "levanc@email.com",
      trangThai: "Thường trú",
      avatar: "👨‍⚕️",
    },
    {
      _id: "4",
      hoTen: "Phạm Thị D",
      cccd: "321654987012",
      ngaySinh: "25/12/1995",
      tuoi: 29,
      gioiTinh: "Nữ",
      ngheNghiep: "Marketing",
      noiLamViec: "Công ty XYZ",
      hoKhau: "HK001",
      diaChi: "123 Lạc Long Quân, P.10, Q.Tân Bình",
      soDienThoai: "0934567890",
      email: "phamthid@email.com",
      trangThai: "Tạm trú",
      avatar: "👩‍💼",
    },
    {
      _id: "5",
      hoTen: "Hoàng Văn E",
      cccd: "654321098765",
      ngaySinh: "05/07/1988",
      tuoi: 37,
      gioiTinh: "Nam",
      ngheNghiep: "Kiến trúc sư",
      noiLamViec: "Studio Design",
      hoKhau: "HK004",
      diaChi: "321 Điện Biên Phủ, P.15, Q.Bình Thạnh",
      soDienThoai: "0945678901",
      email: "hoangvane@email.com",
      trangThai: "Thường trú",
      avatar: "👨‍🎨",
    },
    {
      _id: "6",
      hoTen: "Võ Thị F",
      cccd: "789012345678",
      ngaySinh: "18/11/1998",
      tuoi: 27,
      gioiTinh: "Nữ",
      ngheNghiep: "Nhân viên văn phòng",
      noiLamViec: "Công ty DEF",
      hoKhau: "HK002",
      diaChi: "456 Nguyễn Trãi, P.5, Q.5",
      soDienThoai: "0956789012",
      email: "vothif@email.com",
      trangThai: "Thường trú",
      avatar: "👩‍💻",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Thường trú":
        return "bg-green-100 text-green-800 border-green-200";
      case "Tạm trú":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Tạm vắng":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">👥</div>
            <div>
              <h1 className="text-4xl font-bold mb-1">Quản lý Nhân khẩu</h1>
              <p className="text-green-100">
                Danh sách và quản lý thông tin cư dân
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() =>
                setViewMode(viewMode === "grid" ? "table" : "grid")
              }
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition backdrop-blur-sm"
            >
              {viewMode === "grid" ? "📋 Bảng" : "🎴 Lưới"}
            </button>
            <button className="bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl transform hover:scale-105">
              ➕ Thêm nhân khẩu mới
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter - Enhanced */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">🔍</span>
            Tìm kiếm & Lọc
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm theo tên, CCCD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
          </div>
          <select className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white">
            <option value="">👤 Tất cả giới tính</option>
            <option value="male">👨 Nam</option>
            <option value="female">👩 Nữ</option>
          </select>
          <select className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white">
            <option value="">📍 Tất cả trạng thái</option>
            <option value="permanent">🏠 Thường trú</option>
            <option value="temporary">⏱️ Tạm trú</option>
            <option value="absent">✈️ Tạm vắng</option>
          </select>
          <input
            type="text"
            placeholder="🏘️ Mã hộ khẩu"
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>
      </div>

      {/* Statistics - Enhanced with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Tổng nhân khẩu
              </p>
              <p className="text-3xl font-bold text-green-600">4,567</p>
              <p className="text-xs text-green-600 mt-1">
                ↑ 12% so với tháng trước
              </p>
            </div>
            <div className="text-5xl opacity-20">👥</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Nam giới</p>
              <p className="text-3xl font-bold text-blue-600">2,345</p>
              <p className="text-xs text-blue-600 mt-1">51.3% tổng số</p>
            </div>
            <div className="text-5xl opacity-20">👨</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Nữ giới</p>
              <p className="text-3xl font-bold text-pink-600">2,222</p>
              <p className="text-xs text-pink-600 mt-1">48.7% tổng số</p>
            </div>
            <div className="text-5xl opacity-20">👩</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Độ tuổi trung bình
              </p>
              <p className="text-3xl font-bold text-purple-600">35.2</p>
              <p className="text-xs text-purple-600 mt-1">Tuổi</p>
            </div>
            <div className="text-5xl opacity-20">📊</div>
          </div>
        </div>
      </div>

      {/* Grid View - Card Layout */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nhanKhauList.map((nhanKhau) => (
            <div
              key={nhanKhau._id}
              className="bg-white rounded-3xl border-2 border-black shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-800 p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl">{nhanKhau.avatar}</div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-1">
                      {nhanKhau.hoTen}
                    </h3>
                    <p className="text-green-100 text-sm flex items-center">
                      <span className="mr-1">🎂</span>
                      {nhanKhau.tuoi} tuổi • {nhanKhau.gioiTinh}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3">
                <div className="flex items-center space-x-2 text-gray-700">
                  <span className="text-lg">🆔</span>
                  <span className="text-sm font-mono font-semibold">
                    {nhanKhau.cccd}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <span className="text-lg">💼</span>
                  <span className="text-sm">{nhanKhau.ngheNghiep}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <span className="text-lg">🏢</span>
                  <span className="text-sm">{nhanKhau.noiLamViec}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <span className="text-lg">📍</span>
                  <span className="text-sm line-clamp-1">
                    {nhanKhau.diaChi}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <span className="text-lg">📞</span>
                  <span className="text-sm">{nhanKhau.soDienThoai}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <span className="text-lg">📧</span>
                  <span className="text-sm truncate">{nhanKhau.email}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🏘️</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {nhanKhau.hoKhau}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      nhanKhau.trangThai
                    )}`}
                  >
                    {nhanKhau.trangThai}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between border-t border-gray-100">
                <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition flex items-center space-x-1">
                  <span>👁️</span>
                  <span>Chi tiết</span>
                </button>
                <button className="text-green-600 hover:text-green-800 font-semibold text-sm transition flex items-center space-x-1">
                  <span>✏️</span>
                  <span>Chỉnh sửa</span>
                </button>
                <button className="text-red-600 hover:text-red-800 font-semibold text-sm transition flex items-center space-x-1">
                  <span>🗑️</span>
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Họ và tên
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    CCCD
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Tuổi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Giới tính
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Nghề nghiệp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Hộ khẩu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nhanKhauList.map((nhanKhau) => (
                  <tr
                    key={nhanKhau._id}
                    className="hover:bg-green-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{nhanKhau.avatar}</span>
                        <span className="font-semibold text-gray-800">
                          {nhanKhau.hoTen}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-600 font-mono text-sm">
                        {nhanKhau.cccd}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700 font-semibold">
                        {nhanKhau.tuoi}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-800">
                        {nhanKhau.gioiTinh === "Nam" ? "👨" : "👩"}{" "}
                        {nhanKhau.gioiTinh}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-gray-800 font-medium">
                          {nhanKhau.ngheNghiep}
                        </p>
                        <p className="text-xs text-gray-500">
                          {nhanKhau.noiLamViec}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-700">
                          📞 {nhanKhau.soDienThoai}
                        </p>
                        <p className="text-gray-500 text-xs">
                          📧 {nhanKhau.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-600 font-semibold">
                        {nhanKhau.hoKhau}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                          nhanKhau.trangThai
                        )}`}
                      >
                        {nhanKhau.trangThai}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 transition">
                          👁️
                        </button>
                        <button className="text-green-600 hover:text-green-800 transition">
                          ✏️
                        </button>
                        <button className="text-red-600 hover:text-red-800 transition">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold">1-6</span> trong tổng số{" "}
              <span className="font-semibold">4,567</span> nhân khẩu
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold text-gray-700">
                ← Trước
              </button>
              <button className="px-4 py-2 bg-green-300 text-white rounded-lg font-semibold shadow-md">
                1
              </button>
              <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold text-gray-700">
                2
              </button>
              <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold text-gray-700">
                3
              </button>
              <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold text-gray-700">
                Sau →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
