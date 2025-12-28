"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// 👇 1. Import thêm getAllThuPhi
import {
  getAllHoKhau,
  createPhieuThu,
  getAllKhoanThu,
  getAllThuPhi,
} from "../api";
import { User, CheckCircle, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";

const DON_GIA_VE_SINH = 6000;

export default function QuanLyPhiVeSinh() {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 1. Lấy danh sách hộ khẩu
  const { data: dsHoKhau = [], isLoading: isLoadingHoKhau } = useQuery({
    queryKey: ["ho-khau"],
    queryFn: async () => {
      const res = await getAllHoKhau();
      return Array.isArray(res) ? res : [];
    },
  });

  // 2. Lấy danh sách khoản thu (để tìm ID thật)
  const { data: dsKhoanThu = [] } = useQuery({
    queryKey: ["khoan-thu"],
    queryFn: async () => {
      const res = await getAllKhoanThu();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  // 👇 3. LẤY LỊCH SỬ THU PHÍ (Để check xem ai đóng rồi)
  const { data: dsPhieuThu = [] } = useQuery({
    queryKey: ["thu-phi-history"],
    queryFn: async () => {
      const res = await getAllThuPhi();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  // 4. Mutation thu phí
  const thuPhiMutation = useMutation({
    mutationFn: async (payload: any) => await createPhieuThu(payload),
    onSuccess: () => {
      toast.success("Thu phí thành công!");
      // 👇 QUAN TRỌNG: Tải lại lịch sử để cập nhật trạng thái "Đã thu" ngay lập tức
      queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err.message || "Có lỗi xảy ra";
      toast.error(
        "Lỗi thu phí: " + (Array.isArray(msg) ? msg.join(", ") : msg)
      );
    },
  });

  // --- HÀM KIỂM TRA TRẠNG THÁI ĐÃ ĐÓNG TIỀN CHƯA ---
  const checkDaDong = (hoKhauId: string) => {
    // Logic: Tìm trong dsPhieuThu xem có phiếu nào khớp Hộ + Kỳ thu (Tháng/Năm) không
    const kyThuCanTim = `Tháng ${selectedMonth}/${selectedYear}`;

    return dsPhieuThu.some((pt: any) => {
      // So sánh ID hộ khẩu (xử lý cả trường hợp _id và id)
      const ptHoKhauId = pt.hoKhauId?._id || pt.hoKhauId?.id || pt.hoKhauId;
      const targetId = hoKhauId;

      // Điều kiện 1: Khớp hộ khẩu
      const isMatchHoKhau = ptHoKhauId === targetId;
      // Điều kiện 2: Khớp kỳ thu (Tháng này)
      const isMatchKyThu = pt.kyThu === kyThuCanTim;
      // Điều kiện 3: Có chứa khoản thu "Vệ sinh" (để tránh nhầm với quỹ đóng góp khác)
      const isVeSinh = pt.chiTietThu?.some((ct: any) =>
        ct.tenKhoanThu?.toLowerCase().includes("vệ sinh")
      );

      return (
        isMatchHoKhau && isMatchKyThu && isVeSinh && pt.trangThai === "Đã thu"
      );
    });
  };

  // --- HÀM XỬ LÝ THU NHANH ---
  const handleThuNhanh = (hoKhau: any) => {
    // 1. Tìm ID khoản thu thật
    const khoanThuVeSinh = dsKhoanThu.find(
      (kt: any) =>
        kt.tenKhoanThu && kt.tenKhoanThu.toLowerCase().includes("vệ sinh")
    );

    if (!khoanThuVeSinh) {
      return toast.error(
        "Cảnh báo: Không tìm thấy khoản thu 'Phí vệ sinh' trong hệ thống!"
      );
    }
    const realId = khoanThuVeSinh._id || khoanThuVeSinh.id;

    // 2. Tính toán
    const soNhanKhau = hoKhau.soNhanKhau || hoKhau.nhanKhau?.length || 1;
    const tongTien = soNhanKhau * DON_GIA_VE_SINH;

    const dc = hoKhau.diaChi || hoKhau.diaChiThuongTru;
    let diaChiString = "Chưa cập nhật";
    if (dc) {
      diaChiString = `${dc.soNha ? "Số " + dc.soNha + ", " : ""}${
        dc.duong ? "Đường " + dc.duong + ", " : ""
      }${dc.phuongXa || ""}`;
    }

    // 3. Payload
    const payload = {
      hoKhauId: hoKhau._id || hoKhau.id,
      maPhieuThu: `VS-${selectedMonth}${selectedYear}-${hoKhau.maHoKhau}`,
      tenChuHo: hoKhau.chuHo?.hoTen || "Chủ hộ không xác định",
      diaChi: diaChiString,
      soNhanKhau: Number(soNhanKhau),
      nam: Number(selectedYear),
      kyThu: `Tháng ${selectedMonth}/${selectedYear}`, // Key quan trọng để check đã đóng chưa
      ngayThu: new Date().toISOString(),
      trangThai: "Đã thu",
      chiTietThu: [
        {
          khoanThuId: realId,
          tenKhoanThu: `Phí vệ sinh tháng ${selectedMonth}`,
          soTien: Number(tongTien),
          ghiChu: `${soNhanKhau} người x ${DON_GIA_VE_SINH.toLocaleString()}đ`,
        },
      ],
      tongTien: Number(tongTien),
    };

    // 👇 THAY THẾ CONFIRM BẰNG TOAST TẠI ĐÂY
    toast(`Thu phí: ${hoKhau.chuHo?.hoTen || "Không rõ"}`, {
      description: `Xác nhận thu ${tongTien.toLocaleString()}đ?`,
      action: {
        label: "Xác nhận",
        onClick: () => thuPhiMutation.mutate(payload),
      },
      cancel: {
        label: "Hủy",
        onClick: () => {}, // Hàm rỗng để tránh lỗi TypeScript
      },
      duration: 5000, // Hiện trong 5s
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="text-green-600" /> Khoản Phí Vệ Sinh
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Thu phí bắt buộc theo đầu người ({DON_GIA_VE_SINH.toLocaleString()}{" "}
            đ/người)
          </p>
        </div>

        {/* BỘ LỌC THÁNG */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
          <Calendar size={18} className="text-gray-500" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="outline-none font-medium text-gray-700 bg-transparent"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
          <span className="text-gray-300">|</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="outline-none font-medium text-gray-700 bg-transparent"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {/* DANH SÁCH HỘ DÂN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">
                Mã Hộ
              </th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">
                Chủ Hộ
              </th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">
                Số NK
              </th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">
                Phải Thu
              </th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoadingHoKhau ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : (
              dsHoKhau.map((hk: any) => {
                const hkId = hk._id || hk.id;
                const soNK = hk.soNhanKhau || hk.nhanKhau?.length || 1;
                const phaiThu = soNK * DON_GIA_VE_SINH;

                // 👇 KIỂM TRA TRẠNG THÁI
                const daDongTien = checkDaDong(hkId);

                return (
                  <tr
                    key={hkId}
                    className={`transition-colors ${
                      daDongTien ? "bg-green-50/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-4 font-medium text-blue-600">
                      #{hk._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">
                        {hk.chuHo?.hoTen || "Trống"}
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">
                        {hk.diaChi?.soNha} {hk.diaChi?.duong}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
                        {soNK}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-gray-700">
                      {phaiThu.toLocaleString()} ₫
                    </td>
                    <td className="p-4 text-center">
                      {/* 👇 LOGIC HIỂN THỊ NÚT BẤM DỰA TRÊN TRẠNG THÁI */}
                      {daDongTien ? (
                        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold shadow-sm">
                          <CheckCircle size={16} /> Đã thu
                        </div>
                      ) : (
                        <button
                          onClick={() => handleThuNhanh(hk)}
                          disabled={thuPhiMutation.isPending}
                          className="group flex items-center gap-2 mx-auto px-3 py-1.5 bg-white border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                        >
                          <DollarSign size={16} /> Thu Nhanh
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
