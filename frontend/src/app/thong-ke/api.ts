import api from "@/lib/axios";


// Gắn token tự động (chỉ trên client)


export const getThongKeData = async () => {
  try {
    const [nk, hk, tttv, kt, tp] = await Promise.all([
      api.get('/nhan-khau'),
      api.get('/ho-khau'),
      api.get('/tam-tru-tam-vang'),
      api.get('/khoan-thu'),
      api.get('/thu-phi')
    ]);
    return {
      nhanKhau: nk.data, hoKhau: hk.data, tamTru: tttv.data,
      khoanThu: kt.data, thuPhi: tp.data
    };
  } catch (error) {
    console.error("Lỗi API:", error);
    return null;
  }
};

// Lấy danh sách các đợt thu trong năm (tổng tiền đã thu và số hộ đã nộp)
export const getDanhSachDotThu = async (nam: number) => {
  try {
    const res = await api.get(`/thu-phi/ke-toan/dot-thu/nam/${nam}`);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đợt thu:', error);
    return null;
  }
};

// Lấy chi tiết các hộ đã nộp trong một đợt thu (bao gồm chi tiết các khoản đã nộp)
export const getChiTietHoDaNop = async (kyThu: string, nam?: number) => {
  try {
    const encoded = encodeURIComponent(kyThu);
    const url = nam ? `/thu-phi/ke-toan/dot-thu/${encoded}/da-nop?nam=${nam}` : `/thu-phi/ke-toan/dot-thu/${encoded}/da-nop`;
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết hộ đã nộp:', error);
    return null;
  }
};

// Lấy lịch sử nộp tiền của một hộ khẩu (các phiếu thu, tổng đã nộp và còn nợ)
export const getLichSuHo = async (hoKhauId: string, nam?: number) => {
  try {
    const id = encodeURIComponent(String(hoKhauId));
    const url = nam ? `/thu-phi/ke-toan/ho-khau/${id}/lich-su?nam=${nam}` : `/thu-phi/ke-toan/ho-khau/${id}/lich-su`;
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử nộp tiền hộ khẩu:', error);
    return null;
  }
};
