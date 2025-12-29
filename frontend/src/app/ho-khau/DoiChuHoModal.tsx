"use client";
import React, { useState, useEffect } from "react";
import { X, Users } from "lucide-react";
import { HoKhau, DoiChuHoParams } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DoiChuHoParams) => void;
  hoKhau: HoKhau | null;
  isLoading: boolean;
}

export default function DoiChuHoModal({
  isOpen,
  onClose,
  onSubmit,
  hoKhau,
  isLoading,
}: Props) {
  const [chuHoMoiId, setChuHoMoiId] = useState("");
  const [lyDo, setLyDo] = useState("");

  useEffect(() => {
    if (isOpen) {
      setChuHoMoiId("");
      setLyDo("");
    }
  }, [isOpen]);

  if (!isOpen || !hoKhau) return null;

  // Lấy ID và tên chủ hộ hiện tại
  const currentChuHoId = hoKhau.chuHo?._id || hoKhau.chuHoId || "";
  const currentChuHoTen = hoKhau.chuHo?.hoTen || "N/A";

  // Danh sách thành viên (không bao gồm chủ hộ hiện tại)
  const thanhVienList = (hoKhau.thanhVien || []).filter(
    (tv) => tv.nhanKhauId !== currentChuHoId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!chuHoMoiId) {
      alert("Vui lòng chọn chủ hộ mới!");
      return;
    }

    onSubmit({
      chuHoMoiId,
      lyDo: lyDo || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="text-purple-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Đổi chủ hộ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Chủ hộ hiện tại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chủ hộ hiện tại
            </label>
            <div className="p-3 bg-gray-100 rounded-xl">
              <p className="font-semibold text-gray-800">{currentChuHoTen}</p>
            </div>
          </div>

          {/* Chọn chủ hộ mới */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn chủ hộ mới <span className="text-red-500">*</span>
            </label>
            {thanhVienList.length > 0 ? (
              <select
                value={chuHoMoiId}
                onChange={(e) => setChuHoMoiId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                required
              >
                <option value="">-- Chọn thành viên --</option>
                {thanhVienList.map((tv, index) => (
                  <option key={tv.nhanKhauId || index} value={tv.nhanKhauId}>
                    {tv.hoTen} ({tv.quanHeVoiChuHo || "---"})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-yellow-50 text-yellow-700 rounded-xl text-sm">
                Không có thành viên khác trong hộ để đổi chủ hộ
              </div>
            )}
          </div>

          {/* Lý do */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do đổi chủ hộ
            </label>
            <textarea
              value={lyDo}
              onChange={(e) => setLyDo(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition resize-none"
              rows={3}
              placeholder="VD: Chủ hộ cũ đã chuyển đi, qua đời..."
            />
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
              disabled={isLoading || !chuHoMoiId || thanhVienList.length === 0}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : "Đổi chủ hộ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
