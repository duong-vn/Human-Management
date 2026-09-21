"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button } from "@/components/ui";
import { TamTruTamVang, DiaChi, NhanKhauItem } from "./types";
import { getAllNhanKhau } from "./api";

export interface TamTruTamVangFormData {
  nhanKhauId?: string;
  hoTen: string;
  soDinhDanh: string;
  loai: "Tạm trú" | "Tạm vắng";
  tuNgay: string;
  denNgay: string;
  diaChiTamTru: DiaChi;
  diaChiThuongTru: DiaChi;
  lyDo: string;
  noiDen: string;
  ghiChu: string;
  trangThai?: "Đang hiệu lực" | "Hết hạn" | "Đã hủy";
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TamTruTamVangFormData) => void;
  initialData?: TamTruTamVang | null;
  isLoading: boolean;
}

const defaultData: TamTruTamVangFormData = {
  nhanKhauId: undefined,
  hoTen: "",
  soDinhDanh: "",
  loai: "Tạm trú",
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
  const [formData, setFormData] = useState<TamTruTamVangFormData>(defaultData);
  const [nhanKhauList, setNhanKhauList] = useState<NhanKhauItem[]>([]);
  const [isNewPerson, setIsNewPerson] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getAllNhanKhau()
        .then((data) => setNhanKhauList(Array.isArray(data) ? data : []))
        .catch((err: unknown) => console.error("Lỗi lấy danh sách nhân khẩu:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nhanKhauId: initialData.nhanKhauId,
          hoTen: initialData.hoTen || "",
          soDinhDanh: initialData.soDinhDanh || "",
          loai: initialData.loai || "Tạm trú",
          tuNgay: initialData.tuNgay ? initialData.tuNgay.split("T")[0] : "",
          denNgay: initialData.denNgay ? initialData.denNgay.split("T")[0] : "",
          diaChiTamTru: initialData.diaChiTamTru || defaultData.diaChiTamTru,
          diaChiThuongTru: initialData.diaChiThuongTru || defaultData.diaChiThuongTru,
          lyDo: initialData.lyDo || "",
          noiDen: initialData.noiDen || "",
          ghiChu: initialData.ghiChu || "",
          trangThai: initialData.trangThai,
        });
        setIsNewPerson(!initialData.nhanKhauId);
      } else {
        setFormData(defaultData);
        setIsNewPerson(false);
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectNhanKhau = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData((prev) => ({
        ...prev,
        nhanKhauId: undefined,
        hoTen: "",
        soDinhDanh: "",
      }));
      return;
    }

    const selectedPerson = nhanKhauList.find(
      (nk) => (nk._id || nk.id) === selectedId
    );
    if (selectedPerson) {
      const cccd = typeof selectedPerson.soDinhDanh === "object"
        ? selectedPerson.soDinhDanh?.so || ""
        : selectedPerson.soDinhDanh || "";

      setFormData((prev) => ({
        ...prev,
        nhanKhauId: selectedPerson._id || selectedPerson.id,
        hoTen: selectedPerson.hoTen || "",
        soDinhDanh: cccd,
        diaChiThuongTru: selectedPerson.diaChiThuongTru || prev.diaChiThuongTru,
      }));
    }
  };

  const handleDiaChiChange = (
    type: "diaChiTamTru" | "diaChiThuongTru",
    field: keyof DiaChi,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const title = initialData
    ? "Chỉnh sửa hồ sơ Tạm trú / Tạm vắng"
    : "Đăng ký Tạm trú / Tạm vắng";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Điền thông tin chi tiết để cập nhật vào hệ thống quản lý cư trú"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hình thức */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="select-loai-hinh-thuc">
              Hình thức đăng ký <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-loai-hinh-thuc"
              name="loai"
              value={formData.loai}
              onChange={handleChange}
              className="field"
              disabled={!!initialData}
              required
            >
              <option value="Tạm trú">Tạm trú (Đến sinh sống tạm thời)</option>
              <option value="Tạm vắng">Tạm vắng (Tạm rời khỏi địa bàn)</option>
            </select>
          </div>

          {initialData && (
            <div>
              <label className="field-label" htmlFor="select-trang-thai">
                Trạng thái hồ sơ
              </label>
              <select
                id="select-trang-thai"
                name="trangThai"
                value={formData.trangThai}
                onChange={handleChange}
                className="field"
              >
                <option value="Đang hiệu lực">Đang hiệu lực</option>
                <option value="Hết hạn">Hết hạn</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>
          )}
        </div>

        {/* Thông tin công dân */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="section-heading">Thông tin người khai báo</h3>
            {!initialData && (
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isNewPerson}
                  onChange={(e) => {
                    setIsNewPerson(e.target.checked);
                    if (e.target.checked) {
                      setFormData((prev) => ({
                        ...prev,
                        nhanKhauId: undefined,
                        hoTen: "",
                        soDinhDanh: "",
                      }));
                    }
                  }}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Người ngoài địa bàn (chưa có hồ sơ nhân khẩu)
              </label>
            )}
          </div>

          {!isNewPerson && !initialData ? (
            <div className="mb-3">
              <label className="field-label" htmlFor="select-nhan-khau">
                Chọn công dân trong tổ dân phố <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-nhan-khau"
                value={formData.nhanKhauId || ""}
                onChange={handleSelectNhanKhau}
                className="field"
                required
              >
                <option value="">-- Chọn công dân --</option>
                {nhanKhauList.map((nk) => {
                  const id = nk._id || nk.id || "";
                  const cccd = typeof nk.soDinhDanh === "object" ? nk.soDinhDanh?.so : nk.soDinhDanh;
                  return (
                    <option key={id} value={id}>
                      {nk.hoTen} {cccd ? `(CCCD: ${cccd})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="input-ho-ten">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-ho-ten"
                type="text"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                disabled={!isNewPerson && !initialData}
                placeholder="VD: Nguyễn Văn A"
                className="field"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="input-so-dinh-danh">
                Số CCCD / Định danh cá nhân
              </label>
              <input
                id="input-so-dinh-danh"
                type="text"
                name="soDinhDanh"
                value={formData.soDinhDanh}
                onChange={handleChange}
                disabled={!isNewPerson && !initialData}
                placeholder="VD: 00109xxxxxxx"
                className="field font-mono"
              />
            </div>
          </div>
        </div>

        {/* Thời gian */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="section-heading mb-2">Thời hạn tạm trú / tạm vắng</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="input-tu-ngay">
                Từ ngày <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-tu-ngay"
                type="date"
                name="tuNgay"
                value={formData.tuNgay}
                onChange={handleChange}
                className="field"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="input-den-ngay">
                Đến ngày <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-den-ngay"
                type="date"
                name="denNgay"
                value={formData.denNgay}
                onChange={handleChange}
                className="field"
                required
              />
            </div>
          </div>
        </div>

        {/* Địa chỉ & Lý do */}
        <div className="pt-2 border-t border-slate-100">
          {formData.loai === "Tạm trú" ? (
            <div className="space-y-3">
              <h3 className="section-heading">Địa chỉ nơi tạm trú</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Số nhà"
                  value={formData.diaChiTamTru?.soNha || ""}
                  onChange={(e) => handleDiaChiChange("diaChiTamTru", "soNha", e.target.value)}
                  className="field"
                  aria-label="Tạm trú: Số nhà"
                />
                <input
                  type="text"
                  placeholder="Đường / Phố"
                  value={formData.diaChiTamTru?.duong || ""}
                  onChange={(e) => handleDiaChiChange("diaChiTamTru", "duong", e.target.value)}
                  className="field"
                  aria-label="Tạm trú: Đường"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Phường / Xã"
                  value={formData.diaChiTamTru?.phuongXa || ""}
                  onChange={(e) => handleDiaChiChange("diaChiTamTru", "phuongXa", e.target.value)}
                  className="field"
                  aria-label="Tạm trú: Phường Xã"
                />
                <input
                  type="text"
                  placeholder="Quận / Huyện"
                  value={formData.diaChiTamTru?.quanHuyen || ""}
                  onChange={(e) => handleDiaChiChange("diaChiTamTru", "quanHuyen", e.target.value)}
                  className="field"
                  aria-label="Tạm trú: Quận Huyện"
                />
                <input
                  type="text"
                  placeholder="Tỉnh / Thành phố"
                  value={formData.diaChiTamTru?.tinhThanh || ""}
                  onChange={(e) => handleDiaChiChange("diaChiTamTru", "tinhThanh", e.target.value)}
                  className="field"
                  aria-label="Tạm trú: Tỉnh Thành"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="field-label" htmlFor="input-noi-den">
                  Nơi đến tạm trú <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-noi-den"
                  type="text"
                  name="noiDen"
                  value={formData.noiDen}
                  onChange={handleChange}
                  placeholder="VD: Số 123 Đường ABC, Quận 1, TP. Hồ Chí Minh"
                  className="field"
                  required
                />
              </div>
            </div>
          )}

          <div className="mt-3">
            <label className="field-label" htmlFor="input-ly-do">
              Lý do tạm trú / tạm vắng
            </label>
            <textarea
              id="input-ly-do"
              name="lyDo"
              rows={2}
              value={formData.lyDo}
              onChange={handleChange}
              placeholder="VD: Đi học, đi làm việc theo hợp đồng, thăm thân..."
              className="field min-h-[4rem] resize-none"
            />
          </div>

          <div className="mt-3">
            <label className="field-label" htmlFor="input-ghi-chu">
              Ghi chú thêm
            </label>
            <input
              id="input-ghi-chu"
              type="text"
              name="ghiChu"
              value={formData.ghiChu}
              onChange={handleChange}
              placeholder="Ghi chú hồ sơ (nếu có)"
              className="field"
            />
          </div>
        </div>

        {/* Action Buttons */}
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
            {initialData ? "Lưu thay đổi" : "Đăng ký hồ sơ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
