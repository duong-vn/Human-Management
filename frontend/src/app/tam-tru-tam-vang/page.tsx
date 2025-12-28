"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createTamTruTamVang, deleteTamTruTamVang, getAllTamTruTamVang, updateTamTruTamVang } from "./api";
import { TamTruTamVang } from "./types";
import { toast } from "sonner";

// 1. IMPORT THÊM THƯ VIỆN UI
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Plus, User, Search, MapPin, Calendar } from "lucide-react";
import TamTruTamVangModal from "./tamTruTamVangModal";
import ConfirmModal from "./confirmModal";

export default function TamTruTamVangPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TamTruTamVang | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLoai, setFilterLoai] = useState<string>("");
  const [filterTrangThai, setFilterTrangThai] = useState<string>("");

  // --- LOGIC API ---
  const { data: list = [], isLoading, isError, error } = useQuery({
    queryKey: ["tam-tru-tam-vang", filterLoai, filterTrangThai],
    queryFn: () => getAllTamTruTamVang({
      loai: filterLoai || undefined,
      trangThai: filterTrangThai || undefined,
    }),
  });

  const addMutation = useMutation({
    mutationFn: createTamTruTamVang,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tam-tru-tam-vang"] });
      toast.success("Đăng ký thành công!");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Có lỗi xảy ra";
      toast.error("Lỗi đăng ký: " + message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTamTruTamVang(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tam-tru-tam-vang"] });
      toast.success("Cập nhật thành công!");
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Có lỗi xảy ra";
      toast.error("Lỗi cập nhật: " + message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTamTruTamVang,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tam-tru-tam-vang"] });
      toast.success("Đã xoá thành công!");
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error("Xoá thất bại!");
    },
  });

  // --- HANDLERS ---
  const handleOpenAdd = () => { setEditingItem(null); setIsModalOpen(true); };
  const handleOpenEdit = (item: TamTruTamVang) => { setEditingItem(item); setIsModalOpen(true); };
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

  // Filter and Search
  const safeList = Array.isArray(list) ? list : [];
  const filteredList = safeList.filter((item: any) =>
    item.hoTen && item.hoTen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Utility Functions
  const formatDiaChi = (diaChi?: any) => {
    if (!diaChi || typeof diaChi !== 'object') return "---";
    const parts = [
      diaChi.soNha,
      diaChi.duong,
      diaChi.phuongXa,
      diaChi.quanHuyen,
      diaChi.tinhThanh,
    ].filter(part => part && part.trim());
    return parts.length > 0 ? parts.join(", ") : "---";
  };

  // Loading and Error States
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-10 text-center">
        <h2 className="text-xl font-bold mb-4">Có lỗi xảy ra</h2>
        <p>{(error as Error)?.message || "Không thể tải dữ liệu"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
      {/* HEADER: Tiêu đề + Nút Thêm + Tìm kiếm + Bộ lọc */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Quản Lý Tạm Trú/Tạm Vắng</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách đăng ký tạm trú và tạm vắng</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Bộ lọc loại */}
          <select
            value={filterLoai}
            onChange={(e) => setFilterLoai(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white shadow-sm"
          >
            <option value="">Tất cả loại</option>
            <option value="Tạm trú">Tạm trú</option>
            <option value="Tạm vắng">Tạm vắng</option>
          </select>

          {/* Bộ lọc trạng thái */}
          <select
            value={filterTrangThai}
            onChange={(e) => setFilterTrangThai(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white shadow-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Đang hiệu lực">Đang hiệu lực</option>
            <option value="Hết hạn">Hết hạn</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>

          {/* Ô tìm kiếm */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm theo tên..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Nút Thêm Mới */}
          <button
            onClick={handleOpenAdd}
            disabled={addMutation.isPending}
            className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus size={18} />
            {addMutation.isPending ? "Đang xử lý..." : "Đăng ký mới"}
          </button>
        </div>
      </div>

      {/* --- BẢNG DỮ LIỆU --- */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="p-4 pl-6">Mã ID</th>
                <th className="p-4">Họ và Tên</th>
                <th className="p-4">Loại</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Địa chỉ/Nơi đến</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredList.map((item: any, index: number) => {
                  const itemId = item._id || item.id;

                  return (
                    <motion.tr
                      key={itemId || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-blue-50/50 transition-colors duration-200 group"
                    >
                      <td className="p-4 pl-6 font-mono text-sm text-gray-400">
                        #{itemId?.toString().slice(-4).toUpperCase()}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <User size={14} />
                          </div>
                          <span className="font-medium text-gray-700">{item.hoTen}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          item.loai === "Tạm trú"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-orange-50 text-orange-600 border-orange-100"
                        }`}>
                          {item.loai}
                        </span>
                      </td>

                      <td className="p-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>
                            {item.tuNgay ? new Date(item.tuNgay).toLocaleDateString("vi-VN") : "---"} -<br />
                            {item.denNgay ? new Date(item.denNgay).toLocaleDateString("vi-VN") : "---"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>
                            {item.loai === "Tạm trú" ? formatDiaChi(item.diaChiTamTru) : item.noiDen || "---"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          item.trangThai === "Đang hiệu lực"
                            ? "bg-green-50 text-green-600 border-green-100"
                            : item.trangThai === "Hết hạn"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-gray-50 text-gray-600 border-gray-100"
                        }`}>
                          {item.trangThai}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110 tooltip"
                            title="Sửa thông tin"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() => handleOpenDelete(itemId)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-110 tooltip"
                            title="Xoá đăng ký"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 italic">
                    Không tìm thấy dữ liệu nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}
      <TamTruTamVangModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editingItem}
        isLoading={addMutation.isPending || updateMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
