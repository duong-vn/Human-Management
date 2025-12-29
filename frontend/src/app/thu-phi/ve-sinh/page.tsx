"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllHoKhau,
  createPhieuThu,
  getKhoanThuBatBuoc,
  getAllThuPhi,
  deleteKhoanThu // 👈 1. Import hàm xóa
} from "../api";
import {
  User,
  CheckCircle,
  DollarSign,
  Calendar,
  Layers,
  Trash2, // 👈 2. Import icon thùng rác
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function QuanLyCacKhoanThu() {
  const queryClient = useQueryClient();

  // State thời gian
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [activeKhoanThu, setActiveKhoanThu] = useState<any>(null);

  // 1. Lấy danh sách hộ khẩu
  const { data: dsHoKhau = [], isLoading: isLoadingHoKhau } = useQuery({
    queryKey: ["ho-khau"],
    queryFn: async () => {
      const res = await getAllHoKhau();
      return Array.isArray(res) ? res : [];
    },
  });

  // 2. Lấy danh sách khoản thu bắt buộc
  const { data: dsKhoanThu = [], isLoading: isLoadingKhoanThu } = useQuery({
    queryKey: ["khoan-thu-bat-buoc"],
    queryFn: async () => {
      const res = await getKhoanThuBatBuoc();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  // Tự động chọn khoản thu đầu tiên
  useEffect(() => {
    if (!activeKhoanThu && dsKhoanThu.length > 0) {
      setActiveKhoanThu(dsKhoanThu[0]);
    }
  }, [dsKhoanThu, activeKhoanThu]);

  // 3. Lấy lịch sử thu phí
  const { data: dsPhieuThu = [] } = useQuery({
    queryKey: ["thu-phi-history"],
    queryFn: async () => {
      const res = await getAllThuPhi();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  // Mutation Thu Phí
  const thuPhiMutation = useMutation({
    mutationFn: async (payload: any) => await createPhieuThu(payload),
    onSuccess: () => {
      toast.success("Thu phí thành công!");
      queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err.message || "Có lỗi xảy ra";
      toast.error("Lỗi: " + (Array.isArray(msg) ? msg.join(", ") : msg));
    },
  });

  // 👇 4. MUTATION XÓA KHOẢN THU
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await deleteKhoanThu(id),
    onSuccess: () => {
        toast.success("Đã xóa khoản thu thành công!");
        queryClient.invalidateQueries({ queryKey: ["khoan-thu-bat-buoc"] });
        // Nếu đang chọn khoản vừa xóa thì reset
        if (activeKhoanThu) setActiveKhoanThu(null);
    },
    onError: (err: any) => toast.error("Không thể xóa: " + err.message)
  });

  // 👇 5. HÀM XỬ LÝ XÓA
  const handleDeleteKhoanThu = (e: React.MouseEvent, kt: any) => {
      e.stopPropagation(); // Quan trọng: Ngăn không cho sự kiện click lan ra ngoài (để không bị chọn khoản thu khi bấm xóa)

      const id = kt._id || kt.id;

      toast("Bạn có chắc muốn xóa?", {
          description: `Khoản thu: ${kt.tenKhoanThu}. Hành động này không thể hoàn tác.`,
          action: {
              label: "Xóa ngay",
              onClick: () => deleteMutation.mutate(id)
          },
          cancel: {
              label: "Hủy",
              onClick: () => {}
          },
          duration: 5000
      });
  }

  // --- HÀM KIỂM TRA LOGIC TÍNH PHÍ ---
  const calculateFee = (hoKhau: any) => {
    if (!activeKhoanThu) return { tongTien: 0, kyThuLabel: "", ghiChu: "" };

    const donGia = Number(activeKhoanThu.soTien || 0);
    const tenKhoan = activeKhoanThu.tenKhoanThu?.toLowerCase() || "";

    if (tenKhoan.includes("vệ sinh")) {
        return {
            tongTien: donGia * 12,
            kyThuLabel: `Năm ${selectedYear}`,
            ghiChu: `Thu phí vệ sinh cả năm ${selectedYear} (1 hộ)`
        };
    }

    const soNhanKhau = hoKhau.soNhanKhau || hoKhau.nhanKhau?.length || 1;
    return {
        tongTien: donGia * soNhanKhau,
        kyThuLabel: `Tháng ${selectedMonth}/${selectedYear}`,
        ghiChu: `${soNhanKhau} người x ${donGia.toLocaleString()}đ`
    };
  };

  const checkDaDong = (hoKhauId: string, kyThuLabel: string) => {
    if (!activeKhoanThu) return false;

    return dsPhieuThu.some((pt: any) => {
      const ptHoKhauId = pt.hoKhauId?._id || pt.hoKhauId?.id || pt.hoKhauId;
      const isMatchHoKhau = ptHoKhauId === hoKhauId;
      const isMatchKyThu = pt.kyThu === kyThuLabel;
      const isMatchKhoanThu = pt.chiTietThu?.some((ct: any) =>
         ct.khoanThuId === (activeKhoanThu._id || activeKhoanThu.id)
      );
      return isMatchHoKhau && isMatchKyThu && isMatchKhoanThu && pt.trangThai === "Đã thu";
    });
  };

  const handleThuNhanh = (hoKhau: any) => {
    if (!activeKhoanThu) return toast.error("Chưa chọn khoản thu!");

    const { tongTien, kyThuLabel, ghiChu } = calculateFee(hoKhau);
    const realId = activeKhoanThu._id || activeKhoanThu.id;

    const dc = hoKhau.diaChi || hoKhau.diaChiThuongTru;
    let diaChiString = "Chưa cập nhật";
    if (dc) {
      diaChiString = `${dc.soNha ? "Số " + dc.soNha + ", " : ""}${
        dc.duong ? "Đường " + dc.duong + ", " : ""
      }${dc.phuongXa || ""}`;
    }

    const payload = {
      hoKhauId: hoKhau._id || hoKhau.id,
      maPhieuThu: `FEE-${realId.slice(-4)}-${kyThuLabel.replace(/ /g,'')}-${hoKhau._id.slice(-4)}-${Date.now()}`,
      tenChuHo: hoKhau.chuHo?.hoTen || "Chủ hộ không xác định",
      diaChi: diaChiString,
      soNhanKhau: Number(hoKhau.soNhanKhau || 1),
      nam: Number(selectedYear),
      kyThu: kyThuLabel,
      ngayThu: new Date().toISOString(),
      trangThai: "Đã thu",
      chiTietThu: [
        {
          khoanThuId: realId,
          tenKhoanThu: activeKhoanThu.tenKhoanThu,
          soTien: Number(tongTien),
          ghiChu: ghiChu,
        },
      ],
      tongTien: Number(tongTien),
    };

    toast(`Thu phí: ${activeKhoanThu.tenKhoanThu}`, {
      description: `Hộ: ${hoKhau.chuHo?.hoTen}. Tổng: ${tongTien.toLocaleString()}đ (${kyThuLabel})`,
      action: {
        label: "Xác nhận",
        onClick: () => thuPhiMutation.mutate(payload),
      },
      cancel: { label: "Hủy", onClick: () => {} },
      duration: 5000,
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* SIDEBAR: DANH SÁCH KHOẢN THU */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Layers className="text-blue-600"/> Các Khoản Thu
            </h2>
            <p className="text-xs text-gray-500 mt-1">Danh sách các loại phí cố định</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoadingKhoanThu ? (
                <div className="text-center text-sm text-gray-400 py-4">Đang tải...</div>
            ) : dsKhoanThu.map((kt: any) => {
                const isActive = activeKhoanThu && (activeKhoanThu._id || activeKhoanThu.id) === (kt._id || kt.id);
                return (
                    <div
                        key={kt._id || kt.id}
                        onClick={() => setActiveKhoanThu(kt)}
                        className={`group w-full text-left p-4 rounded-xl transition-all border cursor-pointer relative ${
                            isActive
                            ? "bg-blue-50 border-blue-200 shadow-sm"
                            : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`font-bold ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                                {kt.tenKhoanThu}
                            </span>
                            {isActive && <CheckCircle size={16} className="text-blue-600"/>}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                             <DollarSign size={14}/>
                             {Number(kt.soTien).toLocaleString()} đ
                        </div>

                        {/* 👇 NÚT XÓA: Chỉ hiện khi Hover vào */}
                        <button
                            onClick={(e) => handleDeleteKhoanThu(e, kt)}
                            className="absolute right-3 bottom-3 p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Xóa khoản thu này"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )
            })}

            {dsKhoanThu.length === 0 && (
                <div className="text-center p-4 text-gray-400 text-sm">
                    Chưa có khoản thu nào.
                </div>
            )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        <div className="p-8 pb-4 flex justify-between items-end">
             <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {activeKhoanThu ? activeKhoanThu.tenKhoanThu : "Chọn khoản thu"}
                </h1>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                    {activeKhoanThu?.tenKhoanThu.toLowerCase().includes("vệ sinh") ? (
                        <>
                            <User size={14}/> Thu theo hộ •
                            Đơn giá: <span className="font-bold text-gray-700">{Number(activeKhoanThu?.soTien).toLocaleString()} đ / tháng</span>
                            • <span className="font-bold text-green-600">Thu cả năm</span>
                        </>
                    ) : (
                        <>
                            <User size={14}/> Thu theo đầu người • Đơn giá:
                            <span className="font-bold text-gray-700">{activeKhoanThu ? Number(activeKhoanThu.soTien).toLocaleString() : 0} đ</span>
                        </>
                    )}
                </p>
             </div>

             <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
                {!activeKhoanThu?.tenKhoanThu.toLowerCase().includes("vệ sinh") && (
                    <>
                        <Calendar size={18} className="text-gray-500" />
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="outline-none font-medium text-gray-700 bg-transparent cursor-pointer"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>Tháng {m}</option>
                            ))}
                        </select>
                        <span className="text-gray-300">|</span>
                    </>
                )}

                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="outline-none font-medium text-gray-700 bg-transparent cursor-pointer px-2"
                >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                </select>
            </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                    <tr>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Mã Hộ</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Chủ Hộ</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Số NK</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Phải Thu</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Trạng Thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {!activeKhoanThu ? (
                         <tr><td colSpan={5} className="p-8 text-center text-gray-400">Vui lòng chọn một khoản thu bên trái</td></tr>
                    ) : isLoadingHoKhau ? (
                         <tr><td colSpan={5} className="p-8 text-center">Đang tải dữ liệu...</td></tr>
                    ) : (
                        dsHoKhau.map((hk: any) => {
                            const hkId = hk._id || hk.id;
                            const soNK = hk.soNhanKhau || hk.nhanKhau?.length || 1;
                            const { tongTien, kyThuLabel } = calculateFee(hk);
                            const daDongTien = checkDaDong(hkId, kyThuLabel);

                            return (
                                <tr key={hkId} className={`transition-colors ${daDongTien ? "bg-green-50/50" : "hover:bg-gray-50"}`}>
                                    <td className="p-4 font-medium text-blue-600">
                                        #{hk.maHoKhau}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800">{hk.chuHo?.hoTen || "Trống"}</div>
                                        <div className="text-xs text-gray-400 truncate max-w-[200px]">
                                            {hk.diaChi?.soNha} {hk.diaChi?.duong}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
                                            {soNK}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-gray-700">
                                        {tongTien.toLocaleString()} ₫
                                    </td>
                                    <td className="p-4 text-center">
                                        {daDongTien ? (
                                            <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold shadow-sm">
                                                <CheckCircle size={16} /> Đã thu
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleThuNhanh(hk)}
                                                disabled={thuPhiMutation.isPending}
                                                className="group flex items-center gap-2 mx-auto px-3 py-1.5 bg-white border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95"
                                            >
                                                <DollarSign size={16} /> Thu Nhanh
                                            </button>
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
