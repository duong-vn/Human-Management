"use client";
import React, { useState, useEffect } from "react";
import { NhanKhau } from "@/app/nhan-khau/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: NhanKhau | null;
  isLoading: boolean;
}

// 1. Dữ liệu mặc định (hoKhauId để rỗng ban đầu)
const defaultData = {
  hoTen: "",
  biDanh: "",
  danToc: "Kinh",
  ngaySinh: "",
  gioiTinh: "Nam",
  soDinhDanh: { loai: "CCCD", so: "", ngayCap: "", noiCap: "" },
  hoKhauId: "", // 👈 Trường này sẽ là optional
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
  const [formData, setFormData] = useState<any>(defaultData);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // --- CHẾ ĐỘ SỬA ---

        // Xử lý hoKhauId: Nếu backend trả về object (do populate) thì lấy _id, nếu không thì lấy chính nó
        let currentHoKhauId = "";
        if (initialData.hoKhauId) {
            currentHoKhauId = typeof initialData.hoKhauId === 'object'
                ? (initialData.hoKhauId as any)._id
                : initialData.hoKhauId;
        }

        setFormData({
          ...defaultData,
          ...initialData,
          hoKhauId: currentHoKhauId, // Gán ID đã xử lý vào

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
        // --- CHẾ ĐỘ THÊM MỚI ---
        setFormData(defaultData);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // 👇 LOGIC XỬ LÝ OPTIONAL hoKhauId
    let finalHoKhauId = formData.hoKhauId;

    // Nếu rỗng hoặc chỉ có khoảng trắng -> Gán null (Backend sẽ hiểu là không gắn hộ khẩu)
    if (!finalHoKhauId || finalHoKhauId.trim() === "") {
        finalHoKhauId = null;
    }

    const submitData = {
      ...formData,
      hoKhauId: finalHoKhauId, // Gửi null hoặc ID thực

      ngaySinh: formData.ngaySinh ? new Date(formData.ngaySinh).toISOString() : null,
      soDinhDanh: {
        ...formData.soDinhDanh,
        ngayCap: formData.soDinhDanh?.ngayCap
          ? new Date(formData.soDinhDanh.ngayCap).toISOString()
          : null,
      },
    };

    // Nếu bạn muốn "Không có thì KHÔNG GỬI luôn key đó" (delete key), dùng đoạn dưới:
    // if (!finalHoKhauId) {
    //    delete submitData.hoKhauId;
    // }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 py-10">
      <div className="bg-white p-8 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          {initialData ? "Cập Nhật Nhân Khẩu" : "Thêm Nhân Khẩu Mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Hàng 0: ID Hộ Khẩu (Optional) */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
             <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mã Hộ Khẩu (ID) <span className="font-sans text-gray-700 mb-1">- (Không bắt buộc)</span>
             </label>
             <input
                name="hoKhauId"
                value={formData.hoKhauId || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-black outline-none"
                placeholder="Nhập ID hộ khẩu"
             />
             <p className="text-xs font-semibold text-gray-700 mt-1">Để trống nếu nhân khẩu này chưa nhập vào hộ nào.</p>
          </div>

          {/* Hàng 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Họ Tên <span className="text-red-500">*</span></label>
              <input
                required
                name="hoTen"
                value={formData.hoTen || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày Sinh</label>
              <input
                type="date"
                name="ngaySinh"
                value={formData.ngaySinh || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Số Định Danh</label>
              <input
                value={formData.soDinhDanh?.so || ""}
                onChange={(e) => handleNestedChange("soDinhDanh", "so", e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                placeholder="00109xxxxxxx"
              />
            </div>
          </div>

          {/* Hàng 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Bí Danh</label>
              <input
                name="biDanh"
                value={formData.biDanh || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Giới Tính</label>
              <select
                name="gioiTinh"
                value={formData.gioiTinh || "Nam"}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dân Tộc</label>
              <input
                name="danToc"
                value={formData.danToc || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Hàng 3: Chi tiết Giấy tờ */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Loại giấy tờ</label>
              <select
                value={formData.soDinhDanh?.loai || "CCCD"}
                onChange={(e) => handleNestedChange("soDinhDanh", "loai", e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg outline-none bg-white"
              >
                <option>CCCD</option>
                <option>CMND</option>
                <option>Hộ chiếu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày cấp</label>
              <input
                type="date"
                value={formData.soDinhDanh?.ngayCap || ""}
                onChange={(e) => handleNestedChange("soDinhDanh", "ngayCap", e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nơi cấp</label>
              <input
                value={formData.soDinhDanh?.noiCap || ""}
                onChange={(e) => handleNestedChange("soDinhDanh", "noiCap", e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg outline-none bg-white"
                placeholder="Cục CSQLHC về TTXH"
              />
            </div>
          </div>

          {/* Hàng 4: Thông tin khác */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quốc tịch</label>
              <input
                name="quocTich"
                value={formData.quocTich || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tôn Giáo</label>
              <input
                name="tonGiao"
                value={formData.tonGiao || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quan hệ với chủ hộ</label>
              <input
                name="quanHeVoiChuHo"
                value={formData.quanHeVoiChuHo || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg outline-none"
                placeholder="Ví dụ: Chủ hộ, Con, Vợ..."
              />
            </div>
          </div>

           {/* Hàng 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nghề nghiệp</label>
              <input
                name="ngheNghiep"
                value={formData.ngheNghiep || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg outline-none"
              />
            </div>
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú</label>
              <input
                name="ghiChu"
                value={formData.ghiChu || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">Địa chỉ thường trú</h3>
              <input placeholder="Số nhà" value={formData.diaChiThuongTru?.soNha || ""} onChange={(e) => handleNestedChange("diaChiThuongTru", "soNha", e.target.value)} className="w-full border p-2 rounded-lg" />
              <input placeholder="Đường" value={formData.diaChiThuongTru?.duong || ""} onChange={(e) => handleNestedChange("diaChiThuongTru", "duong", e.target.value)} className="w-full border p-2 rounded-lg" />
              <input placeholder="Phường/Xã" value={formData.diaChiThuongTru?.phuongXa || ""} onChange={(e) => handleNestedChange("diaChiThuongTru", "phuongXa", e.target.value)} className="w-full border p-2 rounded-lg" />
              <input placeholder="Quận/Huyện" value={formData.diaChiThuongTru?.quanHuyen || ""} onChange={(e) => handleNestedChange("diaChiThuongTru", "quanHuyen", e.target.value)} className="w-full border p-2 rounded-lg" />
              <input placeholder="Tỉnh/Thành" value={formData.diaChiThuongTru?.tinhThanh || ""} onChange={(e) => handleNestedChange("diaChiThuongTru", "tinhThanh", e.target.value)} className="w-full border p-2 rounded-lg" />
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">Địa chỉ hiện tại</h3>
              <input placeholder="Số nhà" value={formData.diaChiHienTai?.soNha || ""} onChange={(e) => handleNestedChange("diaChiHienTai", "soNha", e.target.value)} className="w-full border p-2 rounded-lg" />
              <input placeholder="Đường" value={formData.diaChiHienTai?.duong || ""} onChange={(e) => handleNestedChange("diaChiHienTai", "duong", e.target.value)} className="w-full border p-2 rounded-lg" />
              <input placeholder="Phường/Xã" value={formData.diaChiHienTai?.phuongXa || ""} onChange={(e) => handleNestedChange("diaChiHienTai", "phuongXa", e.target.value)} className="w-full border p-2 rounded-lg" />
              <input placeholder="Quận/Huyện" value={formData.diaChiHienTai?.quanHuyen || ""} onChange={(e) => handleNestedChange("diaChiHienTai", "quanHuyen", e.target.value)} className="w-full border p-2 rounded-lg" />
              <input placeholder="Tỉnh/Thành" value={formData.diaChiHienTai?.tinhThanh || ""} onChange={(e) => handleNestedChange("diaChiHienTai", "tinhThanh", e.target.value)} className="w-full border p-2 rounded-lg" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
            >
              {isLoading ? "Đang xử lý..." : (initialData ? "Cập nhật" : "Thêm mới")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
