"use client";
import React, { useState, useEffect } from "react";
import { User, UserRole } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: User | null;
  isLoading: boolean;
}

const defaultData = {
  hoTen: "",
  username: "",
  email: "",
  password: "",
  role: UserRole.CAN_BO as UserRole,
  soDienThoai: "",
  soDinhDanh: {
    loai: "CCCD" as "CMND" | "CCCD",
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
  const [formData, setFormData] = useState<any>(defaultData);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          password: "", // Don't show password
          soDinhDanh: initialData.soDinhDanh || defaultData.soDinhDanh,
          soDinhDanh_ngayCap: initialData.soDinhDanh?.ngayCap
            ? initialData.soDinhDanh.ngayCap.split("T")[0]
            : "",
        });
      } else {
        setFormData(defaultData);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    if (!formData.hoTen.trim()) newErrors.hoTen = "Vui lòng nhập họ tên";
    if (!formData.username.trim()) newErrors.username = "Vui lòng nhập username";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!initialData && !formData.password.trim()) newErrors.password = "Vui lòng nhập mật khẩu";
    if (!formData.soDinhDanh.so.trim()) newErrors.soDinhDanh_so = "Vui lòng nhập số định danh";
    if (!formData.soDinhDanh.ngayCap) newErrors.soDinhDanh_ngayCap = "Vui lòng chọn ngày cấp";
    if (!formData.soDinhDanh.noiCap.trim()) newErrors.soDinhDanh_noiCap = "Vui lòng nhập nơi cấp";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data
    const submitData = {
      ...formData,
      soDinhDanh: {
        ...formData.soDinhDanh,
        ngayCap: formData.soDinhDanh.ngayCap,
      },
    };

    // Remove password if empty (for update)
    if (!submitData.password) {
      delete submitData.password;
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? "Cập nhật" : "Thêm mới"} User
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập username"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu {initialData ? "(để trống nếu không đổi)" : "*"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mật khẩu"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quyền
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={UserRole.CAN_BO}>Cán bộ</option>
              <option value={UserRole.KE_TOAN}>Kế toán</option>
              <option value={UserRole.TO_PHO}>Tổ phó</option>
              <option value={UserRole.TO_TRUONG}>Tổ trưởng</option>
            </select>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              name="soDienThoai"
              value={formData.soDienThoai}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập số điện thoại"
            />
          </div>

          {/* Số định danh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số định danh *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.soDinhDanh.loai}
                onChange={(e) => handleNestedChange('soDinhDanh', 'loai', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="CCCD">CCCD</option>
                <option value="CMND">CMND</option>
              </select>
              <input
                type="text"
                value={formData.soDinhDanh.so}
                onChange={(e) => handleNestedChange('soDinhDanh', 'so', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Số định danh"
              />
              <input
                type="date"
                value={formData.soDinhDanh.ngayCap}
                onChange={(e) => handleNestedChange('soDinhDanh', 'ngayCap', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={formData.soDinhDanh.noiCap}
                onChange={(e) => handleNestedChange('soDinhDanh', 'noiCap', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nơi cấp"
              />
            </div>
            {(errors.soDinhDanh_so || errors.soDinhDanh_ngayCap || errors.soDinhDanh_noiCap) && (
              <p className="text-red-500 text-sm mt-1">
                Vui lòng điền đầy đủ thông tin số định danh
              </p>
            )}
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
              {isLoading ? "Đang xử lý..." : initialData ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
