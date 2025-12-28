"use client";
import React, { useState } from "react";
import { X, Save, Tag } from "lucide-react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function CreateKhoanThuModal({ isOpen, onClose, onSubmit, isLoading }: Props) {
  const [formData, setFormData] = useState({
    tenKhoanThu: "",
    // Backend yêu cầu tiếng Việt có dấu (theo mẫu bạn gửi), nếu lỗi thì đổi lại thành "BatBuoc"
    loaiKhoanThu: "Bắt buộc",
    soTien: 0,
    moTa: "",
    donViTinh: "VNĐ", // Thêm đơn vị tính
    ngayBatDau: new Date().toISOString().split('T')[0], // Ngày hôm nay (YYYY-MM-DD)

    // --- QUAN TRỌNG NHẤT: SỬA TỪ "trangThai" THÀNH "isActive" ---
    isActive: true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenKhoanThu) return toast.warning("Vui lòng nhập tên khoản thu!");

    // Gửi dữ liệu y hệt form Backend yêu cầu
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Tag className="text-purple-600" size={20} /> Thêm Khoản Thu Mới
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Tên khoản thu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tên khoản thu (*)</label>
            <input
              type="text"
              placeholder="VD: Phí vệ sinh, Quỹ an ninh..."
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              value={formData.tenKhoanThu}
              onChange={(e) => setFormData({...formData, tenKhoanThu: e.target.value})}
              autoFocus
            />
          </div>

          {/* Loại khoản thu (Sửa value khớp với mẫu JSON của bạn) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Loại khoản thu</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg w-full has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                <input
                  type="radio"
                  name="loaiKhoanThu"
                  value="Bắt buộc" // Khớp với JSON bạn gửi
                  checked={formData.loaiKhoanThu === "Bắt buộc"}
                  onChange={() => setFormData({...formData, loaiKhoanThu: "Bắt buộc"})}
                  className="accent-purple-600"
                />
                <span className="font-medium text-gray-800 text-sm">Bắt buộc</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg w-full has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                <input
                  type="radio"
                  name="loaiKhoanThu"
                  value="Tự nguyện" // Khớp với JSON bạn gửi (hoặc check lại BE nếu họ dùng 'TuNguyen')
                  checked={formData.loaiKhoanThu === "Tự nguyện"}
                  onChange={() => setFormData({...formData, loaiKhoanThu: "Tự nguyện"})}
                  className="accent-green-600"
                />
                <span className="font-medium text-gray-800 text-sm">Tự nguyện</span>
              </label>
            </div>
          </div>

          {/* Số tiền & Đơn vị tính */}
          <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Số tiền (VNĐ)</label>
                <input
                type="number"
                className="w-full border p-2.5 rounded-lg font-mono text-center"
                value={formData.soTien}
                onChange={(e) => setFormData({...formData, soTien: Number(e.target.value)})}
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Đơn vị tính</label>
                <input
                type="text"
                placeholder="Hộ / Người / Tháng"
                className="w-full border p-2.5 rounded-lg text-center"
                value={formData.donViTinh}
                onChange={(e) => setFormData({...formData, donViTinh: e.target.value})}
                />
            </div>
          </div>

          {/* Mô tả */}
          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả / Ghi chú</label>
             <textarea
               rows={2}
               className="w-full border p-2.5 rounded-lg text-sm"
               value={formData.moTa}
               onChange={(e) => setFormData({...formData, moTa: e.target.value})}
               placeholder="Nhập ghi chú chi tiết..."
             />
          </div>

          {/* FOOTER */}
          <div className="pt-4 flex justify-end gap-3">
             <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-100 text-sm font-medium">
               Hủy
             </button>
             <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-all flex items-center gap-2"
             >
                {isLoading ? "Đang tạo..." : <><Save size={16}/> Lưu lại</>}
             </button>
          </div>
        </form>

      </div>
    </div>
  );
}
