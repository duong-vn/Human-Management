"use client";
import React, { useState, useEffect } from "react";
import { TamTruTamVang } from "./types";
import { getAllNhanKhau } from "./api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: TamTruTamVang | null;
  isLoading: boolean;
}

const defaultData = {
  nhanKhauId: undefined,
  hoTen: "",
  loai: "Tạm trú" as "Tạm trú" | "Tạm vắng",
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

// Thêm enum cho loại đăng ký
type LoaiDangKy = 'tam-vang-tu-danh-sach' | 'tam-tru-tu-danh-sach' | 'tam-tru-nguoi-moi';

export default function TamTruTamVangModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: Props) {
  const [formData, setFormData] = useState<any>(defaultData);
  const [errors, setErrors] = useState<any>({});
  const [loaiDangKy, setLoaiDangKy] = useState<LoaiDangKy>('tam-tru-nguoi-moi');
  const [nhanKhauList, setNhanKhauList] = useState<any[]>([]);
  const [selectedNhanKhau, setSelectedNhanKhau] = useState<any>(null);
  const [loadingNhanKhau, setLoadingNhanKhau] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          tuNgay: initialData.tuNgay ? initialData.tuNgay.split("T")[0] : "",
          denNgay: initialData.denNgay ? initialData.denNgay.split("T")[0] : "",
          diaChiTamTru: initialData.diaChiTamTru || defaultData.diaChiTamTru,
          diaChiThuongTru: initialData.diaChiThuongTru || defaultData.diaChiThuongTru,
        });
        // Xác định loại đăng ký dựa trên dữ liệu có sẵn
        if (initialData.loai === 'Tạm vắng') {
          setLoaiDangKy('tam-vang-tu-danh-sach');
        } else if (initialData.nhanKhauId) {
          setLoaiDangKy('tam-tru-tu-danh-sach');
        } else {
          setLoaiDangKy('tam-tru-nguoi-moi');
        }
      } else {
        setFormData(defaultData);
        setLoaiDangKy('tam-tru-nguoi-moi');
        setSelectedNhanKhau(null);
      }

      // Load danh sách nhân khẩu
      loadNhanKhauList();
    }
  }, [isOpen, initialData]);

  const loadNhanKhauList = async () => {
    setLoadingNhanKhau(true);
    try {
      const list = await getAllNhanKhau();
      setNhanKhauList(list);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhân khẩu:', error);
    } finally {
      setLoadingNhanKhau(false);
    }
  };

  // Cập nhật formData khi chọn loại đăng ký hoặc nhân khẩu
  useEffect(() => {
    if (loaiDangKy === 'tam-vang-tu-danh-sach' || loaiDangKy === 'tam-tru-tu-danh-sach') {
      if (selectedNhanKhau) {
        setFormData((prev: any) => ({
          ...prev,
          nhanKhauId: selectedNhanKhau.id || selectedNhanKhau._id,
          hoTen: selectedNhanKhau.hoTen,
          diaChiThuongTru: selectedNhanKhau.diaChiThuongTru || defaultData.diaChiThuongTru,
          loai: loaiDangKy === 'tam-vang-tu-danh-sach' ? 'Tạm vắng' : 'Tạm trú',
        }));
      }
    } else {
      // Người mới - reset form
      setFormData((prev: any) => ({
        ...defaultData,
        loai: 'Tạm trú',
      }));
      setSelectedNhanKhau(null);
    }
  }, [loaiDangKy, selectedNhanKhau]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

    // Validation chung
    if (!formData.tuNgay) newErrors.tuNgay = "Vui lòng chọn ngày bắt đầu";
    if (!formData.denNgay) newErrors.denNgay = "Vui lòng chọn ngày kết thúc";

    // Validation theo loại đăng ký
    if (loaiDangKy === 'tam-vang-tu-danh-sach' || loaiDangKy === 'tam-tru-tu-danh-sach') {
      if (!selectedNhanKhau) {
        newErrors.nhanKhau = "Vui lòng chọn nhân khẩu từ danh sách";
      }
    } else {
      // Người mới
      if (!formData.hoTen.trim()) newErrors.hoTen = "Vui lòng nhập họ tên";
      if (!formData.diaChiThuongTru?.tinhThanh?.trim()) {
        newErrors.diaChiThuongTru = "Vui lòng nhập địa chỉ thường trú";
      }
    }

    if (formData.loai === "Tạm trú" && !formData.diaChiTamTru.tinhThanh?.trim()) {
      newErrors.diaChiTamTru = "Vui lòng nhập địa chỉ tạm trú";
    }
    if (formData.loai === "Tạm vắng" && !formData.noiDen.trim()) {
      newErrors.noiDen = "Vui lòng nhập nơi đến";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-screen-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? "Cập nhật" : "Đăng ký"} {formData.loai}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Chọn loại đăng ký - chỉ hiển thị khi thêm mới */}
          {!initialData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Loại đăng ký *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    name="loaiDangKy"
                    value="tam-vang-tu-danh-sach"
                    checked={loaiDangKy === 'tam-vang-tu-danh-sach'}
                    onChange={(e) => setLoaiDangKy(e.target.value as LoaiDangKy)}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-bold">TV</span>
                      </div>
                      <div className="font-medium text-gray-800">Tạm vắng</div>
                      <div className="text-sm text-gray-500">Chọn từ danh sách nhân khẩu</div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="loaiDangKy"
                    value="tam-tru-tu-danh-sach"
                    checked={loaiDangKy === 'tam-tru-tu-danh-sach'}
                    onChange={(e) => setLoaiDangKy(e.target.value as LoaiDangKy)}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-2 border-gray-200 rounded-xl cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">TT</span>
                      </div>
                      <div className="font-medium text-gray-800">Tạm trú</div>
                      <div className="text-sm text-gray-500">Người đã có trong danh sách</div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="loaiDangKy"
                    value="tam-tru-nguoi-moi"
                    checked={loaiDangKy === 'tam-tru-nguoi-moi'}
                    onChange={(e) => setLoaiDangKy(e.target.value as LoaiDangKy)}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">Mới</span>
                      </div>
                      <div className="font-medium text-gray-800">Tạm trú</div>
                      <div className="text-sm text-gray-500">Người từ nơi khác đến</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Dropdown chọn nhân khẩu - chỉ hiển thị cho 2 loại đầu */}
          {(loaiDangKy === 'tam-vang-tu-danh-sach' || loaiDangKy === 'tam-tru-tu-danh-sach') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn nhân khẩu từ danh sách *
              </label>
              <select
                value={selectedNhanKhau?.id || selectedNhanKhau?._id || ""}
                onChange={(e) => {
                  const selected = nhanKhauList.find(nk => (nk.id || nk._id) === e.target.value);
                  setSelectedNhanKhau(selected);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingNhanKhau}
              >
                <option value="">
                  {loadingNhanKhau ? "Đang tải..." : "-- Chọn nhân khẩu --"}
                </option>
                {nhanKhauList.map((nk) => (
                  <option key={nk.id || nk._id} value={nk.id || nk._id}>
                    {nk.hoTen} - {nk.soDinhDanh?.so || 'Chưa có CMND/CCCD'}
                  </option>
                ))}
              </select>
              {errors.nhanKhau && (
                <p className="text-red-500 text-sm mt-1">{errors.nhanKhau}</p>
              )}
            </div>
          )}

          {/* Thông tin nhân khẩu được chọn */}
          {(loaiDangKy === 'tam-vang-tu-danh-sach' || loaiDangKy === 'tam-tru-tu-danh-sach') && selectedNhanKhau && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-medium text-blue-800 mb-2">Thông tin nhân khẩu đã chọn:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Họ tên:</span> {selectedNhanKhau.hoTen}
                </div>
                <div>
                  <span className="font-medium">CMND/CCCD:</span> {selectedNhanKhau.soDinhDanh?.so || 'Chưa có'}
                </div>
                <div>
                  <span className="font-medium">Trạng thái hiện tại:</span> {selectedNhanKhau.trangThai}
                </div>
                <div>
                  <span className="font-medium">Ngày sinh:</span> {new Date(selectedNhanKhau.ngaySinh).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          )}

          {/* Ngày bắt đầu và kết thúc */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày *
              </label>
              <input
                type="date"
                name="tuNgay"
                value={formData.tuNgay}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.tuNgay && (
                <p className="text-red-500 text-sm mt-1">{errors.tuNgay}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày *
              </label>
              <input
                type="date"
                name="denNgay"
                value={formData.denNgay}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.denNgay && (
                <p className="text-red-500 text-sm mt-1">{errors.denNgay}</p>
              )}
            </div>
          </div>

          {/* Nhân khẩu ID và Họ tên */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Nhân khẩu (tùy chọn)
              </label>
              <input
                type="text"
                name="nhanKhauId"
                value={formData.nhanKhauId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập ID nhân khẩu (nếu có)"
              />
              {errors.nhanKhauId && (
                <p className="text-red-500 text-sm mt-1">{errors.nhanKhauId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên {loaiDangKy === 'tam-tru-nguoi-moi' ? '*' : ''}
              </label>
              <input
                type="text"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập họ và tên"
                disabled={loaiDangKy === 'tam-vang-tu-danh-sach' || loaiDangKy === 'tam-tru-tu-danh-sach'}
              />
              {errors.hoTen && (
                <p className="text-red-500 text-sm mt-1">{errors.hoTen}</p>
              )}
            </div>
          </div>

          {/* Địa chỉ thường trú - chỉ hiển thị cho người mới */}
          {loaiDangKy === 'tam-tru-nguoi-moi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ thường trú *
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  value={formData.diaChiThuongTru.soNha}
                  onChange={(e) => handleNestedChange('diaChiThuongTru', 'soNha', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Số nhà"
                />
                <input
                  type="text"
                  value={formData.diaChiThuongTru.duong}
                  onChange={(e) => handleNestedChange('diaChiThuongTru', 'duong', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Đường"
                />
                <input
                  type="text"
                  value={formData.diaChiThuongTru.phuongXa}
                  onChange={(e) => handleNestedChange('diaChiThuongTru', 'phuongXa', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phường/Xã"
                />
                <input
                  type="text"
                  value={formData.diaChiThuongTru.quanHuyen}
                  onChange={(e) => handleNestedChange('diaChiThuongTru', 'quanHuyen', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Quận/Huyện"
                />
                <input
                  type="text"
                  value={formData.diaChiThuongTru.tinhThanh}
                  onChange={(e) => handleNestedChange('diaChiThuongTru', 'tinhThanh', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
                  placeholder="Tỉnh/Thành"
                />
                {errors.diaChiThuongTru && (
                  <p className="text-red-500 text-sm mt-1 col-span-3">{errors.diaChiThuongTru}</p>
                )}
              </div>
            </div>
          )}

          {/* Fields specific to loại */}
          {formData.loai === "Tạm trú" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ tạm trú *
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  value={formData.diaChiTamTru.soNha}
                  onChange={(e) => handleNestedChange('diaChiTamTru', 'soNha', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Số nhà"
                />
                <input
                  type="text"
                  value={formData.diaChiTamTru.duong}
                  onChange={(e) => handleNestedChange('diaChiTamTru', 'duong', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Đường"
                />
                <input
                  type="text"
                  value={formData.diaChiTamTru.phuongXa}
                  onChange={(e) => handleNestedChange('diaChiTamTru', 'phuongXa', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phường/Xã"
                />
                <input
                  type="text"
                  value={formData.diaChiTamTru.quanHuyen}
                  onChange={(e) => handleNestedChange('diaChiTamTru', 'quanHuyen', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Quận/Huyện"
                />
                <input
                  type="text"
                  value={formData.diaChiTamTru.tinhThanh}
                  onChange={(e) => handleNestedChange('diaChiTamTru', 'tinhThanh', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
                  placeholder="Tỉnh/Thành"
                />
                {errors.diaChiTamTru && (
                  <p className="text-red-500 text-sm mt-1 col-span-3">{errors.diaChiTamTru}</p>
                )}
              </div>
            </div>
          )}

          {formData.loai === "Tạm vắng" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nơi đến *
              </label>
              <input
                type="text"
                name="noiDen"
                value={formData.noiDen}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập nơi đến"
              />
              {errors.noiDen && (
                <p className="text-red-500 text-sm mt-1">{errors.noiDen}</p>
              )}
            </div>
          )}

          {/* Lý do và Ghi chú */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do
              </label>
              <textarea
                name="lyDo"
                value={formData.lyDo}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập lý do"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="ghiChu"
                value={formData.ghiChu}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập ghi chú"
              />
            </div>
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
              {isLoading ? "Đang xử lý..." : initialData ? "Cập nhật" : "Đăng ký"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
