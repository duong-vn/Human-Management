import { CreateThuPhiPayload } from "./types";
import api from "@/lib/axios";

// --- QUẢN LÝ KHOẢN THU (DANH MỤC) ---

export const getAllKhoanThu = async () => {
  const res = await api.get("/khoan-thu");
  return res.data;
};

export const getKhoanThuBatBuoc = async () => {
  const res = await api.get("/khoan-thu/bat-buoc");
  return res.data;
};

export const getKhoanThuTuNguyen = async () => {
  const res = await api.get("/khoan-thu/tu-nguyen");
  return res.data;
};

export const createKhoanThu = async (data: any) => {
  // Đảm bảo data truyền vào đã có ngayBatDau (ISO String) và loaiKhoanThu
  const res = await api.post("/khoan-thu", data);
  return res.data;
};

export const deleteKhoanThu = async (id: string) => {
  const res = await api.delete(`/khoan-thu/${id}`);
  return res.data;
};

export const getActiveKhoanThu = async () => {
  const res = await api.get("/khoan-thu/active");
  return res.data;
};


// --- QUẢN LÝ THU PHÍ (GIAO DỊCH) ---

export const getAllThuPhi = async () => {
  const res = await api.get("/thu-phi");
  // Quan trọng: Giao diện sẽ dùng trường "trangThai" từ đây để check "Đã nộp"
  return res.data;
};

// Thống nhất dùng createPhieuThu hoặc createThuPhi (nên dùng createPhieuThu cho đồng bộ giao diện)
export const createPhieuThu = async (data: any) => {
  const res = await api.post("/thu-phi", data);
  return res.data;
};

export const updatePhieuThu = async (id: string, payload: any) => {
  const res = await api.patch(`/thu-phi/${id}`, payload);
  return res.data;
};

export const deletePhieuThu = async (id: string) => {
  const res = await api.delete(`/thu-phi/${id}`);
  return res.data;
};


// --- QUẢN LÝ HỘ KHẨU ---

export const getAllHoKhau = async () => {
  const res = await api.get("/ho-khau");
  return res.data;
};
