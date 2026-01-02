"use client";
import React, { useState, useEffect } from "react";
import { X, UserPlus, Search, CreditCard, Loader2 } from "lucide-react";
import { NhanKhauBasic, ThemThanhVienParams } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ThemThanhVienParams) => void;
  onSearchByCCCD?: (cccd: string) => Promise<NhanKhauBasic | null>;
  nhanKhauList: NhanKhauBasic[];
  currentThanhVienIds: string[]; // Danh sách ID thành viên hiện tại trong hộ
  isLoading: boolean;
}

const quanHeOptions = [
  "Vợ",
  "Chồng",
  "Con",
  "Cha",
  "Mẹ",
  "Anh",
  "Chị",
  "Em",
  "Ông",
  "Bà",
  "Cháu",
  "Cô",
  "Chú",
  "Dì",
  "Dượng",
  "Khác",
];

export default function ThemThanhVienModal({
  isOpen,
  onClose,
  onSubmit,
  onSearchByCCCD,
  nhanKhauList,
  currentThanhVienIds,
  isLoading,
}: Props) {
  const [selectedNhanKhau, setSelectedNhanKhau] =
    useState<NhanKhauBasic | null>(null);
  const [quanHeVoiChuHo, setQuanHeVoiChuHo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cccdSearch, setCccdSearch] = useState("");
  const [isSearchingCCCD, setIsSearchingCCCD] = useState(false);
  const [cccdSearchError, setCccdSearchError] = useState("");

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setSelectedNhanKhau(null);
      setQuanHeVoiChuHo("");
      setSearchTerm("");
      setCccdSearch("");
      setCccdSearchError("");
    }
  }, [isOpen]);

  // Lọc nhân khẩu: chưa có hộ khẩu và chưa trong hộ này
  const availableNhanKhau = nhanKhauList.filter((nk) => {
    // Không hiển thị những người đã trong hộ khẩu này
    if (currentThanhVienIds.includes(nk._id)) return false;
    // Chỉ hiển thị người chưa có hộ khẩu
    return !nk.hoKhauId;
  });

  // Lọc theo search
  const filteredNhanKhau = availableNhanKhau.filter((nk) =>
    nk.hoTen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tìm kiếm theo CCCD/CMND
  const handleSearchByCCCD = async () => {
    if (!cccdSearch.trim() || !onSearchByCCCD) return;

    setIsSearchingCCCD(true);
    setCccdSearchError("");

    try {
      const result = await onSearchByCCCD(cccdSearch.trim());
      if (result) {
        // Kiểm tra xem đã trong hộ khẩu này chưa
        if (currentThanhVienIds.includes(result._id)) {
          setCccdSearchError("Nhân khẩu này đã là thành viên của hộ khẩu!");
        } else {
          setSelectedNhanKhau(result);
          setCccdSearchError("");
        }
      } else {
        setCccdSearchError("Không tìm thấy nhân khẩu với số CMND/CCCD này");
      }
    } catch {
      setCccdSearchError("Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setIsSearchingCCCD(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNhanKhau || !quanHeVoiChuHo) {
      alert("Vui lòng chọn nhân khẩu và quan hệ với chủ hộ!");
      return;
    }

    onSubmit({
      nhanKhauId: selectedNhanKhau._id,
      hoTen: selectedNhanKhau.hoTen,
      quanHeVoiChuHo,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <UserPlus className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Thêm thành viên</h2>
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
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          {/* Tìm kiếm theo CCCD/CMND */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm nhanh bằng CMND/CCCD
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <CreditCard
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Nhập số CMND hoặc CCCD..."
                  value={cccdSearch}
                  onChange={(e) => setCccdSearch(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleSearchByCCCD())
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchByCCCD}
                disabled={isSearchingCCCD || !cccdSearch.trim()}
                className="px-4 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isSearchingCCCD ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}
                Tìm
              </button>
            </div>
            {cccdSearchError && (
              <p className="text-sm text-red-500 mt-2">{cccdSearchError}</p>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">
                hoặc chọn từ danh sách
              </span>
            </div>
          </div>

          {/* Tìm kiếm nhân khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn nhân khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Danh sách nhân khẩu - Hiển thị dạng grid */}
            <div className="border border-gray-200 rounded-xl max-h-64 overflow-y-auto">
              {filteredNhanKhau.length > 0 ? (
                <div className="grid grid-cols-2 gap-px bg-gray-200">
                  {filteredNhanKhau.map((nk) => (
                    <div
                      key={nk._id}
                      onClick={() => setSelectedNhanKhau(nk)}
                      className={`p-3 cursor-pointer bg-white transition hover:bg-gray-50 ${
                        selectedNhanKhau?._id === nk._id
                          ? "bg-blue-50 ring-2 ring-inset ring-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 truncate">
                            {nk.hoTen}
                          </p>
                          <p className="text-xs text-gray-500">
                            {nk.ngaySinh
                              ? new Date(nk.ngaySinh).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "---"}{" "}
                            • {nk.gioiTinh || "---"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Không tìm thấy nhân khẩu phù hợp
                </div>
              )}
            </div>

            {selectedNhanKhau && (
              <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  Đã chọn: <strong>{selectedNhanKhau.hoTen}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Quan hệ với chủ hộ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quan hệ với chủ hộ <span className="text-red-500">*</span>
            </label>
            <select
              value={quanHeVoiChuHo}
              onChange={(e) => setQuanHeVoiChuHo(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              required
            >
              <option value="">-- Chọn quan hệ --</option>
              {quanHeOptions.map((qh) => (
                <option key={qh} value={qh}>
                  {qh}
                </option>
              ))}
            </select>
          </div>

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
              disabled={isLoading || !selectedNhanKhau || !quanHeVoiChuHo}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {isLoading ? "Đang thêm..." : "Thêm thành viên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
