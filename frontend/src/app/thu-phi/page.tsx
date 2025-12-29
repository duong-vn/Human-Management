"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllThuPhi,
  getKhoanThuBatBuoc,
  getKhoanThuTuNguyen,
  deletePhieuThu
} from "./api";
import {
  Search,
  Filter,
  User,
  CheckCircle,
  Clock,
  Wallet,
  Heart,
  TrendingUp,
  Eye,
  X,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function QuanLyThuPhi() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    type: "bat-buoc" | "tu-nguyen" | null;
    title: string;
    data: any[];
  }>({
    isOpen: false,
    type: null,
    title: "",
    data: [],
  });

  const { data: listBatBuocDef = [] } = useQuery({
    queryKey: ["khoan-thu-bat-buoc"],
    queryFn: async () => {
      const res = await getKhoanThuBatBuoc();
      return Array.isArray(res) ? res : res?.data || [];
    }
  });

  const { data: listTuNguyenDef = [] } = useQuery({
    queryKey: ["khoan-thu-tu-nguyen"],
    queryFn: async () => {
      const res = await getKhoanThuTuNguyen();
      return Array.isArray(res) ? res : res?.data || [];
    }
  });

  const { data: dsPhieuThu = [] } = useQuery({
    queryKey: ["thu-phi-history"],
    queryFn: async () => {
      const res = await getAllThuPhi();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await deletePhieuThu(id),
    onSuccess: () => {
        toast.success("Đã xóa phiếu thu thành công!");
        queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
    },
    onError: (err: any) => {
        toast.error("Lỗi xóa: " + (err.message || "Không xác định"));
    }
  });

  const handleDeletePhieu = (phieu: any) => {
      const id = phieu._id || phieu.id;
      toast("Xác nhận xóa phiếu thu?", {
          description: `Mã phiếu: ${phieu.maPhieuThu || "..."} - Chủ hộ: ${phieu.tenChuHo}. Dữ liệu sẽ mất vĩnh viễn.`,
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
  };

  const stats = useMemo(() => {
    let totalBatBuoc = 0;
    let totalTuNguyen = 0;

    const listDetailBatBuoc: any[] = [];
    const listDetailTuNguyen: any[] = [];

    const batBuocIds = new Set(listBatBuocDef.map((k: any) => k._id || k.id));
    const tuNguyenIds = new Set(listTuNguyenDef.map((k: any) => k._id || k.id));

    dsPhieuThu.forEach((pt: any) => {
        if (pt.trangThai === "Đã thu") {
            pt.chiTietThu?.forEach((detail: any) => {
                const amount = Number(detail.soTien) || 0;
                const kId = detail.khoanThuId;

                const detailItem = {
                    maPhieu: pt.maPhieuThu,
                    tenChuHo: pt.tenChuHo,
                    tenKhoanThu: detail.tenKhoanThu,
                    ngayThu: pt.ngayThu,
                    soTien: amount,
                    ghiChu: detail.ghiChu
                };

                if (batBuocIds.has(kId)) {
                    totalBatBuoc += amount;
                    listDetailBatBuoc.push(detailItem);
                } else if (tuNguyenIds.has(kId)) {
                    totalTuNguyen += amount;
                    listDetailTuNguyen.push(detailItem);
                }
            });
        }
    });

    listDetailBatBuoc.sort((a, b) => new Date(b.ngayThu).getTime() - new Date(a.ngayThu).getTime());
    listDetailTuNguyen.sort((a, b) => new Date(b.ngayThu).getTime() - new Date(a.ngayThu).getTime());

    return { totalBatBuoc, totalTuNguyen, listDetailBatBuoc, listDetailTuNguyen };
  }, [dsPhieuThu, listBatBuocDef, listTuNguyenDef]);


  const openModal = (type: "bat-buoc" | "tu-nguyen") => {
      setDetailModal({
          isOpen: true,
          type,
          title: type === "bat-buoc" ? "Chi tiết thu Phí Bắt Buộc" : "Chi tiết thu Đóng Góp / Ủng Hộ",
          data: type === "bat-buoc" ? stats.listDetailBatBuoc : stats.listDetailTuNguyen
      });
  };

  const filteredData = dsPhieuThu.filter((item: any) => {
    const term = searchTerm.toLowerCase();
    const matchName = item.tenChuHo?.toLowerCase().includes(term);
    const matchKy = item.kyThu?.toLowerCase().includes(term);
    const matchMonth = filterMonth ? item.kyThu?.includes(filterMonth) : true;
    return (matchName || matchKy) && matchMonth;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Thu Phí</h1>
          <p className="text-gray-500 text-sm mt-1">Lịch sử đóng góp và thu phí của cư dân</p>
        </div>
        <div className="flex gap-3">
            <Link href="/thu-phi/ve-sinh">
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all active:scale-95">
                    ⚙️ Phí Cố Định
                </button>
            </Link>
            <Link href="/thu-phi/dong-gop">
                <button className="px-4 py-2 bg-black text-white rounded-lg shadow-lg hover:bg-gray-800 font-medium transition-all active:scale-95">
                    ❤ Quỹ Đóng Góp
                </button>
            </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Bắt Buộc */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex justify-between items-start z-10">
                <div>
                    <p className="text-gray-500 text-sm font-semibold uppercase mb-1">Tổng thu Phí Bắt Buộc</p>
                    <h3 className="text-3xl font-bold text-blue-600">
                        {stats.totalBatBuoc.toLocaleString()} ₫
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <TrendingUp size={14} className="text-green-500"/> {stats.listDetailBatBuoc.length} giao dịch thành công
                    </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                    <Wallet size={32} />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 z-10">
                <button
                    onClick={() => openModal("bat-buoc")}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                    <Eye size={16}/> Xem chi tiết nguồn thu
                </button>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"/>
        </div>

        {/* Card Tự Nguyện */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex justify-between items-start z-10">
                <div>
                    <p className="text-gray-500 text-sm font-semibold uppercase mb-1">Tổng thu Đóng Góp / Ủng Hộ</p>
                    <h3 className="text-3xl font-bold text-red-500">
                        {stats.totalTuNguyen.toLocaleString()} ₫
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Heart size={14} className="text-red-500"/> {stats.listDetailTuNguyen.length} lượt quyên góp
                    </p>
                </div>
                <div className="p-4 bg-red-50 rounded-full text-red-500">
                    <Heart size={32} />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 z-10">
                <button
                    onClick={() => openModal("tu-nguyen")}
                    className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 hover:underline"
                >
                    <Eye size={16}/> Xem chi tiết nguồn thu
                </button>
            </div>
             <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-red-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"/>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            <input
                placeholder="Tìm kiếm phiếu thu..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
             <select
                className="pl-10 pr-8 py-2 border rounded-lg outline-none bg-white appearance-none cursor-pointer hover:bg-gray-50"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
             >
                 <option value="">Tất cả thời gian</option>
                 <option value="2024">Năm 2024</option>
                 <option value="2025">Năm 2025</option>
             </select>
         </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-semibold">
                <tr>
                    <th className="p-4">Mã Phiếu</th>
                    <th className="p-4">Hộ Khẩu / Chủ Hộ</th>
                    <th className="p-4">Kỳ Thu</th>
                    <th className="p-4">Chi Tiết</th>
                    <th className="p-4 text-right">Tổng Tiền</th>
                    <th className="p-4">Ngày Thu</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-center">Hành Động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {filteredData.map((item: any) => (
                    <tr key={item._id || item.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4 text-gray-400 font-mono">
                            #{ (item.maPhieuThu || item._id).slice(-6).toUpperCase() }
                        </td>
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <User size={14}/>
                                </div>
                                <span className="font-medium text-gray-700">{item.tenChuHo}</span>
                            </div>
                        </td>
                        <td className="p-4 text-gray-600">
                            {item.kyThu}
                        </td>
                        <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                                {item.chiTietThu?.map((ct: any, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 bg-gray-100 border rounded text-xs text-gray-600 truncate max-w-[150px]">
                                        {ct.tenKhoanThu}
                                    </span>
                                ))}
                            </div>
                        </td>
                        <td className="p-4 text-right font-bold text-green-600">
                            {Number(item.tongTien).toLocaleString()} ₫
                        </td>
                        <td className="p-4 text-gray-500">
                            {new Date(item.ngayThu).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="p-4 text-center">
                            {item.trangThai === "Đã thu" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                                    <CheckCircle size={12}/> Đã thu
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">
                                    <Clock size={12}/> Chờ thu
                                </span>
                            )}
                        </td>
                        <td className="p-4 text-center">
                            <button
                                onClick={() => handleDeletePhieu(item)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                title="Xóa phiếu thu này"
                            >
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
                <div className={`px-6 py-4 border-b flex justify-between items-center ${detailModal.type === "bat-buoc" ? "bg-blue-50" : "bg-red-50"} rounded-t-2xl`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${detailModal.type === "bat-buoc" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}>
                            {detailModal.type === "bat-buoc" ? <Wallet size={20}/> : <Heart size={20}/>}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{detailModal.title}</h3>
                            <p className="text-sm text-gray-500">{detailModal.data.length} giao dịch</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setDetailModal(prev => ({ ...prev, isOpen: false }))}
                        className="p-2 hover:bg-white/50 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-500"/>
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-500 font-semibold uppercase text-xs">
                            <tr>
                                <th className="p-3">Ngày thu</th>
                                <th className="p-3">Hộ nộp tiền</th>
                                <th className="p-3">Khoản thu</th>
                                <th className="p-3 text-right">Số tiền</th>
                                <th className="p-3">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {detailModal.data.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Chưa có dữ liệu.</td></tr>
                            ) : detailModal.data.map((row: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-3 text-gray-500 font-mono">
                                        {new Date(row.ngayThu).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="p-3 font-medium text-gray-800">
                                        {row.tenChuHo}
                                    </td>
                                    <td className="p-3 text-gray-600">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs border ${
                                            detailModal.type === "bat-buoc" ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-red-50 border-red-100 text-red-700"
                                        }`}>
                                            {row.tenKhoanThu}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right font-bold text-gray-800">
                                        {row.soTien.toLocaleString()} ₫
                                    </td>
                                    <td className="p-3 text-gray-400 text-xs italic truncate max-w-[150px]">
                                        {row.ghiChu || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
