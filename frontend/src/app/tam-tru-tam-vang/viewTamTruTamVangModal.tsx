"use client";

import React from "react";
import { Modal, Button, Badge } from "@/components/ui";
import { TamTruTamVang, DiaChi } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: TamTruTamVang | null;
}

export default function ViewTamTruTamVangModal({ isOpen, onClose, item }: Props) {
  if (!isOpen || !item) return null;

  const formatDiaChi = (diaChi?: DiaChi) => {
    if (!diaChi || typeof diaChi !== "object") return "---";
    const parts = [
      diaChi.soNha,
      diaChi.duong,
      diaChi.phuongXa,
      diaChi.quanHuyen,
      diaChi.tinhThanh,
    ].filter((part) => part && part.trim());
    return parts.length > 0 ? parts.join(", ") : "---";
  };

  const getStatusBadge = (trangThai: string) => {
    switch (trangThai) {
      case "Đang hiệu lực":
        return <Badge variant="success">Đang hiệu lực</Badge>;
      case "Hết hạn":
        return <Badge variant="danger">Hết hạn</Badge>;
      case "Đã hủy":
        return <Badge variant="neutral">Đã hủy</Badge>;
      default:
        return <Badge variant="neutral">{trangThai}</Badge>;
    }
  };

  const idText = (item._id || item.id || "").toString().slice(-8).toUpperCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi Tiết Phiếu Đăng Ký ${item.loai}`}
      description={`Mã hồ sơ: #${idText || "N/A"}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Thông tin cơ bản */}
        <div>
          <h3 className="section-heading mb-2">Thông tin công dân</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Họ và tên</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{item.hoTen}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Số CMND / CCCD</p>
              <p className="text-sm font-mono text-slate-900 mt-0.5">{item.soDinhDanh || "Chưa có"}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Loại đăng ký</p>
              <p className="text-sm font-medium text-blue-700 mt-0.5">{item.loai}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Trạng thái</p>
              <div className="mt-0.5">{getStatusBadge(item.trangThai)}</div>
            </div>
          </div>
        </div>

        {/* Thời hạn lưu trú */}
        <div>
          <h3 className="section-heading mb-2">Thời hạn đăng ký</h3>
          <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-slate-200 text-sm">
            <div>
              <p className="text-xs text-slate-500">Từ ngày</p>
              <p className="font-medium text-slate-900 font-mono mt-0.5">
                {item.tuNgay ? new Date(item.tuNgay).toLocaleDateString("vi-VN") : "---"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Đến ngày</p>
              <p className="font-medium text-slate-900 font-mono mt-0.5">
                {item.denNgay ? new Date(item.denNgay).toLocaleDateString("vi-VN") : "---"}
              </p>
            </div>
          </div>
        </div>

        {/* Nơi cư trú / Nơi đến */}
        <div>
          <h3 className="section-heading mb-2">Nơi đi & Nơi đến</h3>
          <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200 text-sm">
            <div>
              <p className="text-xs text-slate-500">Địa chỉ thường trú</p>
              <p className="text-slate-800 mt-0.5">{formatDiaChi(item.diaChiThuongTru)}</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              {item.loai === "Tạm trú" ? (
                <>
                  <p className="text-xs text-slate-500">Địa chỉ tạm trú tại tổ dân phố</p>
                  <p className="text-slate-800 mt-0.5">{formatDiaChi(item.diaChiTamTru)}</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-500">Nơi đến tạm vắng</p>
                  <p className="text-slate-800 mt-0.5">{item.noiDen || "---"}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Lý do & Ghi chú */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200 text-sm">
            <p className="text-xs text-slate-500">Lý do</p>
            <p className="text-slate-800 mt-0.5">{item.lyDo || "Không ghi nhận"}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200 text-sm">
            <p className="text-xs text-slate-500">Ghi chú</p>
            <p className="text-slate-800 mt-0.5">{item.ghiChu || "Không có"}</p>
          </div>
        </div>

        {/* Thông tin duyệt / Thời gian ghi nhận */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            <p className="text-[11px] text-slate-400">Người duyệt</p>
            <p className="text-slate-700 font-medium">
              {typeof item.nguoiDuyet === "object" && item.nguoiDuyet !== null && "hoTen" in (item.nguoiDuyet as Record<string, unknown>)
                ? String((item.nguoiDuyet as Record<string, unknown>).hoTen)
                : typeof item.nguoiDuyet === "string"
                ? item.nguoiDuyet
                : "Chưa duyệt"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Ngày duyệt</p>
            <p className="text-slate-700 font-mono">
              {item.ngayDuyet ? new Date(item.ngayDuyet).toLocaleDateString("vi-VN") : "---"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Ngày lập</p>
            <p className="text-slate-700 font-mono">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "---"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Cập nhật lần cuối</p>
            <p className="text-slate-700 font-mono">
              {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("vi-VN") : "---"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer pt-3">
          <Button variant="secondary" size="md" onClick={onClose} className="w-full sm:w-auto">
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
