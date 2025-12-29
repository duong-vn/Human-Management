"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Filter,
  History,
  Users,
  MapPin,
} from "lucide-react";

import {
  getAllHoKhau,
  getHoKhauById,
  createHoKhau,
  updateHoKhau,
  deleteHoKhau,
  tachHo,
  doiChuHo,
  themThanhVien,
  xoaThanhVien,
  getLichSuHoKhau,
  getAllNhanKhau,
  findNhanKhauByCCCD,
  capNhatQuanHeThanhVien,
} from "./api";
import {
  HoKhau,
  CreateHoKhauParams,
  TachHoParams,
  DoiChuHoParams,
  ThemThanhVienParams,
  LichSuThayDoi,
  NhanKhauBasic,
} from "./types";

// Import các modal
import HoKhauFormModal from "./HoKhauFormModal";
import HoKhauDetailModal from "./HoKhauDetailModal";
import ThemThanhVienModal from "./ThemThanhVienModal";
import TachHoModal from "./TachHoModal";
import DoiChuHoModal from "./DoiChuHoModal";
import LichSuModal from "./LichSuModal";
import ConfirmModal from "./ConfirmModal";

export default function HoKhauPage() {
  const queryClient = useQueryClient();

  // States cho các modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isThemThanhVienModalOpen, setIsThemThanhVienModalOpen] =
    useState(false);
  const [isTachHoModalOpen, setIsTachHoModalOpen] = useState(false);
  const [isDoiChuHoModalOpen, setIsDoiChuHoModalOpen] = useState(false);
  const [isLichSuModalOpen, setIsLichSuModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isXoaThanhVienModalOpen, setIsXoaThanhVienModalOpen] = useState(false);

  // States cho dữ liệu
  const [selectedHoKhau, setSelectedHoKhau] = useState<HoKhau | null>(null);
  const [editingHoKhau, setEditingHoKhau] = useState<HoKhau | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [xoaThanhVienData, setXoaThanhVienData] = useState<{
    nhanKhauId: string;
    hoTen: string;
  } | null>(null);
  const [lichSu, setLichSu] = useState<LichSuThayDoi[]>([]);

  // States cho filter/search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("Đang hoạt động");

  // --- QUERIES ---
  const {
    data: hoKhauList = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["ho-khau", filterTrangThai, searchTerm],
    queryFn: () =>
      getAllHoKhau({
        trangThai: filterTrangThai || undefined,
        search: searchTerm || undefined,
      }),
  });

  const { data: nhanKhauList = [] } = useQuery({
    queryKey: ["nhan-khau"],
    queryFn: getAllNhanKhau,
  });

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: createHoKhau,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ho-khau"] });
      toast.success("Tạo hộ khẩu thành công!");
      setIsFormModalOpen(false);
    },
    onError: (err: any) =>
      toast.error("Lỗi: " + (err.response?.data?.message || err.message)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateHoKhauParams>;
    }) => updateHoKhau(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ho-khau"] });
      toast.success("Cập nhật hộ khẩu thành công!");
      setIsFormModalOpen(false);
      setEditingHoKhau(null);
      // Refresh selected nếu đang xem detail
      if (selectedHoKhau) {
        refreshSelectedHoKhau(selectedHoKhau._id || selectedHoKhau.id || "");
      }
    },
    onError: (err: any) =>
      toast.error("Lỗi: " + (err.response?.data?.message || err.message)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHoKhau,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ho-khau"] });
      toast.success("Xóa hộ khẩu thành công!");
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    },
    onError: (err: any) =>
      toast.error("Lỗi: " + (err.response?.data?.message || err.message)),
  });

  const tachHoMutation = useMutation({
    mutationFn: tachHo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ho-khau"] });
      toast.success("Tách hộ thành công!");
      setIsTachHoModalOpen(false);
      setIsDetailModalOpen(false);
    },
    onError: (err: any) =>
      toast.error("Lỗi: " + (err.response?.data?.message || err.message)),
  });

  const doiChuHoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DoiChuHoParams }) =>
      doiChuHo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ho-khau"] });
      toast.success("Đổi chủ hộ thành công!");
      setIsDoiChuHoModalOpen(false);
      if (selectedHoKhau) {
        refreshSelectedHoKhau(selectedHoKhau._id || selectedHoKhau.id || "");
      }
    },
    onError: (err: any) =>
      toast.error("Lỗi: " + (err.response?.data?.message || err.message)),
  });

  const themThanhVienMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ThemThanhVienParams }) =>
      themThanhVien(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ho-khau"] });
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      toast.success("Thêm thành viên thành công!");
      setIsThemThanhVienModalOpen(false);
      if (selectedHoKhau) {
        refreshSelectedHoKhau(selectedHoKhau._id || selectedHoKhau.id || "");
      }
    },
    onError: (err: any) =>
      toast.error("Lỗi: " + (err.response?.data?.message || err.message)),
  });

  const xoaThanhVienMutation = useMutation({
    mutationFn: ({
      hoKhauId,
      nhanKhauId,
    }: {
      hoKhauId: string;
      nhanKhauId: string;
    }) => xoaThanhVien(hoKhauId, nhanKhauId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ho-khau"] });
      queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
      toast.success("Xóa thành viên khỏi hộ thành công!");
      setIsXoaThanhVienModalOpen(false);
      setXoaThanhVienData(null);
      if (selectedHoKhau) {
        refreshSelectedHoKhau(selectedHoKhau._id || selectedHoKhau.id || "");
      }
    },
    onError: (err: any) =>
      toast.error("Lỗi: " + (err.response?.data?.message || err.message)),
  });

  const capNhatQuanHeMutation = useMutation({
    mutationFn: ({
      hoKhauId,
      nhanKhauId,
      quanHeVoiChuHo,
    }: {
      hoKhauId: string;
      nhanKhauId: string;
      quanHeVoiChuHo: string;
    }) => capNhatQuanHeThanhVien(hoKhauId, nhanKhauId, quanHeVoiChuHo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ho-khau"] });
      toast.success("Cập nhật quan hệ thành công!");
      if (editingHoKhau) {
        refreshSelectedHoKhau(editingHoKhau._id || editingHoKhau.id || "").then(
          (updated) => {
            if (updated) setEditingHoKhau(updated as HoKhau);
          }
        );
      }
    },
    onError: (err: any) =>
      toast.error("Lỗi: " + (err.response?.data?.message || err.message)),
  });

  // --- HELPER FUNCTIONS ---
  const refreshSelectedHoKhau = async (id: string) => {
    try {
      const updated = await getHoKhauById(id);
      setSelectedHoKhau(updated);
      return updated;
    } catch {
      // Ignore
      return null;
    }
  };

  const handleOpenDetail = async (hoKhau: HoKhau) => {
    const id = hoKhau._id || hoKhau.id || "";
    try {
      const detail = await getHoKhauById(id);
      setSelectedHoKhau(detail);
      setIsDetailModalOpen(true);
    } catch {
      toast.error("Không thể tải chi tiết hộ khẩu");
    }
  };

  const handleOpenCreate = () => {
    setEditingHoKhau(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = () => {
    setEditingHoKhau(selectedHoKhau);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleOpenLichSu = async () => {
    if (!selectedHoKhau) return;
    const id = selectedHoKhau._id || selectedHoKhau.id || "";
    try {
      const data = await getLichSuHoKhau(id);
      setLichSu(data);
      setIsLichSuModalOpen(true);
    } catch {
      toast.error("Không thể tải lịch sử");
    }
  };

  const handleXoaThanhVien = (nhanKhauId: string, hoTen: string) => {
    setXoaThanhVienData({ nhanKhauId, hoTen });
    setIsXoaThanhVienModalOpen(true);
  };

  const handleUpdateQuanHe = (nhanKhauId: string, quanHeVoiChuHo: string) => {
    if (!editingHoKhau) return;
    const hoKhauId = editingHoKhau._id || editingHoKhau.id || "";
    capNhatQuanHeMutation.mutate({ hoKhauId, nhanKhauId, quanHeVoiChuHo });
  };

  // --- SUBMIT HANDLERS ---
  const handleSubmitForm = (data: CreateHoKhauParams) => {
    if (editingHoKhau) {
      const id = editingHoKhau._id || editingHoKhau.id || "";
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleSubmitTachHo = (data: TachHoParams) => {
    tachHoMutation.mutate(data);
  };

  const handleSubmitDoiChuHo = (data: DoiChuHoParams) => {
    if (!selectedHoKhau) return;
    const id = selectedHoKhau._id || selectedHoKhau.id || "";
    doiChuHoMutation.mutate({ id, data });
  };

  const handleSubmitThemThanhVien = (data: ThemThanhVienParams) => {
    if (!selectedHoKhau) return;
    const id = selectedHoKhau._id || selectedHoKhau.id || "";
    themThanhVienMutation.mutate({ id, data });
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const handleConfirmXoaThanhVien = () => {
    if (!selectedHoKhau || !xoaThanhVienData) return;
    const hoKhauId = selectedHoKhau._id || selectedHoKhau.id || "";
    xoaThanhVienMutation.mutate({
      hoKhauId,
      nhanKhauId: xoaThanhVienData.nhanKhauId,
    });
  };

  // --- HELPERS ---
  const formatDiaChi = (diaChi?: HoKhau["diaChi"]) => {
    if (!diaChi) return "---";
    const { soNha, duong, phuongXa, quanHuyen, tinhThanh } = diaChi;
    const parts = [soNha, duong, phuongXa, quanHuyen, tinhThanh].filter(
      Boolean
    );
    return parts.join(", ") || "---";
  };

  const getTrangThaiBadge = (trangThai: string) => {
    switch (trangThai) {
      case "Đang hoạt động":
        return "bg-green-100 text-green-700 border-green-200";
      case "Đã tách hộ":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Đã xóa":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCurrentThanhVienIds = () => {
    if (!selectedHoKhau) return [];
    return (selectedHoKhau.thanhVien || []).map((tv) => tv.nhanKhauId);
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-10">Lỗi: {(error as Error).message}</div>
    );
  }

  const safeList = Array.isArray(hoKhauList) ? hoKhauList : [];

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
            <Home className="text-gray-600" />
            Quản Lý Hộ Khẩu
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Danh sách hộ khẩu trong tổ dân phố ({safeList.length} hộ)
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Filter trạng thái */}
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={filterTrangThai}
              onChange={(e) => setFilterTrangThai(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white shadow-sm transition-all appearance-none min-w-40"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Đã tách hộ">Đã tách hộ</option>
              <option value="Đã xóa">Đã xóa</option>
            </select>
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative flex-1 lg:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm theo tên chủ hộ..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Nút Thêm Mới */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all active:scale-95"
          >
            <Plus size={18} />
            Thêm hộ khẩu
          </button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="p-4 pl-6">Mã hộ khẩu</th>
                <th className="p-4">Chủ hộ</th>
                <th className="p-4">Địa chỉ</th>
                <th className="p-4 text-center">Số thành viên</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {safeList.map((hoKhau, index) => {
                  const id = hoKhau._id || hoKhau.id || "";
                  // Lấy tên chủ hộ từ chuHo đã populated
                  const chuHoTen = hoKhau.chuHo?.hoTen || "---";

                  return (
                    <motion.tr
                      key={id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-blue-50/50 transition-colors duration-200 group"
                    >
                      <td className="p-4 pl-6">
                        <span className="font-mono text-sm text-gray-600">
                          #{id.slice(-8).toUpperCase()}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                            <Users size={16} />
                          </div>
                          <span className="font-medium text-gray-800">
                            {chuHoTen}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm max-w-xs">
                          <MapPin
                            size={14}
                            className="text-gray-400 shrink-0"
                          />
                          <span className="truncate">
                            {formatDiaChi(hoKhau.diaChi)}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-medium text-sm">
                          {hoKhau.thanhVien?.length || 0}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getTrangThaiBadge(
                            hoKhau.trangThai
                          )}`}
                        >
                          {hoKhau.trangThai}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* Xem chi tiết */}
                          <button
                            onClick={() => handleOpenDetail(hoKhau)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Thêm thành viên nhanh */}
                          <button
                            onClick={() => {
                              setSelectedHoKhau(hoKhau);
                              setIsThemThanhVienModalOpen(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Thêm thành viên"
                          >
                            <UserPlus size={16} />
                          </button>

                          {/* Xem lịch sử */}
                          <button
                            onClick={async () => {
                              try {
                                const data = await getLichSuHoKhau(id);
                                setLichSu(data);
                                setSelectedHoKhau(hoKhau);
                                setIsLichSuModalOpen(true);
                              } catch {
                                toast.error("Không thể tải lịch sử");
                              }
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            title="Xem lịch sử"
                          >
                            <History size={16} />
                          </button>

                          {/* Xóa */}
                          <button
                            onClick={() => handleOpenDelete(id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Xóa hộ khẩu"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {safeList.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-gray-400 italic"
                  >
                    <Home size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Không tìm thấy hộ khẩu nào.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== MODALS ========== */}

      {/* Modal Tạo/Sửa Hộ Khẩu */}
      <HoKhauFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingHoKhau(null);
        }}
        onSubmit={handleSubmitForm}
        onUpdateQuanHe={handleUpdateQuanHe}
        initialData={editingHoKhau}
        nhanKhauList={nhanKhauList}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Modal Chi tiết Hộ Khẩu */}
      <HoKhauDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        hoKhau={selectedHoKhau}
        onEdit={handleOpenEdit}
        onThemThanhVien={() => setIsThemThanhVienModalOpen(true)}
        onTachHo={() => setIsTachHoModalOpen(true)}
        onDoiChuHo={() => setIsDoiChuHoModalOpen(true)}
        onXemLichSu={handleOpenLichSu}
        onXoaThanhVien={handleXoaThanhVien}
      />

      {/* Modal Thêm Thành Viên */}
      <ThemThanhVienModal
        isOpen={isThemThanhVienModalOpen}
        onClose={() => setIsThemThanhVienModalOpen(false)}
        onSubmit={handleSubmitThemThanhVien}
        onSearchByCCCD={findNhanKhauByCCCD}
        nhanKhauList={nhanKhauList}
        currentThanhVienIds={getCurrentThanhVienIds()}
        isLoading={themThanhVienMutation.isPending}
      />

      {/* Modal Tách Hộ */}
      <TachHoModal
        isOpen={isTachHoModalOpen}
        onClose={() => setIsTachHoModalOpen(false)}
        onSubmit={handleSubmitTachHo}
        hoKhau={selectedHoKhau}
        isLoading={tachHoMutation.isPending}
      />

      {/* Modal Đổi Chủ Hộ */}
      <DoiChuHoModal
        isOpen={isDoiChuHoModalOpen}
        onClose={() => setIsDoiChuHoModalOpen(false)}
        onSubmit={handleSubmitDoiChuHo}
        hoKhau={selectedHoKhau}
        isLoading={doiChuHoMutation.isPending}
      />

      {/* Modal Lịch Sử */}
      <LichSuModal
        isOpen={isLichSuModalOpen}
        onClose={() => setIsLichSuModalOpen(false)}
        lichSu={lichSu}
        hoKhauId={selectedHoKhau?._id || selectedHoKhau?.id || ""}
        isLoading={false}
      />

      {/* Modal Xác nhận Xóa Hộ Khẩu */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Xóa hộ khẩu?"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa hộ khẩu này?"
        confirmText="Xóa"
        confirmColor="red"
      />

      {/* Modal Xác nhận Xóa Thành Viên */}
      <ConfirmModal
        isOpen={isXoaThanhVienModalOpen}
        onClose={() => {
          setIsXoaThanhVienModalOpen(false);
          setXoaThanhVienData(null);
        }}
        onConfirm={handleConfirmXoaThanhVien}
        isLoading={xoaThanhVienMutation.isPending}
        title="Xóa thành viên khỏi hộ?"
        message={`Bạn có chắc muốn xóa "${
          xoaThanhVienData?.hoTen || ""
        }" khỏi hộ khẩu này? Nhân khẩu vẫn tồn tại trong hệ thống.`}
        confirmText="Xóa khỏi hộ"
        confirmColor="red"
      />
    </div>
  );
}
