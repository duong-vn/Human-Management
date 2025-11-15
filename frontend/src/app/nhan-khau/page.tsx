"use client";

import { useState } from "react";

export default function NhanKhauPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dữ liệu giả lập
  const nhanKhauList = [
    {
      _id: "1",
      hoTen: "Nguyễn Văn A",
      cccd: "123456789012",
      ngaySinh: "20/05/1990",
      gioiTinh: "Nam",
      ngheNghiep: "Kỹ sư",
      hoKhau: "HK001",
      trangThai: "Thường trú",
    },
    {
      _id: "2",
      hoTen: "Trần Thị B",
      cccd: "987654321098",
      ngaySinh: "15/08/1992",
      gioiTinh: "Nữ",
      ngheNghiep: "Giáo viên",
      hoKhau: "HK002",
      trangThai: "Thường trú",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Quản lý Nhân khẩu
            </h1>
            <p className="text-gray-600">
              Danh sách và quản lý thông tin nhân khẩu
            </p>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md">
            ➕ Thêm nhân khẩu mới
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên, CCCD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Tất cả giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Tất cả trạng thái</option>
            <option value="permanent">Thường trú</option>
            <option value="temporary">Tạm trú</option>
            <option value="absent">Tạm vắng</option>
          </select>
          <input
            type="text"
            placeholder="Mã hộ khẩu"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Tổng nhân khẩu</p>
          <p className="text-2xl font-bold text-green-600">4,567</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Nam</p>
          <p className="text-2xl font-bold text-blue-600">2,345</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Nữ</p>
          <p className="text-2xl font-bold text-pink-600">2,222</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">Độ tuổi TB</p>
          <p className="text-2xl font-bold text-purple-600">35.2</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Họ và tên
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  CCCD
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ngày sinh
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Giới tính
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nghề nghiệp
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Hộ khẩu
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
              {nhanKhauList.map((nhanKhau) => (
                <tr key={nhanKhau._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-800">
                      {nhanKhau.hoTen}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 font-mono text-sm">
                      {nhanKhau.cccd}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">{nhanKhau.ngaySinh}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-800">
                      {nhanKhau.gioiTinh === "Nam" ? "👨" : "👩"}{" "}
                      {nhanKhau.gioiTinh}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">{nhanKhau.ngheNghiep}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-600 font-semibold">
                      {nhanKhau.hoKhau}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {nhanKhau.trangThai}
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
            <span className="font-semibold">4,567</span> nhân khẩu
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              ← Trước
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
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
