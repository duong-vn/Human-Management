"use client";

import React, { useState, useEffect } from "react";
import { Users, Edit2, Check, XCircle } from "lucide-react";
import { Modal, Button } from "@/components/ui";
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

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingQuanHe, setEditingQuanHe] = useState("");

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const chuHoInfo = getChuHoInfo(initialData.chuHo);
        setChuHoId(chuHoInfo?.id || "");
        setChuHoTen(chuHoInfo?.hoTen || "");
        setDiaChi(initialData.diaChi || defaultDiaChi);
        setTrangThai(initialData.trangThai);
        setGhiChu(initialData.ghiChu || "");
      } else {
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

  const getNhanKhauId = (tv: ThanhVien): string => {
    return typeof tv.nhanKhauId === "object"
      ? tv.nhanKhauId._id
      : tv.nhanKhauId;
  };

  const startEditQuanHe = (tv: ThanhVien) => {
    const nkId = getNhanKhauId(tv);
    setEditingMemberId(nkId);
    setEditingQuanHe(tv.quanHeVoiChuHo);
  };

  const saveQuanHe = (nhanKhauId: string) => {
    if (onUpdateQuanHe && editingQuanHe) {
      onUpdateQuanHe(nhanKhauId, editingQuanHe);
    }
    setEditingMemberId(null);
    setEditingQuanHe("");
  };

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

    if (isEditMode) {
      const data: Partial<CreateHoKhauParams> = {
        diaChi,
        trangThai,
        ghiChu,
      };
      onSubmit(data as CreateHoKhauParams);
    } else {
      const data: CreateHoKhauParams = {
        chuHo: chuHoId,
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
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Cập Nhật Sổ Hộ Khẩu" : "Tạo Sổ Hộ Khẩu Mới"}
      description={
        isEditMode
          ? "Chỉnh sửa địa chỉ thường trú và thông tin chung của sổ hộ khẩu"
          : "Đăng ký sổ hộ khẩu mới, chọn chủ hộ và khai báo nơi thường trú"
      }
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Thông tin chủ hộ */}
        <div className="space-y-3">
          <h3 className="section-heading flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Thông tin chủ hộ
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="select-chu-ho">
                Chọn nhân khẩu làm chủ hộ <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-chu-ho"
                value={chuHoId}
                onChange={(e) => handleChuHoChange(e.target.value)}
                className="field"
                required
                disabled={isEditMode}
              >
                <option value="">-- Chọn nhân khẩu --</option>
                {nhanKhauList.map((nk) => (
                  <option key={nk._id} value={nk._id}>
                    {nk.hoTen} {nk.hoKhauId ? "(Đã có hộ khẩu)" : ""}
                  </option>
                ))}
              </select>
              {isEditMode && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Để đổi chủ hộ, vui lòng dùng chức năng &quot;Đổi chủ hộ&quot; tại màn hình chi tiết.
                </p>
              )}
            </div>

            <div>
              <label className="field-label" htmlFor="input-ten-chu-ho">
                Họ tên chủ hộ <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-ten-chu-ho"
                type="text"
                value={chuHoTen}
                onChange={(e) => setChuHoTen(e.target.value)}
                className="field"
                placeholder="Họ tên chủ hộ"
                required
              />
            </div>
          </div>
        </div>

        {/* Danh sách thành viên - Chỉ hiển thị khi edit mode */}
        {isEditMode && initialData?.thanhVien && initialData.thanhVien.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="section-heading flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Danh sách thành viên ({initialData.thanhVien.length} người)
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Quan hệ với chủ hộ</th>
                    <th className="text-center w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {initialData.thanhVien.map((tv) => {
                    const nkId = getNhanKhauId(tv);
                    const isEditing = editingMemberId === nkId;
                    const isChuHo = tv.quanHeVoiChuHo === "Chủ hộ";

                    return (
                      <tr key={nkId}>
                        <td>
                          <span className="font-semibold text-slate-900">{tv.hoTen}</span>
                          {isChuHo && (
                            <span className="ml-2 text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                              Chủ hộ
                            </span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              value={editingQuanHe}
                              onChange={(e) => setEditingQuanHe(e.target.value)}
                              className="field py-1 text-xs"
                              autoFocus
                              aria-label={`Chọn quan hệ cho ${tv.hoTen}`}
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
                            <span className="text-slate-700">{tv.quanHeVoiChuHo}</span>
                          )}
                        </td>
                        <td className="text-center">
                          {!isChuHo &&
                            (isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => saveQuanHe(nkId)}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                  title="Lưu"
                                  aria-label="Lưu quan hệ"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditQuanHe}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                  title="Hủy"
                                  aria-label="Hủy sửa quan hệ"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEditQuanHe(tv)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                                title="Sửa quan hệ"
                                aria-label={`Sửa quan hệ cho ${tv.hoTen}`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500">
              Bấm biểu tượng bút chì để chỉnh sửa quan hệ thành viên với chủ hộ.
            </p>
          </div>
        )}

        {/* Địa chỉ hộ khẩu */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h3 className="section-heading">Địa chỉ thường trú</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="input-so-nha">
                Số nhà
              </label>
              <input
                id="input-so-nha"
                type="text"
                value={diaChi.soNha || ""}
                onChange={(e) => handleDiaChiChange("soNha", e.target.value)}
                className="field"
                placeholder="VD: Số 12, Ngõ 4"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="input-duong">
                Đường / Phố / Xóm
              </label>
              <input
                id="input-duong"
                type="text"
                value={diaChi.duong || ""}
                onChange={(e) => handleDiaChiChange("duong", e.target.value)}
                className="field"
                placeholder="VD: Đường Quang Trung"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="input-phuong-xa">
                Phường / Xã
              </label>
              <input
                id="input-phuong-xa"
                type="text"
                value={diaChi.phuongXa || ""}
                onChange={(e) => handleDiaChiChange("phuongXa", e.target.value)}
                className="field"
                placeholder="VD: Phường La Khê"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="input-quan-huyen">
                Quận / Huyện
              </label>
              <input
                id="input-quan-huyen"
                type="text"
                value={diaChi.quanHuyen || ""}
                onChange={(e) => handleDiaChiChange("quanHuyen", e.target.value)}
                className="field"
                placeholder="VD: Quận Hà Đông"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="input-tinh-thanh">
                Tỉnh / Thành phố
              </label>
              <input
                id="input-tinh-thanh"
                type="text"
                value={diaChi.tinhThanh || ""}
                onChange={(e) => handleDiaChiChange("tinhThanh", e.target.value)}
                className="field"
                placeholder="VD: TP. Hà Nội"
              />
            </div>
          </div>
        </div>

        {/* Trạng thái & Ghi chú */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="field-label" htmlFor="select-trang-thai">
              Trạng thái
            </label>
            <select
              id="select-trang-thai"
              value={trangThai}
              onChange={(e) => setTrangThai(e.target.value)}
              className="field"
            >
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Đã tách hộ">Đã tách hộ</option>
              <option value="Đã xóa">Đã xóa</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="input-ghi-chu">
              Ghi chú
            </label>
            <input
              id="input-ghi-chu"
              type="text"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              className="field"
              placeholder="Ghi chú thêm nếu có"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
          >
            {isEditMode ? "Lưu thay đổi" : "Tạo hộ khẩu"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
