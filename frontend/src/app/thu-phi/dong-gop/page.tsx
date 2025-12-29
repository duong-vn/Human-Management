"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllHoKhau,
  createPhieuThu,
  createKhoanThu,
  getAllThuPhi,
  updatePhieuThu,
  deleteKhoanThu,
  getKhoanThuTuNguyen
} from "../api";
import {
  Heart,
  Plus,
  ChevronDown,
  ChevronUp,
  User,
  CheckCircle,
  Clock,
  DollarSign,
  Trash2,
  X
} from "lucide-react";
import { toast } from "sonner";

export default function QuanLyDongGop() {
  const queryClient = useQueryClient();

  // State UI
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  // State Form
  const [newCampaignName, setNewCampaignName] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedHoKhauId, setSelectedHoKhauId] = useState("");
  const [donationAmount, setDonationAmount] = useState<number>(50000);
  const [donationNote, setDonationNote] = useState("");

  // Trạng thái UI thân thiện, khi gửi sẽ map lại
  const [donationStatus, setDonationStatus] = useState("Đã nộp");

  // 1. DATA FETCHING
  const { data: dsKhoanThu = [] } = useQuery({
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
    }
  });

  const { data: dsHoKhau = [] } = useQuery({
    queryKey: ["ho-khau"],
    queryFn: async () => {
      const res = await getAllHoKhau();
      return Array.isArray(res) ? res : [];
    },
  });

  // 2. DATA PROCESSING
  const campaigns = useMemo(() => {
    return dsKhoanThu.map((kt: any) => {
        const ktId = kt._id || kt.id;
        // Lọc ra các phiếu thu thuộc chiến dịch này
        const donations = dsPhieuThu.filter((pt: any) =>
            pt.chiTietThu?.some((detail: any) => detail.khoanThuId === ktId)
        );

        // 🟢 THỐNG KÊ: Tiền thực nhận (Đã thu)
        const totalMoney = donations.reduce((sum: number, pt: any) => {
            if (pt.trangThai !== "Đã thu") return sum;
            const detail = pt.chiTietThu.find((d: any) => d.khoanThuId === ktId);
            return sum + (Number(detail?.soTien) || 0);
        }, 0);

        // 🟢 THỐNG KÊ: Tiền cam kết (Chưa thu)
        const pendingMoney = donations.reduce((sum: number, pt: any) => {
            if (pt.trangThai !== "Chưa thu") return sum;
            const detail = pt.chiTietThu.find((d: any) => d.khoanThuId === ktId);
            return sum + (Number(detail?.soTien) || 0);
        }, 0);

        return { ...kt, donations, totalMoney, pendingMoney };
    }).sort((a: any, b: any) => b.totalMoney - a.totalMoney);
  }, [dsKhoanThu, dsPhieuThu]);


  // 3. MUTATIONS
  const createCampaignMutation = useMutation({
    mutationFn: async () => await createKhoanThu({
        tenKhoanThu: newCampaignName,
        soTien: 0,
        loaiKhoanThu: "Tự nguyện",
        moTa: "Chiến dịch quyên góp tự nguyện",
        ngayBatDau: new Date().toISOString()
    }),
    onSuccess: () => {
        toast.success("Tạo chiến dịch thành công!");
        setIsCreateCampaignOpen(false);
        setNewCampaignName("");
        queryClient.invalidateQueries({ queryKey: ["khoan-thu-tu-nguyen"] });
    }
  });

  const donateMutation = useMutation({
    mutationFn: async () => {
        const hk = dsHoKhau.find((h: any) => (h._id || h.id) === selectedHoKhauId);
        if(!hk) throw new Error("Chưa chọn hộ khẩu");

        const payload = {
            hoKhauId: hk._id || hk.id,
            maPhieuThu: `DG-${selectedCampaign.tenKhoanThu.slice(0,3).toUpperCase()}-${Date.now()}`,
            tenChuHo: hk.chuHo?.hoTen,
            diaChi: (hk.diaChi?.soNha || "") + " " + (hk.diaChi?.duong || ""),
            soNhanKhau: Number(hk.soNhanKhau || 1),
            nam: new Date().getFullYear(),
            kyThu: `Đợt: ${selectedCampaign.tenKhoanThu}`,
            ngayThu: new Date().toISOString(),
            // 🟢 MAP TRẠNG THÁI: Để khớp DB
            trangThai: donationStatus === "Đã nộp" ? "Đã thu" : "Chưa thu",
            chiTietThu: [{
                khoanThuId: selectedCampaign._id || selectedCampaign.id,
                tenKhoanThu: selectedCampaign.tenKhoanThu,
                soTien: Number(donationAmount),
                ghiChu: donationNote
            }],
            tongTien: Number(donationAmount)
        };
        return await createPhieuThu(payload);
    },
    onSuccess: () => {
        toast.success("Ghi nhận đóng góp thành công!");
        setIsDonateModalOpen(false);
        setSelectedHoKhauId("");
        setDonationAmount(50000);
        setDonationStatus("Đã nộp");
        queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
    },
    onError: (err: any) => toast.error("Lỗi: " + (err.response?.data?.message || err.message))
  });

  const payMutation = useMutation({
    mutationFn: async (id: string) => {
        return await updatePhieuThu(id, {
          trangThai: "Đã thu",
          ngayThu: new Date().toISOString(),
          ghiChu: "Đã xác nhận nộp tiền đóng góp"
        });
    },
    onSuccess: () => {
        toast.success("Xác nhận nộp tiền thành công!");
        queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => await deleteKhoanThu(id),
    onSuccess: () => {
      toast.success("Đã xóa chiến dịch thành công!");
      queryClient.invalidateQueries({ queryKey: ["khoan-thu-tu-nguyen"] });
    }
  });

  // 4. HANDLERS
  const handleDeleteCampaign = (id: string, hasDonations: boolean) => {
    toast(hasDonations ? "Chiến dịch này đã có dữ liệu đóng góp. Vẫn xóa?" : "Xác nhận xóa chiến dịch?", {
      description: "Mọi phiếu thu liên quan sẽ không còn được thống kê vào chiến dịch này.",
      action: { label: "Xóa", onClick: () => deleteCampaignMutation.mutate(id) },
      cancel: { label: "Hủy", onClick: () => {} },
    });
  };

  const handleConfirmPay = (pId: string) => {
    toast("Xác nhận hộ đã nộp tiền mặt/chuyển khoản?", {
        action: { label: "Xác nhận", onClick: () => payMutation.mutate(pId) },
        cancel: { label: "Hủy", onClick: () => {} },
    });
  }

  const toggleExpand = (id: string) => setExpandedCampaignId(prev => prev === id ? null : id);
  const openDonateModal = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsDonateModalOpen(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Heart className="text-red-500 fill-red-500" /> Quản Lý Đóng Góp
            </h1>
            <p className="text-gray-500 text-sm mt-1">Vận động và tiếp nhận quyên góp tự nguyện cho cộng đồng</p>
        </div>
        <button
            onClick={() => setIsCreateCampaignOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 transition-all active:scale-95"
        >
            <Plus size={20}/> Tạo Chiến Dịch
        </button>
      </div>

      {/* LIST CAMPAIGNS */}
      <div className="space-y-4">
        {campaigns.map((camp: any) => {
            const isExpanded = expandedCampaignId === (camp._id || camp.id);
            const campId = camp._id || camp.id;
            const hasDonations = camp.donations.length > 0;

            return (
                <div key={campId} className={`bg-white rounded-xl border transition-all overflow-hidden ${isExpanded ? "ring-2 ring-red-100 border-red-200 shadow-md" : "border-gray-200"}`}>
                    <div onClick={() => toggleExpand(campId)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 select-none group">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isExpanded ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                                <Heart size={24} className={isExpanded ? "fill-red-600" : ""}/>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors">{camp.tenKhoanThu}</h3>
                                <p className="text-xs text-gray-500">{camp.donations.length} lượt tương tác</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                             {camp.pendingMoney > 0 && (
                                <div className="text-right hidden md:block">
                                    <p className="text-[10px] text-orange-500 uppercase font-bold">Chưa nộp (Cam kết)</p>
                                    <p className="text-sm font-bold text-orange-400">
                                        {camp.pendingMoney.toLocaleString()} ₫
                                    </p>
                                </div>
                             )}
                             <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Tổng thực nhận</p>
                                <p className="text-xl font-bold text-red-600">{camp.totalMoney.toLocaleString()} ₫</p>
                            </div>

                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(campId, hasDonations); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                                    <Trash2 size={18} />
                                </button>
                                {isExpanded ? <ChevronUp className="text-gray-400"/> : <ChevronDown className="text-gray-400"/>}
                            </div>
                        </div>
                    </div>

                    {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><User size={18}/> Danh sách đóng góp</h4>
                                <button onClick={(e) => { e.stopPropagation(); openDonateModal(camp); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow flex items-center gap-2">
                                    <Plus size={16}/> Ghi nhận mới
                                </button>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-gray-100 text-gray-500 font-semibold uppercase text-[10px]">
                                        <tr>
                                            <th className="p-3">Hộ đóng góp</th>
                                            <th className="p-3">Ngày ghi nhận</th>
                                            <th className="p-3 text-center">Trạng thái</th>
                                            <th className="p-3 text-right">Số tiền</th>
                                            <th className="p-3 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {camp.donations.length === 0 ? (
                                            <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">Chưa có hộ gia đình nào đóng góp cho chiến dịch này</td></tr>
                                        ) : camp.donations.map((d: any, idx: number) => {
                                            const detail = d.chiTietThu.find((x:any) => x.khoanThuId === campId);
                                            const isPaid = d.trangThai === "Đã thu";
                                            return (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 font-medium text-gray-800">{d.tenChuHo}</td>
                                                    <td className="p-3 text-gray-500">{new Date(d.ngayThu).toLocaleDateString("vi-VN")}</td>
                                                    <td className="p-3 text-center">
                                                        {isPaid ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-200">
                                                                <CheckCircle size={10}/> Đã thu
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold border border-orange-200">
                                                                <Clock size={10}/> Chưa nộp
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={`p-3 text-right font-bold ${isPaid ? "text-gray-700" : "text-orange-500"}`}>
                                                        {Number(detail?.soTien).toLocaleString()} ₫
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        {!isPaid && (
                                                            <button onClick={() => handleConfirmPay(d._id || d.id)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded shadow-sm">
                                                                Xác nhận đã thu tiền
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            );
        })}
      </div>

      {/* MODAL TẠO CHIẾN DỊCH */}
      {isCreateCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Tạo Chiến Dịch Mới</h3>
                    <button onClick={() => setIsCreateCampaignOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên chiến dịch</label>
                    <input autoFocus type="text" value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)} placeholder="VD: Quỹ Vì Người Nghèo 2024..." className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setIsCreateCampaignOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                    <button onClick={() => createCampaignMutation.mutate()} disabled={!newCampaignName} className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50 font-bold">Tạo Ngay</button>
                </div>
             </div>
        </div>
      )}

      {/* MODAL ĐÓNG GÓP */}
      {isDonateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95">
                <h3 className="text-2xl font-bold mb-6 text-red-600">{selectedCampaign?.tenKhoanThu}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Hộ gia đình ủng hộ (*)</label>
                        <select className="w-full border p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-red-500" value={selectedHoKhauId} onChange={(e) => setSelectedHoKhauId(e.target.value)}>
                            <option value="">-- Chọn hộ khẩu --</option>
                            {dsHoKhau.map((hk:any) => (
                                <option key={hk._id || hk.id} value={hk._id || hk.id}>{hk.maHoKhau} - {hk.chuHo?.hoTen}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Số tiền đóng góp (₫)</label>
                        <input type="number" className="w-full border-2 border-red-100 p-3 rounded-lg text-2xl font-bold text-red-600 outline-none focus:border-red-500" value={donationAmount} onChange={(e) => setDonationAmount(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái nộp tiền</label>
                        <div className="flex gap-4">
                            <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer has-[:checked]:bg-green-50 has-[:checked]:border-green-500 transition-all">
                                <input type="radio" name="status" value="Đã nộp" checked={donationStatus === "Đã nộp"} onChange={(e) => setDonationStatus(e.target.value)} className="w-4 h-4 accent-green-600" />
                                <span className="font-bold text-green-700 text-sm">Đã nộp tiền</span>
                            </label>
                            <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer has-[:checked]:bg-orange-50 has-[:checked]:border-orange-500 transition-all">
                                <input type="radio" name="status" value="Chưa nộp" checked={donationStatus === "Chưa nộp"} onChange={(e) => setDonationStatus(e.target.value)} className="w-4 h-4 accent-orange-600" />
                                <span className="font-bold text-orange-700 text-sm">Chưa nộp</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú</label>
                        <textarea rows={2} className="w-full border p-3 rounded-lg outline-none focus:ring-1 focus:ring-gray-300" value={donationNote} onChange={(e) => setDonationNote(e.target.value)} placeholder="Nhập lời nhắn hoặc ghi chú ủng hộ..."></textarea>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                    <button onClick={() => setIsDonateModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl">Đóng</button>
                    <button onClick={() => donateMutation.mutate()} disabled={!selectedHoKhauId || donationAmount <= 0} className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg disabled:opacity-50">Xác nhận</button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
}
