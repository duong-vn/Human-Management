"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button } from "@/components/ui";
import { User, UserRole, CreateUserDto, UpdateUserDto } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDto | UpdateUserDto) => void;
  initialData?: User | null;
  isLoading: boolean;
}

interface FormDataState {
  hoTen: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  soDienThoai?: string;
  soDinhDanh: {
    loai: "CMND" | "CCCD";
    so: string;
    ngayCap: string;
    noiCap: string;
  };
}

const defaultData: FormDataState = {
  hoTen: "",
  username: "",
  email: "",
  password: "",
  role: UserRole.CAN_BO,
  soDienThoai: "",
  soDinhDanh: {
    loai: "CCCD",
    so: "",
    ngayCap: "",
    noiCap: "",
  },
};

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: Props) {
  const [formData, setFormData] = useState<FormDataState>(defaultData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...defaultData,
          ...initialData,
          password: "", // Don't show password
          soDinhDanh: {
            ...defaultData.soDinhDanh,
            ...(initialData.soDinhDanh || {}),
            ngayCap: initialData.soDinhDanh?.ngayCap
              ? initialData.soDinhDanh.ngayCap.split("T")[0]
              : "",
          },
        });
      } else {
        setFormData(defaultData);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent: "soDinhDanh", child: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [child]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.hoTen.trim()) newErrors.hoTen = "Vui lòng nhập họ tên";
    if (!formData.username.trim()) newErrors.username = "Vui lòng nhập tên đăng nhập";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!initialData && (!formData.password || !formData.password.trim())) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    }
    if (!formData.soDinhDanh.so.trim()) newErrors.soDinhDanh_so = "Vui lòng nhập số định danh";
    if (!formData.soDinhDanh.ngayCap) newErrors.soDinhDanh_ngayCap = "Vui lòng chọn ngày cấp";
    if (!formData.soDinhDanh.noiCap.trim()) newErrors.soDinhDanh_noiCap = "Vui lòng nhập nơi cấp";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data
    const submitData: Record<string, unknown> = {
      ...formData,
      soDinhDanh: {
        ...formData.soDinhDanh,
        ngayCap: formData.soDinhDanh.ngayCap,
      },
    };

    // Remove password if empty (for update)
    if (!formData.password || !formData.password.trim()) {
      delete submitData.password;
    }

    onSubmit(submitData as unknown as CreateUserDto | UpdateUserDto);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Cập Nhật Tài Khoản Cán Bộ" : "Cấp Tài Khoản Cán Bộ Mới"}
      description={
        initialData
          ? `Chỉnh sửa thông tin tài khoản và vai trò của cán bộ ${initialData.hoTen}`
          : "Tạo tài khoản và thiết lập quyền truy cập hệ thống cho cán bộ tổ dân phố"
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Họ tên & Chức vụ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="input-user-hoten">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-user-hoten"
              type="text"
              name="hoTen"
              value={formData.hoTen}
              onChange={handleChange}
              className="field"
              placeholder="VD: Nguyễn Văn A"
            />
            {errors.hoTen && <p className="text-xs text-rose-600 mt-1">{errors.hoTen}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="select-user-role">
              Chức vụ / Vai trò <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-user-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="field"
            >
              <option value={UserRole.CAN_BO}>Cán bộ</option>
              <option value={UserRole.KE_TOAN}>Kế toán</option>
              <option value={UserRole.TO_PHO}>Tổ phó</option>
              <option value={UserRole.TO_TRUONG}>Tổ trưởng</option>
            </select>
          </div>
        </div>

        {/* Username & Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="input-user-username">
              Tên đăng nhập <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-user-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="field font-mono"
              placeholder="VD: canbo01"
              disabled={!!initialData}
            />
            {errors.username && <p className="text-xs text-rose-600 mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="input-user-password">
              Mật khẩu {initialData ? <span className="text-slate-400 font-normal">(để trống nếu không đổi)</span> : <span className="text-rose-500">*</span>}
            </label>
            <input
              id="input-user-password"
              type="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              className="field"
              placeholder={initialData ? "••••••••" : "Nhập mật khẩu ban đầu"}
            />
            {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
          </div>
        </div>

        {/* Email & Điện thoại */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="input-user-email">
              Email công vụ <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-user-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="field"
              placeholder="canbo@todanpho.gov.vn"
            />
            {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="input-user-phone">
              Số điện thoại liên hệ
            </label>
            <input
              id="input-user-phone"
              type="tel"
              name="soDienThoai"
              value={formData.soDienThoai || ""}
              onChange={handleChange}
              className="field font-mono"
              placeholder="0912345678"
            />
          </div>
        </div>

        {/* Số định danh cá nhân */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
          <h3 className="section-heading">Căn cước công dân / Giấy tờ định danh <span className="text-rose-500">*</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="field-label text-[11px]" htmlFor="select-user-loaidinhdanh">Loại giấy tờ</label>
              <select
                id="select-user-loaidinhdanh"
                value={formData.soDinhDanh.loai}
                onChange={(e) => handleNestedChange("soDinhDanh", "loai", e.target.value)}
                className="field"
              >
                <option value="CCCD">Căn cước công dân (CCCD)</option>
                <option value="CMND">Chứng minh nhân dân (CMND)</option>
              </select>
            </div>
            <div>
              <label className="field-label text-[11px]" htmlFor="input-user-sodinhdanh">Số thẻ định danh</label>
              <input
                id="input-user-sodinhdanh"
                type="text"
                value={formData.soDinhDanh.so}
                onChange={(e) => handleNestedChange("soDinhDanh", "so", e.target.value)}
                className="field font-mono"
                placeholder="00109xxxxxxx"
              />
              {errors.soDinhDanh_so && <p className="text-xs text-rose-600 mt-1">{errors.soDinhDanh_so}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="field-label text-[11px]" htmlFor="input-user-ngaycap">Ngày cấp</label>
              <input
                id="input-user-ngaycap"
                type="date"
                value={formData.soDinhDanh.ngayCap}
                onChange={(e) => handleNestedChange("soDinhDanh", "ngayCap", e.target.value)}
                className="field"
              />
              {errors.soDinhDanh_ngayCap && <p className="text-xs text-rose-600 mt-1">{errors.soDinhDanh_ngayCap}</p>}
            </div>
            <div>
              <label className="field-label text-[11px]" htmlFor="input-user-noicap">Nơi cấp</label>
              <input
                id="input-user-noicap"
                type="text"
                value={formData.soDinhDanh.noiCap}
                onChange={(e) => handleNestedChange("soDinhDanh", "noiCap", e.target.value)}
                className="field"
                placeholder="VD: Cục CSQLHC về TTXH"
              />
              {errors.soDinhDanh_noiCap && <p className="text-xs text-rose-600 mt-1">{errors.soDinhDanh_noiCap}</p>}
            </div>
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
            disabled={isLoading}
            isLoading={isLoading}
          >
            {initialData ? "Lưu thay đổi" : "Cấp tài khoản"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
