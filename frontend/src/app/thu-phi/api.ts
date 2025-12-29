import { CreateThuPhiPayload } from "./types";
import api from "@/lib/axios";

export const getActiveKhoanThu = async () => {
  const res = await api.get("/khoan-thu/active");
  return res.data;
};

export const createThuPhi = async (data: CreateThuPhiPayload) => {
  const res = await api.post("/thu-phi", data);
  return res.data;
};

export const getAllHoKhau = async () => {
  const res = await api.get("/ho-khau");
  return res.data; // Backend trả về Array
};

export const createKhoanThu = async (data: any) => {
  const res = await api.post("/khoan-thu", data);
  return res.data;
};

export const getAllKhoanThu = async () => {
  const res = await api.get("/khoan-thu");
  return res.data;
};

export const getAllThuPhi = async () => {
  const res = await api.get("/thu-phi");
  return res.data;
};

export const createPhieuThu = async (data: any) => {
  // LƯU Ý: Kiểm tra Backend của bạn:
  // Nếu Controller là @Controller('phieu-thu') -> dùng "/phieu-thu"
  // Nếu Controller là @Controller('thu-phi') -> dùng "/thu-phi"

  // Tạm thời mình để /phieu-thu theo chuẩn RESTful mới
  const res = await api.post("/thu-phi", data);
  return res.data;
};

export const updatePhieuThu = async (id: string, payload: any) => {
  // Sửa put -> patch
  const res = await api.patch(`/thu-phi/${id}`, payload);
  return res.data;
};

export const deleteKhoanThu = async (id: string) => {
  const res = await api.delete(`/khoan-thu/${id}`);
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

export const deletePhieuThu = async (id: string) => {
  const res = await api.delete(`/thu-phi/${id}`);
  return res.data;
};
