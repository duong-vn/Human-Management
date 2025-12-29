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
  getKhoanThuTuNguyen // 👈 QUAN TRỌNG: Đảm bảo đã có hàm này trong api.ts
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
  Trash2
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
  const [donationStatus, setDonationStatus] = useState("Đã thu");

  // 1. DATA FETCHING

  // 👇 SỬA LẠI: Lấy danh sách khoản thu TỰ NGUYỆN từ API riêng
  const { data: dsKhoanThu = [] } = useQuery({
    queryKey: ["khoan-thu-tu-nguyen"], // Đặt key riêng biệt
    queryFn: async () => {
        // Gọi API chuyên biệt cho tự nguyện
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
        const donations = dsPhieuThu.filter((pt: any) =>
            pt.chiTietThu?.some((detail: any) => detail.khoanThuId === ktId)
        );

        const totalMoney = donations.reduce((sum: number, pt: any) => {
            if (pt.trangThai !== "Đã thu") return sum;
            const detail = pt.chiTietThu.find((d: any) => d.khoanThuId === ktId);
            return sum + (Number(detail?.soTien) || 0);
        }, 0);

        const pendingMoney = donations.reduce((sum: number, pt: any) => {
            if (pt.trangThai === "Đã thu") return sum;
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
        soTien: 0, // Tự nguyện thường không có định mức cố định
        loaiKhoanThu: "Tự nguyện", // 👈 QUAN TRỌNG: Phải lưu đúng loại này
        moTa: "Chiến dịch quyên góp tự nguyện"
    }),
    onSuccess: () => {
        toast.success("Tạo chiến dịch thành công!");
        setIsCreateCampaignOpen(false);
        setNewCampaignName("");
        // 👇 Làm mới đúng key cache
        queryClient.invalidateQueries({ queryKey: ["khoan-thu-tu-nguyen"] });
    }
  });

  const donateMutation = useMutation({
    mutationFn: async () => {
        const hk = dsHoKhau.find((h: any) => (h._id || h.id) === selectedHoKhauId);
        if(!hk) throw new Error("Chưa chọn hộ khẩu");

        const payload = {
            hoKhauId: hk._id || hk.id,
            maPhieuThu: `DG-${Date.now()}`,
            tenChuHo: hk.chuHo?.hoTen,
            diaChi: hk.diaChi?.soNha + " " + hk.diaChi?.duong,
            soNhanKhau: Number(hk.soNhanKhau || 1),
            nam: new Date().getFullYear(),
            kyThu: `Đợt: ${selectedCampaign.tenKhoanThu}`,
            ngayThu: new Date().toISOString(),
            trangThai: donationStatus,
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
        toast.success("Ghi nhận thành công!");
        setIsDonateModalOpen(false);
        setDonationAmount(50000);
        setDonationStatus("Đã thu");
        queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
    }
  });

  const payMutation = useMutation({
    mutationFn: async (id: string) => {
        return await updatePhieuThu(id, {
          trangThai: "Đã thu",
          ngayThu: new Date().toISOString(),
          ghiChu: "Đã xác nhận nộp tiền"
        });
    },
    onSuccess: () => {
        toast.success("Đã nộp tiền thành công!");
        queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
    },
    onError: (err: any) => toast.error("Lỗi: " + err.message)
  });

  // 👇 MUTATION XÓA CHIẾN DỊCH
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => await deleteKhoanThu(id),
    onSuccess: () => {
      toast.success("Đã xóa chiến dịch thành công!");
      // 👇 Làm mới đúng key cache
      queryClient.invalidateQueries({ queryKey: ["khoan-thu-tu-nguyen"] });
    },
    onError: (err: any) => toast.error("Không thể xóa: " + err.message)
  });

  const handleDeleteCampaign = (id: string, hasDonations: boolean) => {
    const message = hasDonations
      ? "Chiến dịch này ĐÃ CÓ dữ liệu thu chi. Việc xóa có thể làm mất lịch sử đóng góp. Bạn chắc chắn chứ?"
      : "Bạn có chắc chắn muốn xóa chiến dịch này không?";

    toast(message, {
      description: "Hành động này không thể hoàn tác.",
      action: {
        label: "Vẫn xóa",
        onClick: () => deleteCampaignMutation.mutate(id),
      },
      cancel: {
        label: "Hủy",
        onClick: () => {},
      },
      duration: hasDonations ? 8000 : 4000,
    });
  };

  const handleConfirmPay = (pId: string) => {
    toast("Xác nhận thu tiền?", {
        description: "Hành động này sẽ cập nhật trạng thái thành 'Đã thu'.",
        action: {
            label: "Xác nhận",
            onClick: () => payMutation.mutate(pId),
        },
        cancel: {
            label: "Hủy",
            onClick: () => {},
        },
    });
  }

  // --- HANDLERS ---
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
            <p className="text-gray-500 text-sm mt-1">Tạo và quản lý các đợt vận động quyên góp</p>
        </div>
        <button
            onClick={() => setIsCreateCampaignOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 transition-all"
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
                    {/* CARD HEADER */}
                    <div
                        onClick={() => toggleExpand(campId)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 select-none group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isExpanded ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                                <Heart size={24} className={isExpanded ? "fill-red-600" : ""}/>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors">{camp.tenKhoanThu}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                    {camp.donations.length} lượt ghi nhận • Tạo ngày {new Date().toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                             {camp.pendingMoney > 0 && (
                                <div className="text-right hidden md:block">
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Dự kiến (Chưa thu)</p>
                                    <p className="text-sm font-bold text-gray-400 dashed underline decoration-gray-300">
                                        {camp.pendingMoney.toLocaleString()} ₫
                                    </p>
                                </div>
                             )}
                             <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase font-semibold">Thực thu</p>
                                <p className="text-xl font-bold text-red-600">{camp.totalMoney.toLocaleString()} ₫</p>
                            </div>

                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                {/* 👇 NÚT XÓA CHIẾN DỊCH */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCampaign(campId, hasDonations);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="Xóa chiến dịch này"
                                >
                                    <Trash2 size={18} />
                                </button>

                                {isExpanded ? <ChevronUp className="text-gray-400"/> : <ChevronDown className="text-gray-400"/>}
                            </div>
                        </div>
                    </div>

                    {/* CARD BODY (TABLE) */}
                    {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                    <User size={18}/> Danh sách ủng hộ
                                </h4>
                                <button
                                    onClick={(e) => { e.stopPropagation(); openDonateModal(camp); }}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow flex items-center gap-2"
                                >
                                    <Plus size={16}/> Thêm khoản đóng góp
                                </button>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100 text-gray-500 font-semibold uppercase text-xs">
                                        <tr>
                                            <th className="p-3">Người đóng góp</th>
                                            <th className="p-3">Địa chỉ</th>
                                            <th className="p-3">Ngày ghi nhận</th>
                                            <th className="p-3 text-center">Trạng thái</th>
                                            <th className="p-3 text-right">Số tiền</th>
                                            <th className="p-3 text-right">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {camp.donations.length === 0 ? (
                                            <tr><td colSpan={6} className="p-4 text-center text-gray-400 italic">Chưa có dữ liệu</td></tr>
                                        ) : camp.donations.map((d: any, idx: number) => {
                                            const detail = d.chiTietThu.find((x:any) => x.khoanThuId === campId);
                                            const isPaid = d.trangThai === "Đã thu";
                                            const pId = d._id || d.id;

                                            return (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 font-medium text-gray-800">{d.tenChuHo}</td>
                                                    <td className="p-3 text-gray-500 truncate max-w-[200px]">{d.diaChi}</td>
                                                    <td className="p-3 text-gray-500">
                                                        {new Date(d.ngayThu).toLocaleDateString("vi-VN")}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {isPaid ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                                                                <CheckCircle size={12}/> Đã thu
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200">
                                                                <Clock size={12}/> Chờ thu
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={`p-3 text-right font-bold ${isPaid ? "text-gray-700" : "text-gray-400"}`}>
                                                        {Number(detail?.soTien).toLocaleString()} ₫
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        {!isPaid && (
                                                            <button
                                                                onClick={() => handleConfirmPay(pId)}
                                                                disabled={payMutation.isPending}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
                                                            >
                                                                <DollarSign size={14}/> Nộp tiền
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
                <h3 className="text-xl font-bold mb-4">Tạo Chiến Dịch Mới</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên chiến dịch</label>
                    <input
                        autoFocus
                        type="text"
                        value={newCampaignName}
                        onChange={(e) => setNewCampaignName(e.target.value)}
                        placeholder="VD: Quỹ Bão Lụt Yagi..."
                        className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setIsCreateCampaignOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                    <button
                        onClick={() => createCampaignMutation.mutate()}
                        disabled={!newCampaignName}
                        className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
                    >
                        Tạo Ngay
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* MODAL ĐÓNG GÓP */}
      {isDonateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedCampaign?.tenKhoanThu}</h3>
                </div>

                <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Chọn hộ gia đình (*)</label>
                        <select
                            className="w-full border p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-red-500"
                            value={selectedHoKhauId}
                            onChange={(e) => setSelectedHoKhauId(e.target.value)}
                        >
                            <option value="">-- Tìm kiếm hộ khẩu --</option>
                            {dsHoKhau.map((hk:any) => (
                                <option key={hk._id || hk.id} value={hk._id || hk.id}>
                                    {hk.maHoKhau} - {hk.chuHo?.hoTen}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Số tiền cam kết / ủng hộ</label>
                        <input
                            type="number"
                            className="w-full border-2 border-red-100 p-3 rounded-lg text-2xl font-bold text-red-600 outline-none focus:border-red-500"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(Number(e.target.value))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái thu tiền</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="Đã thu"
                                    checked={donationStatus === "Đã thu"}
                                    onChange={(e) => setDonationStatus(e.target.value)}
                                    className="w-5 h-5 accent-green-600"
                                />
                                <span className="font-medium text-green-700">Đã nhận tiền</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="Chưa thu"
                                    checked={donationStatus === "Chưa thu"}
                                    onChange={(e) => setDonationStatus(e.target.value)}
                                    className="w-5 h-5 accent-gray-500"
                                />
                                <span className="font-medium text-gray-600">Chưa nhận (Chờ thu)</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú</label>
                        <textarea
                            rows={2}
                            className="w-full border p-3 rounded-lg outline-none focus:border-gray-400"
                            value={donationNote}
                            onChange={(e) => setDonationNote(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                    <button onClick={() => setIsDonateModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Đóng</button>
                    <button
                        onClick={() => donateMutation.mutate()}
                        disabled={!selectedHoKhauId || donationAmount <= 0}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200"
                    >
                        Xác nhận
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
}
