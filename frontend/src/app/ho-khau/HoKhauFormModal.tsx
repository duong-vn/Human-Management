"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { DiaChi, CreateHoKhauParams, NhanKhauBasic, HoKhau } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHoKhauParams) => void;
  initialData?: HoKhau | null;
  nhanKhauList: NhanKhauBasic[];
  isLoading: boolean;
}

const defaultDiaChi: DiaChi = {
  soNha: "",
  duong: "",
  phuongXa: "",
  quanHuyen: "",
  tinhThanh: "",
};

export default function HoKhauFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  nhanKhauList,
  isLoading,
}: Props) {
  const [chuHoId, setChuHoId] = useState("");
  const [chuHoTen, setChuHoTen] = useState("");
  const [diaChi, setDiaChi] = useState<DiaChi>(defaultDiaChi);
  const [trangThai, setTrangThai] = useState("Đang hoạt động");
  const [ghiChu, setGhiChu] = useState("");

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit mode
        const chuHoNhanKhauId =
          typeof initialData.chuHo.nhanKhauId === "object"
            ? initialData.chuHo.nhanKhauId._id
            : initialData.chuHo.nhanKhauId || "";
        setChuHoId(chuHoNhanKhauId);
        setChuHoTen(initialData.chuHo.hoTen);
        setDiaChi(initialData.diaChi || defaultDiaChi);
        setTrangThai(initialData.trangThai);
        setGhiChu(initialData.ghiChu || "");
      } else {
        // Create mode
        setChuHoId("");
        setChuHoTen("");
        setDiaChi(defaultDiaChi);
        setTrangThai("Đang hoạt động");
        setGhiChu("");
      }
    }
  }, [isOpen, initialData]);

  // Auto fill họ tên khi chọn chủ hộ
  const handleChuHoChange = (nhanKhauId: string) => {
    setChuHoId(nhanKhauId);
    const nhanKhau = nhanKhauList.find((nk) => nk._id === nhanKhauId);
    if (nhanKhau) {
      setChuHoTen(nhanKhau.hoTen);
    }
  };

  const handleDiaChiChange = (field: keyof DiaChi, value: string) => {
    setDiaChi((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!chuHoId || !chuHoTen) {
      alert("Vui lòng chọn chủ hộ!");
      return;
    }

    const data: CreateHoKhauParams = {
      chuHo: {
        nhanKhauId: chuHoId,
        hoTen: chuHoTen,
      },
      diaChi,
      trangThai,
      ghiChu,
    };

    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditMode ? "Cập Nhật Hộ Khẩu" : "Tạo Hộ Khẩu Mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="space-y-6">
            {/* Thông tin chủ hộ */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                Thông tin chủ hộ
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Chọn nhân khẩu làm chủ hộ{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={chuHoId}
                    onChange={(e) => handleChuHoChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition"
                    required
                    disabled={isEditMode} // Không cho đổi chủ hộ từ form này
                  >
                    <option value="">-- Chọn nhân khẩu --</option>
                    {nhanKhauList.map((nk) => (
                      <option key={nk._id} value={nk._id}>
                        {nk.hoTen} {nk.hoKhauId ? "(Đã có hộ khẩu)" : ""}
                      </option>
                    ))}
                  </select>
                  {isEditMode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Để đổi chủ hộ, vui lòng dùng chức năng "Đổi chủ hộ"
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Họ tên chủ hộ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={chuHoTen}
                    onChange={(e) => setChuHoTen(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition"
                    placeholder="Họ tên chủ hộ"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                Địa chỉ hộ khẩu
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Số nhà
                  </label>
                  <input
                    type="text"
                    value={diaChi.soNha || ""}
                    onChange={(e) =>
                      handleDiaChiChange("soNha", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition"
                    placeholder="VD: 12A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Đường
                  </label>
                  <input
                    type="text"
                    value={diaChi.duong || ""}
                    onChange={(e) =>
                      handleDiaChiChange("duong", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition"
                    placeholder="VD: Nguyễn Trãi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Phường/Xã
                  </label>
                  <input
                    type="text"
                    value={diaChi.phuongXa || ""}
                    onChange={(e) =>
                      handleDiaChiChange("phuongXa", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition"
                    placeholder="VD: Phường 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Quận/Huyện
                  </label>
                  <input
                    type="text"
                    value={diaChi.quanHuyen || ""}
                    onChange={(e) =>
                      handleDiaChiChange("quanHuyen", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition"
                    placeholder="VD: Quận 1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tỉnh/Thành phố
                  </label>
                  <input
                    type="text"
                    value={diaChi.tinhThanh || ""}
                    onChange={(e) =>
                      handleDiaChiChange("tinhThanh", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition"
                    placeholder="VD: TP. Hồ Chí Minh"
                  />
                </div>
              </div>
            </div>

            {/* Trạng thái & Ghi chú */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Trạng thái
                </label>
                <select
                  value={trangThai}
                  onChange={(e) => setTrangThai(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition"
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Đã tách hộ">Đã tách hộ</option>
                  <option value="Đã xóa">Đã xóa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition"
                  placeholder="Ghi chú (nếu có)"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition font-medium disabled:opacity-50"
            >
              {isLoading
                ? "Đang xử lý..."
                : isEditMode
                ? "Cập nhật"
                : "Tạo hộ khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
