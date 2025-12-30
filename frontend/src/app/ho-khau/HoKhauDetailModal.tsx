"use client";
import React from "react";
import {
  X,
  UserPlus,
  History,
  Users,
  Edit,
  Home,
  Calendar,
  MapPin,
} from "lucide-react";
import { HoKhau, getChuHoInfo } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hoKhau: HoKhau | null;
  onEdit: () => void;
  onThemThanhVien: () => void;
  onTachHo: () => void;
  onDoiChuHo: () => void;
  onXemLichSu: () => void;
  onXoaThanhVien: (nhanKhauId: string, hoTen: string) => void;
}

export default function HoKhauDetailModal({
  isOpen,
  onClose,
  hoKhau,
  onEdit,
  onThemThanhVien,
  onTachHo,
  onDoiChuHo,
  onXemLichSu,
  onXoaThanhVien,
}: Props) {
  if (!isOpen || !hoKhau) return null;

  const hoKhauId = hoKhau._id || hoKhau.id || "";

  // Format địa chỉ
  const formatDiaChi = () => {
    const { soNha, duong, phuongXa, quanHuyen, tinhThanh } =
      hoKhau.diaChi || {};
    const parts = [soNha, duong, phuongXa, quanHuyen, tinhThanh].filter(
      Boolean
    );
    return parts.join(", ") || "Chưa có địa chỉ";
  };

  // Lấy tên chủ hộ - sử dụng helper function
  const getChuHoName = () => {
    const chuHoInfo = getChuHoInfo(hoKhau.chuHo);
    return chuHoInfo?.hoTen || "Chưa có chủ hộ";
  };

  // Get trạng thái badge color
  const getTrangThaiBadge = (trangThai: string) => {
    switch (trangThai) {
      case "Đang hoạt động":
        return "bg-green-100 text-green-700 border-green-200";
      case "Đã tách hộ":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Đã xóa":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Get trạng thái nhân khẩu badge
  const getNhanKhauTrangThaiBadge = (trangThai?: string) => {
    switch (trangThai) {
      case "Thường trú":
        return "bg-green-50 text-green-600";
      case "Tạm trú":
        return "bg-blue-50 text-blue-600";
      case "Tạm vắng":
        return "bg-yellow-50 text-yellow-600";
      case "Đã chuyển đi":
        return "bg-gray-50 text-gray-600";
      case "Đã qua đời":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <Home className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Chi tiết Hộ khẩu
              </h2>
              <p className="text-sm text-gray-500 font-mono">
                #{hoKhauId.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Thông tin chung */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Home size={16} />
              Thông tin hộ khẩu
            </h3>
            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Số hộ khẩu
                  </label>
                  <p className="font-semibold text-gray-800 mt-1 font-mono">
                    {hoKhauId.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </label>
                  <p className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getTrangThaiBadge(
                        hoKhau.trangThai
                      )}`}
                    >
                      {hoKhau.trangThai}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Chủ hộ
                  </label>
                  <p className="font-semibold text-gray-800 mt-1">
                    {getChuHoName()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} /> Ngày lập
                  </label>
                  <p className="font-medium text-gray-700 mt-1">
                    {hoKhau.ngayLap
                      ? new Date(hoKhau.ngayLap).toLocaleDateString("vi-VN")
                      : "---"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={12} /> Địa chỉ
                  </label>
                  <p className="font-medium text-gray-700 mt-1">
                    {formatDiaChi()}
                  </p>
                </div>
                {hoKhau.ghiChu && (
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      Ghi chú
                    </label>
                    <p className="text-gray-600 mt-1">{hoKhau.ghiChu}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách thành viên */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Users size={16} />
                Danh sách thành viên ({hoKhau.thanhVien?.length || 0} người)
              </h3>
            </div>

            {hoKhau.thanhVien && hoKhau.thanhVien.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                      <th className="text-left p-4">Họ tên</th>
                      <th className="text-left p-4">Quan hệ với chủ hộ</th>
                      <th className="text-center p-4">Trạng thái</th>
                      <th className="text-center p-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {hoKhau.thanhVien.map((tv, index) => {
                      const nkId =
                        typeof tv.nhanKhauId === "object"
                          ? tv.nhanKhauId?._id
                          : tv.nhanKhauId;
                      const nkTrangThai =
                        typeof tv.nhanKhauId === "object"
                          ? tv.nhanKhauId?.trangThai
                          : undefined;
                      const nkHoTen =
                        typeof tv.nhanKhauId === "object" &&
                        tv.nhanKhauId?.hoTen
                          ? tv.nhanKhauId?.hoTen
                          : tv.hoTen;

                      return (
                        <tr
                          key={nkId || index}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="p-4">
                            <span className="font-medium text-gray-800">
                              {nkHoTen}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600">
                            {tv.quanHeVoiChuHo || "---"}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getNhanKhauTrangThaiBadge(
                                nkTrangThai
                              )}`}
                            >
                              {nkTrangThai || "---"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => onXoaThanhVien(nkId, nkHoTen)}
                              className="text-xs text-red-500 hover:text-red-700 hover:underline"
                            >
                              Xóa khỏi hộ
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p>Chưa có thành viên nào trong hộ khẩu</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-wrap gap-3 justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onThemThanhVien}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium"
              >
                <UserPlus size={16} />
                Thêm thành viên
              </button>
              <button
                onClick={onTachHo}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition text-sm font-medium"
              >
                <Home size={16} />
                Tách hộ
              </button>
              <button
                onClick={onDoiChuHo}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition text-sm font-medium"
              >
                <Users size={16} />
                Đổi chủ hộ
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onXemLichSu}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition text-sm font-medium"
              >
                <History size={16} />
                Lịch sử
              </button>
              <button
                onClick={() => {
                  onEdit();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition text-sm font-medium"
              >
                <Edit size={16} />
                Sửa thông tin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
