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
import { Edit, Trash2, Plus, User, Search, Users, Calendar, Baby, X, Sparkles } from "lucide-react"; // 👈 Thêm icon Sparkles
import NhanKhauModal from "./nhanKhauModal";
import ConfirmModal from "./confirmModal";

export default function NhanKhauPage() {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoiSinhModalOpen, setIsMoiSinhModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NhanKhau | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [searchName, setSearchName] = useState("");
  const [searchID, setSearchID] = useState("");
  const [searchYear, setSearchYear] = useState("");

  const [moiSinhForm, setMoiSinhForm] = useState({
      hoTen: "",
      ngaySinh: "",
      gioiTinh: "Nam",
      hoKhauId: "",
      quanHeVoiChuHo: "Con"
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

  // --- MUTATIONS (Giữ nguyên) ---
  const addMutation = useMutation({
    mutationFn: (newNhanKhau: any) => createNhanKhau(newNhanKhau),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      toast.success("Thêm nhân khẩu thành công!");
      setIsModalOpen(false);
    },
    onError: (error: any) => toast.error("Lỗi: " + (error.response?.data?.message || "Có lỗi xảy ra")),
  });

  const addMoiSinhMutation = useMutation({
    mutationFn: (data: any) => createMoiSinh(data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
        toast.success("Đã thêm trẻ mới sinh thành công!");
        setIsMoiSinhModalOpen(false);
        setMoiSinhForm({
            hoTen: "", ngaySinh: "", gioiTinh: "Nam", hoKhauId: "", quanHeVoiChuHo: "Con"
        });
    },
    onError: (err: any) => toast.error("Lỗi: " + (err.response?.data?.message || err.message))
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNhanKhau,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      toast.success("Đã xoá thành công!");
      setDeleteId(null);
    },
    onError: () => toast.error("Xoá thất bại!"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateNhanKhau(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      setIsModalOpen(false);
      setEditingItem(null);
      toast.success("Cập nhật thành công!");
    },
    onError: (err: any) => toast.error("Lỗi sửa: " + err.message),
  });

  // --- HANDLERS ---
  const handleSubmitMoiSinh = () => {
      if(!moiSinhForm.hoTen || !moiSinhForm.ngaySinh || !moiSinhForm.hoKhauId) {
          toast.error("Vui lòng điền đủ: Họ tên, Ngày sinh, Hộ khẩu");
          return;
      }
      addMoiSinhMutation.mutate(moiSinhForm);
  };

  const sanitizeItem = (item: any) => {
    const cleanItem = { ...item };
    Object.keys(cleanItem).forEach((key) => {
      if (cleanItem[key] === null || cleanItem[key] === undefined) {
        cleanItem[key] = "";
      }
    });
    if (cleanItem.soDinhDanh) {
        cleanItem.soDinhDanh = {
            ...cleanItem.soDinhDanh,
            so: cleanItem.soDinhDanh.so || "",
            ngayCap: cleanItem.soDinhDanh.ngayCap || "",
            noiCap: cleanItem.soDinhDanh.noiCap || "",
        };
    }
    return cleanItem;
  };

  const handleOpenAdd = () => { setEditingItem(null); setIsModalOpen(true); };
  const handleOpenEdit = (item: NhanKhau) => { const cleanData = sanitizeItem(item); setEditingItem(cleanData); setIsModalOpen(true); };
  const handleSubmitForm = (formData: any) => {
    if (editingItem) {
      const id = (editingItem as any)._id || editingItem.id;
      updateMutation.mutate({ id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };
  const handleOpenDelete = (id: string) => setDeleteId(id);
  const handleConfirmDelete = () => { if (deleteId) deleteMutation.mutate(deleteId); };

  // --- LOGIC LỌC ---
  const safeList = Array.isArray(list) ? list : [];

  const filteredList = safeList.filter((item: any) => {
    const termName = searchName.toLowerCase().trim();
    const matchName = termName ? (item.hoTen ? item.hoTen.toLowerCase().includes(termName) : false) : true;
    const termID = searchID.toLowerCase().trim();
    const cccd = item.soDinhDanh?.so || item.soDinhDanh?.soDinhDanh || "";
    const matchID = termID ? cccd.toString().toLowerCase().includes(termID) : true;
    const termYear = searchYear.trim();
    let matchYear = true;
    if (termYear) {
        if (item.ngaySinh) {
             const year = new Date(item.ngaySinh).getFullYear().toString();
             matchYear = year.includes(termYear);
        } else { matchYear = false; }
    }
    return matchName && matchID && matchYear;
  });

  const stats = useMemo(() => {
    const total = safeList.length;
    let male = 0;
    let female = 0;
    let totalAge = 0;
    let validAgeCount = 0;
    const currentYear = new Date().getFullYear();
    safeList.forEach((item: any) => {
        if (item.gioiTinh === "Nam") male++;
        else if (item.gioiTinh === "Nữ") female++;
        if (item.ngaySinh) {
            const birthYear = new Date(item.ngaySinh).getFullYear();
            if (!isNaN(birthYear)) {
                totalAge += (currentYear - birthYear);
                validAgeCount++;
            }
        }
    });
    const avgAge = validAgeCount > 0 ? (totalAge / validAgeCount).toFixed(1) : 0;
    return { total, male, female, avgAge };
  }, [safeList]);

  // 👇 HÀM KIỂM TRA MỚI SINH (Dưới 12 tháng tuổi)
  const checkIsMoiSinh = (ngaySinh: string) => {
      if (!ngaySinh) return false;
      const birth = new Date(ngaySinh);
      const now = new Date();
      // Tính số tháng chênh lệch
      const monthDiff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      return monthDiff < 12 && monthDiff >= 0;
  };

  // --- GIAO DIỆN ---
  if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>;
  if (isError) return <div className="text-red-500 p-10">Lỗi: {(error as Error).message}</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
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
              <div><p className="text-xs text-gray-500 uppercase font-bold">Tổng Nhân Khẩu</p><p className="text-2xl font-bold text-gray-800">{stats.total}</p></div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><User size={24} /></div>
              <div><p className="text-xs text-gray-500 uppercase font-bold">Nam Giới</p><p className="text-2xl font-bold text-indigo-900">{stats.male}</p></div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-pink-50 text-pink-500 rounded-full"><User size={24} /></div>
              <div><p className="text-xs text-gray-500 uppercase font-bold">Nữ Giới</p><p className="text-2xl font-bold text-pink-700">{stats.female}</p></div>
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
                <input type="text" placeholder="Tìm tên..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>
            <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Tìm CCCD..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm" value={searchID} onChange={(e) => setSearchID(e.target.value)} />
            </div>
            <div className="relative w-full md:w-32">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="number" placeholder="Năm sinh..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm" value={searchYear} onChange={(e) => setSearchYear(e.target.value)} />
            </div>

            <div className="ml-auto flex gap-2">
                <button onClick={() => setIsMoiSinhModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-95 whitespace-nowrap h-[38px] text-sm font-medium">
                    <Baby size={18} /> Thêm Mới Sinh
                </button>
                <button onClick={handleOpenAdd} disabled={addMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap h-[38px] text-sm font-medium">
                    <Plus size={18} /> Thêm Nhân Khẩu
                </button>
            </div>
      </div>

      {/* TABLE */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="p-4 pl-6">Mã ID</th>
                <th className="p-4">Họ và Tên</th>
                <th className="p-4">Ngày Sinh</th>
                <th className="p-4 text-center">Giới Tính</th>
                <th className="p-4">Số Định Danh</th>
                <th className="p-4">Ngày Nhập</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredList.map((item: any, index: number) => {
                  const itemId = item._id || item.id;
                  const isBaby = checkIsMoiSinh(item.ngaySinh); // Kiểm tra mới sinh

                  return (
                    <motion.tr
                      key={itemId || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-blue-50/50 transition-colors duration-200 group"
                    >
                      <td className="p-4 pl-6 font-mono text-sm text-gray-400">#{itemId?.toString().slice(-4).toUpperCase()}</td>

                      {/* 👇 CỘT HỌ TÊN CÓ HIỂN THỊ BADGE MỚI SINH */}
                      <td className="p-4">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                  {isBaby ? <Baby size={16} className="text-pink-500"/> : <User size={14} />}
                              </div>
                              <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-700">{item.hoTen}</span>
                                      {isBaby && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-600 border border-pink-200 uppercase tracking-wide">
                                              <Sparkles size={10} /> Mới sinh
                                          </span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </td>

                      <td className="p-4 text-gray-600 text-sm">{item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString("vi-VN") : "---"}</td>
                      <td className="p-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-medium border ${item.gioiTinh === "Nam" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-pink-50 text-pink-600 border-pink-100"}`}>{item.gioiTinh}</span></td>
                      <td className="p-4 text-gray-500 text-sm font-mono">{item.soDinhDanh?.so || item.soDinhDanh?.soDinhDanh || "---"}</td>
                      <td className="p-4 text-gray-600 text-sm">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : (item.ngayChuyenDen ? new Date(item.ngayChuyenDen).toLocaleDateString("vi-VN") : "---")}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button onClick={() => handleOpenEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110 tooltip"><Edit size={16} /></button>
                            <button onClick={() => handleOpenDelete(itemId)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-110 tooltip"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filteredList.length === 0 && (<tr><td colSpan={7} className="text-center py-10 text-gray-400 italic">Không tìm thấy dữ liệu nào.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MỚI SINH (Giữ nguyên) */}
      {isMoiSinhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-indigo-50">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><Baby className="text-indigo-600"/> Khai Báo Mới Sinh</h3>
                    <button onClick={() => setIsMoiSinhModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên trẻ (*)</label><input type="text" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={moiSinhForm.hoTen} onChange={e => setMoiSinhForm({...moiSinhForm, hoTen: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh (*)</label><input type="date" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={moiSinhForm.ngaySinh} onChange={e => setMoiSinhForm({...moiSinhForm, ngaySinh: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label><select className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={moiSinhForm.gioiTinh} onChange={e => setMoiSinhForm({...moiSinhForm, gioiTinh: e.target.value})} ><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Thuộc hộ khẩu (*)</label><select className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={moiSinhForm.hoKhauId} onChange={e => setMoiSinhForm({...moiSinhForm, hoKhauId: e.target.value})} ><option value="">-- Chọn hộ khẩu --</option>{listHoKhau.map((hk: any) => (<option key={hk._id || hk.id} value={hk._id || hk.id}>{hk.maHoKhau} - {hk.chuHo?.hoTen}</option>))}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Quan hệ với chủ hộ</label><input type="text" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={moiSinhForm.quanHeVoiChuHo} onChange={e => setMoiSinhForm({...moiSinhForm, quanHeVoiChuHo: e.target.value})} /></div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3"><button onClick={() => setIsMoiSinhModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">Hủy bỏ</button><button onClick={handleSubmitMoiSinh} disabled={addMoiSinhMutation.isPending} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md disabled:opacity-50">{addMoiSinhMutation.isPending ? "Đang xử lý..." : "Xác nhận thêm"}</button></div>
             </div>
        </div>
      )}

      {/* CÁC MODAL CŨ */}
      <NhanKhauModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmitForm} initialData={editingItem} isLoading={addMutation.isPending || updateMutation.isPending} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleConfirmDelete} isLoading={deleteMutation.isPending} />
    </div>
  );
}
