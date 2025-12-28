"use client";
import React, { useState, useEffect } from "react";
import { X, Home, MapPin, Users, CheckSquare } from "lucide-react";
import {
  HoKhau,
  TachHoParams,
  DiaChi,
  ThanhVien,
  NhanKhauBasic,
} from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TachHoParams) => void;
  hoKhau: HoKhau | null;
  isLoading: boolean;
}

const defaultDiaChi: DiaChi = {
  soNha: "",
  duong: "",
  phuongXa: "",
  quanHuyen: "",
  tinhThanh: "",
};

export default function TachHoModal({
  isOpen,
  onClose,
  onSubmit,
  hoKhau,
  isLoading,
}: Props) {
  const [selectedNhanKhauIds, setSelectedNhanKhauIds] = useState<string[]>([]);
  const [chuHoMoiId, setChuHoMoiId] = useState("");
  const [chuHoMoiTen, setChuHoMoiTen] = useState("");
  const [diaChi, setDiaChi] = useState<DiaChi>(defaultDiaChi);

  useEffect(() => {
    if (isOpen) {
      setSelectedNhanKhauIds([]);
      setChuHoMoiId("");
      setChuHoMoiTen("");
      setDiaChi(defaultDiaChi);
    }
  }, [isOpen]);

  if (!isOpen || !hoKhau) return null;

  const hoKhauId = hoKhau._id || hoKhau.id || "";

  // Toggle chọn nhân khẩu
  const toggleSelectNhanKhau = (nkId: string, hoTen: string) => {
    setSelectedNhanKhauIds((prev) => {
      if (prev.includes(nkId)) {
        // Bỏ chọn
        if (chuHoMoiId === nkId) {
          setChuHoMoiId("");
          setChuHoMoiTen("");
        }
        return prev.filter((id) => id !== nkId);
      } else {
        return [...prev, nkId];
      }
    });
  };

  // Chọn chủ hộ mới (phải nằm trong danh sách đã chọn)
  const handleSelectChuHoMoi = (nkId: string, hoTen: string) => {
    setChuHoMoiId(nkId);
    setChuHoMoiTen(hoTen);
  };

  const handleDiaChiChange = (field: keyof DiaChi, value: string) => {
    setDiaChi((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedNhanKhauIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 nhân khẩu để tách hộ!");
      return;
    }

    if (!chuHoMoiId || !chuHoMoiTen) {
      alert("Vui lòng chọn chủ hộ mới cho hộ khẩu tách ra!");
      return;
    }

    const data: TachHoParams = {
      hoKhauGocId: hoKhauId,
      chuHoMoi: {
        nhanKhauId: chuHoMoiId,
        hoTen: chuHoMoiTen,
      },
      diaChi,
      danhSachNhanKhauId: selectedNhanKhauIds.filter((id) => id !== chuHoMoiId), // Loại chủ hộ mới ra khỏi danh sách thành viên
    };

    onSubmit(data);
  };

  // Lấy danh sách thành viên có thể tách
  const thanhVienList = hoKhau.thanhVien || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Home className="text-orange-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Tách hộ</h2>
              <p className="text-sm text-gray-500">
                Tách từ hộ khẩu #{hoKhauId.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
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
          className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6"
        >
          {/* Bước 1: Chọn nhân khẩu */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CheckSquare size={16} />
              Bước 1: Chọn nhân khẩu chuyển sang hộ mới
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Chọn những người sẽ được tách ra khỏi hộ khẩu hiện tại
            </p>

            {thanhVienList.length > 0 ? (
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                {thanhVienList.map((tv, index) => {
                  const nkId =
                    typeof tv.nhanKhauId === "object"
                      ? tv.nhanKhauId._id
                      : tv.nhanKhauId;
                  const nkHoTen =
                    typeof tv.nhanKhauId === "object" && tv.nhanKhauId.hoTen
                      ? tv.nhanKhauId.hoTen
                      : tv.hoTen;

                  const isSelected = selectedNhanKhauIds.includes(nkId);

                  return (
                    <div
                      key={nkId || index}
                      className={`p-3 flex items-center justify-between cursor-pointer transition ${
                        isSelected ? "bg-orange-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => toggleSelectNhanKhau(nkId, nkHoTen)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{nkHoTen}</p>
                          <p className="text-xs text-gray-500">
                            {tv.quanHeVoiChuHo || "---"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                Không có thành viên để tách
              </div>
            )}

            {selectedNhanKhauIds.length > 0 && (
              <p className="mt-2 text-sm text-orange-600">
                Đã chọn {selectedNhanKhauIds.length} người
              </p>
            )}
          </div>

          {/* Bước 2: Chọn chủ hộ mới */}
          {selectedNhanKhauIds.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users size={16} />
                Bước 2: Chọn chủ hộ mới
              </h3>
              <select
                value={chuHoMoiId}
                onChange={(e) => {
                  const selected = thanhVienList.find((tv) => {
                    const id =
                      typeof tv.nhanKhauId === "object"
                        ? tv.nhanKhauId._id
                        : tv.nhanKhauId;
                    return id === e.target.value;
                  });
                  if (selected) {
                    const hoTen =
                      typeof selected.nhanKhauId === "object" &&
                      selected.nhanKhauId.hoTen
                        ? selected.nhanKhauId.hoTen
                        : selected.hoTen;
                    handleSelectChuHoMoi(e.target.value, hoTen);
                  }
                }}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                required
              >
                <option value="">-- Chọn chủ hộ mới --</option>
                {thanhVienList
                  .filter((tv) => {
                    const id =
                      typeof tv.nhanKhauId === "object"
                        ? tv.nhanKhauId._id
                        : tv.nhanKhauId;
                    return selectedNhanKhauIds.includes(id);
                  })
                  .map((tv) => {
                    const id =
                      typeof tv.nhanKhauId === "object"
                        ? tv.nhanKhauId._id
                        : tv.nhanKhauId;
                    const hoTen =
                      typeof tv.nhanKhauId === "object" && tv.nhanKhauId.hoTen
                        ? tv.nhanKhauId.hoTen
                        : tv.hoTen;
                    return (
                      <option key={id} value={id}>
                        {hoTen}
                      </option>
                    );
                  })}
              </select>
            </div>
          )}

          {/* Bước 3: Địa chỉ hộ khẩu mới */}
          {chuHoMoiId && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin size={16} />
                Bước 3: Địa chỉ hộ khẩu mới
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Số nhà
                  </label>
                  <input
                    type="text"
                    value={diaChi.soNha || ""}
                    onChange={(e) =>
                      handleDiaChiChange("soNha", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    placeholder="VD: 12A"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Đường
                  </label>
                  <input
                    type="text"
                    value={diaChi.duong || ""}
                    onChange={(e) =>
                      handleDiaChiChange("duong", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    placeholder="VD: Nguyễn Trãi"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Phường/Xã
                  </label>
                  <input
                    type="text"
                    value={diaChi.phuongXa || ""}
                    onChange={(e) =>
                      handleDiaChiChange("phuongXa", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    placeholder="VD: Phường 1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Quận/Huyện
                  </label>
                  <input
                    type="text"
                    value={diaChi.quanHuyen || ""}
                    onChange={(e) =>
                      handleDiaChiChange("quanHuyen", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    placeholder="VD: Quận 1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">
                    Tỉnh/Thành phố
                  </label>
                  <input
                    type="text"
                    value={diaChi.tinhThanh || ""}
                    onChange={(e) =>
                      handleDiaChiChange("tinhThanh", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    placeholder="VD: TP. Hồ Chí Minh"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={
                isLoading || selectedNhanKhauIds.length === 0 || !chuHoMoiId
              }
              className="px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : "Tách hộ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
