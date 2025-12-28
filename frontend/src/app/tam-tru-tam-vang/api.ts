import api from "@/lib/axios";
import { TamTruTamVang, CreateTamTruTamVangDto, UpdateTamTruTamVangDto } from "./types";

export const getAllTamTruTamVang = async (params?: {
  loai?: string;
  trangThai?: string;
  tuNgay?: string;
  denNgay?: string;
}): Promise<TamTruTamVang[]> => {
  const res = await api.get("/tam-tru-tam-vang", { params });
  return res.data;
};

export const createTamTruTamVang = async (
  data: CreateTamTruTamVangDto
): Promise<TamTruTamVang> => {
  const res = await api.post("/tam-tru-tam-vang", data);
  return res.data;
};

export const updateTamTruTamVang = async (
  id: string,
  data: UpdateTamTruTamVangDto
): Promise<TamTruTamVang> => {
  const res = await api.patch(`/tam-tru-tam-vang/${id}`, data);
  return res.data;
};

export const deleteTamTruTamVang = async (id: string): Promise<void> => {
  await api.delete(`/tam-tru-tam-vang/${id}`);
};

export const getTamTruTamVangById = async (id: string): Promise<TamTruTamVang> => {
  const res = await api.get(`/tam-tru-tam-vang/${id}`);
  return res.data;
};

export const getThongKeTamTruTamVang = async (params?: {
  tuNgay?: string;
  denNgay?: string;
}) => {
  const res = await api.get("/tam-tru-tam-vang/thong-ke", { params });
  return res.data;
};