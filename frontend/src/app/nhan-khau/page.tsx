"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNhanKhau,
  deleteNhanKhau,
  getAllNhanKhau,
  updateNhanKhau,
  getAllHoKhau,
  createMoiSinh,
  getThongKeNhanKhau // 👈 IMPORT HÀM MỚI
} from "./api";
import { NhanKhau } from "./types";
import { toast } from "sonner";

import { motion, AnimatePresence } from "framer-motion";
import {
  Edit, Trash2, Plus, User, Search, Users, Calendar,
  Baby, X, Sparkles, MapPin, Home, Fingerprint, Briefcase, Info, Skull
} from "lucide-react";
import NhanKhauModal from "./nhanKhauModal";
import ConfirmModal from "./confirmModal";

export default function NhanKhauPage() {
  const queryClient = useQueryClient();

  // --- STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoiSinhModalOpen, setIsMoiSinhModalOpen] = useState(false);

  // State cho chức năng Khai tử
  const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);
  const [deathItem, setDeathItem] = useState<any>(null);
  const [deathForm, setDeathForm] = useState({ ngayMat: "", lyDo: "" });

  const [editingItem, setEditingItem] = useState<NhanKhau | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<any | null>(null);

  // Các state bộ lọc
  const [searchName, setSearchName] = useState("");
  const [searchID, setSearchID] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [searchGender, setSearchGender] = useState("");

  const [moiSinhForm, setMoiSinhForm] = useState({
      hoTen: "",
      ngaySinh: "",
      gioiTinh: "Nam",
      hoKhauId: "",
      quanHeVoiChuHo: "Con",
      noiSinh: "",
      queQuan: ""
  });

  // --- DATA FETCHING ---

  // 1. Lấy danh sách nhân khẩu (cho bảng)
  const { data: list = [], isLoading: isLoadingList } = useQuery({
    queryKey: ["nhan-khau"],
    queryFn: getAllNhanKhau,
  });

  // 2. 🟢 Lấy dữ liệu THỐNG KÊ từ API (thay vì tự tính)
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["nhan-khau-stats"],
    queryFn: getThongKeNhanKhau,
    // Giá trị mặc định để không bị lỗi undefined khi đang tải
    initialData: { total: 0, male: 0, female: 0, avgAge: 0 }
  });

  // 3. Lấy danh sách hộ khẩu (cho dropdown modal mới sinh)
  const { data: listHoKhau = [] } = useQuery({
    queryKey: ["ho-khau"],
    queryFn: async () => {
        const res = await getAllHoKhau();
        return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: isMoiSinhModalOpen
  });

  // --- MUTATIONS ---
  const addMutation = useMutation({
    mutationFn: (newNhanKhau: any) => createNhanKhau(newNhanKhau),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      queryClient.invalidateQueries({ queryKey: ["nhan-khau-stats"] }); // Reload lại thống kê
      toast.success("Thêm nhân khẩu thành công!");
      setIsModalOpen(false);
    },
  });

  const addMoiSinhMutation = useMutation({
    mutationFn: (data: any) => createMoiSinh(data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
        queryClient.invalidateQueries({ queryKey: ["nhan-khau-stats"] });
        toast.success("Đã thêm trẻ mới sinh thành công!");
        setIsMoiSinhModalOpen(false);
        setMoiSinhForm({ hoTen: "", ngaySinh: "", gioiTinh: "Nam", hoKhauId: "", quanHeVoiChuHo: "Con", noiSinh: "", queQuan: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateNhanKhau(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      queryClient.invalidateQueries({ queryKey: ["nhan-khau-stats"] });
      setIsModalOpen(false);
      setEditingItem(null);
      toast.success("Cập nhật thành công!");
    },
  });

  const deathMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateNhanKhau(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      queryClient.invalidateQueries({ queryKey: ["nhan-khau-stats"] }); // Cập nhật lại số lượng/tuổi
      setIsDeathModalOpen(false);
      setDeathItem(null);
      toast.success("Đã ghi nhận khai tử thành công!");
    },
    onError: (err: any) => {
        toast.error("Lỗi: " + (err.response?.data?.message || "Có lỗi xảy ra khi khai tử!"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNhanKhau,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      queryClient.invalidateQueries({ queryKey: ["nhan-khau-stats"] });
      toast.success("Đã xoá thành công!");
      setDeleteId(null);
    },
  });

  // --- HANDLERS ---
  const handleSubmitMoiSinh = () => {
      if(!moiSinhForm.hoTen || !moiSinhForm.ngaySinh || !moiSinhForm.hoKhauId) {
          toast.error("Vui lòng điền đủ: Họ tên, Ngày sinh, Hộ khẩu");
          return;
      }
      addMoiSinhMutation.mutate(moiSinhForm);
  };

  const handleOpenDeath = (item: any) => {
    setDeathItem(item);
    setDeathForm({ ngayMat: new Date().toISOString().split('T')[0], lyDo: "" });
    setIsDeathModalOpen(true);
  };

  const handleSubmitDeath = () => {
    if (!deathItem) return;
    if (!deathForm.ngayMat) return toast.error("Vui lòng chọn ngày mất");

    const id = deathItem._id || deathItem.id;

    const deathNote = `[Qua đời] Mất ngày ${new Date(deathForm.ngayMat).toLocaleDateString("vi-VN")}. Lý do: ${deathForm.lyDo || "Không rõ"}.`;
    const currentNote = deathItem.ghiChu || "";
    const finalGhiChu = currentNote ? `${currentNote}\n${deathNote}` : deathNote;

    const updateData = {
      trangThai: "Đã qua đời",
      ghiChu: finalGhiChu,
    };

    deathMutation.mutate({ id, data: updateData });
  };

  const handleOpenEdit = (item: NhanKhau) => {
    const cleanData = { ...item };
    setEditingItem(cleanData);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (formData: any) => {
    if (editingItem) {
      const id = (editingItem as any)._id || editingItem.id;
      updateMutation.mutate({ id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleConfirmDelete = () => { if (deleteId) deleteMutation.mutate(deleteId); };

  // --- BỘ LỌC CLIENT ---
  const safeList = useMemo(() => Array.isArray(list) ? list : [], [list]);

  // 🟢 ĐÂY LÀ HÀM BẠN BỊ THIẾU, TÔI ĐÃ THÊM VÀO ĐÂY
  const checkIsMoiSinh = (ngaySinh: string) => {
      if (!ngaySinh) return false;
      const birth = new Date(ngaySinh);
      const now = new Date();
      const monthDiff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      return monthDiff < 12 && monthDiff >= 0;
  };

  const filteredList = safeList.filter((item: any) => {
    const termName = searchName.toLowerCase().trim();
    const matchName = termName ? (item.hoTen?.toLowerCase().includes(termName)) : true;

    const termID = searchID.toLowerCase().trim();
    const cccd = item.soDinhDanh?.so || "";
    const matchID = termID ? cccd.toString().toLowerCase().includes(termID) : true;

    const termYear = searchYear.trim();
    let matchYear = true;
    if (termYear && item.ngaySinh) {
        matchYear = new Date(item.ngaySinh).getFullYear().toString().includes(termYear);
    }

    let matchGender = true;
    if (searchGender && searchGender !== "") {
        matchGender = item.gioiTinh === searchGender;
    }

    return matchName && matchID && matchYear && matchGender;
  });

  if (isLoadingList) return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div className="mb-2 md:mb-0">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Quản Lý Nhân Khẩu</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách cư dân hiện tại trong hệ thống</p>
        </div>
      </div>

      {/* STATS CARDS: SỬ DỤNG DỮ LIỆU TỪ API (statsData) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Users size={24} /></div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Tổng số</p>
                <p className="text-2xl font-bold text-gray-800">
                   {isLoadingStats ? "..." : statsData?.total || 0}
                </p>
              </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><User size={24} /></div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Nam</p>
                <p className="text-2xl font-bold text-indigo-900">
                    {isLoadingStats ? "..." : statsData?.male || 0}
                </p>
              </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-pink-50 text-pink-500 rounded-full"><User size={24} /></div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Nữ</p>
                <p className="text-2xl font-bold text-pink-700">
                     {isLoadingStats ? "..." : statsData?.female || 0}
                </p>
              </div>
          </div>
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-full"><Calendar size={24} /></div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Tuổi Trung Bình</p>
                <p className="text-2xl font-bold text-green-800">
                    {isLoadingStats ? "..." : statsData?.avgAge || 0}
                </p>
              </div>
          </div>
      </div>

      {/* FILTER & ACTIONS */}
      <div className="flex flex-col md:flex-row gap-3 w-full items-end mb-6 flex-wrap">
            <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Tìm tên..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>
            <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Tìm CCCD..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={searchID} onChange={(e) => setSearchID(e.target.value)} />
            </div>

            <div className="relative w-full md:w-32">
                 <input type="number" placeholder="Năm sinh" className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchYear} onChange={(e) => setSearchYear(e.target.value)} />
            </div>

            <div className="relative w-full md:w-32">
                 <select
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    value={searchGender}
                    onChange={(e) => setSearchGender(e.target.value)}
                 >
                    <option value="">Tất cả</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                 </select>
            </div>

            <div className="ml-auto flex gap-2">
                <button onClick={() => setIsMoiSinhModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all text-sm font-medium">
                    <Baby size={18} /> Mới Sinh
                </button>
                <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 transition-all text-sm font-medium">
                    <Plus size={18} /> Thêm Nhân Khẩu
                </button>
            </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="p-4 pl-6">Mã ID</th>
                <th className="p-4">Họ và Tên</th>
                <th className="p-4">Ngày Sinh</th>
                <th className="p-4 text-center">Giới Tính</th>
                <th className="p-4">Số Định Danh</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredList.map((item: any, index: number) => {
                  const itemId = item._id || item.id;
                  const isBaby = checkIsMoiSinh(item.ngaySinh);

                  const isDead = item.trangThai === "Đã qua đời";
                  const statusText = item.trangThai && item.trangThai.trim() !== "" ? item.trangThai : "Chưa đăng ký";

                  return (
                    <motion.tr
                      key={itemId || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setViewingItem(item)}
                      className={`hover:bg-blue-50/50 transition-colors group cursor-pointer ${isDead ? "bg-gray-100/50 grayscale opacity-80" : ""}`}
                    >
                      <td className="p-4 pl-6 font-mono text-sm text-gray-400">#{itemId?.toString().slice(-4).toUpperCase()}</td>
                      <td className="p-4">
                          <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDead ? "bg-gray-300 text-gray-500" : "bg-gray-100 text-gray-500"}`}>
                                  {isBaby ? <Baby size={16} className={isDead ? "text-gray-500" : "text-pink-500"}/> : <User size={14} />}
                              </div>
                              <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                      <span className={`font-medium ${isDead ? "text-gray-500 line-through" : "text-gray-700"}`}>{item.hoTen}</span>
                                      {isBaby && !isDead && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-600 border border-pink-200 uppercase">
                                              <Sparkles size={10} /> Mới sinh
                                          </span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">{item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString("vi-VN") : "---"}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${item.gioiTinh === "Nam" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-pink-50 text-pink-600 border-pink-100"}`}>
                            {item.gioiTinh}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm font-mono">{item.soDinhDanh?.so || "---"}</td>

                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          statusText === "Thường trú" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          statusText === "Tạm trú" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          statusText === "Tạm vắng" ? "bg-orange-50 text-orange-700 border-orange-200" :
                          isDead ? "bg-gray-800 text-white border-gray-600" :
                          "bg-gray-100 text-gray-500 border-gray-200 italic"
                        }`}>
                          {statusText}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleOpenEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Chỉnh sửa"><Edit size={16} /></button>
                            {!isDead && (
                                <button onClick={() => handleOpenDeath(item)} className="p-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-all" title="Khai tử">
                                    <Skull size={16} />
                                </button>
                            )}
                            <button onClick={() => setDeleteId(itemId)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Xóa"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                   <Info className="text-blue-600" size={20}/> Chi Tiết Nhân Khẩu
                </h3>
                <button onClick={() => setViewingItem(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-gray-900">
                <div className="flex items-center gap-5 pb-6 border-b">
                  <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold">
                    {viewingItem.hoTen?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {viewingItem.hoTen}
                        {viewingItem.trangThai === "Đã qua đời" &&
                            <span className="text-xs bg-black text-white px-2 py-0.5 rounded">Đã mất</span>
                        }
                    </h4>
                    <p className="text-gray-500 font-medium">Bí danh: {viewingItem.biDanh || "Không có"}</p>
                    <div className="mt-2 flex gap-2">
                       <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border ${
                          (viewingItem.trangThai === "Thường trú" || !viewingItem.trangThai) ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"
                       }`}>
                         {viewingItem.trangThai || "Chưa đăng ký"}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailRow icon={Calendar} label="Ngày sinh" value={viewingItem.ngaySinh ? new Date(viewingItem.ngaySinh).toLocaleDateString("vi-VN") : "---"} />
                  <DetailRow icon={User} label="Giới tính" value={viewingItem.gioiTinh} />
                  <DetailRow icon={Fingerprint} label="CCCD/Số định danh" value={viewingItem.soDinhDanh?.so || "---"} />
                  <DetailRow icon={MapPin} label="Nơi sinh" value={viewingItem.noiSinh || "---"} />
                  <DetailRow icon={Home} label="Quê quán" value={viewingItem.queQuan || "---"} />
                  <DetailRow icon={Users} label="Dân tộc / Tôn giáo" value={`${viewingItem.danToc || "---"} / ${viewingItem.tonGiao || "---"}`} />
                  <DetailRow icon={Briefcase} label="Nghề nghiệp" value={viewingItem.ngheNghiep || "---"} />
                  <DetailRow icon={Info} label="Quan hệ với chủ hộ" value={viewingItem.quanHeVoiChuHo || "---"} />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><MapPin size={12}/> Địa chỉ thường trú</p>
                    <p className="text-sm font-medium text-gray-700">
                      {viewingItem.diaChiThuongTru ?
                        `${viewingItem.diaChiThuongTru.soNha}, ${viewingItem.diaChiThuongTru.duong}, ${viewingItem.diaChiThuongTru.phuongXa}, ${viewingItem.diaChiThuongTru.quanHuyen}, ${viewingItem.diaChiThuongTru.tinhThanh}` : "---"}
                    </p>
                  </div>
                </div>

                {viewingItem.ghiChu && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Ghi chú</p>
                    <p className="text-sm text-amber-800 italic whitespace-pre-line">{viewingItem.ghiChu}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 border-t flex justify-end">
                <button onClick={() => setViewingItem(null)} className="px-6 py-2 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition-all">Đóng</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL KHAI TỬ */}
      {isDeathModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="px-6 py-4 border-b bg-gray-100 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Skull className="text-gray-600" size={20}/> Khai Báo Qua Đời</h3>
                      <button onClick={() => setIsDeathModalOpen(false)}><X size={20} className="text-gray-500 hover:text-black"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <p className="text-sm text-gray-600">Xác nhận khai tử cho nhân khẩu: <span className="font-bold text-black">{deathItem?.hoTen}</span></p>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mất (*)</label>
                          <input type="date" className="w-full border p-2 rounded-lg" value={deathForm.ngayMat} onChange={e => setDeathForm({...deathForm, ngayMat: e.target.value})} />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Lý do / Ghi chú</label>
                          <textarea rows={3} className="w-full border p-2 rounded-lg" value={deathForm.lyDo} onChange={e => setDeathForm({...deathForm, lyDo: e.target.value})} placeholder="Nguyên nhân tử vong..." />
                      </div>
                  </div>
                  <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                      <button onClick={() => setIsDeathModalOpen(false)} className="px-4 py-2 text-gray-600 text-sm">Hủy</button>
                      <button onClick={handleSubmitDeath} className="px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-lg text-sm font-bold shadow-md">Xác nhận</button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL MỚI SINH */}
      {isMoiSinhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b bg-indigo-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><Baby className="text-indigo-600"/> Khai Báo Mới Sinh</h3>
                    <button onClick={() => setIsMoiSinhModalOpen(false)}><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên trẻ (*)</label><input type="text" className="w-full border p-2 rounded-lg" value={moiSinhForm.hoTen} onChange={e => setMoiSinhForm({...moiSinhForm, hoTen: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh (*)</label><input type="date" className="w-full border p-2 rounded-lg" value={moiSinhForm.ngaySinh} onChange={e => setMoiSinhForm({...moiSinhForm, ngaySinh: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label><select className="w-full border p-2 rounded-lg" value={moiSinhForm.gioiTinh} onChange={e => setMoiSinhForm({...moiSinhForm, gioiTinh: e.target.value})} ><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={14}/> Nơi sinh</label><input type="text" placeholder="..." className="w-full border p-2 rounded-lg" value={moiSinhForm.noiSinh} onChange={e => setMoiSinhForm({...moiSinhForm, noiSinh: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Home size={14}/> Quê quán</label><input type="text" placeholder="..." className="w-full border p-2 rounded-lg" value={moiSinhForm.queQuan} onChange={e => setMoiSinhForm({...moiSinhForm, queQuan: e.target.value})} /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Thuộc hộ khẩu (*)</label><select className="w-full border p-2 rounded-lg" value={moiSinhForm.hoKhauId} onChange={e => setMoiSinhForm({...moiSinhForm, hoKhauId: e.target.value})} ><option value="">-- Chọn hộ khẩu --</option>{listHoKhau.map((hk: any) => (<option key={hk._id} value={hk._id}>{hk.maHoKhau} - {hk.chuHo?.hoTen}</option>))}</select></div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3"><button onClick={() => setIsMoiSinhModalOpen(false)} className="px-4 py-2 text-gray-600 text-sm">Hủy</button><button onClick={handleSubmitMoiSinh} disabled={addMoiSinhMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md">Xác nhận</button></div>
             </div>
        </div>
      )}

      <NhanKhauModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmitForm} initialData={editingItem} isLoading={addMutation.isPending || updateMutation.isPending} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleConfirmDelete} isLoading={deleteMutation.isPending} />
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-700">{value}</p>
    </div>
  );
}
