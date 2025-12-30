"use client";
import React from "react";
import { TamTruTamVang } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: TamTruTamVang | null;
}

export default function ViewTamTruTamVangModal({ isOpen, onClose, item }: Props) {
  if (!isOpen || !item) return null;

  const formatDiaChi = (diaChi?: any) => {
    if (!diaChi || typeof diaChi !== 'object') return "---";
    const parts = [
      diaChi.soNha,
      diaChi.duong,
      diaChi.phuongXa,
      diaChi.quanHuyen,
      diaChi.tinhThanh,
    ].filter(part => part && part.trim());
    return parts.length > 0 ? parts.join(", ") : "---";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Chi tiết phiếu đăng ký {item.loai}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Mã ID: #{item._id?.toString().slice(-4).toUpperCase()}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <p className="text-gray-900 font-medium">{item.hoTen}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Căn cước công dân
              </label>
              <p className="text-gray-900">{item.soDinhDanh || "---"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại đăng ký
              </label>
              <p className="text-gray-900">{item.loai}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                item.trangThai === "Đang hiệu lực"
                  ? "bg-green-50 text-green-600 border-green-100"
                  : item.trangThai === "Hết hạn"
                  ? "bg-red-50 text-red-600 border-red-100"
                  : "bg-gray-50 text-gray-600 border-gray-100"
              }`}>
                {item.trangThai}
              </span>
            </div>
          </div>

          {/* Thời gian */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày
              </label>
              <p className="text-gray-900">
                {item.tuNgay ? new Date(item.tuNgay).toLocaleDateString("vi-VN") : "---"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày
              </label>
              <p className="text-gray-900">
                {item.denNgay ? new Date(item.denNgay).toLocaleDateString("vi-VN") : "---"}
              </p>
            </div>
          </div>

          {/* Địa chỉ thường trú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ thường trú
            </label>
            <p className="text-gray-900">{formatDiaChi(item.diaChiThuongTru)}</p>
          </div>

          {/* Địa chỉ tạm trú hoặc nơi đến */}
          {item.loai === "Tạm trú" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ tạm trú
              </label>
              <p className="text-gray-900">{formatDiaChi(item.diaChiTamTru)}</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nơi đến
              </label>
              <p className="text-gray-900">{item.noiDen || "---"}</p>
            </div>
          )}

          {/* Lý do và ghi chú */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do
              </label>
              <p className="text-gray-900">{item.lyDo || "---"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <p className="text-gray-900">{item.ghiChu || "---"}</p>
            </div>
          </div>

          {/* Thông tin duyệt (nếu có) */}
          {(item.nguoiDuyet || item.ngayDuyet) && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Người duyệt
                </label>
                <p className="text-gray-900">
                  {typeof item.nguoiDuyet === 'object' && item.nguoiDuyet !== null && 'hoTen' in item.nguoiDuyet
                    ? (item.nguoiDuyet as Record<string, any>).hoTen
                    : typeof item.nguoiDuyet === 'string'
                    ? item.nguoiDuyet
                    : "---"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày duyệt
                </label>
                <p className="text-gray-900">
                  {item.ngayDuyet ? new Date(item.ngayDuyet).toLocaleDateString("vi-VN") : "---"}
                </p>
              </div>
            </div>
          )}

          {/* Thời gian tạo và cập nhật */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày tạo
              </label>
              <p className="text-gray-900">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "---"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày cập nhật
              </label>
              <p className="text-gray-900">
                {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("vi-VN") : "---"}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
