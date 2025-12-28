"use client";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createThuPhi, createKhoanThu, getAllThuPhi } from "./api";
import { toast } from "sonner";
import {
  Plus,
  Settings,
  User,
  Calendar,
  CheckCircle, // 👇 Thêm icon này
  Clock        // 👇 Thêm icon này
} from "lucide-react";
import ThuPhiModal from "./ThuPhiModal";
import CreateKhoanThuModal from "./CreateKhoanThuModal";

export default function ThuPhiPage() {
  const queryClient = useQueryClient();
  const [isThuPhiModalOpen, setIsThuPhiModalOpen] = useState(false);
  const [isKhoanThuModalOpen, setIsKhoanThuModalOpen] = useState(false);

  // 1. LẤY DANH SÁCH PHIẾU THU
  const { data: listThuPhi = [], isLoading } = useQuery({
    queryKey: ["thu-phi"],
    queryFn: async () => {
      const res = await getAllThuPhi();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  // Mutation 1: Tạo Phiếu Thu
  const createPhieuThuMutation = useMutation({
    mutationFn: createThuPhi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thu-phi"] });
      setIsThuPhiModalOpen(false);
      toast.success("Tạo phiếu thu thành công!");
    },
    onError: (err: any) =>
      toast.error("Lỗi: " + (err.response?.data?.message || "Thất bại")),
  });

  // Mutation 2: Tạo Khoản Thu
  const createKhoanThuMutation = useMutation({
    mutationFn: createKhoanThu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["khoan-thu"] });
      setIsKhoanThuModalOpen(false);
      toast.success("Đã thêm khoản thu mới!");
    },
    onError: (err: any) => toast.error("Lỗi tạo khoản thu: " + err.message),
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản Lý Thu Phí</h1>
          <p className="text-gray-500 mt-1">
            Lịch sử đóng góp và thu phí của cư dân
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsKhoanThuModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all active:scale-95"
          >
            <Settings size={18} /> Thêm Khoản Thu
          </button>

          <button
            onClick={() => setIsThuPhiModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 transition-all active:scale-95"
          >
            <Plus size={20} /> Thu Phí Mới
          </button>
        </div>
      </div>

      {/* BODY: BẢNG DANH SÁCH */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-4">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="p-4 pl-6">Mã Phiếu</th>
                  <th className="p-4">Hộ Khẩu / Chủ Hộ</th>
                  <th className="p-4">Kỳ Thu</th>
                  <th className="p-4">Chi Tiết</th>
                  <th className="p-4 text-right">Tổng Tiền</th>
                  {/* 👇 Đã có header, giờ ta thêm body tương ứng */}
                  <th className="p-4 text-right">Ngày Thu</th>
                  <th className="p-4 text-right">Trạng thái</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {!listThuPhi || listThuPhi.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-10 text-gray-400 italic"
                    >
                      Chưa có phiếu thu nào. Hãy thử tạo mới!
                    </td>
                  </tr>
                ) : (
                  listThuPhi.map((item: any, index: number) => {
                    const total = item.chiTietThu
                      ? item.chiTietThu.reduce(
                          (sum: number, ct: any) => sum + (ct.soTien || 0),
                          0
                        )
                      : 0;

                    return (
                      <tr
                        key={item._id || index}
                        className="hover:bg-blue-50 transition-colors duration-200"
                      >
                        <td className="p-4 pl-6 font-mono text-sm text-gray-400">
                          #{item.maPhieuThu?.slice(-6).toUpperCase() || item._id?.toString().slice(-6).toUpperCase()}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <User size={14} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">
                                {item.tenChuHo || item.hoKhauId?.chuHo?.hoTen || "Chưa xác định"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.diaChi || item.hoKhauId?.diaChiThuongTru?.soNha || ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="text-sm text-gray-600 font-medium">
                            {item.kyThu}
                          </span>
                          <span className="text-xs text-gray-400 block">
                            {item.nam}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {item.chiTietThu?.map((ct: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded border border-gray-200 truncate max-w-[150px]"
                                title={ct.tenKhoanThu}
                              >
                                {ct.tenKhoanThu || "Khoản thu"}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                            {total.toLocaleString("vi-VN")} đ
                          </span>
                        </td>

                        {/* 👇 CỘT NGÀY THU */}
                        <td className="p-4 text-right text-sm text-gray-600">
                            {item.ngayThu ? (
                                <div className="flex items-center justify-end gap-2">
                                    {new Date(item.ngayThu).toLocaleDateString("vi-VN")}
                                    <Calendar size={14} className="text-gray-400" />
                                </div>
                            ) : (
                                <span className="text-gray-300">--/--/----</span>
                            )}
                        </td>

                        {/* 👇 CỘT TRẠNG THÁI */}
                        <td className="p-4 text-right">
                            {item.trangThai === "Đã thu" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                                    <CheckCircle size={12} /> Đã thu
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-200">
                                    <Clock size={12} /> Chờ thu
                                </span>
                            )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CÁC MODAL */}
      <ThuPhiModal
        isOpen={isThuPhiModalOpen}
        onClose={() => setIsThuPhiModalOpen(false)}
        onSubmit={(data: any) => createPhieuThuMutation.mutate(data)}
        isLoading={createPhieuThuMutation.isPending}
      />

      <CreateKhoanThuModal
        isOpen={isKhoanThuModalOpen}
        onClose={() => setIsKhoanThuModalOpen(false)}
        onSubmit={(data: any) => createKhoanThuMutation.mutate(data)}
        isLoading={createKhoanThuMutation.isPending}
      />
    </div>
  );
}
