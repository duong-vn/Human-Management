"use client";

import React, { useState, useEffect } from "react";
import {
  UserPlus,
  History,
  Users,
  Edit,
  Home,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Briefcase,
  CreditCard,
  Globe,
  Heart,
  Flag,
  Building,
  FileText,
  Trash2,
} from "lucide-react";
import { Modal, Button, Badge } from "@/components/ui";
import { HoKhau, NhanKhauPopulated } from "./types";

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
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
    }
  }, [isOpen, hoKhau?._id]);

  if (!isOpen || !hoKhau) return null;

  const hoKhauId = hoKhau._id || hoKhau.id || "";

  const formatDiaChi = (diaChi?: {
    soNha?: string;
    duong?: string;
    phuongXa?: string;
    quanHuyen?: string;
    tinhThanh?: string;
  }) => {
    if (!diaChi) return "—";
    const parts = [
      diaChi.soNha,
      diaChi.duong,
      diaChi.phuongXa,
      diaChi.quanHuyen,
      diaChi.tinhThanh,
    ].filter(Boolean);
    return parts.join(", ") || "—";
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getChuHoData = (): NhanKhauPopulated | null => {
    if (!hoKhau.chuHo) return null;
    if (typeof hoKhau.chuHo === "string") {
      const chuHoTV = hoKhau.thanhVien?.find(
        (tv) => tv.quanHeVoiChuHo === "Chủ hộ"
      );
      if (chuHoTV && typeof chuHoTV.nhanKhauId === "object") {
        return chuHoTV.nhanKhauId as NhanKhauPopulated;
      }
      return null;
    }
    return hoKhau.chuHo as NhanKhauPopulated;
  };

  const chuHoData = getChuHoData();
  const allMembers = hoKhau.thanhVien || [];
  const totalPages = 1 + allMembers.length;

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const getMemberDataAtIndex = (
    idx: number
  ): { data: NhanKhauPopulated | null; quanHe: string } => {
    const member = allMembers[idx];
    if (!member) return { data: null, quanHe: "" };

    if (typeof member.nhanKhauId === "object" && member.nhanKhauId) {
      return {
        data: member.nhanKhauId as NhanKhauPopulated,
        quanHe: member.quanHeVoiChuHo,
      };
    }
    return {
      data: {
        _id: member.nhanKhauId as string,
        hoTen: member.hoTen,
      },
      quanHe: member.quanHeVoiChuHo,
    };
  };

  const renderCoverPage = () => (
    <div className="flex flex-col items-center justify-center bg-slate-900 text-white rounded-lg p-6 sm:p-8 min-h-[460px] border border-slate-800">
      <div className="text-center mb-6">
        <p className="text-xs font-bold tracking-widest text-slate-300 uppercase">
          Cộng hòa Xã hội Chủ nghĩa Việt Nam
        </p>
        <p className="text-[11px] tracking-wider text-slate-400 mt-0.5">
          Độc lập — Tự do — Hạnh phúc
        </p>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-wider text-white">SỔ HỘ KHẨU</h2>
        <div className="w-20 h-0.5 bg-blue-500 mx-auto mt-2 rounded-full" />
      </div>

      <div className="w-full max-w-sm bg-slate-800/80 rounded-lg p-5 border border-slate-700/80 space-y-3.5 text-center">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Số sổ hộ khẩu</p>
          <p className="text-lg font-mono font-bold text-white mt-0.5">
            {hoKhauId.slice(-8).toUpperCase()}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Chủ hộ</p>
          <p className="text-base font-semibold text-white mt-0.5">
            {chuHoData?.hoTen || "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Nơi thường trú</p>
          <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
            {formatDiaChi(hoKhau.diaChi)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Số lượng nhân khẩu</p>
          <p className="text-base font-semibold text-blue-400 mt-0.5">
            {hoKhau.thanhVien?.length || 0} thành viên
          </p>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-6">
        Ngày lập sổ:{" "}
        {hoKhau.ngayLap ? new Date(hoKhau.ngayLap).toLocaleDateString("vi-VN") : "—"}
      </p>
    </div>
  );

  const renderMemberPage = (
    memberData: NhanKhauPopulated | null,
    quanHe: string,
    pageNum: number
  ) => {
    const isChuHo = quanHe === "Chủ hộ";

    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 space-y-4 min-h-[460px]">
        {/* Header trang thành viên */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs text-slate-500 font-medium">Trang {pageNum} / {totalPages - 1}</span>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {isChuHo ? "Thông tin chủ hộ" : "Thông tin thành viên"}
            </span>
          </div>
          <Badge variant={isChuHo ? "primary" : "neutral"} size="sm">
            {quanHe}
          </Badge>
        </div>

        {/* Row 1: Ảnh đại diện & thông tin chính */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-24 h-28 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center shrink-0 text-slate-400">
            <User className="w-10 h-10" />
            <span className="text-[10px] text-slate-500 mt-1 font-medium">Ảnh 3x4</span>
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <p className="text-[11px] text-slate-500 font-medium uppercase">Họ và tên</p>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1">
                {memberData?.hoTen || "—"}
              </h3>
            </div>
            {memberData?.biDanh && (
              <div>
                <p className="text-[11px] text-slate-500 font-medium uppercase">Bí danh</p>
                <p className="text-xs text-slate-700">{memberData.biDanh}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-[11px] text-slate-500 font-medium uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Ngày sinh
                </p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {formatDate(memberData?.ngaySinh)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium uppercase">Giới tính</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {memberData?.gioiTinh || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid trường thông tin chi tiết */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
          <InfoField icon={<MapPin className="w-3 h-3 text-slate-400" />} label="Nơi sinh" value={memberData?.noiSinh} />
          <InfoField icon={<Home className="w-3 h-3 text-slate-400" />} label="Quê quán" value={memberData?.queQuan} />
          <InfoField icon={<Flag className="w-3 h-3 text-slate-400" />} label="Dân tộc" value={memberData?.danToc} />
          <InfoField icon={<Heart className="w-3 h-3 text-slate-400" />} label="Tôn giáo" value={memberData?.tonGiao || "Không"} />
          <InfoField icon={<Globe className="w-3 h-3 text-slate-400" />} label="Quốc tịch" value={memberData?.quocTich || "Việt Nam"} />
          <InfoField icon={<Briefcase className="w-3 h-3 text-slate-400" />} label="Nghề nghiệp" value={memberData?.ngheNghiep} />
        </div>

        {memberData?.noiLamViec && (
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" /> Nơi làm việc
            </p>
            <p className="text-xs text-slate-800 mt-0.5">{memberData.noiLamViec}</p>
          </div>
        )}

        {/* Căn cước công dân */}
        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
          <p className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-slate-400" /> Số CCCD / CMND
          </p>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div>
              <p className="text-[10px] text-slate-400">Số</p>
              <p className="text-xs font-mono font-bold text-slate-800">
                {memberData?.soDinhDanh?.so || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Ngày cấp</p>
              <p className="text-xs text-slate-700">
                {formatDate(memberData?.soDinhDanh?.ngayCap)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Nơi cấp</p>
              <p className="text-xs text-slate-700">
                {memberData?.soDinhDanh?.noiCap || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Địa chỉ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> Địa chỉ thường trú
            </p>
            <p className="text-xs text-slate-800 mt-0.5">
              {formatDiaChi(memberData?.diaChiThuongTru || hoKhau.diaChi)}
            </p>
          </div>
          {memberData?.diaChiHienTai && (
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
              <p className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                <Home className="w-3 h-3 text-slate-400" /> Nơi ở hiện tại
              </p>
              <p className="text-xs text-slate-800 mt-0.5">
                {formatDiaChi(memberData.diaChiHienTai)}
              </p>
            </div>
          )}
        </div>

        {/* Trạng thái và thao tác xóa thành viên */}
        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2.5 border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Trạng thái cư trú</span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {memberData?.trangThai || "—"}
            </span>
          </div>

          {!isChuHo && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onXoaThanhVien(memberData?._id || "", memberData?.hoTen || "")}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Xóa khỏi hộ
            </Button>
          )}
        </div>

        {memberData?.ghiChu && (
          <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200">
            <p className="text-[10px] text-amber-800 uppercase font-semibold flex items-center gap-1">
              <FileText className="w-3 h-3 text-amber-600" /> Ghi chú
            </p>
            <p className="text-xs text-amber-900 mt-0.5">{memberData.ghiChu}</p>
          </div>
        )}
      </div>
    );
  };

  const renderCurrentPage = () => {
    if (currentPage === 0) return renderCoverPage();
    const { data, quanHe } = getMemberDataAtIndex(currentPage - 1);
    return renderMemberPage(data, quanHe, currentPage);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sổ Hộ Khẩu Điện Tử"
      description={`Mã sổ: #${hoKhauId.slice(-8).toUpperCase()} • Trạng thái: ${hoKhau.trangThai}`}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Vùng xem trang và lật trang */}
        <div className="flex items-stretch gap-2">
          <button
            type="button"
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`px-2 py-4 rounded-lg border border-slate-200 flex items-center justify-center transition-colors ${
              currentPage === 0
                ? "text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white"
            }`}
            aria-label="Trang trước"
            title="Trang trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            {renderCurrentPage()}
          </div>

          <button
            type="button"
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            className={`px-2 py-4 rounded-lg border border-slate-200 flex items-center justify-center transition-colors ${
              currentPage >= totalPages - 1
                ? "text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white"
            }`}
            aria-label="Trang sau"
            title="Trang sau"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh chuyển trang nhanh */}
        <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <span className="text-slate-500 font-medium">
            {currentPage === 0 ? "Trang bìa" : `Thành viên ${currentPage} / ${totalPages - 1}`}
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPage(idx)}
                className={`h-6 px-2 rounded text-xs font-semibold transition-colors ${
                  currentPage === idx
                    ? "bg-blue-700 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
                title={idx === 0 ? "Bìa" : `Thành viên ${idx}`}
                aria-label={idx === 0 ? "Trang bìa" : `Thành viên ${idx}`}
              >
                {idx === 0 ? "Bìa" : idx}
              </button>
            ))}
          </div>
        </div>

        {/* Thao tác nghiệp vụ */}
        <div className="modal-footer justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onThemThanhVien}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Thêm thành viên
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onTachHo}
              leftIcon={<Home className="w-3.5 h-3.5" />}
            >
              Tách hộ
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onDoiChuHo}
              leftIcon={<Users className="w-3.5 h-3.5" />}
            >
              Đổi chủ hộ
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onXemLichSu}
              leftIcon={<History className="w-3.5 h-3.5" />}
            >
              Lịch sử biến động
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onEdit}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Chỉnh sửa sổ
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
      <p className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-xs text-slate-800 font-medium mt-0.5 truncate" title={value || "—"}>
        {value || "—"}
      </p>
    </div>
  );
}
