"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, deleteUser, getAllUsers, updateUser } from "./api";
import { User, UserRole } from "./types";
import { toast } from "sonner";

// UI Imports
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Plus, User as UserIcon, Search, Shield, Mail, Phone } from "lucide-react";
import UserModal from "./userModal";
import ConfirmModal from "./confirmModal";

export default function UserPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("");

  // API Queries & Mutations
  const { data: list = [], isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const addMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Thêm user thành công!");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Có lỗi xảy ra";
      toast.error("Lỗi thêm user: " + message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Đã xoá thành công!");
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error("Xoá thất bại!");
    },
  });

  // Event Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: User) => {
    setEditingItem(item);
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

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  // Utility Functions
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.TO_TRUONG: return "Tổ trưởng";
      case UserRole.TO_PHO: return "Tổ phó";
      case UserRole.KE_TOAN: return "Kế toán";
      case UserRole.CAN_BO: return "Cán bộ";
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.TO_TRUONG: return "bg-purple-50 text-purple-600 border-purple-100";
      case UserRole.TO_PHO: return "bg-blue-50 text-blue-600 border-blue-100";
      case UserRole.KE_TOAN: return "bg-green-50 text-green-600 border-green-100";
      case UserRole.CAN_BO: return "bg-gray-50 text-gray-600 border-gray-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  // Filter and Search
  const safeList = Array.isArray(list) ? list : [];
  const filteredList = safeList.filter((item: any) => {
    const matchesSearch = item.hoTen && item.hoTen.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || item.role === filterRole;
    const matchesActive = filterActive === "" || item.isActive === (filterActive === "true");
    return matchesSearch && matchesRole && matchesActive;
  });

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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Quản Lý User
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Danh sách người dùng hệ thống
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Filter by Role */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white shadow-sm"
          >
            <option value="">Tất cả quyền</option>
            <option value={UserRole.TO_TRUONG}>Tổ trưởng</option>
            <option value={UserRole.TO_PHO}>Tổ phó</option>
            <option value={UserRole.KE_TOAN}>Kế toán</option>
            <option value={UserRole.CAN_BO}>Cán bộ</option>
          </select>

          {/* Filter by Active Status */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white shadow-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Không hoạt động</option>
          </select>

          {/* Search */}
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

          {/* Add Button */}
          <button
            onClick={handleOpenAdd}
            disabled={addMutation.isPending}
            className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus size={18} />
            {addMutation.isPending ? "Đang xử lý..." : "Thêm user"}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="p-4 pl-6">Mã ID</th>
                <th className="p-4">Họ và Tên</th>
                <th className="p-4">Username</th>
                <th className="p-4">Email</th>
                <th className="p-4">Quyền</th>
                <th className="p-4">Số điện thoại</th>
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
                            <UserIcon size={14} />
                          </div>
                          <span className="font-medium text-gray-700">{item.hoTen}</span>
                        </div>
                      </td>

                      <td className="p-4 text-gray-600 text-sm">
                        {item.username}
                      </td>

                      <td className="p-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          {item.email}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(item.role)}`}>
                          {getRoleLabel(item.role)}
                        </span>
                      </td>

                      <td className="p-4 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          {item.soDienThoai || "---"}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          item.isActive
                            ? "bg-green-50 text-green-600 border-green-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}>
                          {item.isActive ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                            title="Sửa thông tin"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() => handleOpenDelete(itemId)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                            title="Xoá user"
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
                  <td colSpan={8} className="text-center py-10 text-gray-400 italic">
                    Không tìm thấy dữ liệu nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <UserModal
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
