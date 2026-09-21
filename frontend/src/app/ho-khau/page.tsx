"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  UserPlus,
  History,
  Users,
  MapPin,
  BarChart3,
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
  getChuHoInfo,
} from "./types";

import { PageHeader, Button, Badge, DataTable, ConfirmDialog } from "@/components/ui";
import type { Column } from "@/components/ui";

// Import các modal
import HoKhauFormModal from "./HoKhauFormModal";
import HoKhauDetailModal from "./HoKhauDetailModal";
import ThemThanhVienModal from "./ThemThanhVienModal";
import TachHoModal from "./TachHoModal";
import DoiChuHoModal from "./DoiChuHoModal";
import LichSuModal from "./LichSuModal";

export default function HoKhauPage() {
  const queryClient = useQueryClient();

  // States cho các modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isThemThanhVienModalOpen, setIsThemThanhVienModalOpen] = useState(false);
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
    refetch,
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
      toast.success("Tạo sổ hộ khẩu thành công!");
      setIsFormModalOpen(false);
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message || (err as Error).message;
      toast.error("Lỗi: " + errorMsg);
    },
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
      if (selectedHoKhau) {
        refreshSelectedHoKhau(selectedHoKhau._id || selectedHoKhau.id || "");
      }
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message || (err as Error).message;
      toast.error("Lỗi: " + errorMsg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHoKhau,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ho-khau"] });
      toast.success("Xóa hộ khẩu thành công!");
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      setIsDetailModalOpen(false);
      setSelectedHoKhau(null);
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message || (err as Error).message;
      toast.error("Lỗi: " + errorMsg);
    },
  });

  const tachHoMutation = useMutation({
    mutationFn: tachHo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ho-khau"] });
      toast.success("Tách hộ khẩu thành công!");
      setIsTachHoModalOpen(false);
      setIsDetailModalOpen(false);
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message || (err as Error).message;
      toast.error("Lỗi: " + errorMsg);
    },
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
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message || (err as Error).message;
      toast.error("Lỗi: " + errorMsg);
    },
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
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message || (err as Error).message;
      toast.error("Lỗi: " + errorMsg);
    },
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
      toast.success("Đã xóa thành viên khỏi hộ khẩu!");
      setIsXoaThanhVienModalOpen(false);
      setXoaThanhVienData(null);
      if (selectedHoKhau) {
        refreshSelectedHoKhau(selectedHoKhau._id || selectedHoKhau.id || "");
      }
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message || (err as Error).message;
      toast.error("Lỗi: " + errorMsg);
    },
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
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message || (err as Error).message;
      toast.error("Lỗi: " + errorMsg);
    },
  });

  // --- HELPER FUNCTIONS ---
  const refreshSelectedHoKhau = async (id: string) => {
    try {
      const updated = await getHoKhauById(id);
      setSelectedHoKhau(updated);
      return updated;
    } catch {
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

  const getCurrentThanhVienIds = () => {
    if (!selectedHoKhau) return [];
    return (selectedHoKhau.thanhVien || []).map((tv) =>
      typeof tv.nhanKhauId === "object" ? tv.nhanKhauId?._id : tv.nhanKhauId
    );
  };

  const safeList = useMemo(
    () => (Array.isArray(hoKhauList) ? hoKhauList : []),
    [hoKhauList]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTrangThai]);

  const totalPages = Math.max(1, Math.ceil(safeList.length / PAGE_SIZE));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const pagedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return safeList.slice(start, start + PAGE_SIZE);
  }, [safeList, currentPage]);

  // Định nghĩa cột cho DataTable
  const columns: Column<HoKhau>[] = [
    {
      header: "Mã hộ khẩu",
      className: "w-28",
      render: (row: HoKhau) => {
        const id = row._id || row.id || "";
        return (
          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
            #{id.slice(-8).toUpperCase()}
          </span>
        );
      },
    },
    {
      header: "Chủ hộ",
      className: "min-w-[180px]",
      render: (row: HoKhau) => {
        const chuHoInfo = getChuHoInfo(row.chuHo);
        const chuHoTen = chuHoInfo?.hoTen || "—";
        const chuHoData = typeof row.chuHo === "object" ? row.chuHo : null;

        return (
          <div>
            <p className="font-semibold text-slate-900 text-sm">{chuHoTen}</p>
            {chuHoData?.gioiTinh && (
              <p className="text-xs text-slate-500 tabular-nums">
                {chuHoData.gioiTinh}
                {chuHoData.ngaySinh && ` • Năm sinh: ${new Date(chuHoData.ngaySinh).getFullYear()}`}
              </p>
            )}
          </div>
        );
      },
    },
    {
      header: "Địa chỉ thường trú",
      className: "min-w-[220px]",
      render: (row: HoKhau) => {
        const diaChi = row.diaChi;
        if (!diaChi) return <span className="text-slate-400">—</span>;
        const line1 = diaChi.soNha ? `${diaChi.soNha} ${diaChi.duong || ""}`.trim() : diaChi.duong;
        const line2 = [diaChi.phuongXa, diaChi.quanHuyen, diaChi.tinhThanh].filter(Boolean).join(", ");

        return (
          <div className="flex items-start gap-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              {line1 && <p className="font-medium text-slate-800">{line1}</p>}
              <p className="text-slate-500">{line2 || "—"}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Số TV",
      className: "w-20 text-center",
      headerClassName: "text-center",
      render: (row: HoKhau) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 tabular-nums">
          <Users className="w-3 h-3" />
          {row.thanhVien?.length || 0}
        </span>
      ),
    },
    {
      header: "Ngày lập",
      className: "w-28 text-center text-xs tabular-nums text-slate-600",
      headerClassName: "text-center",
      render: (row: HoKhau) => (row.ngayLap ? new Date(row.ngayLap).toLocaleDateString("vi-VN") : "—"),
    },
    {
      header: "Ghi chú",
      className: "max-w-[150px] truncate text-xs text-slate-500",
      render: (row: HoKhau) => row.ghiChu || <span className="text-slate-300 italic">—</span>,
    },
    {
      header: "Trạng thái",
      className: "w-32 text-center",
      headerClassName: "text-center",
      render: (row: HoKhau) => {
        const variant =
          row.trangThai === "Đang hoạt động"
            ? "success"
            : row.trangThai === "Đã tách hộ"
            ? "warning"
            : row.trangThai === "Đã xóa"
            ? "danger"
            : "neutral";
        return <Badge variant={variant} size="sm">{row.trangThai}</Badge>;
      },
    },
    {
      header: "Thao tác",
      className: "w-32 text-center",
      headerClassName: "text-center",
      render: (row: HoKhau) => {
        const id = row._id || row.id || "";
        return (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => handleOpenDetail(row)}
              className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
              title="Xem chi tiết sổ"
              aria-label={`Xem chi tiết sổ hộ khẩu #${id.slice(-8).toUpperCase()}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedHoKhau(row);
                setIsThemThanhVienModalOpen(true);
              }}
              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
              title="Thêm thành viên"
              aria-label={`Thêm thành viên vào sổ #${id.slice(-8).toUpperCase()}`}
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  const data = await getLichSuHoKhau(id);
                  setLichSu(data);
                  setSelectedHoKhau(row);
                  setIsLichSuModalOpen(true);
                } catch {
                  toast.error("Không thể tải lịch sử");
                }
              }}
              className="p-1 text-slate-500 hover:text-indigo-700 hover:bg-slate-100 rounded transition-colors"
              title="Lịch sử biến động"
              aria-label={`Lịch sử biến động sổ #${id.slice(-8).toUpperCase()}`}
            >
              <History className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleOpenDelete(id)}
              className="p-1 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded transition-colors"
              title="Xóa sổ hộ khẩu"
              aria-label={`Xóa sổ hộ khẩu #${id.slice(-8).toUpperCase()}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-stack">
      {/* Page Header */}
      <PageHeader
        title="Quản Lý Sổ Hộ Khẩu"
        description={`Theo dõi, đăng ký và quản lý sổ hộ khẩu trong tổ dân phố (${safeList.length} hộ)`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/ho-khau/thong-ke"
              className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs h-9 px-3.5 text-sm gap-2"
            >
              <BarChart3 className="w-4 h-4 text-slate-500" />
              Thống kê hộ khẩu
            </Link>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Đăng ký hộ khẩu
            </Button>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo họ tên chủ hộ hoặc mã sổ..."
            aria-label="Tìm theo họ tên chủ hộ hoặc mã sổ"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field pl-9"
          />
        </div>

        <div className="w-48 shrink-0">
          <select
            value={filterTrangThai}
            onChange={(e) => setFilterTrangThai(e.target.value)}
            className="field"
            aria-label="Lọc theo trạng thái hộ khẩu"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Đang hoạt động">Đang hoạt động</option>
            <option value="Đã tách hộ">Đã tách hộ</option>
            <option value="Đã xóa">Đã xóa</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={pagedList}
        keyExtractor={(row: HoKhau, index: number) => row._id || row.id || `ho-khau-${index}`}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error ? (error as Error).message : "Không tải được danh sách hộ khẩu"}
        onRetry={() => refetch()}
        emptyMessage="Không tìm thấy sổ hộ khẩu nào phù hợp"
        pagination={{
          currentPage,
          totalPages,
          totalItems: safeList.length,
          onPageChange: setCurrentPage,
        }}
      />

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
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Xác nhận xóa sổ hộ khẩu"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa toàn bộ thông tin sổ hộ khẩu này?"
        confirmText="Xóa hộ khẩu"
        variant="danger"
      />

      {/* Modal Xác nhận Xóa Thành Viên */}
      <ConfirmDialog
        isOpen={isXoaThanhVienModalOpen}
        onClose={() => {
          setIsXoaThanhVienModalOpen(false);
          setXoaThanhVienData(null);
        }}
        onConfirm={handleConfirmXoaThanhVien}
        isLoading={xoaThanhVienMutation.isPending}
        title="Xóa thành viên khỏi hộ"
        message={`Bạn có chắc muốn xóa "${xoaThanhVienData?.hoTen || ""}" khỏi hộ khẩu này? Bản ghi nhân khẩu vẫn được bảo lưu trong hệ thống.`}
        confirmText="Xóa thành viên"
        variant="danger"
      />
    </div>
  );
}
