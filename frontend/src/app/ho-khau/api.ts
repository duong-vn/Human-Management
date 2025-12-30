import api from "@/lib/axios";
import {
  HoKhau,
  CreateHoKhauParams,
  TachHoParams,
  DoiChuHoParams,
  ThemThanhVienParams,
  LichSuThayDoi,
  NhanKhauBasic,
} from "./types";

// Lấy danh sách hộ khẩu
export const getAllHoKhau = async (params?: {
  trangThai?: string;
  search?: string;
}): Promise<HoKhau[]> => {
  const res = await api.get("/ho-khau", { params });
  return res.data;
};

// Lấy chi tiết 1 hộ khẩu
export const getHoKhauById = async (id: string): Promise<HoKhau> => {
  const res = await api.get(`/ho-khau/${id}`);
  return res.data;
};

// Tạo hộ khẩu mới
export const createHoKhau = async (
  data: CreateHoKhauParams
): Promise<HoKhau> => {
  const res = await api.post("/ho-khau", data);
  return res.data;
};

// Cập nhật thông tin hộ khẩu
export const updateHoKhau = async (
  id: string,
  data: Partial<CreateHoKhauParams>
): Promise<HoKhau> => {
  const res = await api.patch(`/ho-khau/${id}`, data);
  return res.data;
};

// Tách hộ
export const tachHo = async (data: TachHoParams): Promise<HoKhau> => {
  const res = await api.post("/ho-khau/tach-ho", data);
  return res.data;
};

// Đổi chủ hộ
export const doiChuHo = async (
  hoKhauId: string,
  data: DoiChuHoParams
): Promise<HoKhau> => {
  const res = await api.patch(`/ho-khau/${hoKhauId}/thay-doi-chu-ho`, data);
  return res.data;
};

// Thêm thành viên vào hộ khẩu
export const themThanhVien = async (
  hoKhauId: string,
  data: ThemThanhVienParams
): Promise<HoKhau> => {
  const res = await api.patch(`/ho-khau/${hoKhauId}/them-thanh-vien`, data);
  return res.data;
};

// Xóa thành viên khỏi hộ khẩu
export const xoaThanhVien = async (
  hoKhauId: string,
  nhanKhauId: string,
  chuHoThayThe?: { nhanKhauId: string; hoTen: string }
): Promise<HoKhau> => {
  const res = await api.patch(
    `/ho-khau/${hoKhauId}/xoa-thanh-vien/${nhanKhauId}`,
    chuHoThayThe ? { chuHoThayThe } : {}
  );
  return res.data;
};

// Lấy lịch sử thay đổi hộ khẩu
export const getLichSuHoKhau = async (
  hoKhauId: string
): Promise<LichSuThayDoi[]> => {
  const res = await api.get(`/ho-khau/${hoKhauId}/lich-su`);
  return res.data;
};

// Xóa hộ khẩu (chỉ TO_TRUONG, TO_PHO)
export const deleteHoKhau = async (id: string): Promise<void> => {
  await api.delete(`/ho-khau/${id}`);
};

// Lấy thống kê hộ khẩu
export const getThongKeHoKhau = async (): Promise<{
  tong: number;
  dangHoatDong: number;
  daTachHo: number;
  daXoa: number;
}> => {
  const res = await api.get("/ho-khau/thong-ke");
  return res.data;
};

// Lấy danh sách nhân khẩu (dùng khi thêm thành viên)
export const getAllNhanKhau = async (): Promise<NhanKhauBasic[]> => {
  const res = await api.get("/nhan-khau");
  return res.data;
};

// Lấy danh sách nhân khẩu chưa có hộ khẩu
export const getNhanKhauChuaCoHoKhau = async (): Promise<NhanKhauBasic[]> => {
  const res = await api.get("/nhan-khau");
  // Filter nhân khẩu chưa có hoKhauId
  return res.data.filter(
    (nk: NhanKhauBasic) => !nk.hoKhauId || nk.hoKhauId === null
  );
};

// Tìm kiếm nhân khẩu theo từ khóa (tên, CCCD, CMND)
export const searchNhanKhau = async (
  keyword: string
): Promise<NhanKhauBasic[]> => {
  const res = await api.get("/nhan-khau/search", { params: { keyword } });
  return res.data;
};

// Tìm nhân khẩu theo CCCD/CMND
export const findNhanKhauByCCCD = async (
  cccd: string
): Promise<NhanKhauBasic | null> => {
  try {
    const res = await api.get(`/nhan-khau/cccd/${cccd}`);
    return res.data;
  } catch {
    return null;
  }
};

// Cập nhật quan hệ thành viên với chủ hộ
export const capNhatQuanHeThanhVien = async (
  hoKhauId: string,
  nhanKhauId: string,
  quanHeVoiChuHo: string
): Promise<HoKhau> => {
  const res = await api.patch(
    `/ho-khau/${hoKhauId}/cap-nhat-thanh-vien/${nhanKhauId}`,
    {
      quanHeVoiChuHo,
    }
  );
  return res.data;
};
