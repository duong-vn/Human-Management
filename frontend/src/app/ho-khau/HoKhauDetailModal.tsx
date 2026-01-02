"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  History,
  Users,
  Edit,
  Home,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  BookOpen,
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

  // Reset về trang đầu khi mở modal khác hoặc đóng/mở lại
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
    }
  }, [isOpen, hoKhau?._id]);

  if (!isOpen || !hoKhau) return null;

  const hoKhauId = hoKhau._id || hoKhau.id || "";

  // Format địa chỉ đầy đủ
  const formatDiaChi = (diaChi?: {
    soNha?: string;
    duong?: string;
    phuongXa?: string;
    quanHuyen?: string;
    tinhThanh?: string;
  }) => {
    if (!diaChi) return "---";
    const parts = [
      diaChi.soNha,
      diaChi.duong,
      diaChi.phuongXa,
      diaChi.quanHuyen,
      diaChi.tinhThanh,
    ].filter(Boolean);
    return parts.join(", ") || "---";
  };

  // Format ngày tháng
  const formatDate = (date?: string) => {
    if (!date) return "---";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  // Lấy thông tin chủ hộ từ populated data
  const getChuHoData = (): NhanKhauPopulated | null => {
    if (!hoKhau.chuHo) return null;
    if (typeof hoKhau.chuHo === "string") {
      // Tìm trong thành viên
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

  // Tất cả thành viên (bao gồm chủ hộ)
  const allMembers = hoKhau.thanhVien || [];
  const totalPages = 1 + allMembers.length; // bìa + các thành viên

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  // Lấy thông tin thành viên cho trang hiện tại
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

  // Render trang bìa sổ hộ khẩu
  const renderCoverPage = () => (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-red-700 to-red-800 text-yellow-100 p-8 relative">
      {/* Hoa văn trang trí */}
      <div className="absolute top-4 left-4 right-4 bottom-4 border-4 border-yellow-400/30 rounded-lg pointer-events-none"></div>
      <div className="absolute top-8 left-8 right-8 bottom-8 border-2 border-yellow-400/20 rounded-lg pointer-events-none"></div>

      {/* Quốc huy */}
      <div className="text-6xl mb-4">🇻🇳</div>

      {/* Tiêu đề */}
      <div className="text-center mb-8">
        <p className="text-sm font-medium tracking-widest mb-2 text-yellow-300">
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </p>
        <p className="text-xs tracking-wider text-yellow-200/80">
          Độc lập - Tự do - Hạnh phúc
        </p>
      </div>

      {/* Tên sổ */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-wider mb-2 text-yellow-100">
          SỔ HỘ KHẨU
        </h1>
        <div className="w-32 h-1 bg-yellow-400/50 mx-auto rounded-full"></div>
      </div>

      {/* Thông tin hộ */}
      <div className="text-center space-y-4 bg-red-900/50 rounded-xl p-6 border border-yellow-400/20 w-full max-w-sm">
        <div>
          <p className="text-xs text-yellow-300/80 uppercase tracking-wider">
            Số hộ khẩu
          </p>
          <p className="text-xl font-mono font-bold text-yellow-100">
            {hoKhauId.slice(-8).toUpperCase()}
          </p>
        </div>
        <div>
          <p className="text-xs text-yellow-300/80 uppercase tracking-wider">
            Chủ hộ
          </p>
          <p className="text-lg font-semibold text-yellow-100">
            {chuHoData?.hoTen || "---"}
          </p>
        </div>
        <div>
          <p className="text-xs text-yellow-300/80 uppercase tracking-wider">
            Nơi thường trú
          </p>
          <p className="text-sm text-yellow-100/90">
            {formatDiaChi(hoKhau.diaChi)}
          </p>
        </div>
        <div>
          <p className="text-xs text-yellow-300/80 uppercase tracking-wider">
            Số thành viên
          </p>
          <p className="text-lg font-semibold text-yellow-100">
            {hoKhau.thanhVien?.length || 0} người
          </p>
        </div>
      </div>

      {/* Ngày cấp */}
      <div className="absolute bottom-12 text-center">
        <p className="text-xs text-yellow-200/60">
          Ngày lập:{" "}
          {hoKhau.ngayLap
            ? new Date(hoKhau.ngayLap).toLocaleDateString("vi-VN")
            : "---"}
        </p>
      </div>
    </div>
  );

  // Render trang thành viên với đầy đủ thông tin
  const renderMemberPage = (
    memberData: NhanKhauPopulated | null,
    quanHe: string,
    pageNum: number
  ) => {
    const isChuHo = quanHe === "Chủ hộ";

    return (
      <div className="h-full bg-amber-50 relative overflow-y-auto">
        {/* Header trang */}
        <div className="sticky top-0 bg-amber-50 text-center border-b-2 border-red-700 py-3 px-4 z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Trang {pageNum}</span>
            <div className="text-center">
              <p className="text-xs text-red-700 font-medium tracking-wider">
                {isChuHo ? "TRANG CHỦ HỘ" : "TRANG THÀNH VIÊN"}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                isChuHo
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {quanHe}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Row 1: Ảnh + Thông tin cơ bản */}
          <div className="flex gap-4">
            {/* Ảnh */}
            <div className="w-28 h-36 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
              <User size={48} className="text-gray-400" />
            </div>

            {/* Thông tin cơ bản */}
            <div className="flex-1 space-y-2">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Họ và tên
                </label>
                <p className="text-lg font-bold text-gray-800 border-b border-gray-300">
                  {memberData?.hoTen || "---"}
                </p>
              </div>
              {memberData?.biDanh && (
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Bí danh
                  </label>
                  <p className="text-sm text-gray-700">{memberData.biDanh}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={10} /> Ngày sinh
                  </label>
                  <p className="text-sm font-medium text-gray-700">
                    {formatDate(memberData?.ngaySinh)}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Giới tính
                  </label>
                  <p className="text-sm font-medium text-gray-700">
                    {memberData?.gioiTinh || "---"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Thông tin chi tiết */}
          <div className="grid grid-cols-2 gap-3">
            <InfoField
              icon={<MapPin size={12} />}
              label="Nơi sinh"
              value={memberData?.noiSinh}
            />
            <InfoField
              icon={<Home size={12} />}
              label="Quê quán"
              value={memberData?.queQuan}
            />
            <InfoField
              icon={<Flag size={12} />}
              label="Dân tộc"
              value={memberData?.danToc}
            />
            <InfoField
              icon={<Heart size={12} />}
              label="Tôn giáo"
              value={memberData?.tonGiao || "Không"}
            />
            <InfoField
              icon={<Globe size={12} />}
              label="Quốc tịch"
              value={memberData?.quocTich || "Việt Nam"}
            />
            <InfoField
              icon={<Briefcase size={12} />}
              label="Nghề nghiệp"
              value={memberData?.ngheNghiep}
            />
          </div>

          {/* Nơi làm việc */}
          {memberData?.noiLamViec && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Building size={10} /> Nơi làm việc
              </label>
              <p className="text-sm text-gray-700">{memberData.noiLamViec}</p>
            </div>
          )}

          {/* Số CCCD */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <CreditCard size={10} /> Số CCCD / CMND
            </label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div>
                <p className="text-[10px] text-gray-400">Số</p>
                <p className="text-sm font-mono font-medium text-gray-700">
                  {memberData?.soDinhDanh?.so || "---"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Ngày cấp</p>
                <p className="text-sm text-gray-700">
                  {formatDate(memberData?.soDinhDanh?.ngayCap)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Nơi cấp</p>
                <p className="text-sm text-gray-700">
                  {memberData?.soDinhDanh?.noiCap || "---"}
                </p>
              </div>
            </div>
          </div>

          {/* Địa chỉ thường trú */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin size={10} /> Địa chỉ thường trú
            </label>
            <p className="text-sm text-gray-700 mt-1">
              {formatDiaChi(memberData?.diaChiThuongTru || hoKhau.diaChi)}
            </p>
            {memberData?.ngayDangKyThuongTru && (
              <p className="text-xs text-gray-500 mt-1">
                Ngày ĐK: {formatDate(memberData.ngayDangKyThuongTru)}
              </p>
            )}
          </div>

          {/* Nơi ở hiện tại (nếu khác) */}
          {memberData?.diaChiHienTai && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Home size={10} /> Nơi ở hiện tại
              </label>
              <p className="text-sm text-gray-700 mt-1">
                {formatDiaChi(memberData.diaChiHienTai)}
              </p>
            </div>
          )}

          {/* Trạng thái */}
          <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">
                Trạng thái
              </label>
              <p className="mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    memberData?.trangThai === "Thường trú"
                      ? "bg-green-100 text-green-700"
                      : memberData?.trangThai === "Tạm trú"
                      ? "bg-blue-100 text-blue-700"
                      : memberData?.trangThai === "Tạm vắng"
                      ? "bg-yellow-100 text-yellow-700"
                      : memberData?.trangThai === "Đã chuyển đi"
                      ? "bg-orange-100 text-orange-700"
                      : memberData?.trangThai === "Đã qua đời"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {memberData?.trangThai || "---"}
                </span>
              </p>
            </div>

            {/* Nút xóa - chỉ hiện cho thành viên không phải chủ hộ */}
            {!isChuHo && (
              <button
                onClick={() =>
                  onXoaThanhVien(memberData?._id || "", memberData?.hoTen || "")
                }
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
              >
                <Trash2 size={14} />
                Xóa khỏi hộ
              </button>
            )}
          </div>

          {/* Ghi chú */}
          {memberData?.ghiChu && (
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <FileText size={10} /> Ghi chú
              </label>
              <p className="text-sm text-gray-700 mt-1">{memberData.ghiChu}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render nội dung trang hiện tại
  const renderCurrentPage = () => {
    if (currentPage === 0) return renderCoverPage();

    const { data, quanHe } = getMemberDataAtIndex(currentPage - 1);
    return renderMemberPage(data, quanHe, currentPage);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-stone-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-300 bg-stone-100">
          <div className="flex items-center gap-3">
            <BookOpen className="text-red-700" size={24} />
            <div>
              <h2 className="text-lg font-bold text-gray-800">Sổ Hộ Khẩu</h2>
              <p className="text-xs text-gray-500">
                Mã: #{hoKhauId.slice(-8).toUpperCase()} •{" "}
                <span
                  className={`${
                    hoKhau.trangThai === "Đang hoạt động"
                      ? "text-green-600"
                      : hoKhau.trangThai === "Đã tách hộ"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {hoKhau.trangThai}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Nội dung sổ - 1 trang */}
        <div className="flex-1 flex bg-stone-300 p-3 gap-2 min-h-0">
          {/* Nút lật trang trái */}
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`p-1 rounded-full transition self-center flex-shrink-0 ${
              currentPage === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-stone-400"
            }`}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Nội dung trang */}
          <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden min-h-[600px]">
            {renderCurrentPage()}
          </div>

          {/* Nút lật trang phải */}
          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            className={`p-1 rounded-full transition self-center flex-shrink-0 ${
              currentPage >= totalPages - 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-stone-400"
            }`}
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center items-center gap-2 py-2 bg-stone-200 border-t border-stone-300">
          <span className="text-xs text-gray-500 mr-2">
            {currentPage === 0 ? "Bìa" : `Thành viên ${currentPage}`} /{" "}
            {totalPages - 1} người
          </span>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`w-2.5 h-2.5 rounded-full transition ${
                currentPage === idx
                  ? "bg-red-700 scale-125"
                  : "bg-stone-400 hover:bg-stone-500"
              }`}
              title={idx === 0 ? "Bìa" : `Thành viên ${idx}`}
            />
          ))}
        </div>

        {/* Footer - Action Buttons */}
        <div className="p-3 border-t border-stone-300 bg-stone-100">
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onThemThanhVien}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <UserPlus size={14} />
                Thêm TV
              </button>
              <button
                onClick={onTachHo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
              >
                <Home size={14} />
                Tách hộ
              </button>
              <button
                onClick={onDoiChuHo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
              >
                <Users size={14} />
                Đổi chủ hộ
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onXemLichSu}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                <History size={14} />
                Lịch sử
              </button>
              <button
                onClick={() => {
                  onEdit();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
              >
                <Edit size={14} />
                Sửa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component hiển thị một trường thông tin
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
    <div className="bg-white rounded-lg p-2.5 border border-gray-200">
      <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
        {icon} {label}
      </label>
      <p className="text-sm text-gray-700 mt-0.5">{value || "---"}</p>
    </div>
  );
}
