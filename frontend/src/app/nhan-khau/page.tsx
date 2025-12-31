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
  getThongKeNhanKhau
} from "./api";
import { NhanKhau } from "./types";
import { toast } from "sonner";

import { motion, AnimatePresence } from "framer-motion";
import {
  Edit, Trash2, Plus, User, Search, Users, Calendar,
  Baby, X, Sparkles, MapPin, Home, Fingerprint, Briefcase, Info, Skull,
  Filter, ChevronDown
} from "lucide-react";
import NhanKhauModal from "./nhanKhauModal";
import ConfirmModal from "./confirmModal";

export default function NhanKhauPage() {
  const queryClient = useQueryClient();

  // --- STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoiSinhModalOpen, setIsMoiSinhModalOpen] = useState(false);
  const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);

  const [deathItem, setDeathItem] = useState<any>(null);
  const [deathForm, setDeathForm] = useState({ ngayMat: "", lyDo: "" });

  const [editingItem, setEditingItem] = useState<NhanKhau | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<any | null>(null);

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [searchID, setSearchID] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [searchGender, setSearchGender] = useState("");

  const [moiSinhForm, setMoiSinhForm] = useState({
      hoTen: "", ngaySinh: "", gioiTinh: "Nam", hoKhauId: "",
      quanHeVoiChuHo: "Con", noiSinh: "", queQuan: ""
  });

  // --- DATA FETCHING ---
  const { data: list = [], isLoading: isLoadingList } = useQuery({
    queryKey: ["nhan-khau"],
    queryFn: getAllNhanKhau,
  });

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["nhan-khau-stats"],
    queryFn: getThongKeNhanKhau,
    initialData: { total: 0, male: 0, female: 0, avgAge: 0 }
  });

  const { data: listHoKhau = [] } = useQuery({
    queryKey: ["ho-khau"],
    queryFn: async () => {
        const res = await getAllHoKhau();
        return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: isMoiSinhModalOpen
  });

  // --- MUTATIONS (Giữ nguyên logic) ---
  const onSuccessCommon = (mess: string) => {
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      queryClient.invalidateQueries({ queryKey: ["nhan-khau-stats"] });
      toast.success(mess);
  };

  const addMutation = useMutation({
    mutationFn: (newNhanKhau: any) => createNhanKhau(newNhanKhau),
    onSuccess: () => { onSuccessCommon("Thêm nhân khẩu thành công!"); setIsModalOpen(false); },
  });

  const addMoiSinhMutation = useMutation({
    mutationFn: (data: any) => createMoiSinh(data),
    onSuccess: () => {
        onSuccessCommon("Đã thêm trẻ mới sinh thành công!");
        setIsMoiSinhModalOpen(false);
        setMoiSinhForm({ hoTen: "", ngaySinh: "", gioiTinh: "Nam", hoKhauId: "", quanHeVoiChuHo: "Con", noiSinh: "", queQuan: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateNhanKhau(id, data),
    onSuccess: () => { onSuccessCommon("Cập nhật thành công!"); setIsModalOpen(false); setEditingItem(null); },
  });

  const deathMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateNhanKhau(id, data),
    onSuccess: () => { onSuccessCommon("Đã ghi nhận khai tử thành công!"); setIsDeathModalOpen(false); setDeathItem(null); },
    onError: (err: any) => toast.error("Lỗi: " + (err.response?.data?.message || "Có lỗi xảy ra!"))
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNhanKhau,
    onSuccess: () => { onSuccessCommon("Đã xoá thành công!"); setDeleteId(null); },
  });

  // --- HANDLERS ---
  const handleSubmitMoiSinh = () => {
      if(!moiSinhForm.hoTen || !moiSinhForm.ngaySinh || !moiSinhForm.hoKhauId) return toast.error("Vui lòng điền đủ: Họ tên, Ngày sinh, Hộ khẩu");
      addMoiSinhMutation.mutate(moiSinhForm);
  };

  const handleOpenDeath = (item: any) => {
    setDeathItem(item);
    setDeathForm({ ngayMat: new Date().toISOString().split('T')[0], lyDo: "" });
    setIsDeathModalOpen(true);
  };

  const handleSubmitDeath = () => {
    if (!deathItem || !deathForm.ngayMat) return toast.error("Vui lòng chọn ngày mất");
    const id = deathItem._id || deathItem.id;
    const deathNote = `[Qua đời] Mất ngày ${new Date(deathForm.ngayMat).toLocaleDateString("vi-VN")}. Lý do: ${deathForm.lyDo || "Không rõ"}.`;
    const finalGhiChu = deathItem.ghiChu ? `${deathItem.ghiChu}\n${deathNote}` : deathNote;
    deathMutation.mutate({ id, data: { trangThai: "Đã qua đời", ghiChu: finalGhiChu } });
  };

  const handleOpenEdit = (item: NhanKhau) => { setEditingItem({ ...item }); setIsModalOpen(true); };
  const handleSubmitForm = (formData: any) => {
    const id = (editingItem as any)?._id || (editingItem as any)?.id;
    if (editingItem) updateMutation.mutate({ id, data: formData });
    else addMutation.mutate(formData);
  };
  const handleConfirmDelete = () => { if (deleteId) deleteMutation.mutate(deleteId); };

  // --- FILTER & LOGIC ---
  const safeList = useMemo(() => Array.isArray(list) ? list : [], [list]);

  const checkIsMoiSinh = (ngaySinh: string) => {
      if (!ngaySinh) return false;
      const birth = new Date(ngaySinh);
      const now = new Date();
      const monthDiff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      return monthDiff < 12 && monthDiff >= 0;
  };

  const filteredList = safeList.filter((item: any) => {
    const matchName = searchName ? item.hoTen?.toLowerCase().includes(searchName.toLowerCase().trim()) : true;
    const matchID = searchID ? (item.soDinhDanh?.so || "").toString().toLowerCase().includes(searchID.toLowerCase().trim()) : true;
    const matchYear = searchYear ? (item.ngaySinh && new Date(item.ngaySinh).getFullYear().toString().includes(searchYear.trim())) : true;
    const matchGender = searchGender ? item.gioiTinh === searchGender : true;
    return matchName && matchID && matchYear && matchGender;
  });

  if (isLoadingList) return (
    <div className="flex flex-col justify-center items-center h-screen bg-slate-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu nhân khẩu...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-900">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="text-indigo-600" size={32}/> Quản Lý Nhân Khẩu
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Hệ thống quản lý cư dân và thông tin nhân khẩu học.</p>
        </div>
        <div className="flex gap-3">
             <button onClick={() => setIsMoiSinhModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 rounded-xl shadow-sm transition-all font-semibold">
                <Baby size={18} /> <span className="hidden md:inline">Khai Báo</span> Mới Sinh
            </button>
            <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all font-semibold">
                <Plus size={18} /> Thêm Nhân Khẩu
            </button>
        </div>
      </div>

      {/* STATS CARDS - DESIGN MỚI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard label="Tổng nhân khẩu" value={statsData?.total} icon={Users} color="blue" isLoading={isLoadingStats} />
          <StatCard label="Nam giới" value={statsData?.male} icon={User} color="indigo" isLoading={isLoadingStats} />
          <StatCard label="Nữ giới" value={statsData?.female} icon={User} color="pink" isLoading={isLoadingStats} />
          <StatCard label="Tuổi trung bình" value={statsData?.avgAge} icon={Calendar} color="emerald" isLoading={isLoadingStats} suffix=" tuổi" />
      </div>

      {/* FILTER BAR - DESIGN KHOA HỌC */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold text-sm uppercase tracking-wide">
            <Filter size={16} /> Bộ lọc tìm kiếm
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
             <div className="md:col-span-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Tìm theo tên..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm outline-none" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>
            <div className="md:col-span-3 relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Số định danh / CCCD" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm outline-none font-mono" value={searchID} onChange={(e) => setSearchID(e.target.value)} />
            </div>
            <div className="md:col-span-2 relative">
                 <input type="number" placeholder="Năm sinh" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm outline-none" value={searchYear} onChange={(e) => setSearchYear(e.target.value)} />
            </div>
            <div className="md:col-span-3 relative">
                 <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm outline-none cursor-pointer appearance-none" value={searchGender} onChange={(e) => setSearchGender(e.target.value)}>
                    <option value="">Tất cả giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
        </div>
      </div>

      {/* DATA TABLE - DESIGN SẠCH SẼ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <th className="p-4 pl-6 whitespace-nowrap">Thông tin cá nhân</th>
                <th className="p-4 whitespace-nowrap">Ngày Sinh</th>
                <th className="p-4 text-center whitespace-nowrap">Giới Tính</th>
                <th className="p-4 whitespace-nowrap">CCCD / Định danh</th>
                <th className="p-4 text-center whitespace-nowrap">Trạng Thái</th>
                <th className="p-4 text-center whitespace-nowrap w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredList.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Search size={32} className="text-slate-300"/>
                                <p>Không tìm thấy nhân khẩu nào phù hợp.</p>
                            </div>
                        </td>
                    </tr>
                ) : filteredList.map((item: any) => {
                  const itemId = item._id || item.id;
                  const isBaby = checkIsMoiSinh(item.ngaySinh);
                  const isDead = item.trangThai === "Đã qua đời";
                  const statusText = item.trangThai || "Chưa đăng ký";

                  return (
                    <motion.tr
                      key={itemId}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      onClick={() => setViewingItem(item)}
                      className={`group cursor-pointer transition-colors ${isDead ? "bg-slate-100/70 grayscale-[0.8]" : "hover:bg-indigo-50/60"}`}
                    >
                      <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border ${isDead ? "bg-slate-200 text-slate-500 border-slate-300" : "bg-white text-indigo-600 border-indigo-100"}`}>
                                  {item.hoTen?.charAt(0)}
                              </div>
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className={`font-semibold text-sm ${isDead ? "text-slate-500 line-through decoration-slate-400" : "text-slate-800"}`}>{item.hoTen}</span>
                                      {isBaby && !isDead && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-600 border border-pink-200 uppercase flex items-center gap-1"><Sparkles size={10}/> Mới sinh</span>}
                                  </div>
                                  <p className="text-xs text-slate-500 font-mono mt-0.5">#{itemId.toString().slice(-6).toUpperCase()}</p>
                              </div>
                          </div>
                      </td>
                      <td className="p-4 text-slate-600 text-sm">{item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString("vi-VN") : "---"}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${item.gioiTinh === "Nam" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"}`}>
                            {item.gioiTinh}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 text-sm font-mono tracking-wide">{item.soDinhDanh?.so || "---"}</td>

                      <td className="p-4 text-center">
                        <StatusBadge status={statusText} isDead={isDead} />
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200" onClick={(e) => e.stopPropagation()}>
                            <ActionButton icon={Edit} color="indigo" onClick={() => handleOpenEdit(item)} tooltip="Sửa" />
                            {!isDead && <ActionButton icon={Skull} color="slate" onClick={() => handleOpenDeath(item)} tooltip="Khai tử" />}
                            <ActionButton icon={Trash2} color="red" onClick={() => setDeleteId(itemId)} tooltip="Xóa" />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL VIEW - DESIGN MỚI */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Info className="text-indigo-600" size={20}/> Hồ Sơ Nhân Khẩu</h3>
                <button onClick={() => setViewingItem(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-4xl font-bold shadow-inner border-4 border-white ring-2 ring-indigo-100">
                    {viewingItem.hoTen?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        {viewingItem.hoTen}
                        {viewingItem.trangThai === "Đã qua đời" && <span className="text-xs bg-slate-800 text-white px-2 py-1 rounded font-bold uppercase tracking-wider">Đã mất</span>}
                    </h4>
                    <p className="text-slate-500 text-sm mt-1">Bí danh: <span className="text-slate-700 font-medium">{viewingItem.biDanh || "Không có"}</span></p>
                    <div className="mt-3"><StatusBadge status={viewingItem.trangThai} isDead={viewingItem.trangThai === "Đã qua đời"} /></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <DetailItem icon={Calendar} label="Ngày sinh" value={viewingItem.ngaySinh ? new Date(viewingItem.ngaySinh).toLocaleDateString("vi-VN") : "---"} />
                  <DetailItem icon={User} label="Giới tính" value={viewingItem.gioiTinh} />
                  <DetailItem icon={Fingerprint} label="CCCD / Định danh" value={viewingItem.soDinhDanh?.so || "---"} />
                  <DetailItem icon={MapPin} label="Nơi sinh" value={viewingItem.noiSinh || "---"} />
                  <DetailItem icon={Home} label="Quê quán" value={viewingItem.queQuan || "---"} />
                  <DetailItem icon={Users} label="Dân tộc / Tôn giáo" value={`${viewingItem.danToc || "---"} / ${viewingItem.tonGiao || "---"}`} />
                  <DetailItem icon={Briefcase} label="Nghề nghiệp" value={viewingItem.ngheNghiep || "---"} />
                  <DetailItem icon={Info} label="Quan hệ với chủ hộ" value={viewingItem.quanHeVoiChuHo || "---"} />
                </div>

                <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
                     <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><MapPin size={14}/> Địa chỉ thường trú</h5>
                     <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {viewingItem.diaChiThuongTru ? `${viewingItem.diaChiThuongTru.soNha}, ${viewingItem.diaChiThuongTru.duong}, ${viewingItem.diaChiThuongTru.phuongXa}, ${viewingItem.diaChiThuongTru.quanHuyen}, ${viewingItem.diaChiThuongTru.tinhThanh}` : "---"}
                    </p>
                </div>

                {viewingItem.ghiChu && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <h5 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Ghi chú</h5>
                    <p className="text-sm text-amber-900 italic">{viewingItem.ghiChu}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL KHAI TỬ & MỚI SINH (Giữ nguyên cấu trúc logic, chỉ chỉnh CSS nhẹ nếu cần) */}
      {isDeathModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Skull className="text-slate-600" size={20}/> Khai Báo Qua Đời</h3>
                      <button onClick={() => setIsDeathModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-800"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <p className="text-sm text-slate-600">Xác nhận khai tử cho: <span className="font-bold text-slate-900">{deathItem?.hoTen}</span></p>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày mất (*)</label><input type="date" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-slate-200 outline-none" value={deathForm.ngayMat} onChange={e => setDeathForm({...deathForm, ngayMat: e.target.value})} /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lý do</label><textarea rows={3} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-slate-200 outline-none" value={deathForm.lyDo} onChange={e => setDeathForm({...deathForm, lyDo: e.target.value})} placeholder="Nguyên nhân..." /></div>
                  </div>
                  <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
                      <button onClick={() => setIsDeathModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-200 rounded-lg transition-colors">Hủy</button>
                      <button onClick={handleSubmitDeath} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md transition-colors">Xác nhận</button>
                  </div>
              </div>
          </div>
      )}

      {isMoiSinhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
             <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                <div className="px-6 py-4 border-b bg-indigo-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><Baby className="text-indigo-600"/> Khai Báo Mới Sinh</h3>
                    <button onClick={() => setIsMoiSinhModalOpen(false)}><X size={20} className="text-indigo-400 hover:text-indigo-800"/></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Họ tên (*)</label><input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none focus:border-indigo-500" value={moiSinhForm.hoTen} onChange={e => setMoiSinhForm({...moiSinhForm, hoTen: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày sinh (*)</label><input type="date" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none focus:border-indigo-500" value={moiSinhForm.ngaySinh} onChange={e => setMoiSinhForm({...moiSinhForm, ngaySinh: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giới tính</label><select className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none focus:border-indigo-500" value={moiSinhForm.gioiTinh} onChange={e => setMoiSinhForm({...moiSinhForm, gioiTinh: e.target.value})} ><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nơi sinh</label><input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none focus:border-indigo-500" value={moiSinhForm.noiSinh} onChange={e => setMoiSinhForm({...moiSinhForm, noiSinh: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quê quán</label><input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none focus:border-indigo-500" value={moiSinhForm.queQuan} onChange={e => setMoiSinhForm({...moiSinhForm, queQuan: e.target.value})} /></div>
                    </div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hộ khẩu (*)</label><select className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none focus:border-indigo-500" value={moiSinhForm.hoKhauId} onChange={e => setMoiSinhForm({...moiSinhForm, hoKhauId: e.target.value})} ><option value="">-- Chọn hộ khẩu --</option>{listHoKhau.map((hk: any) => (<option key={hk._id} value={hk._id}>{hk.maHoKhau} - {hk.chuHo?.hoTen}</option>))}</select></div>
                </div>
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-3"><button onClick={() => setIsMoiSinhModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-200 rounded-lg">Hủy</button><button onClick={handleSubmitMoiSinh} disabled={addMoiSinhMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors">Xác nhận</button></div>
             </div>
        </div>
      )}

      {/* COMPONENT MODALS (Giữ nguyên component con) */}
      <NhanKhauModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmitForm} initialData={editingItem} isLoading={addMutation.isPending || updateMutation.isPending} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleConfirmDelete} isLoading={deleteMutation.isPending} />
    </div>
  );
}

// --- SUB COMPONENTS (ĐỂ CODE GỌN HƠN) ---

const StatCard = ({ label, value, icon: Icon, color, isLoading, suffix = "" }: any) => {
    const colorClasses: any = {
        blue: "bg-blue-50 text-blue-600 border-l-4 border-blue-500",
        indigo: "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-500",
        pink: "bg-pink-50 text-pink-600 border-l-4 border-pink-500",
        emerald: "bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500"
    };

    return (
        <div className={`p-5 rounded-xl shadow-sm border border-slate-100 bg-white flex items-center justify-between hover:shadow-md transition-shadow`}>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-extrabold text-slate-800">
                    {isLoading ? <span className="animate-pulse bg-slate-200 h-6 w-16 block rounded"></span> : <>{value}{suffix}</>}
                </p>
            </div>
            <div className={`p-3 rounded-full ${colorClasses[color]?.split(' ')[0]} ${colorClasses[color]?.split(' ')[1]}`}>
                <Icon size={24} />
            </div>
        </div>
    )
}

const StatusBadge = ({ status, isDead }: { status: string, isDead: boolean }) => {
    let style = "bg-slate-100 text-slate-600 border-slate-200";
    if (isDead) style = "bg-slate-800 text-white border-slate-600";
    else if (status === "Thường trú") style = "bg-emerald-50 text-emerald-700 border-emerald-200";
    else if (status === "Tạm trú") style = "bg-blue-50 text-blue-700 border-blue-200";
    else if (status === "Tạm vắng") style = "bg-amber-50 text-amber-700 border-amber-200";

    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide whitespace-nowrap ${style}`}>
            {status}
        </span>
    );
};

const ActionButton = ({ icon: Icon, color, onClick, tooltip }: any) => {
    const colors: any = {
        indigo: "text-indigo-600 hover:bg-indigo-50",
        slate: "text-slate-600 hover:bg-slate-100",
        red: "text-red-500 hover:bg-red-50"
    };
    return (
        <button onClick={onClick} className={`p-2 rounded-lg transition-all ${colors[color]}`} title={tooltip}>
            <Icon size={18} />
        </button>
    )
}

const DetailItem = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-3">
        <div className="mt-1 p-2 bg-slate-50 text-slate-400 rounded-lg"><Icon size={16}/></div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-slate-800">{value}</p>
        </div>
    </div>
);
