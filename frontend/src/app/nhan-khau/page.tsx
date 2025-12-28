"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import React Query
import {
  createNhanKhau,
  deleteNhanKhau,
  getAllNhanKhau,
  updateNhanKhau,
} from "./api";
import { NhanKhau } from "./types";
import { toast } from "sonner";
import { totalmem } from "os";
import ConfirmModal from "./confirmModal";
import NhanKhauModal from "./nhanKhauModal";

export default function NhanKhauPage() {
  const queryClient = useQueryClient(); // Dùng để ra lệnh "làm mới dữ liệu"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NhanKhau | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // 1. TỰ ĐỘNG LẤY DỮ LIỆU (Thay thế useEffect + useState)
  const {
    data: list = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["nhan-khau"], // Tên định danh cho dữ liệu này
    queryFn: getAllNhanKhau, // Hàm gọi API
  });

  // 2. XỬ LÝ THÊM MỚI (Mutation)
  const addMutation = useMutation({
    mutationFn: (newNhanKhau: any) => createNhanKhau(newNhanKhau),
    onSuccess: () => {
      // Khi thêm thành công -> Báo React Query tải lại danh sách ngay lập tức
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      toast.success("Thêm thành công!");
    },
    onError: (error: any) => {
      toast.error("Lỗi: " + (error.response?.data?.message || "Có lỗi xảy ra"));
    },
  });

  // 3. XỬ LÝ XOÁ (Mutation)
  const deleteMutation = useMutation({
    mutationFn: deleteNhanKhau,
    onSuccess: () => {
      // Khi xoá thành công -> Tự động tải lại danh sách
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      toast.success("Đã xoá thành công!");
    },
    onError: () => {
      toast.error("Xoá thất bại! Có thể do lỗi kết nối.");
    },
  });

  //4.Mutation Sửa
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateNhanKhau(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      setIsModalOpen(false);
      setEditingItem(null);
      toast.success("Cập nhật thành công!");
    },
    onError: (err: any) => toast.error("Lỗi sửa: " + err.message),
  });
  // --- CÁC HÀM SỰ KIỆN ---
//Modal thêm
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };
//modal sửa
  const handleOpenEdit =(item: NhanKhau) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }
//xử lý khi bấm nút lưu ở modal
const handleSubmitForm = (formData: any) => {
  if(editingItem) {
    const id = (editingItem as any)._id || editingItem.id;
    updateMutation.mutate({id, data: formData});
  } else {
    addMutation.mutate(formData);
  }
}

//HÀM MỞ MODAL XOÁ
const handleOpenDelete = (id: string) => {
  setDeleteId(id);
};
//HAM XAC NHAN XOA THAT
const handleConfirmDelete = () => {
  if(deleteId) {
    deleteMutation.mutate(deleteId);
  }
};
  // --- GIAO DIỆN ---

  if (isLoading) return <div>Đang tải dữ liệu...</div>;
  if (isError)
    return <div style={{ color: "red" }}>Lỗi: {(error as Error).message}</div>;

return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản Lí Nhân Khẩu</h1>

      <button
        onClick={handleOpenAdd}
        disabled={addMutation.isPending}
        style={{
          padding: "10px",
          background: addMutation.isPending ? "#ccc" : "black",
          color: "white",
          marginBottom: "20px",
        }}
      >
        {addMutation.isPending ? "Đang thêm..." : "Thêm nhân khẩu"}
      </button>

      {/* --- CHÈN 2 MODAL VÀO ĐÂY --- */}

      {/* Modal Thêm/Sửa */}
      <NhanKhauModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editingItem}
        isLoading={addMutation.isPending || updateMutation.isPending}
      />

      {/* Modal Xoá (Chỉ hiện khi có ID cần xoá) */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* --- BẢNG DỮ LIỆU --- */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>ID</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Họ Tên</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Ngày Sinh</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Giới Tính</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Số Định Danh</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item: any) => {
              const itemId = item._id || item.id;
              return (
                <tr key={itemId || Math.random()}>
                  <td style={{ padding: "10px", border: "1px solid #ccc", textAlign: "center" }}>
                    {itemId?.toString().slice(-4)}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>{item.hoTen}</td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString("vi-VN") : ""}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc", textAlign: "center" }}>
                    {item.gioiTinh}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {item.soDinhDanh?.so || item.soDinhDanh?.soDinhDanh || item.cccd || ""}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc", textAlign: "center" }}>

                    {/* Nút Sửa */}
                    <button
                        onClick={() => handleOpenEdit(item)}
                        style={{ marginRight: "10px", color: "blue", cursor: "pointer", border: "none", background: "none", textDecoration: "underline" }}
                    >
                        Sửa
                    </button>

                    {/* Nút Xoá: Gọi handleOpenDelete thay vì handleDelete */}
                    <button
                      onClick={() => handleOpenDelete(itemId)}
                      style={{
                        padding: "5px 10px",
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
