"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calculator, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Modal, Button } from "@/components/ui";
import { getAllHoKhau, getAllKhoanThu } from "./api";

export interface HoKhauSelectItem {
  _id?: string;
  id?: string;
  maHoKhau?: string;
  chuHo?: {
    hoTen?: string;
  };
  soNhanKhau?: number;
  nhanKhau?: unknown[];
  diaChi?: {
    soNha?: string;
    duong?: string;
    phuongXa?: string;
  };
  diaChiThuongTru?: {
    soNha?: string;
    duong?: string;
    phuongXa?: string;
  };
}

export interface KhoanThuSelectItem {
  _id?: string;
  id?: string;
  tenKhoanThu: string;
  soTien?: number;
  loaiKhoanThu?: string;
}

export interface SelectedFeeItem {
  khoanThuId: string;
  tenKhoanThu: string;
  soTien: number;
  ghiChu?: string;
}

export interface PhieuThuSubmitData {
  hoKhauId: string;
  nam: number;
  kyThu: string;
  maPhieuThu: string;
  tenChuHo: string;
  diaChi: string;
  soNhanKhau: number;
  chiTietThu: Array<{
    khoanThuId: string;
    tenKhoanThu: string;
    soTien: number;
    ghiChu: string;
  }>;
  tongTien: number;
  ngayThu: string;
  trangThai: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PhieuThuSubmitData) => void;
  isLoading: boolean;
}

