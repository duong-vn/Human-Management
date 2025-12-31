"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllHoKhau,
  createPhieuThu,
  getKhoanThuBatBuoc,
  getAllThuPhi,
  deleteKhoanThu, // 🟢 1. Import hàm xóa khoản thu
  deletePhieuThu  // 🟢 2. Import hàm xóa phiếu thu
} from "../api";
import {
  CheckCircle,
  DollarSign,
  Calendar,
  Layers,
  Trash2 // 🟢 3. Import icon thùng rác
} from "lucide-react";
import { toast } from "sonner";

export default function QuanLyCacKhoanThu() {
  const queryClient = useQueryClient();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeKhoanThu, setActiveKhoanThu] = useState<any>(null);

  // --- DATA FETCHING ---
  const { data: dsHoKhau = [], isLoading: isLoadingHoKhau } = useQuery({
    queryKey: ["ho-khau"],
    queryFn: async () => {
      const res = await getAllHoKhau();
      return Array.isArray(res) ? res : [];
    },
  });

  const { data: dsKhoanThu = [], isLoading: isLoadingKhoanThu } = useQuery({
    queryKey: ["khoan-thu-bat-buoc"],
    queryFn: async () => {
      const res = await getKhoanThuBatBuoc();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  const { data: dsPhieuThu = [] } = useQuery({
    queryKey: ["thu-phi-history"],
    queryFn: async () => {
      const res = await getAllThuPhi();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  useEffect(() => {
    if (!activeKhoanThu && dsKhoanThu.length > 0) {
      setActiveKhoanThu(dsKhoanThu[0]);
    }
  }, [dsKhoanThu, activeKhoanThu]);

  const getCleanId = (obj: any) => {
    if (!obj) return "";
    return typeof obj === "string" ? obj : (obj._id || obj.id || String(obj));
  };

  // 🟢 LOGIC TÍNH PHÍ
  const calculateFee = useCallback((hoKhau: any) => {
    if (!activeKhoanThu) return { tongTien: 0, kyThuLabel: "" };

    const donGia = Number(activeKhoanThu.soTien || 0);
    const tenKhoan = activeKhoanThu.tenKhoanThu?.toLowerCase() || "";
    const soNK = (hoKhau.thanhVien?.length || 0);

    if (tenKhoan.includes("vệ sinh")) {
      return {
        // Công thức: Đơn giá * Số người * 12 tháng
        tongTien: donGia * soNK * 12,
        kyThuLabel: `Năm ${selectedYear}`,
      };
    }
    return {
      tongTien: donGia * soNK,
      kyThuLabel: `Tháng ${selectedMonth}/${selectedYear}`,
    };
  }, [activeKhoanThu, selectedMonth, selectedYear]);

  // --- LOGIC XỬ LÝ TRẠNG THÁI ---
  const getSinglePaymentStatus = (hoKhau: any) => {
    if (!activeKhoanThu) return "none";

    const hkId = getCleanId(hoKhau._id || hoKhau.id);
    const ktId = getCleanId(activeKhoanThu._id || activeKhoanThu.id);
    const { kyThuLabel } = calculateFee(hoKhau);

    const filterredPhieu = dsPhieuThu.filter((pt: any) => {
      const ptHoKhauId = getCleanId(pt.hoKhauId);
      return ptHoKhauId === hkId &&
        pt.kyThu === kyThuLabel &&
        pt.chiTietThu?.some((ct: any) => getCleanId(ct.khoanThuId) === ktId);
    });

    if (filterredPhieu.length === 0) return "none";

    const hasPaid = filterredPhieu.some((p: any) => p.trangThai === "Đã thu");
    if (hasPaid) return "Đã thu";

    const hasDebt = filterredPhieu.some((p: any) => p.trangThai === "Chưa thu");
    if (hasDebt) return "Chưa thu";

    return "none";
  };

  // --- MUTATIONS ---
  const thuPhiMutation = useMutation({
    mutationFn: async (payload: any) => await createPhieuThu(payload),
    onSuccess: (data, variables) => {
      const statusText = variables.trangThai === "Đã thu" ? "nộp phí" : "ghi nhận nợ";
      toast.success(`Đã ${statusText} thành công!`);
      queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err.message || "Có lỗi xảy ra";
      toast.error("Lỗi: " + msg);
    },
  });

  // 🟢 4. HÀM XÓA KHOẢN THU (LOGIC: Xóa phiếu -> Xóa khoản)
  const deleteKhoanThuMutation = useMutation({
    mutationFn: async (id: string) => {
        // Bước 1: Tìm tất cả phiếu thu liên quan đến khoản thu này
        // (Lọc từ dsPhieuThu đã tải về cache để đỡ gọi API search)
        const relatedPhieus = dsPhieuThu.filter((pt: any) =>
             pt.chiTietThu?.some((detail: any) => getCleanId(detail.khoanThuId) === id)
        );

        // Bước 2: Nếu có phiếu thu, xóa chúng trước
        if (relatedPhieus.length > 0) {
            const deletePromises = relatedPhieus.map((pt: any) =>
                deletePhieuThu(getCleanId(pt))
            );
            await Promise.all(deletePromises);
        }

        // Bước 3: Xóa khoản thu gốc
        return await deleteKhoanThu(id);
    },
    onSuccess: () => {
        toast.success("Đã xóa khoản thu và toàn bộ dữ liệu thu phí liên quan!");
        setActiveKhoanThu(null); // Reset active
        queryClient.invalidateQueries({ queryKey: ["khoan-thu-bat-buoc"] });
        queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
    },
    onError: (err: any) => {
        toast.error("Lỗi xóa: " + (err.message || "Không xác định"));
    }
  });

  // 🟢 5. HANDLER XỬ LÝ SỰ KIỆN CLICK XÓA
  const handleDeleteKhoanThu = (e: React.MouseEvent, khoanThu: any) => {
      e.stopPropagation(); // Ngăn chặn sự kiện click vào item cha (chọn khoản thu)

      const id = getCleanId(khoanThu);
      const ten = khoanThu.tenKhoanThu;

      toast(`Xóa khoản thu: ${ten}?`, {
          description: "CẢNH BÁO: Mọi lịch sử thu phí của khoản này sẽ bị xóa vĩnh viễn.",
          action: {
              label: "Xóa Ngay",
              onClick: () => deleteKhoanThuMutation.mutate(id)
          },
          cancel: { label: "Hủy", onClick: () => {} },
          duration: 5000, // Hiện lâu hơn chút để user đọc cảnh báo
      });
  };

  const handleThuPhiLe = (hoKhau: any, status: "Đã thu" | "Chưa thu" = "Đã thu") => {
    if (!activeKhoanThu) return toast.error("Vui lòng chọn một khoản thu ở sidebar!");

    const { tongTien, kyThuLabel } = calculateFee(hoKhau);
    const dc = hoKhau.diaChi || hoKhau.diaChiThuongTru;
    let diaChiString = (dc?.soNha || "") + " " + (dc?.duong || "") || "Chưa cập nhật";

    const payload = {
      hoKhauId: getCleanId(hoKhau._id || hoKhau.id),
      maPhieuThu: `PT-${getCleanId(activeKhoanThu).slice(-4)}-${Date.now()}`,
      tenChuHo: hoKhau.chuHo?.hoTen || "Chủ hộ không xác định",
      diaChi: diaChiString,
      soNhanKhau: Number((hoKhau.thanhVien?.length || 0)),
      nam: Number(selectedYear),
      kyThu: kyThuLabel,
      ngayThu: new Date().toISOString(),
      trangThai: status,
      chiTietThu: [{
        khoanThuId: getCleanId(activeKhoanThu._id || activeKhoanThu.id),
        tenKhoanThu: activeKhoanThu.tenKhoanThu,
        soTien: Number(tongTien),
        ghiChu: status === "Chưa thu" ? "Ghi nợ khoản thu" : "Nộp trực tiếp",
      }],
      tongTien: Number(tongTien),
    };

    if (status === "Đã thu") {
      toast(`Xác nhận nộp phí?`, {
        description: `Khoản: ${activeKhoanThu.tenKhoanThu} - Hộ: ${hoKhau.chuHo?.hoTen}. Số tiền: ${Number(tongTien).toLocaleString()} VNĐ`,
        action: {
          label: "Xác nhận",
          onClick: () => thuPhiMutation.mutate(payload),
        },
        cancel: {
          label: "Hủy",
          onClick: () => { },
        },
      });
    } else {
      thuPhiMutation.mutate(payload);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-blue-600" /> Danh Mục Phí
          </h2>
          <p className="text-xs text-gray-500 mt-1">Chọn khoản thu để xem trạng thái</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoadingKhoanThu ? (
            <div className="text-center py-4 text-gray-400">Đang tải...</div>
          ) : dsKhoanThu.map((kt: any) => {
            const isActive = activeKhoanThu && getCleanId(activeKhoanThu) === getCleanId(kt);
            return (
              <div
                key={getCleanId(kt)}
                onClick={() => setActiveKhoanThu(kt)}
                className={`group w-full p-4 rounded-xl transition-all border cursor-pointer relative ${isActive ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-bold ${isActive ? "text-blue-700" : "text-gray-700"}`}>{kt.tenKhoanThu}</span>
                  {isActive ? (
                       <CheckCircle size={16} className="text-blue-600" />
                  ) : (
                       /* 🟢 6. THÊM NÚT XÓA VÀO SIDEBAR (Chỉ hiện khi hover) */
                       <button
                            onClick={(e) => handleDeleteKhoanThu(e, kt)}
                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-all opacity-0 group-hover:opacity-100"
                            title="Xóa khoản thu này"
                       >
                            <Trash2 size={16} />
                       </button>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <DollarSign size={14} /> {Number(kt.soTien).toLocaleString()} VNĐ
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-8 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {activeKhoanThu ? activeKhoanThu.tenKhoanThu : "Quản lý thu phí"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Đang xem dữ liệu kỳ {selectedMonth}/{selectedYear}</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="outline-none font-medium text-gray-700 bg-transparent cursor-pointer">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
            <span className="text-gray-300">|</span>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="outline-none font-medium text-gray-700 bg-transparent cursor-pointer px-2">
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Hộ Gia Đình</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Số NK</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Phải Nộp</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Trạng Thái</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoadingHoKhau ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
                ) : (
                  dsHoKhau
                    .filter((hk: any) => {
                      const soNK = (hk.thanhVien?.length || 0);
                      const { tongTien } = calculateFee(hk);
                      return soNK > 0 && tongTien > 0;
                    })
                    .map((hk: any) => {
                      const hkId = getCleanId(hk);
                      const soNK = (hk.thanhVien?.length || 0);
                      const { tongTien } = calculateFee(hk);
                      const currentStatus = getSinglePaymentStatus(hk);

                      return (
                        <tr key={hkId} className={`transition-colors ${currentStatus === "Đã thu" ? "bg-green-50/20" : "hover:bg-gray-50"}`}>
                          <td className="p-4">
                            <div className="font-bold text-blue-600 text-sm">#{hkId.slice(-8).toUpperCase()}</div>
                            <div className="font-medium text-gray-800">{hk.chuHo?.hoTen}</div>
                            <div className="text-[10px] text-gray-400 truncate max-w-[200px]">{hk.diaChi?.soNha} {hk.diaChi?.duong}</div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold text-xs">{soNK}</span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="font-bold text-gray-700">{Number(tongTien).toLocaleString()} VNĐ</div>
                          </td>
                          <td className="p-4 text-center">
                            {currentStatus === "Đã thu" ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">Đã nộp</span>
                            ) : currentStatus === "Chưa thu" ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold">Đang nợ</span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs">Chưa nộp</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {currentStatus === "Đã thu" ? (
                              <CheckCircle className="mx-auto text-green-500" size={20} />
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  onClick={() => handleThuPhiLe(hk, "Đã thu")}
                                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-1"
                                >
                                  Thu Tiền
                                </button>
                                <button
                                  onClick={() => handleThuPhiLe(hk, "Chưa thu")}
                                  className="text-[10px] text-gray-400 hover:text-red-500 font-medium"
                                >
                                  Ghi nhận nợ
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
