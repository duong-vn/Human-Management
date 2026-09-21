"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button } from "@/components/ui";
import { NhanKhau } from "@/app/nhan-khau/types";

export interface NhanKhauFormData {
  hoTen: string;
  biDanh: string;
  danToc: string;
  ngaySinh: string;
  gioiTinh: string;
  soDinhDanh: {
    loai: string;
    so: string;
    ngayCap?: string;
    noiCap?: string;
  };
  hoKhauId?: string | null;
  trangThai: "Thường trú" | "Tạm trú" | "Tạm vắng" | "Đã chuyển đi" | "Đã qua đời";
  quocTich: string;
  tonGiao: string;
  quanHeVoiChuHo: string;
  queQuan?: string;
  noiSinh?: string;
  ngheNghiep?: string;
  noiLamViec?: string;
  ghiChu?: string;
  diaChiThuongTru?: {
    soNha?: string;
    duong?: string;
    phuongXa?: string;
    quanHuyen?: string;
    tinhThanh?: string;
  };
  diaChiHienTai?: {
    soNha?: string;
    duong?: string;
    phuongXa?: string;
    quanHuyen?: string;
    tinhThanh?: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NhanKhauFormData) => void;
  initialData?: NhanKhau | null;
  isLoading: boolean;
}

const defaultData: NhanKhauFormData = {
  hoTen: "",
  biDanh: "",
  danToc: "Kinh",
  ngaySinh: "",
  gioiTinh: "Nam",
  soDinhDanh: { loai: "CCCD", so: "", ngayCap: "", noiCap: "" },
  hoKhauId: "",
  trangThai: "Thường trú",
  quocTich: "Việt Nam",
  tonGiao: "Không",
  quanHeVoiChuHo: "",
  queQuan: "",
  noiSinh: "",
  ngheNghiep: "",
  noiLamViec: "",
  ghiChu: "",
  diaChiThuongTru: { soNha: "", duong: "", phuongXa: "", quanHuyen: "", tinhThanh: "" },
  diaChiHienTai: { soNha: "", duong: "", phuongXa: "", quanHuyen: "", tinhThanh: "" },
};

