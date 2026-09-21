"use client";

import React, { useState } from "react";
import { Tag } from "lucide-react";
import { toast } from "sonner";
import { Modal, Button } from "@/components/ui";

export interface KhoanThuFormData {
  tenKhoanThu: string;
  loaiKhoanThu: string;
  soTien: number;
  moTa: string;
  donViTinh: string;
  ngayBatDau: string;
  isActive: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: KhoanThuFormData) => void;
  isLoading: boolean;
  initialData?: Partial<KhoanThuFormData>;
}

export default function CreateKhoanThuModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: Props) {
  const [formData, setFormData] = useState<KhoanThuFormData>({
    tenKhoanThu: initialData?.tenKhoanThu || "",
    loaiKhoanThu: initialData?.loaiKhoanThu || "Bắt buộc",
    soTien: initialData?.soTien || 0,
    moTa: initialData?.moTa || "",
    donViTinh: initialData?.donViTinh || "VNĐ",
    ngayBatDau: initialData?.ngayBatDau || new Date().toISOString().split("T")[0],
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.tenKhoanThu.trim()) {
      return toast.warning("Vui lòng nhập tên khoản thu!");
    }

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-600" />
          <span>Thêm Khoản Thu Mới</span>
        </div>
      }
      description="Thiết lập danh mục khoản phí hoặc quỹ đóng góp mới"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label htmlFor="create-ten-khoan-thu" className="block font-semibold text-slate-700 mb-1.5">
            Tên khoản thu <span className="text-rose-600">*</span>
          </label>
          <input
            id="create-ten-khoan-thu"
            type="text"
            placeholder="Ví dụ: Phí vệ sinh, Quỹ an ninh..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            value={formData.tenKhoanThu}
            onChange={(e) =>
              setFormData({ ...formData, tenKhoanThu: e.target.value })
            }
            autoFocus
          />
        </div>

        <div>
          <span className="block font-semibold text-slate-700 mb-1.5">
            Phân loại khoản thu
          </span>
          <div className="grid grid-cols-2 gap-3">
            <label
              htmlFor="radio-khoan-thu-bat-buoc"
              className={`flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-all ${
                formData.loaiKhoanThu === "Bắt buộc"
                  ? "bg-blue-50/60 border-blue-300 ring-1 ring-blue-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                id="radio-khoan-thu-bat-buoc"
                type="radio"
                name="loaiKhoanThu"
                value="Bắt buộc"
                checked={formData.loaiKhoanThu === "Bắt buộc"}
                onChange={() =>
                  setFormData({ ...formData, loaiKhoanThu: "Bắt buộc" })
                }
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-slate-800 block text-xs">Bắt buộc</span>
                <span className="text-[10px] text-slate-500">Phí định kỳ, vệ sinh</span>
              </div>
            </label>

            <label
              htmlFor="radio-khoan-thu-tu-nguyen"
              className={`flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-all ${
                formData.loaiKhoanThu === "Tự nguyện"
                  ? "bg-purple-50/60 border-purple-300 ring-1 ring-purple-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                id="radio-khoan-thu-tu-nguyen"
                type="radio"
                name="loaiKhoanThu"
                value="Tự nguyện"
                checked={formData.loaiKhoanThu === "Tự nguyện"}
                onChange={() =>
                  setFormData({ ...formData, loaiKhoanThu: "Tự nguyện" })
                }
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="font-bold text-slate-800 block text-xs">Tự nguyện</span>
                <span className="text-[10px] text-slate-500">Quỹ ủng hộ, đóng góp</span>
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="create-so-tien" className="block font-semibold text-slate-700 mb-1.5">
              Định mức (VNĐ)
            </label>
            <input
              id="create-so-tien"
              type="number"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all tabular-nums"
              value={formData.soTien}
              onChange={(e) =>
                setFormData({ ...formData, soTien: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label htmlFor="create-don-vi-tinh" className="block font-semibold text-slate-700 mb-1.5">
              Đơn vị tính
            </label>
            <input
              id="create-don-vi-tinh"
              type="text"
              placeholder="Hộ / Người / Năm"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={formData.donViTinh}
              onChange={(e) =>
                setFormData({ ...formData, donViTinh: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label htmlFor="create-mo-ta" className="block font-semibold text-slate-700 mb-1.5">
            Mô tả / Ghi chú
          </label>
          <textarea
            id="create-mo-ta"
            rows={2}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            value={formData.moTa}
            onChange={(e) =>
              setFormData({ ...formData, moTa: e.target.value })
            }
            placeholder="Nhập ghi chú chi tiết hoặc quy định..."
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
            Lưu khoản thu
          </Button>
        </div>
      </form>
    </Modal>
  );
}
