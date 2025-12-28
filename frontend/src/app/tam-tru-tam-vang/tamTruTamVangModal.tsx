"use client";
import React, { useState, useEffect } from "react";
import { TamTruTamVang } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: TamTruTamVang | null;
  isLoading: boolean;
}

const defaultData = {
  nhanKhauId: undefined,
  hoTen: "",
  loai: "Tạm trú" as "Tạm trú" | "Tạm vắng",
  tuNgay: "",
  denNgay: "",
  diaChiTamTru: {
    soNha: "",
    duong: "",
    phuongXa: "",
    quanHuyen: "",
    tinhThanh: "",
  },
  diaChiThuongTru: {
    soNha: "",
    duong: "",
    phuongXa: "",
    quanHuyen: "",
    tinhThanh: "",
  },
  lyDo: "",
  noiDen: "",
  ghiChu: "",
};

export default function TamTruTamVangModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: Props) {
  const [formData, setFormData] = useState<any>(defaultData);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          tuNgay: initialData.tuNgay ? initialData.tuNgay.split("T")[0] : "",
          denNgay: initialData.denNgay ? initialData.denNgay.split("T")[0] : "",
          diaChiTamTru: initialData.diaChiTamTru || defaultData.diaChiTamTru,
          diaChiThuongTru: initialData.diaChiThuongTru || defaultData.diaChiThuongTru,
        });
      } else {
        setFormData(defaultData);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent: string, child: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [child]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: any = {};
    // nhanKhauId is now optional
    if (!formData.hoTen.trim()) newErrors.hoTen = "Vui lòng nhập họ tên";
    if (!formData.tuNgay) newErrors.tuNgay = "Vui lòng chọn ngày bắt đầu";
    if (!formData.denNgay) newErrors.denNgay = "Vui lòng chọn ngày kết thúc";
    if (formData.loai === "Tạm trú" && !formData.diaChiTamTru.tinhThanh?.trim()) {
      newErrors.diaChiTamTru = "Vui lòng nhập địa chỉ tạm trú";
    }
    if (formData.loai === "Tạm vắng" && !formData.noiDen.trim()) {
      newErrors.noiDen = "Vui lòng nhập nơi đến";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? "Cập nhật" : "Đăng ký"} {formData.loai}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại đăng ký *
            </label>
            <select
              name="loai"
              value={formData.loai}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!!initialData} // Không cho đổi loại khi sửa
            >
              <option value="Tạm trú">Tạm trú</option>
              <option value="Tạm vắng">Tạm vắng</option>
            </select>
          </div>

          {/* Nhân khẩu ID - optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Nhân khẩu (tùy chọn)
            </label>
            <input
              type="text"
              name="nhanKhauId"
              value={formData.nhanKhauId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập ID nhân khẩu (nếu có)"
            />
            {errors.nhanKhauId && (
              <p className="text-red-500 text-sm mt-1">{errors.nhanKhauId}</p>
            )}
          </div>

          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên *
            </label>
            <input
              type="text"
              name="hoTen"
              value={formData.hoTen}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập họ và tên"
            />
            {errors.hoTen && (
              <p className="text-red-500 text-sm mt-1">{errors.hoTen}</p>
            )}
          </div>

          {/* Ngày bắt đầu và kết thúc */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày *
              </label>
              <input
                type="date"
                name="tuNgay"
                value={formData.tuNgay}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.tuNgay && (
                <p className="text-red-500 text-sm mt-1">{errors.tuNgay}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày *
              </label>
              <input
                type="date"
                name="denNgay"
                value={formData.denNgay}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.denNgay && (
                <p className="text-red-500 text-sm mt-1">{errors.denNgay}</p>
              )}
            </div>
          </div>

          {/* Địa chỉ thường trú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ thường trú
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.diaChiThuongTru.soNha}
                onChange={(e) => handleNestedChange('diaChiThuongTru', 'soNha', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Số nhà"
              />
              <input
                type="text"
                value={formData.diaChiThuongTru.duong}
                onChange={(e) => handleNestedChange('diaChiThuongTru', 'duong', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Đường"
              />
              <input
                type="text"
                value={formData.diaChiThuongTru.phuongXa}
                onChange={(e) => handleNestedChange('diaChiThuongTru', 'phuongXa', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Phường/Xã"
              />
              <input
                type="text"
                value={formData.diaChiThuongTru.quanHuyen}
                onChange={(e) => handleNestedChange('diaChiThuongTru', 'quanHuyen', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Quận/Huyện"
              />
              <input
                type="text"
                value={formData.diaChiThuongTru.tinhThanh}
                onChange={(e) => handleNestedChange('diaChiThuongTru', 'tinhThanh', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
                placeholder="Tỉnh/Thành"
              />
            </div>
          </div>

          {/* Fields specific to loại */}
          {formData.loai === "Tạm trú" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ tạm trú *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.diaChiTamTru.soNha}
                  onChange={(e) => handleNestedChange('diaChiTamTru', 'soNha', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Số nhà"
                />
                <input
                  type="text"
                  value={formData.diaChiTamTru.duong}
                  onChange={(e) => handleNestedChange('diaChiTamTru', 'duong', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Đường"
                />
                <input
                  type="text"
                  value={formData.diaChiTamTru.phuongXa}
                  onChange={(e) => handleNestedChange('diaChiTamTru', 'phuongXa', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phường/Xã"
                />
                <input
                  type="text"
                  value={formData.diaChiTamTru.quanHuyen}
                  onChange={(e) => handleNestedChange('diaChiTamTru', 'quanHuyen', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Quận/Huyện"
                />
                <input
                  type="text"
                  value={formData.diaChiTamTru.tinhThanh}
                  onChange={(e) => handleNestedChange('diaChiTamTru', 'tinhThanh', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
                  placeholder="Tỉnh/Thành"
                />
                {errors.diaChiTamTru && (
                  <p className="text-red-500 text-sm mt-1 col-span-2">{errors.diaChiTamTru}</p>
                )}
              </div>
            </div>
          )}

          {formData.loai === "Tạm vắng" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nơi đến *
              </label>
              <input
                type="text"
                name="noiDen"
                value={formData.noiDen}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập nơi đến"
              />
              {errors.noiDen && (
                <p className="text-red-500 text-sm mt-1">{errors.noiDen}</p>
              )}
            </div>
          )}

          {/* Lý do */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do
            </label>
            <textarea
              name="lyDo"
              value={formData.lyDo}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập lý do"
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="ghiChu"
              value={formData.ghiChu}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập ghi chú"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Đang xử lý..." : initialData ? "Cập nhật" : "Đăng ký"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
