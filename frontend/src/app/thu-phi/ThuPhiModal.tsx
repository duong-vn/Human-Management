"use client";
import React, { useState, useEffect } from "react";
import { X, Check, Calculator, DollarSign } from "lucide-react";
// 1. Import useQuery
import { useQuery } from "@tanstack/react-query";
import { getActiveKhoanThu } from "./api";
import { getAllHoKhau } from "./api";
import { getAllKhoanThu } from "./api";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function ThuPhiModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: Props) {
  // State form
  const [formData, setFormData] = useState({
    hoKhauId: "",
    nam: new Date().getFullYear(),
    kyThu: `Tháng ${new Date().getMonth() + 1}`,
  });
  const [selectedFees, setSelectedFees] = useState<any[]>([]);

  // 2. Dùng useQuery để lấy Hộ Khẩu (Tự động cache và cập nhật)
  const { data: dsHoKhau = [] } = useQuery({
    queryKey: ["ho-khau"], // Key định danh
    queryFn: async () => {
      const res = await getAllHoKhau();
      return Array.isArray(res) ? res : [];
    },
    enabled: isOpen, // Chỉ tải khi Modal mở
  });

  // 3. Dùng useQuery để lấy Khoản Thu (Quan trọng: Key phải khớp với lúc invalidate)
  const { data: dsKhoanThu = [] } = useQuery({
    queryKey: ["khoan-thu"], // Key này sẽ được làm mới khi bạn tạo khoản thu
    queryFn: async () => {
      const res = await getAllKhoanThu();
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: isOpen, // Chỉ tải khi Modal mở
  });

  // Reset form khi mở
  useEffect(() => {
    if (isOpen) {
      setSelectedFees([]);
      // Không cần reset dsHoKhau/dsKhoanThu nữa vì useQuery lo rồi
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- LOGIC GIỮ NGUYÊN ---
const handleToggleFee = (khoanThu: any, isChecked: boolean) => {
    if (isChecked) {
      setSelectedFees((prev) => [
        ...prev,
        {
          khoanThuId: khoanThu._id || khoanThu.id,

          // 👇 THÊM DÒNG NÀY: Lưu tên khoản thu vào state
          tenKhoanThu: khoanThu.tenKhoanThu,

          // Mẹo: Lấy luôn giá định mức mặc định nếu có, thay vì để 0
          soTien: khoanThu.soTien || 0,

          ghiChu: ""
        },
      ]);
    } else {
      setSelectedFees((prev) =>
        prev.filter((f) => f.khoanThuId !== (khoanThu._id || khoanThu.id))
      );
    }
  };

  const handleChangeAmount = (id: string, amount: number) => {
    setSelectedFees((prev) =>
      prev.map((f) => (f.khoanThuId === id ? { ...f, soTien: amount } : f))
    );
  };

  const totalAmount = selectedFees.reduce(
    (sum, item) => sum + (Number(item.soTien) || 0),
    0
  );

  // ... (Các đoạn code khác giữ nguyên)

  // src/components/ThuPhiModal.tsx

  // ...

// Trong file ThuPhiModal.tsx

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoKhauId) return toast.warning("Vui lòng chọn hộ khẩu!");
    if (selectedFees.length === 0)
      return toast.warning("Vui lòng chọn ít nhất 1 khoản thu!");

    // 1. Lấy thông tin hộ khẩu
    const selectedHoKhau = dsHoKhau.find(
      (hk: any) => (hk._id || hk.id) === formData.hoKhauId
    );
    const tenChuHo = selectedHoKhau?.chuHo?.hoTen || "Chủ hộ không xác định";

    // Xử lý địa chỉ
    const dc = selectedHoKhau?.diaChi || selectedHoKhau?.diaChiThuongTru;
    let diaChiString = "Địa chỉ không xác định";
    if (dc) {
      diaChiString = `${dc.soNha ? "Số " + dc.soNha + ", " : ""}${
        dc.duong ? "Đường " + dc.duong + ", " : ""
      }${dc.phuongXa || ""}`;
      if (diaChiString.endsWith(", ")) diaChiString = diaChiString.slice(0, -2);
    }

    // Xử lý số nhân khẩu
    const countNhanKhau =
      selectedHoKhau?.soNhanKhau ||
      selectedHoKhau?.nhanKhau?.length ||
      1;

    // 2. Map lại chi tiết thu (đảm bảo có tên khoản thu)
    const finalChiTietThu = selectedFees.map(fee => {
      const originalFee = dsKhoanThu.find((k: any) => (k._id || k.id) === fee.khoanThuId);
      return {
        khoanThuId: fee.khoanThuId,
        tenKhoanThu: fee.tenKhoanThu || originalFee?.tenKhoanThu || "Phí thu",
        soTien: Number(fee.soTien),
        ghiChu: fee.ghiChu || ""
      };
    });

    // 3. Tính tổng tiền
    const finalTongTien = finalChiTietThu.reduce((sum, item) => sum + item.soTien, 0);

    // 4. Đóng gói dữ liệu (Payload)
    const submitData = {
      ...formData,
      nam: Number(formData.nam),

      // Các trường Meta-data
      maPhieuThu: `PT${Date.now()}`,
      tenChuHo: tenChuHo,
      diaChi: diaChiString,
      soNhanKhau: Number(countNhanKhau),

      // Dữ liệu tiền nong
      chiTietThu: finalChiTietThu,
      tongTien: Number(finalTongTien),

      // 👇 THÊM DÒNG NÀY ĐỂ FIX LỖI NGÀY THU
      ngayThu: new Date().toISOString(), // VD: "2025-01-15T10:30:00.000Z"

      // Nếu backend yêu cầu thêm trạng thái
      trangThai: "Đã thu",
    };

    console.log("Payload đầy đủ:", submitData);
    onSubmit(submitData);
  };
  // ...

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="text-blue-600" /> Tạo Phiếu Thu Mới
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Hộ Khẩu Nộp Tiền (*)
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none bg-white"
                value={formData.hoKhauId}
                onChange={(e) =>
                  setFormData({ ...formData, hoKhauId: e.target.value })
                }
              >
                <option value="">-- Chọn hộ khẩu --</option>
                {dsHoKhau.map((hk: any) => (
                  <option key={hk._id || hk.id} value={hk._id || hk.id}>
                    {hk.maHoKhau} - {hk.chuHo?.hoTen || "Chủ hộ chưa rõ"}
                  </option>
                ))}
              </select>
            </div>
            {/* Các ô input khác giữ nguyên */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Kỳ Thu
              </label>
              <input
                type="text"
                className="w-full border p-2.5 rounded-lg"
                value={formData.kyThu}
                onChange={(e) =>
                  setFormData({ ...formData, kyThu: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Năm Thu
              </label>
              <input
                type="number"
                className="w-full border p-2.5 rounded-lg text-center"
                value={formData.nam}
                onChange={(e) =>
                  setFormData({ ...formData, nam: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <hr className="border-dashed border-gray-200" />

          {/* DANH SÁCH KHOẢN THU */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign size={18} /> Các Khoản Thu
            </h3>

            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              {dsKhoanThu.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 italic text-sm">
                    Chưa có khoản thu nào đang hoạt động.
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Hãy tạo khoản thu mới và đảm bảo trạng thái là "Đang hoạt
                    động".
                  </p>
                </div>
              )}

              {dsKhoanThu.map((kt: any) => {
                const ktId = kt._id || kt.id;
                const isSelected = selectedFees.some(
                  (f) => f.khoanThuId === ktId
                );
                const currentAmount =
                  selectedFees.find((f) => f.khoanThuId === ktId)?.soTien || "";

                return (
                  <div
                    key={ktId}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all bg-white ${
                      isSelected
                        ? "border-blue-500 ring-1 ring-blue-500"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-blue-600 cursor-pointer"
                      checked={isSelected}
                      onChange={(e) => handleToggleFee(kt, e.target.checked)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {kt.tenKhoanThu}
                      </p>
                      {/* Hiển thị thêm số tiền định mức để dễ nhập */}
                      {kt.soTien > 0 && (
                        <span className="text-xs text-gray-500">
                          Định mức: {kt.soTien?.toLocaleString()}đ
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="relative w-36">
                        <input
                          type="number"
                          placeholder={kt.soTien || "0"}
                          className="w-full pl-3 pr-8 py-1.5 border rounded-md font-bold text-right text-gray-700"
                          value={currentAmount}
                          onChange={(e) =>
                            handleChangeAmount(ktId, Number(e.target.value))
                          }
                          autoFocus
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                          đ
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
              Tổng thành tiền
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {totalAmount.toLocaleString("vi-VN")} đ
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border hover:bg-white"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 rounded-lg bg-black text-white shadow-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {isLoading ? "Đang lưu..." : "Lưu Phiếu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
