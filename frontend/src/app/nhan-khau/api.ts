import api from "@/lib/axios"; // Giữ nguyên import này
import { NhanKhau } from "./types";

// 👇 Export thêm biến api để dùng ở các component nếu cần gọi thủ công
export { api };

export const getAllNhanKhau = async (): Promise<NhanKhau[]> => {
  const res = await api.get("/nhan-khau");
  return res.data;
};

// BE tao ID, FE ko gui
export const createNhanKhau = async (
  data: Omit<NhanKhau, "id">
): Promise<NhanKhau> => {
  const res = await api.post("/nhan-khau", data);
  return res.data;
};

export const deleteNhanKhau = async (id: string): Promise<void> => {
  await api.delete(`/nhan-khau/${id}`);
};

export const updateNhanKhau = async (id: string, data: Partial<NhanKhau>): Promise<NhanKhau> => {
  const res = await api.patch(`/nhan-khau/${id}`, data);
  return res.data;
};

// ==========================================
// 👇 CÁC HÀM MỚI CẦN THÊM CHO CHỨC NĂNG MỚI SINH
// ==========================================

// 1. Lấy danh sách Hộ Khẩu (cho dropdown chọn hộ)
export const getAllHoKhau = async () => {
    const res = await api.get("/ho-khau");
    // Lưu ý: Kiểm tra lại endpoint này bên BE của bạn xem đúng là /ho-khau không
    return res.data;
};

// 2. Tạo mới nhân khẩu dạng Mới Sinh
export const createMoiSinh = async (data: {
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    hoKhauId: string;
    quanHeVoiChuHo: string;
}) => {
    // Gọi đúng endpoint như trong hình bạn gửi lúc trước
    const res = await api.post("/nhan-khau/moi-sinh", data);
    return res.data;
};

// api.ts
// ... các imports cũ

export const getThongKeNhanKhau = async () => {
  // Giả sử axios instance của bạn tên là 'http' hoặc 'axiosClient'
  const res = await api.get('/nhan-khau/thong-ke/chung');
  return res.data;
  // Hoặc nếu trả về mảng/object trực tiếp: return res;
};
