"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { createTamTruTamVang, deleteTamTruTamVang, getAllTamTruTamVang, updateTamTruTamVang } from "./api";
import { TamTruTamVang, DiaChi, CreateTamTruTamVangDto, UpdateTamTruTamVangDto } from "./types";
import { toast } from "sonner";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { PageHeader, Button, Badge, DataTable, type Column } from "@/components/ui";
import TamTruTamVangModal, { TamTruTamVangFormData } from "./tamTruTamVangModal";
import ConfirmModal from "./confirmModal";
import ViewTamTruTamVangModal from "./viewTamTruTamVangModal";
import { getDaysRemaining, isExpiringSoon } from "./utils";

export default function TamTruTamVangPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TamTruTamVang | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<TamTruTamVang | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLoai, setFilterLoai] = useState<string>("");
  const [filterTrangThai, setFilterTrangThai] = useState<string>("");

  const isFilterSapHetHan = filterTrangThai === "Sắp hết hạn";

  // --- LOGIC API ---
  const { data: list = [], isLoading, isError, error } = useQuery({
    queryKey: ["tam-tru-tam-vang", filterLoai, isFilterSapHetHan ? "" : filterTrangThai],
    queryFn: () => getAllTamTruTamVang({
      loai: filterLoai || undefined,
      trangThai: isFilterSapHetHan ? undefined : (filterTrangThai || undefined),
    }),
  });

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (isAxiosError(err)) {
      return err.response?.data?.message || err.message || fallback;
    }
    if (err instanceof Error) {
      return err.message || fallback;
    }
    return fallback;
  };

  const addMutation = useMutation({
    mutationFn: (data: CreateTamTruTamVangDto) => createTamTruTamVang(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tam-tru-tam-vang"] });
      toast.success("Đăng ký thành công!");
      setIsModalOpen(false);
    },
    onError: (err: unknown) => {
      toast.error("Lỗi đăng ký: " + getErrorMessage(err, "Có lỗi xảy ra"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTamTruTamVangDto }) => updateTamTruTamVang(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tam-tru-tam-vang"] });
      toast.success("Cập nhật thành công!");
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (err: unknown) => {
      toast.error("Lỗi cập nhật: " + getErrorMessage(err, "Có lỗi xảy ra"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTamTruTamVang,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tam-tru-tam-vang"] });
      toast.success("Đã xoá thành công!");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Xoá thất bại!");
    },
  });

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TamTruTamVang) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenView = (item: TamTruTamVang) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleSubmitForm = (formData: TamTruTamVangFormData) => {
    if (editingItem) {
      const id = editingItem._id || editingItem.id || "";
      updateMutation.mutate({ id, data: formData });
    } else {
      addMutation.mutate(formData as CreateTamTruTamVangDto);
    }
  };

  const handleOpenDelete = (id: string) => setDeleteId(id);
  const handleConfirmDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  // Filter and Search
  const filteredList = useMemo(() => {
    const safeList = Array.isArray(list) ? list : [];
    const term = searchTerm.toLowerCase().trim();
    return safeList.filter((item: TamTruTamVang) => {
      const matchSearch =
        !term ||
        (item.hoTen && item.hoTen.toLowerCase().includes(term)) ||
        (item.soDinhDanh && item.soDinhDanh.toLowerCase().includes(term));

      if (!matchSearch) return false;

      if (filterLoai && item.loai !== filterLoai) return false;

      if (filterTrangThai === "Sắp hết hạn") {
        return isExpiringSoon(item.denNgay);
      }

      if (filterTrangThai && item.trangThai !== filterTrangThai) return false;

      return true;
    });
  }, [list, searchTerm, filterLoai, filterTrangThai]);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLoai, filterTrangThai]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const pagedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage]);

  const formatDiaChi = (diaChi?: DiaChi) => {
    if (!diaChi || typeof diaChi !== "object") return "---";
    const parts = [
      diaChi.soNha,
      diaChi.duong,
      diaChi.phuongXa,
      diaChi.quanHuyen,
      diaChi.tinhThanh,
    ].filter((part) => part && part.trim());
    return parts.length > 0 ? parts.join(", ") : "---";
  };

  const columns: Column<TamTruTamVang>[] = [
    {
      header: "Mã hồ sơ",
      render: (item: TamTruTamVang) => {
        const id = item._id || item.id || "";
        return (
          <span className="font-mono text-xs text-slate-500">
            #{id.slice(-6).toUpperCase()}
          </span>
        );
      },
    },
    {
      header: "Công dân",
      render: (item: TamTruTamVang) => (
        <div>
          <p className="font-medium text-slate-900">{item.hoTen}</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {item.soDinhDanh ? `CCCD: ${item.soDinhDanh}` : "Chưa có CCCD"}
          </p>
        </div>
      ),
    },
    {
      header: "Loại",
      render: (item: TamTruTamVang) => (
        <Badge variant={item.loai === "Tạm trú" ? "info" : "warning"}>
          {item.loai}
        </Badge>
      ),
    },
    {
      header: "Thời hạn lưu trú",
      render: (item: TamTruTamVang) => {
        const daysLeft = getDaysRemaining(item.denNgay);
        const isExpiring = daysLeft !== null && daysLeft <= 15 && daysLeft >= 0;
        const isExpired = daysLeft !== null && daysLeft < 0;
        return (
          <div className="text-xs font-mono text-slate-700 space-y-0.5">
            <p>Từ: {item.tuNgay ? new Date(item.tuNgay).toLocaleDateString("vi-VN") : "---"}</p>
            <p>Đến: {item.denNgay ? new Date(item.denNgay).toLocaleDateString("vi-VN") : "---"}</p>
            {isExpiring && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                Còn {daysLeft} ngày
              </span>
            )}
            {isExpired && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                Đã hết hạn
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Nơi đến / Địa chỉ tạm trú",
      render: (item: TamTruTamVang) => (
        <span className="text-xs text-slate-600 line-clamp-2 max-w-xs">
          {item.loai === "Tạm trú" ? formatDiaChi(item.diaChiTamTru) : item.noiDen || "---"}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      render: (item: TamTruTamVang) => {
        switch (item.trangThai) {
          case "Đang hiệu lực":
            return <Badge variant="success">Đang hiệu lực</Badge>;
          case "Hết hạn":
            return <Badge variant="danger">Hết hạn</Badge>;
          case "Đã hủy":
            return <Badge variant="neutral">Đã hủy</Badge>;
          default:
            return <Badge variant="neutral">{item.trangThai}</Badge>;
        }
      },
    },
    {
      header: "Thao tác",
      className: "text-right",
      render: (item: TamTruTamVang) => {
        const itemId = (item._id || item.id || "").toString();
        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenView(item)}
              aria-label={`Xem hồ sơ của ${item.hoTen}`}
            >
              <Eye className="w-4 h-4 text-slate-500 hover:text-slate-900" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenEdit(item)}
              aria-label={`Sửa thông tin của ${item.hoTen}`}
            >
              <Edit className="w-4 h-4 text-slate-500 hover:text-slate-900" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDelete(itemId)}
              aria-label={`Xóa hồ sơ của ${item.hoTen}`}
            >
              <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-700" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-stack">
      {/* Header */}
      <PageHeader
        title="Quản Lý Tạm Trú / Tạm Vắng"
        description="Theo dõi biến động lưu trú, đăng ký tạm trú và khai báo tạm vắng công dân"
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
            disabled={addMutation.isPending}
          >
            Đăng ký mới
          </Button>
        }
      />

      {/* Toolbar / Filters */}
      <div className="filter-bar">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm theo họ tên hoặc số CCCD..."
            className="field pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Tìm kiếm hồ sơ theo họ tên hoặc số CCCD"
          />
        </div>

        <select
          value={filterLoai}
          onChange={(e) => setFilterLoai(e.target.value)}
          className="field w-auto min-w-[140px]"
          aria-label="Lọc theo hình thức"
        >
          <option value="">Tất cả hình thức</option>
          <option value="Tạm trú">Tạm trú</option>
          <option value="Tạm vắng">Tạm vắng</option>
        </select>

        <select
          value={filterTrangThai}
          onChange={(e) => setFilterTrangThai(e.target.value)}
          className="field w-auto min-w-[150px]"
          aria-label="Lọc theo trạng thái"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đang hiệu lực">Đang hiệu lực</option>
          <option value="Sắp hết hạn">Sắp hết hạn</option>
          <option value="Hết hạn">Hết hạn</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={pagedList}
        keyExtractor={(item: TamTruTamVang, index: number) => item._id || item.id || `tam-tru-${index}`}
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as Error)?.message || "Không thể tải danh sách đăng ký"}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["tam-tru-tam-vang"] })}
        emptyMessage="Không tìm thấy hồ sơ tạm trú / tạm vắng nào"
        onRowClick={(item: TamTruTamVang) => handleOpenView(item)}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredList.length,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Modals */}
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

      <ViewTamTruTamVangModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        item={viewingItem}
      />
    </div>
  );
}
