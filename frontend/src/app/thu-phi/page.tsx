"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllThuPhi,
  getKhoanThuBatBuoc,
  getKhoanThuTuNguyen,
  deletePhieuThu,
  createKhoanThu
} from "./api";
import {
  Search,
  CheckCircle,
  Clock,
  Wallet,
  Heart,
  Eye,
  X,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export default function QuanLyThuPhi() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<"Bắt buộc" | "Tự nguyện">("Bắt buộc");

  const [formData, setFormData] = useState({
    tenKhoanThu: "",
    soTien: "",
    ngayBatDau: new Date().toISOString().split('T')[0]
  });

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    type: "bat-buoc" | "tu-nguyen" | "dang-no" | null;
    title: string;
    data: any[];
  }>({
    isOpen: false,
    type: null,
    title: "",
    data: [],
  });

  // 1. DATA FETCHING
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

  // Hàm bổ trợ xử lý ID
  const getCleanId = (obj: any) => {
    if (!obj) return "";
    return typeof obj === "string" ? obj : (obj._id || obj.id || String(obj));
  };

  // 2. MUTATIONS
  const createKhoanThuMutation = useMutation({
    mutationFn: async (payload: any) => await createKhoanThu(payload),
    onSuccess: () => {
        toast.success("Đã thêm khoản thu mới thành công!");
        queryClient.invalidateQueries({ queryKey: ["khoan-thu-bat-buoc"] });
        queryClient.invalidateQueries({ queryKey: ["khoan-thu-tu-nguyen"] });
        setIsAddModalOpen(false);
        setFormData({ tenKhoanThu: "", soTien: "", ngayBatDau: new Date().toISOString().split('T')[0] });
    },
    onError: (err: any) => toast.error("Lỗi: " + (err.response?.data?.message || err.message))
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

  // 3. HANDLERS
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

  const handleOpenAdd = (type: "Bắt buộc" | "Tự nguyện") => {
    setAddType(type);
    setIsAddModalOpen(true);
  };

  const handleConfirmAdd = () => {
    if (!formData.tenKhoanThu) return toast.error("Vui lòng nhập tên khoản thu");
    if (addType === "Bắt buộc" && !formData.soTien) return toast.error("Vui lòng nhập số tiền");

    createKhoanThuMutation.mutate({
        tenKhoanThu: formData.tenKhoanThu,
        soTien: addType === "Bắt buộc" ? Number(formData.soTien) : 0,
        loaiKhoanThu: addType,
        ngayBatDau: new Date(formData.ngayBatDau).toISOString()
    });
  };

  // 4. LOGIC THỐNG KÊ (FIX: TRỪ NỢ KHI ĐÃ NỘP TIỀN)
  const stats = useMemo(() => {
    let totalBatBuoc = 0;
    let totalTuNguyen = 0;
    let totalDangNo = 0;
    const listDetailBatBuoc: any[] = [];
    const listDetailTuNguyen: any[] = [];
    const listDetailDangNo: any[] = [];

    const batBuocIds = new Set(listBatBuocDef.map((k: any) => getCleanId(k)));
    const tuNguyenIds = new Set(listTuNguyenDef.map((k: any) => getCleanId(k)));

    // BƯỚC 1: Thu thập tất cả các khoản đã nộp thành công (Hộ + Khoản + Kỳ)
    const daNopKeys = new Set();
    dsPhieuThu.forEach((pt: any) => {
      if (pt.trangThai === "Đã thu") {
        pt.chiTietThu?.forEach((detail: any) => {
          const key = `${getCleanId(pt.hoKhauId)}-${getCleanId(detail.khoanThuId)}-${pt.kyThu}`;
          daNopKeys.add(key);
        });
      }
    });

    // BƯỚC 2: Duyệt danh sách phiếu để tính toán thực thu và nợ còn lại
    dsPhieuThu.forEach((pt: any) => {
        pt.chiTietThu?.forEach((detail: any) => {
            const amount = Number(detail.soTien) || 0;
            const kId = getCleanId(detail.khoanThuId);
            const hkId = getCleanId(pt.hoKhauId);
            const currentKey = `${hkId}-${kId}-${pt.kyThu}`;

            const detailItem = {
                maPhieu: pt.maPhieuThu,
                tenChuHo: pt.tenChuHo,
                tenKhoanThu: detail.tenKhoanThu,
                ngayThu: pt.ngayThu,
                soTien: amount,
                ghiChu: detail.ghiChu
            };

            if (pt.trangThai === "Đã thu") {
                if (batBuocIds.has(kId)) {
                    totalBatBuoc += amount;
                    listDetailBatBuoc.push(detailItem);
                } else if (tuNguyenIds.has(kId)) {
                    totalTuNguyen += amount;
                    listDetailTuNguyen.push(detailItem);
                }
            }
            // 🟢 FIX LỖI: Chỉ tính vào NỢ nếu chưa tồn tại bất kỳ phiếu ĐÃ THU nào cho khoản này
            else if (pt.trangThai === "Chưa thu" && !daNopKeys.has(currentKey)) {
                totalDangNo += amount;
                listDetailDangNo.push(detailItem);
            }
        });
    });

    listDetailBatBuoc.sort((a, b) => new Date(b.ngayThu).getTime() - new Date(a.ngayThu).getTime());
    listDetailTuNguyen.sort((a, b) => new Date(b.ngayThu).getTime() - new Date(a.ngayThu).getTime());
    listDetailDangNo.sort((a, b) => new Date(b.ngayThu).getTime() - new Date(a.ngayThu).getTime());

    return { totalBatBuoc, totalTuNguyen, totalDangNo, listDetailBatBuoc, listDetailTuNguyen, listDetailDangNo };
  }, [dsPhieuThu, listBatBuocDef, listTuNguyenDef]);

  const openModal = (type: "bat-buoc" | "tu-nguyen" | "dang-no") => {
      const titles = {
          "bat-buoc": "Chi tiết thu Phí Bắt Buộc",
          "tu-nguyen": "Chi tiết thu Đóng Góp / Ủng Hộ",
          "dang-no": "Chi tiết các khoản đang nợ"
      };
      const datas = {
          "bat-buoc": stats.listDetailBatBuoc,
          "tu-nguyen": stats.listDetailTuNguyen,
          "dang-no": stats.listDetailDangNo
      };

      setDetailModal({
          isOpen: true,
          type: type as any,
          title: titles[type],
          data: datas[type]
      });
  };

  const filteredData = dsPhieuThu.filter((item: any) => {
    const term = searchTerm.toLowerCase();
    const matchName = item.tenChuHo?.toLowerCase().includes(term);
    const matchKy = item.kyThu?.toLowerCase().includes(term);
    return (matchName || matchKy);
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
            <button onClick={() => handleOpenAdd("Bắt buộc")} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 font-medium transition-all active:scale-95 flex items-center gap-2">
                <Plus size={18}/> Phí Cố Định
            </button>
            <button onClick={() => handleOpenAdd("Tự nguyện")} className="px-4 py-2 bg-rose-500 text-white rounded-lg shadow-lg hover:bg-rose-600 font-medium transition-all active:scale-95 flex items-center gap-2">
                <Heart size={18}/> Quỹ Đóng Góp
            </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-gray-500 text-sm font-semibold uppercase mb-1">Thực thu Phí Cố Định</p>
                      <h3 className="text-2xl font-bold text-blue-600">{stats.totalBatBuoc.toLocaleString()} VNĐ</h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Wallet size={24} /></div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => openModal("bat-buoc")} className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:underline"><Eye size={14}/> Xem chi tiết</button>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-gray-500 text-sm font-semibold uppercase mb-1">Thực thu Đóng Góp</p>
                      <h3 className="text-2xl font-bold text-rose-500">{stats.totalTuNguyen.toLocaleString()} VNĐ</h3>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-full text-rose-500"><Heart size={24} /></div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => openModal("tu-nguyen")} className="flex items-center gap-2 text-xs font-medium text-rose-600 hover:underline"><Eye size={14}/> Xem chi tiết</button>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-gray-500 text-sm font-semibold uppercase mb-1">Chưa thu</p>
                      <h3 className="text-2xl font-bold text-orange-500">{stats.totalDangNo.toLocaleString()} VNĐ</h3>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-full text-orange-500"><Clock size={24} /></div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => openModal("dang-no")} className="flex items-center gap-2 text-xs font-medium text-orange-600 hover:underline"><Eye size={14}/> Xem danh sách nợ</button>
              </div>
          </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            <input placeholder="Tìm kiếm phiếu thu theo tên chủ hộ hoặc kỳ thu..." className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-semibold">
                <tr>
                    <th className="p-4">Mã Phiếu</th>
                    <th className="p-4">Chủ Hộ</th>
                    <th className="p-4">Kỳ Thu</th>
                    <th className="p-4">Nội dung thu</th>
                    <th className="p-4 text-right">Tổng Tiền</th>
                    <th className="p-4">Ngày Thu</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-center">Hành Động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {filteredData.length === 0 ? (
                    <tr><td colSpan={8} className="p-8 text-center text-gray-400">Không tìm thấy phiếu thu nào</td></tr>
                ) : filteredData.map((item: any) => (
                    <tr key={item._id || item.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4 text-gray-400 font-mono text-xs">#{ (item.maPhieuThu || item._id).slice(-8).toUpperCase() }</td>
                        <td className="p-4 font-medium text-gray-700">{item.tenChuHo}</td>
                        <td className="p-4 text-gray-600">{item.kyThu}</td>
                        <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                                {item.chiTietThu?.map((ct: any, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 bg-gray-100 border rounded text-[10px] text-gray-600">
                                        {ct.tenKhoanThu}
                                    </span>
                                ))}
                            </div>
                        </td>
                        <td className={`p-4 text-right font-bold ${item.trangThai === "Đã thu" ? "text-green-600" : "text-orange-500"}`}>
                            {Number(item.tongTien).toLocaleString()} VNĐ
                        </td>
                        <td className="p-4 text-gray-500">{new Date(item.ngayThu).toLocaleDateString("vi-VN")}</td>
                        <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.trangThai === "Đã thu" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                                {item.trangThai === "Đã thu" ? <CheckCircle size={12}/> : <Clock size={12}/>} {item.trangThai}
                            </span>
                        </td>
                        <td className="p-4 text-center">
                            <button onClick={() => handleDeletePhieu(item)} className="p-2 text-gray-400 hover:text-red-600 rounded-full transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM KHOẢN THU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Thêm {addType === "Bắt buộc" ? "Phí Cố Định" : "Quỹ Đóng Góp"}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={24}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên khoản thu (*)</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.tenKhoanThu} onChange={e => setFormData({...formData, tenKhoanThu: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày bắt đầu hiệu lực (*)</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.ngayBatDau} onChange={e => setFormData({...formData, ngayBatDau: e.target.value})} />
              </div>
              {addType === "Bắt buộc" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Số tiền cố định (VNĐ)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.soTien} onChange={e => setFormData({...formData, soTien: e.target.value})} />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg">Hủy</button>
                <button onClick={handleConfirmAdd} disabled={createKhoanThuMutation.isPending} className={`flex-1 py-2 text-white rounded-lg font-bold ${addType === "Bắt buộc" ? "bg-blue-600" : "bg-rose-500"}`}>
                  {createKhoanThuMutation.isPending ? "Đang tạo..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                <div className={`px-6 py-4 border-b flex justify-between items-center ${detailModal.type === "bat-buoc" ? "bg-blue-50" : detailModal.type === "dang-no" ? "bg-orange-50" : "bg-rose-50"} rounded-t-2xl`}>
                    <h3 className="text-lg font-bold text-gray-800">{detailModal.title}</h3>
                    <button onClick={() => setDetailModal(prev => ({ ...prev, isOpen: false }))} className="p-2 hover:bg-white/50 rounded-full"><X size={24}/></button>
                </div>
                <div className="overflow-y-auto p-6">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 text-gray-500 font-semibold uppercase">
                            <tr><th className="p-3">Ngày</th><th className="p-3">Chủ hộ</th><th className="p-3">Khoản thu</th><th className="p-3 text-right">Số tiền</th><th className="p-3 text-center">Ghi chú</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {detailModal.data.map((row: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-3 text-gray-500">{new Date(row.ngayThu).toLocaleDateString("vi-VN")}</td>
                                    <td className="p-3 font-medium text-gray-800">{row.tenChuHo}</td>
                                    <td className="p-3 text-gray-600">{row.tenKhoanThu}</td>
                                    <td className="p-3 text-right font-bold">{row.soTien.toLocaleString()} VNĐ</td>
                                    <td className="p-3 text-gray-400 italic text-center">{row.ghiChu || "-"}</td>
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
