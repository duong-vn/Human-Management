"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNhanKhau,
  deleteNhanKhau,
  getAllNhanKhau,
  updateNhanKhau,
  getAllHoKhau,
  createMoiSinh
} from "./api";
import { NhanKhau } from "./types";
import { toast } from "sonner";

import { motion, AnimatePresence } from "framer-motion";
import {
  Edit, Trash2, Plus, User, Search, Users, Calendar,
  Baby, X, Sparkles, MapPin, Home, Fingerprint, Briefcase, Info
} from "lucide-react";
import NhanKhauModal from "./nhanKhauModal";
import ConfirmModal from "./confirmModal";

export default function NhanKhauPage() {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoiSinhModalOpen, setIsMoiSinhModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NhanKhau | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 🟢 State mới để xem chi tiết
  const [viewingItem, setViewingItem] = useState<any | null>(null);

  const [searchName, setSearchName] = useState("");
  const [searchID, setSearchID] = useState("");
  const [searchYear, setSearchYear] = useState("");

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
  const { data: list = [], isLoading, isError, error } = useQuery({
    queryKey: ["nhan-khau"],
    queryFn: getAllNhanKhau,
  });

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
      toast.success("Thêm nhân khẩu thành công!");
      setIsModalOpen(false);
    },
  });

  const addMoiSinhMutation = useMutation({
    mutationFn: (data: any) => createMoiSinh(data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
        toast.success("Đã thêm trẻ mới sinh thành công!");
        setIsMoiSinhModalOpen(false);
        setMoiSinhForm({ hoTen: "", ngaySinh: "", gioiTinh: "Nam", hoKhauId: "", quanHeVoiChuHo: "Con", noiSinh: "", queQuan: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateNhanKhau(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      setIsModalOpen(false);
      setEditingItem(null);
      toast.success("Cập nhật thành công!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNhanKhau,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
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

  const safeList = useMemo(() => Array.isArray(list) ? list : [], [list]);

  // --- THỐNG KÊ ---
  const stats = useMemo(() => {
    const total = safeList.length;
    let male = 0; let female = 0; let totalAge = 0; let validAgeCount = 0;
    const now = new Date();

    safeList.forEach((item: any) => {
        if (item.gioiTinh === "Nam") male++;
        else if (item.gioiTinh === "Nữ") female++;
        if (item.ngaySinh) {
            const birthDate = new Date(item.ngaySinh);
            if (!isNaN(birthDate.getTime())) {
                let age = now.getFullYear() - birthDate.getFullYear();
                const m = now.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
                totalAge += Math.max(0, age);
                validAgeCount++;
            }
        }
    });
    const avgAge = validAgeCount > 0 ? (totalAge / validAgeCount).toFixed(1) : 0;
    return { total, male, female, avgAge };
  }, [safeList]);

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
    return matchName && matchID && matchYear;
  });

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div className="mb-2 md:mb-0">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Quản Lý Nhân Khẩu</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách cư dân hiện tại trong hệ thống</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Users size={24} /></div>
              <div><p className="text-xs text-gray-500 uppercase font-bold">Tổng số</p><p className="text-2xl font-bold text-gray-800">{stats.total}</p></div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><User size={24} /></div>
              <div><p className="text-xs text-gray-500 uppercase font-bold">Nam</p><p className="text-2xl font-bold text-indigo-900">{stats.male}</p></div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-pink-50 text-pink-500 rounded-full"><User size={24} /></div>
              <div><p className="text-xs text-gray-500 uppercase font-bold">Nữ</p><p className="text-2xl font-bold text-pink-700">{stats.female}</p></div>
          </div>
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-full"><Calendar size={24} /></div>
              <div><p className="text-xs text-gray-500 uppercase font-bold">Tuổi Trung Bình</p><p className="text-2xl font-bold text-green-800">{stats.avgAge}</p></div>
          </div>
      </div>

      {/* FILTER & ACTIONS */}
      <div className="flex flex-col md:flex-row gap-3 w-full items-end mb-6">
            <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Tìm tên..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>
            <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Tìm CCCD..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={searchID} onChange={(e) => setSearchID(e.target.value)} />
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
                  // Logic trạng thái
                  const status = item.trangThai && item.trangThai.trim() !== "" ? item.trangThai : "Chưa đăng ký";

                  return (
                    <motion.tr
                      key={itemId || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setViewingItem(item)}
                      className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="p-4 pl-6 font-mono text-sm text-gray-400">#{itemId?.toString().slice(-4).toUpperCase()}</td>
                      <td className="p-4">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                  {isBaby ? <Baby size={16} className="text-pink-500"/> : <User size={14} />}
                              </div>
                              <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-700">{item.hoTen}</span>
                                      {isBaby && (
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

                      {/* 👇 CỘT TRẠNG THÁI MỚI */}
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          status === "Thường trú" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          status === "Tạm trú" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          status === "Tạm vắng" ? "bg-orange-50 text-orange-700 border-orange-200" :
                          "bg-gray-100 text-gray-500 border-gray-200 italic"
                        }`}>
                          {status}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleOpenEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Chỉnh sửa"><Edit size={16} /></button>
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

      {/* 🟢 MODAL XEM CHI TIẾT NHÂN KHẨU */}
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
                    <h4 className="text-2xl font-bold text-gray-900">{viewingItem.hoTen}</h4>
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
                    <p className="text-sm text-amber-800 italic">{viewingItem.ghiChu}</p>
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
