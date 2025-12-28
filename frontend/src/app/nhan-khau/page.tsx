"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createNhanKhau, deleteNhanKhau, getAllNhanKhau, updateNhanKhau } from "./api";
import { NhanKhau } from "./types";
import { toast } from "sonner";

// 1. IMPORT THÊM THƯ VIỆN UI
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Plus, User, Search } from "lucide-react";
import NhanKhauModal from "./nhanKhauModal";
import ConfirmModal from "./confirmModal";

export default function NhanKhauPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NhanKhau | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- LOGIC API ---
  const { data: list = [], isLoading, isError, error } = useQuery({
    queryKey: ["nhan-khau"],
    queryFn: getAllNhanKhau,
  });

  const addMutation = useMutation({
    mutationFn: (newNhanKhau: any) => createNhanKhau(newNhanKhau),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      toast.success("Thêm thành công!");
      setIsModalOpen(false);
    },
    onError: (error: any) => toast.error("Lỗi: " + (error.response?.data?.message || "Có lỗi xảy ra")),
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

  // --- HÀM LÀM SẠCH DỮ LIỆU (FIX LỖI CONTROLLED INPUT) ---
  const sanitizeItem = (item: any) => {
    // Tạo bản sao để không ảnh hưởng dữ liệu gốc
    const cleanItem = { ...item };

    // Duyệt qua các key, nếu null/undefined thì gán thành chuỗi rỗng ""
    Object.keys(cleanItem).forEach((key) => {
      if (cleanItem[key] === null || cleanItem[key] === undefined) {
        cleanItem[key] = "";
      }
    });

    // Xử lý riêng object lồng nhau (Số định danh, Địa chỉ...)
    if (cleanItem.soDinhDanh) {
        cleanItem.soDinhDanh = {
            ...cleanItem.soDinhDanh,
            so: cleanItem.soDinhDanh.so || "",
            ngayCap: cleanItem.soDinhDanh.ngayCap || "",
            noiCap: cleanItem.soDinhDanh.noiCap || "",
        };
    }
    // (Tương tự với diaChiThuongTru nếu cần)

    return cleanItem;
  };

  // --- HANDLERS ---
  const handleOpenAdd = () => {
      setEditingItem(null);
      setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NhanKhau) => {
      // 👇 SỬ DỤNG HÀM SANITIZE TẠI ĐÂY
      const cleanData = sanitizeItem(item);
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
  const handleOpenDelete = (id: string) => setDeleteId(id);
  const handleConfirmDelete = () => { if (deleteId) deleteMutation.mutate(deleteId); };

  // Lọc danh sách theo tìm kiếm
  const safeList = Array.isArray(list) ? list : [];

  const filteredList = safeList.filter((item: any) =>
    item.hoTen ? item.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) : false
  );

  // --- GIAO DIỆN ---

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );

  if (isError) return <div className="text-red-500 p-10">Lỗi: {(error as Error).message}</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Quản Lý Nhân Khẩu</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách cư dân hiện tại trong hệ thống</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
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
            {addMutation.isPending ? "Đang xử lý..." : "Thêm mới"}
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
                <th className="p-4">Ngày Sinh</th>
                <th className="p-4 text-center">Giới Tính</th>
                <th className="p-4">Số Định Danh</th>
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

                      <td className="p-4 text-gray-600 text-sm">
                        {item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString("vi-VN") : "---"}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            item.gioiTinh === "Nam"
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : "bg-pink-50 text-pink-600 border-pink-100"
                        }`}>
                            {item.gioiTinh}
                        </span>
                      </td>

                      <td className="p-4 text-gray-500 text-sm font-mono">
                          {item.soDinhDanh?.so || item.soDinhDanh?.soDinhDanh || "---"}
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
                                title="Xoá nhân khẩu"
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
                    <td colSpan={6} className="text-center py-10 text-gray-400 italic">
                        Không tìm thấy dữ liệu nào.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NhanKhauModal
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