export default function ThuPhiModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: Props) {
  const [formData, setFormData] = useState({
    hoKhauId: "",
    nam: new Date().getFullYear(),
    kyThu: `Tháng ${new Date().getMonth() + 1}`,
  });
  const [selectedFees, setSelectedFees] = useState<SelectedFeeItem[]>([]);

  const { data: dsHoKhau = [] } = useQuery<HoKhauSelectItem[]>({
    queryKey: ["ho-khau"],
    queryFn: async () => {
      const res = await getAllHoKhau();
      return Array.isArray(res) ? res : [];
    },
    enabled: isOpen,
  });

  const { data: dsKhoanThu = [] } = useQuery<KhoanThuSelectItem[]>({
    queryKey: ["khoan-thu"],
    queryFn: async () => {
      const res = await getAllKhoanThu();
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedFees([]);
    }
  }, [isOpen]);

  const handleToggleFee = (khoanThu: KhoanThuSelectItem, isChecked: boolean) => {
    const kId = khoanThu._id || khoanThu.id || "";
    if (isChecked) {
      setSelectedFees((prev) => [
        ...prev,
        {
          khoanThuId: kId,
          tenKhoanThu: khoanThu.tenKhoanThu,
          soTien: Number(khoanThu.soTien) || 0,
          ghiChu: "",
        },
      ]);
    } else {
      setSelectedFees((prev) => prev.filter((f) => f.khoanThuId !== kId));
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.hoKhauId) return toast.warning("Vui lòng chọn hộ khẩu!");
    if (selectedFees.length === 0)
      return toast.warning("Vui lòng chọn ít nhất 1 khoản thu!");

    const selectedHoKhau = dsHoKhau.find(
      (hk) => (hk._id || hk.id) === formData.hoKhauId
    );
    const tenChuHo = selectedHoKhau?.chuHo?.hoTen || "Chủ hộ không xác định";

    const dc = selectedHoKhau?.diaChi || selectedHoKhau?.diaChiThuongTru;
    let diaChiString = "Địa chỉ không xác định";
    if (dc) {
      diaChiString = `${dc.soNha ? "Số " + dc.soNha + ", " : ""}${
        dc.duong ? "Đường " + dc.duong + ", " : ""
      }${dc.phuongXa || ""}`;
      if (diaChiString.endsWith(", ")) diaChiString = diaChiString.slice(0, -2);
    }

    const countNhanKhau =
      selectedHoKhau?.soNhanKhau ||
      selectedHoKhau?.nhanKhau?.length ||
      1;

    const finalChiTietThu = selectedFees.map((fee) => {
      const originalFee = dsKhoanThu.find(
        (k) => (k._id || k.id) === fee.khoanThuId
      );
      return {
        khoanThuId: fee.khoanThuId,
        tenKhoanThu: fee.tenKhoanThu || originalFee?.tenKhoanThu || "Phí thu",
        soTien: Number(fee.soTien),
        ghiChu: fee.ghiChu || "",
      };
    });

    const finalTongTien = finalChiTietThu.reduce(
      (sum, item) => sum + item.soTien,
      0
    );

    const submitData: PhieuThuSubmitData = {
      ...formData,
      nam: Number(formData.nam),
      maPhieuThu: `PT${Date.now()}`,
      tenChuHo,
      diaChi: diaChiString,
      soNhanKhau: Number(countNhanKhau),
      chiTietThu: finalChiTietThu,
      tongTien: Number(finalTongTien),
      ngayThu: new Date().toISOString(),
      trangThai: "Đã thu",
    };

    onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <span>Tạo Phiếu Thu Mới</span>
        </div>
      }
      description="Lập phiếu thu nộp phí cố định hoặc tự nguyện cho hộ gia đình"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="thu-phi-ho-khau-id" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hộ Khẩu Nộp Tiền <span className="text-rose-600">*</span>
            </label>
            <select
              id="thu-phi-ho-khau-id"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
              value={formData.hoKhauId}
              onChange={(e) =>
                setFormData({ ...formData, hoKhauId: e.target.value })
              }
            >
              <option value="">-- Chọn hộ khẩu --</option>
              {dsHoKhau.map((hk) => (
                <option key={hk._id || hk.id} value={hk._id || hk.id}>
                  {hk.maHoKhau} - {hk.chuHo?.hoTen || "Chủ hộ chưa rõ"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="thu-phi-ky-thu" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kỳ Thu
            </label>
            <input
              id="thu-phi-ky-thu"
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={formData.kyThu}
              onChange={(e) =>
                setFormData({ ...formData, kyThu: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="thu-phi-nam-thu" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Năm Thu
            </label>
            <input
              id="thu-phi-nam-thu"
              type="number"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all tabular-nums"
              value={formData.nam}
              onChange={(e) =>
                setFormData({ ...formData, nam: Number(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              Các Khoản Thu Áp Dụng
            </h4>
            <span className="text-[11px] text-slate-500">
              Đã chọn: <strong className="text-blue-600">{selectedFees.length}</strong> khoản
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {dsKhoanThu.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-xs text-slate-500">
                  Chưa có danh mục khoản thu nào đang hoạt động.
                </p>
              </div>
            ) : (
              dsKhoanThu.map((kt) => {
                const ktId = kt._id || kt.id || "";
                const isSelected = selectedFees.some(
                  (f) => f.khoanThuId === ktId
                );
                const currentFeeItem = selectedFees.find(
                  (f) => f.khoanThuId === ktId
                );
                const currentAmount = currentFeeItem ? currentFeeItem.soTien : "";

                return (
                  <div
                    key={ktId}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isSelected
                        ? "bg-blue-50/60 border-blue-300 ring-1 ring-blue-500/30"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`kt-${ktId}`}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={isSelected}
                      onChange={(e) => handleToggleFee(kt, e.target.checked)}
                    />
                    <label
                      htmlFor={`kt-${ktId}`}
                      className="flex-1 min-w-0 cursor-pointer select-none"
                    >
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {kt.tenKhoanThu}
                      </p>
                      {kt.soTien && kt.soTien > 0 ? (
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          Định mức: {Number(kt.soTien).toLocaleString("vi-VN")} đ
                        </p>
                      ) : null}
                    </label>

                    {isSelected && (
                      <div className="relative w-36 shrink-0">
                        <input
                          id={`amount-fee-${ktId}`}
                          aria-label={`Số tiền ${kt.tenKhoanThu}`}
                          type="number"
                          placeholder={String(kt.soTien || 0)}
                          className="w-full pl-2.5 pr-7 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-right text-slate-900 focus:border-blue-600 outline-none tabular-nums"
                          value={currentAmount}
                          onChange={(e) =>
                            handleChangeAmount(ktId, Number(e.target.value))
                          }
                          autoFocus
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">
                          đ
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tổng thành tiền & Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
              Tổng thành tiền
            </p>
            <p className="text-xl font-bold text-blue-700 tabular-nums">
              {totalAmount.toLocaleString("vi-VN")} đ
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
            >
              Lưu phiếu thu
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