export default function NhanKhauModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: Props) {
  const [formData, setFormData] = useState<NhanKhauFormData>(defaultData);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        let currentHoKhauId = "";
        if (initialData.hoKhauId) {
          if (typeof initialData.hoKhauId === "object" && initialData.hoKhauId !== null) {
            currentHoKhauId =
              (initialData.hoKhauId as { _id?: string; id?: string })._id ||
              (initialData.hoKhauId as { _id?: string; id?: string }).id ||
              "";
          } else {
            currentHoKhauId = String(initialData.hoKhauId);
          }
        }

        setFormData({
          ...defaultData,
          ...initialData,
          hoKhauId: currentHoKhauId,
          ngaySinh: initialData.ngaySinh ? initialData.ngaySinh.split("T")[0] : "",
          soDinhDanh: {
            ...defaultData.soDinhDanh,
            ...(initialData.soDinhDanh || {}),
            ngayCap: initialData.soDinhDanh?.ngayCap
              ? initialData.soDinhDanh.ngayCap.split("T")[0]
              : "",
          },
          diaChiThuongTru: initialData.diaChiThuongTru || defaultData.diaChiThuongTru,
          diaChiHienTai: initialData.diaChiHienTai || defaultData.diaChiHienTai,
        });
      } else {
        setFormData(defaultData);
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (
    parent: "soDinhDanh" | "diaChiThuongTru" | "diaChiHienTai",
    child: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [child]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalHoKhauId: string | null = formData.hoKhauId || null;
    if (!finalHoKhauId || finalHoKhauId.trim() === "") {
      finalHoKhauId = null;
    }

    const submitData: NhanKhauFormData = {
      ...formData,
      hoKhauId: finalHoKhauId,
      ngaySinh: formData.ngaySinh ? new Date(formData.ngaySinh).toISOString() : "",
      soDinhDanh: {
        ...formData.soDinhDanh,
        ngayCap: formData.soDinhDanh?.ngayCap
          ? new Date(formData.soDinhDanh.ngayCap).toISOString()
          : undefined,
      },
    };
    onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Cập Nhật Thông Tin Nhân Khẩu" : "Đăng Ký Nhân Khẩu Mới"}
      description={
        initialData
          ? "Chỉnh sửa thông tin hành chính, nhân thân và nơi cư trú của nhân khẩu"
          : "Khai báo lý lịch, thông tin định danh và hộ khẩu của cư dân mới"
      }
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mã hộ khẩu liên kết */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <label className="field-label" htmlFor="input-hokhau-id">
            Mã định danh Hộ Khẩu (ID) <span className="font-normal text-slate-500">(Không bắt buộc)</span>
          </label>
          <input
            id="input-hokhau-id"
            name="hoKhauId"
            value={formData.hoKhauId || ""}
            onChange={handleChange}
            className="field font-mono"
            placeholder="Nhập ID hộ khẩu hoặc để trống"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Để trống nếu nhân khẩu này chưa được ghép vào sổ hộ khẩu nào trong tổ dân phố.
          </p>
        </div>

        {/* Thông tin cơ bản */}
        <div>
          <h3 className="section-heading mb-2.5">Thông tin nhân thân</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="field-label" htmlFor="input-nk-hoten">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-nk-hoten"
                required
                name="hoTen"
                value={formData.hoTen || ""}
                onChange={handleChange}
                className="field"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="input-nk-ngaysinh">
                Ngày sinh
              </label>
              <input
                id="input-nk-ngaysinh"
                type="date"
                required
                name="ngaySinh"
                value={formData.ngaySinh || ""}
                onChange={handleChange}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="input-nk-cccd">
                Số CMND / CCCD
              </label>
              <input
                id="input-nk-cccd"
                value={formData.soDinhDanh?.so || ""}
                onChange={(e) => handleNestedChange("soDinhDanh", "so", e.target.value)}
                className="field font-mono"
                placeholder="00109xxxxxxx"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="field-label" htmlFor="input-nk-bidanh">
              Bí danh / Tên gọi khác
            </label>
            <input
              id="input-nk-bidanh"
              name="biDanh"
              value={formData.biDanh || ""}
              onChange={handleChange}
              className="field"
              placeholder="Nếu có"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="select-nk-gioitinh">
              Giới tính
            </label>
            <select
              id="select-nk-gioitinh"
              name="gioiTinh"
              value={formData.gioiTinh || "Nam"}
              onChange={handleChange}
              className="field"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="input-nk-dantoc">
              Dân tộc
            </label>
            <input
              id="input-nk-dantoc"
              name="danToc"
              value={formData.danToc || ""}
              onChange={handleChange}
              className="field"
              placeholder="VD: Kinh"
            />
          </div>
        </div>

        {/* Quê quán và Nơi sinh */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="input-nk-quequan">
              Quê quán
            </label>
            <input
              id="input-nk-quequan"
              name="queQuan"
              value={formData.queQuan || ""}
              onChange={handleChange}
              className="field"
              placeholder="Xã, Huyện, Tỉnh"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="input-nk-noisinh">
              Nơi sinh
            </label>
            <input
              id="input-nk-noisinh"
              name="noiSinh"
              value={formData.noiSinh || ""}
              onChange={handleChange}
              className="field"
              placeholder="Thành phố, Tỉnh"
            />
          </div>
        </div>

        {/* Chi tiết giấy tờ tùy thân */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="section-heading mb-2.5">Giấy tờ tùy thân</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="field-label" htmlFor="select-nk-loaidinhdanh">
                Loại giấy tờ
              </label>
              <select
                id="select-nk-loaidinhdanh"
                value={formData.soDinhDanh?.loai || "CCCD"}
                onChange={(e) => handleNestedChange("soDinhDanh", "loai", e.target.value)}
                className="field"
              >
                <option value="CCCD">CCCD</option>
                <option value="CMND">CMND</option>
                <option value="Hộ chiếu">Hộ chiếu</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="input-nk-ngaycap">
                Ngày cấp
              </label>
              <input
                id="input-nk-ngaycap"
                type="date"
                value={formData.soDinhDanh?.ngayCap || ""}
                onChange={(e) => handleNestedChange("soDinhDanh", "ngayCap", e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="input-nk-noicap">
                Nơi cấp
              </label>
              <input
                id="input-nk-noicap"
                value={formData.soDinhDanh?.noiCap || ""}
                onChange={(e) => handleNestedChange("soDinhDanh", "noiCap", e.target.value)}
                className="field"
                placeholder="VD: Cục CSQLHC về TTXH"
              />
            </div>
          </div>
        </div>

        {/* Thông tin bổ sung */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="field-label" htmlFor="input-nk-quoctich">
              Quốc tịch
            </label>
            <input
              id="input-nk-quoctich"
              name="quocTich"
              value={formData.quocTich || ""}
              onChange={handleChange}
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="input-nk-tongiao">
              Tôn giáo
            </label>
            <input
              id="input-nk-tongiao"
              name="tonGiao"
              value={formData.tonGiao || ""}
              onChange={handleChange}
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="input-nk-quanhe">
              Quan hệ với chủ hộ
            </label>
            <input
              id="input-nk-quanhe"
              name="quanHeVoiChuHo"
              value={formData.quanHeVoiChuHo || ""}
              onChange={handleChange}
              className="field"
              placeholder="VD: Con, Vợ, Chồng, Chủ hộ..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="input-nk-nghenghiep">
              Nghề nghiệp
            </label>
            <input
              id="input-nk-nghenghiep"
              name="ngheNghiep"
              value={formData.ngheNghiep || ""}
              onChange={handleChange}
              className="field"
              placeholder="VD: Kỹ sư phần mềm"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="input-nk-noilamviec">
              Nơi làm việc
            </label>
            <input
              id="input-nk-noilamviec"
              name="noiLamViec"
              value={formData.noiLamViec || ""}
              onChange={handleChange}
              className="field"
              placeholder="VD: Công ty TNHH ABC"
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="input-nk-ghichu">
            Ghi chú
          </label>
          <input
            id="input-nk-ghichu"
            name="ghiChu"
            value={formData.ghiChu || ""}
            onChange={handleChange}
            className="field"
            placeholder="Ghi chú thêm nếu có"
          />
        </div>

        {/* Địa chỉ thường trú và Hiện tại */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-2">
            <h3 className="section-heading">Địa chỉ thường trú</h3>
            <input
              placeholder="Số nhà"
              value={formData.diaChiThuongTru?.soNha || ""}
              onChange={(e) => handleNestedChange("diaChiThuongTru", "soNha", e.target.value)}
              className="field"
              aria-label="Thường trú: Số nhà"
            />
            <input
              placeholder="Đường / Phố"
              value={formData.diaChiThuongTru?.duong || ""}
              onChange={(e) => handleNestedChange("diaChiThuongTru", "duong", e.target.value)}
              className="field"
              aria-label="Thường trú: Đường"
            />
            <input
              placeholder="Phường / Xã"
              value={formData.diaChiThuongTru?.phuongXa || ""}
              onChange={(e) => handleNestedChange("diaChiThuongTru", "phuongXa", e.target.value)}
              className="field"
              aria-label="Thường trú: Phường Xã"
            />
            <input
              placeholder="Quận / Huyện"
              value={formData.diaChiThuongTru?.quanHuyen || ""}
              onChange={(e) => handleNestedChange("diaChiThuongTru", "quanHuyen", e.target.value)}
              className="field"
              aria-label="Thường trú: Quận Huyện"
            />
            <input
              placeholder="Tỉnh / Thành phố"
              value={formData.diaChiThuongTru?.tinhThanh || ""}
              onChange={(e) => handleNestedChange("diaChiThuongTru", "tinhThanh", e.target.value)}
              className="field"
              aria-label="Thường trú: Tỉnh Thành"
            />
          </div>

          <div className="space-y-2">
            <h3 className="section-heading">Địa chỉ hiện tại</h3>
            <input
              placeholder="Số nhà"
              value={formData.diaChiHienTai?.soNha || ""}
              onChange={(e) => handleNestedChange("diaChiHienTai", "soNha", e.target.value)}
              className="field"
              aria-label="Hiện tại: Số nhà"
            />
            <input
              placeholder="Đường / Phố"
              value={formData.diaChiHienTai?.duong || ""}
              onChange={(e) => handleNestedChange("diaChiHienTai", "duong", e.target.value)}
              className="field"
              aria-label="Hiện tại: Đường"
            />
            <input
              placeholder="Phường / Xã"
              value={formData.diaChiHienTai?.phuongXa || ""}
              onChange={(e) => handleNestedChange("diaChiHienTai", "phuongXa", e.target.value)}
              className="field"
              aria-label="Hiện tại: Phường Xã"
            />
            <input
              placeholder="Quận / Huyện"
              value={formData.diaChiHienTai?.quanHuyen || ""}
              onChange={(e) => handleNestedChange("diaChiHienTai", "quanHuyen", e.target.value)}
              className="field"
              aria-label="Hiện tại: Quận Huyện"
            />
            <input
              placeholder="Tỉnh / Thành phố"
              value={formData.diaChiHienTai?.tinhThanh || ""}
              onChange={(e) => handleNestedChange("diaChiHienTai", "tinhThanh", e.target.value)}
              className="field"
              aria-label="Hiện tại: Tỉnh Thành"
            />
          </div>
        </div>

        {/* Modal footer */}
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
            {initialData ? "Lưu thay đổi" : "Đăng ký nhân khẩu"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
