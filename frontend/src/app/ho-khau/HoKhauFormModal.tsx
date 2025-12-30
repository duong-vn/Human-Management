"use client";
import React, { useState, useEffect } from "react";
import { X, Users, Edit2, Check, XCircle } from "lucide-react";
import {
  DiaChi,
  CreateHoKhauParams,
  NhanKhauBasic,
  HoKhau,
  ThanhVien,
  getChuHoInfo,
} from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHoKhauParams) => void;
  onUpdateQuanHe?: (nhanKhauId: string, quanHeVoiChuHo: string) => void;
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

const quanHeOptions = [
  "Chủ hộ",
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

export default function HoKhauFormModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdateQuanHe,
  initialData,
  nhanKhauList,
  isLoading,
}: Props) {
  const [chuHoId, setChuHoId] = useState("");
  const [chuHoTen, setChuHoTen] = useState("");
  const [diaChi, setDiaChi] = useState<DiaChi>(defaultDiaChi);
  const [trangThai, setTrangThai] = useState("Đang hoạt động");
  const [ghiChu, setGhiChu] = useState("");

  // State cho việc edit quan hệ thành viên
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingQuanHe, setEditingQuanHe] = useState("");

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit mode - sử dụng helper function để lấy thông tin chủ hộ
        const chuHoInfo = getChuHoInfo(initialData.chuHo);
        setChuHoId(chuHoInfo?.id || "");
        setChuHoTen(chuHoInfo?.hoTen || "");
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
      setEditingMemberId(null);
      setEditingQuanHe("");
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

  // Lấy nhanKhauId từ thành viên
  const getNhanKhauId = (tv: ThanhVien): string => {
    return typeof tv.nhanKhauId === "object"
      ? tv.nhanKhauId._id
      : tv.nhanKhauId;
  };

  // Bắt đầu edit quan hệ
  const startEditQuanHe = (tv: ThanhVien) => {
    const nkId = getNhanKhauId(tv);
    setEditingMemberId(nkId);
    setEditingQuanHe(tv.quanHeVoiChuHo);
  };

  // Lưu quan hệ
  const saveQuanHe = (nhanKhauId: string) => {
    if (onUpdateQuanHe && editingQuanHe) {
      onUpdateQuanHe(nhanKhauId, editingQuanHe);
    }
    setEditingMemberId(null);
    setEditingQuanHe("");
  };

  // Hủy edit
  const cancelEditQuanHe = () => {
    setEditingMemberId(null);
    setEditingQuanHe("");
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
      thanhVien: [
        {
          nhanKhauId: chuHoId,
          hoTen: chuHoTen,
          quanHeVoiChuHo: "Chủ hộ",
        },
      ],

      diaChi,
      trangThai,
      ghiChu,
    };

    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
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
                      Để đổi chủ hộ, vui lòng dùng chức năng &quot;Đổi chủ
                      hộ&quot;
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

            {/* Danh sách thành viên - Chỉ hiển thị khi edit mode */}
            {isEditMode &&
              initialData?.thanhVien &&
              initialData.thanhVien.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} />
                    Danh sách thành viên ({initialData.thanhVien.length} người)
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                            Họ tên
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                            Quan hệ với chủ hộ
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase w-24">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {initialData.thanhVien.map((tv) => {
                          const nkId = getNhanKhauId(tv);
                          const isEditing = editingMemberId === nkId;
                          const isChuHo = tv.quanHeVoiChuHo === "Chủ hộ";

                          return (
                            <tr key={nkId} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <span className="font-medium text-gray-800">
                                  {tv.hoTen}
                                </span>
                                {isChuHo && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    Chủ hộ
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditing ? (
                                  <select
                                    value={editingQuanHe}
                                    onChange={(e) =>
                                      setEditingQuanHe(e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    autoFocus
                                  >
                                    {quanHeOptions
                                      .filter((qh) => qh !== "Chủ hộ")
                                      .map((qh) => (
                                        <option key={qh} value={qh}>
                                          {qh}
                                        </option>
                                      ))}
                                  </select>
                                ) : (
                                  <span className="text-gray-600">
                                    {tv.quanHeVoiChuHo}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {!isChuHo &&
                                  (isEditing ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => saveQuanHe(nkId)}
                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                                        title="Lưu"
                                      >
                                        <Check size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={cancelEditQuanHe}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Hủy"
                                      >
                                        <XCircle size={16} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => startEditQuanHe(tv)}
                                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                      title="Sửa quan hệ"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                  ))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Bấm vào biểu tượng bút chì để sửa quan hệ với chủ hộ.
                    Không thể sửa quan hệ của chủ hộ.
                  </p>
                </div>
              )}

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
