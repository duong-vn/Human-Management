// src/components/NhanKhauModal.tsx
"use client";
import React, { useState, useEffect } from "react";
import { NhanKhau } from "@/app/nhan-khau/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: NhanKhau | null; // Dữ liệu để sửa (nếu có)
  isLoading: boolean;
}

// Giá trị mặc định (Rỗng)
const defaultData = {
  hoTen: "",
  biDanh: "",
  danToc: "Kinh",
  ngaySinh: "",
  gioiTinh: "Nam",
  soDinhDanh: { loai: "CCCD", so: "", ngayCap: "", noiCap: "" },
  hoKhauId: "691d9631baac1efb7579cf0c",
  trangThai: "Thường trú",
  quocTich: "Việt Nam",
  tonGiao: "Không",
  quanHeVoiChuHo: "",
  queQuan: "",
  noiSinh: "",
  ngheNghiep: "",
  noiLamViec: "",
  diaChiThuongTru: {
    soNha: "",
    duong: "",
    phuongXa: "",
    quanHuyen: "",
    tinhThanh: "",
  },
  diaChiHienTai: {
    soNha: "",
    duong: "",
    phuongXa: "",
    quanHuyen: "",
    tinhThanh: "",
  },
};

export default function NhanKhauModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: Props) {
  const [formData, setFormData] = useState<any>(defaultData);
  const [errors, setErrors] = useState<any>({});

  // MỖI KHI MỞ MODAL: Kiểm tra xem là Thêm hay Sửa
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Chế độ Sửa: Đổ dữ liệu cũ vào form
        // Lưu ý: Cần cắt chuỗi ngày tháng (YYYY-MM-DDTHH:mm...) thành (YYYY-MM-DD) để input date hiểu
        setFormData({
          ...initialData,
          ngaySinh: initialData.ngaySinh
            ? initialData.ngaySinh.split("T")[0]
            : "",
          soDinhDanh: {
            ...initialData.soDinhDanh,
            ngayCap: initialData.soDinhDanh?.ngayCap
              ? initialData.soDinhDanh.ngayCap.split("T")[0]
              : "",
          },
        });
      } else {
        // Chế độ Thêm: Reset về rỗng
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
    let cleanHoKhauId = formData.hoKhauId;

    // Nếu hoKhauId đang là một Object (như trong ảnh bạn gửi), ta chọc vào lấy _id ra
    if (cleanHoKhauId && typeof cleanHoKhauId === "object") {
      cleanHoKhauId = cleanHoKhauId._id || cleanHoKhauId.id;
    }

    // Nếu rỗng thì gửi null để backend không báo lỗi
    if (!cleanHoKhauId) {
      cleanHoKhauId = null;
    }

    // Format lại ngày giờ chuẩn ISO trước khi gửi
    const submitData = {
      ...formData,
      hoKhauId: cleanHoKhauId,
      ngaySinh: formData.ngaySinh
        ? new Date(formData.ngaySinh).toISOString()
        : null,
      soDinhDanh: {
        ...formData.soDinhDanh,
        ngayCap: formData.soDinhDanh.ngayCap
          ? new Date(formData.soDinhDanh.ngayCap).toISOString()
          : null,
      },
    };
    console.log("Submitting data:", submitData);
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-10">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? "Cập Nhật Nhân Khẩu" : "Thêm Nhân Khẩu Mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* VÍ DỤ 1 SỐ TRƯỜNG CƠ BẢN (Bạn giữ nguyên form đầy đủ như cũ nhé) */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Họ Tên</label>
              <input
                required
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Ngày Sinh</label>
              <input
                type="date"
                name="ngaySinh"
                value={formData.ngaySinh}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Số CCCD</label>
              <input
                value={formData.soDinhDanh?.so || ""}
                onChange={(e) =>
                  handleNestedChange("soDinhDanh", "so", e.target.value)
                }
                className="border p-2 w-full rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4"></div>
          {/* Additional fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Bí Danh</label>
              <input
                name="biDanh"
                value={formData.biDanh}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Giới Tính</label>
              <select
                name="gioiTinh"
                value={formData.gioiTinh}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              >
                <option>Nam</option>
                <option>Nữ</option>
                <option>Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Dân Tộc</label>
              <input
                name="danToc"
                value={formData.danToc}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Loại giấy tờ</label>
              <select
                value={formData.soDinhDanh?.loai || "CCCD"}
                onChange={(e) =>
                  handleNestedChange("soDinhDanh", "loai", e.target.value)
                }
                className="border p-2 w-full rounded"
              >
                <option>CCCD</option>
                <option>CMND</option>
                <option>Hộ chiếu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Ngày cấp</label>
              <input
                type="date"
                value={formData.soDinhDanh?.ngayCap || ""}
                onChange={(e) =>
                  handleNestedChange("soDinhDanh", "ngayCap", e.target.value)
                }
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Nơi cấp</label>
              <input
                value={formData.soDinhDanh?.noiCap || ""}
                onChange={(e) =>
                  handleNestedChange("soDinhDanh", "noiCap", e.target.value)
                }
                className="border p-2 w-full rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Quốc tịch</label>
              <input
                name="quocTich"
                value={formData.quocTich}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tôn Giáo</label>
              <input
                name="tonGiao"
                value={formData.tonGiao}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Quan hệ với chủ hộ
              </label>
              <input
                name="quanHeVoiChuHo"
                value={formData.quanHeVoiChuHo}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Quê Quán</label>
              <input
                name="queQuan"
                value={formData.queQuan}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Nơi sinh</label>
              <input
                name="noiSinh"
                value={formData.noiSinh}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Nghề nghiệp</label>
              <input
                name="ngheNghiep"
                value={formData.ngheNghiep}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Địa chỉ thường trú</h3>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <input
                  placeholder="Số nhà"
                  value={formData.diaChiThuongTru?.soNha || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "diaChiThuongTru",
                      "soNha",
                      e.target.value
                    )
                  }
                  className="border p-2 w-full rounded"
                />
                <input
                  placeholder="Đường"
                  value={formData.diaChiThuongTru?.duong || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "diaChiThuongTru",
                      "duong",
                      e.target.value
                    )
                  }
                  className="border p-2 w-full rounded"
                />
                <input
                  placeholder="Phường/Xã"
                  value={formData.diaChiThuongTru?.phuongXa || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "diaChiThuongTru",
                      "phuongXa",
                      e.target.value
                    )
                  }
                  className="border p-2 w-full rounded"
                />
                <input
                  placeholder="Quận/Huyện"
                  value={formData.diaChiThuongTru?.quanHuyen || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "diaChiThuongTru",
                      "quanHuyen",
                      e.target.value
                    )
                  }
                  className="border p-2 w-full rounded"
                />
                <input
                  placeholder="Tỉnh/Thành"
                  value={formData.diaChiThuongTru?.tinhThanh || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "diaChiThuongTru",
                      "tinhThanh",
                      e.target.value
                    )
                  }
                  className="border p-2 w-full rounded"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Địa chỉ hiện tại</h3>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <input
                  placeholder="Số nhà"
                  value={formData.diaChiHienTai?.soNha || ""}
                  onChange={(e) =>
                    handleNestedChange("diaChiHienTai", "soNha", e.target.value)
                  }
                  className="border p-2 w-full rounded"
                />
                <input
                  placeholder="Đường"
                  value={formData.diaChiHienTai?.duong || ""}
                  onChange={(e) =>
                    handleNestedChange("diaChiHienTai", "duong", e.target.value)
                  }
                  className="border p-2 w-full rounded"
                />
                <input
                  placeholder="Phường/Xã"
                  value={formData.diaChiHienTai?.phuongXa || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "diaChiHienTai",
                      "phuongXa",
                      e.target.value
                    )
                  }
                  className="border p-2 w-full rounded"
                />
                <input
                  placeholder="Quận/Huyện"
                  value={formData.diaChiHienTai?.quanHuyen || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "diaChiHienTai",
                      "quanHuyen",
                      e.target.value
                    )
                  }
                  className="border p-2 w-full rounded"
                />
                <input
                  placeholder="Tỉnh/Thành"
                  value={formData.diaChiHienTai?.tinhThanh || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "diaChiHienTai",
                      "tinhThanh",
                      e.target.value
                    )
                  }
                  className="border p-2 w-full rounded"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              {isLoading ? "Đang xử lý..." : "Lưu lại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
