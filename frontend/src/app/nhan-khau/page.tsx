"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import React Query
import { createNhanKhau, deleteNhanKhau, getAllNhanKhau } from "./api";
import { NhanKhau } from "./types";

export default function NhanKhauPage() {
  const queryClient = useQueryClient(); // Dùng để ra lệnh "làm mới dữ liệu"

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
      alert("Thêm thành công!");
    },
    onError: (error: any) => {
      alert("Lỗi: " + (error.response?.data?.message || "Có lỗi xảy ra"));
    },
  });

  // 3. XỬ LÝ XOÁ (Mutation)
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNhanKhau(id),
    onSuccess: () => {
      // Khi xoá thành công -> Tự động tải lại danh sách
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      alert("Đã xoá thành công!");
    },
    onError: () => {
      alert("Xoá thất bại! Có thể do lỗi kết nối.");
    },
  });

  // --- CÁC HÀM SỰ KIỆN ---

  const handleAdd = () => {
    const newNhanKhau: Omit<NhanKhau, "id"> = {
      hoTen: "Luong Thanh Tung",
      biDanh: "tungcso",
      danToc: "Kinh",
      ngaySinh: new Date("2005-08-08").toISOString(), // Đã sửa lỗi dấu : thừa
      gioiTinh: "Nam",
      soDinhDanh: {
        loai: "CCCD", // Sửa lại cho khớp backend nếu cần
        so: "0123864213",
        ngayCap: new Date("2020-01-01").toISOString(),
        noiCap: "Ha Noi",
      },
      hoKhauId: "65b2a3c4d5e6f7a8b9c0d1e2",
      trangThai: "Thường trú",
      quocTich: "Việt Nam",
      tonGiao: "Không",
      quanHeVoiChuHo: "Con",
      queQuan: "Ha Noi",
      noiSinh: "Ha Noi",
      ngheNghiep: "Sinh vien",
      noiLamViec: "HUST",
      diaChiThuongTru: {
        soNha: "12",
        duong: "nguyen duong",
        phuongXa: "Nhat ban",
        quanHuyen: "2",
        tinhThanh: "Thanh Pho",
      },
      diaChiHienTai: {
        soNha: "12",
        duong: "nguyen duong",
        phuongXa: "Nhat ban",
        quanHuyen: "2",
        tinhThanh: "Thanh Pho",
      },
    };

    // Gọi mutation thêm
    addMutation.mutate(newNhanKhau);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xoá?")) return;
    // Gọi mutation xoá
    deleteMutation.mutate(id);
  };

  // --- GIAO DIỆN ---

  if (isLoading) return <div>Đang tải dữ liệu...</div>;
  if (isError)
    return <div style={{ color: "red" }}>Lỗi: {(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản Lí Nhân Khẩu</h1>

      <button
        onClick={handleAdd}
        disabled={addMutation.isPending} // Khoá nút khi đang thêm
        style={{
          padding: "10px",
          background: addMutation.isPending ? "#ccc" : "black",
          color: "white",
          marginBottom: "20px",
        }}
      >
        {addMutation.isPending ? "Đang thêm..." : "Thêm nhân khẩu"}
      </button>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccc",
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>ID</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Họ Tên
              </th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Ngày Sinh
              </th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Giới Tính
              </th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Số Định Danh
              </th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((item: any) => {
              const itemId = item._id || item.id;
              return (
                <tr key={itemId || Math.random()}>
                  <td
                    style={{
                      padding: "10px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    {itemId?.toString().slice(-4)}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {item.hoTen}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {item.ngaySinh
                      ? new Date(item.ngaySinh).toLocaleDateString("vi-VN")
                      : ""}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    {item.gioiTinh}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {item.soDinhDanh?.so ||
                      item.soDinhDanh?.soDinhDanh ||
                      item.cccd ||
                      ""}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    <button
                      onClick={() => handleDelete(itemId)}
                      disabled={deleteMutation.isPending}
                      style={{
                        padding: "5px 10px",
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        opacity: deleteMutation.isPending ? 0.5 : 1,
                      }}
                    >
                      {deleteMutation.isPending ? "..." : "Xoá"}
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
