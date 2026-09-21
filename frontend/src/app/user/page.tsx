"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { createUser, deleteUser, getAllUsers, updateUser } from "./api";
import { User, UserRole, CreateUserDto, UpdateUserDto } from "./types";
import { toast } from "sonner";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Mail,
  Phone,
} from "lucide-react";
import UserModal from "./userModal";
import ConfirmModal from "./confirmModal";
import {
  PageHeader,
  Button,
  Badge,
  DataTable,
  type Column,
} from "@/components/ui";

interface ExtendedUser extends User {
  _id?: string;
}

export default function UserPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtendedUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("");

  // API Queries & Mutations
  const { data: list = [], isLoading, isError, error } = useQuery<ExtendedUser[]>({
    queryKey: ["users"],
    queryFn: getAllUsers,
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
    mutationFn: (data: CreateUserDto) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Thêm cán bộ thành công!");
      setIsModalOpen(false);
    },
    onError: (err: unknown) => {
      toast.error("Lỗi thêm cán bộ: " + getErrorMessage(err, "Có lỗi xảy ra"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Cập nhật thành công!");
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (err: unknown) => {
      toast.error("Lỗi cập nhật: " + getErrorMessage(err, "Có lỗi xảy ra"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Đã xoá tài khoản cán bộ!");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Xoá thất bại!");
    },
  });

  // Event Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ExtendedUser) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (formData: CreateUserDto | UpdateUserDto) => {
    if (editingItem) {
      const id = editingItem._id || editingItem.id || "";
      updateMutation.mutate({ id, data: formData as UpdateUserDto });
    } else {
      addMutation.mutate(formData as CreateUserDto);
    }
  };

  const handleOpenDelete = (id: string) => setDeleteId(id);

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "CB";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.TO_TRUONG:
        return "Tổ trưởng";
      case UserRole.TO_PHO:
        return "Tổ phó";
      case UserRole.KE_TOAN:
        return "Kế toán";
      case UserRole.CAN_BO:
        return "Cán bộ";
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.TO_TRUONG:
        return "primary";
      case UserRole.TO_PHO:
        return "info";
      case UserRole.KE_TOAN:
        return "success";
      default:
        return "neutral";
    }
  };

  const safeList = useMemo(() => (Array.isArray(list) ? list : []), [list]);
  const filteredList = useMemo(() => {
    return safeList.filter((item) => {
      const matchesSearch = item.hoTen && item.hoTen.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchesRole = !filterRole || item.role === filterRole;
      const matchesActive = filterActive === "" || item.isActive === (filterActive === "true");
      return (matchesSearch || !searchTerm) && matchesRole && matchesActive;
    });
  }, [safeList, searchTerm, filterRole, filterActive]);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterActive]);

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

  const columns: Column<ExtendedUser>[] = [
    {
      header: "Cán Bộ",
      render: (item: ExtendedUser) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shadow-2xs shrink-0">
            {getInitials(item.hoTen)}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {item.hoTen}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {getRoleLabel(item.role)}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Tên Đăng Nhập",
      render: (item: ExtendedUser) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          {item.username}
        </span>
      ),
    },
    {
      header: "Liên Hệ",
      render: (item: ExtendedUser) => (
        <div className="space-y-0.5 text-xs">
          {item.email && (
            <div className="flex items-center gap-1.5 text-slate-700">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{item.email}</span>
            </div>
          )}
          {item.soDienThoai && (
            <div className="flex items-center gap-1.5 text-slate-500 tabular-nums">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{item.soDienThoai}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Chức Vụ",
      className: "text-center",
      render: (item: ExtendedUser) => (
        <Badge variant={getRoleBadgeVariant(item.role)} size="sm">
          {getRoleLabel(item.role)}
        </Badge>
      ),
    },
    {
      header: "Trạng Thái",
      className: "text-center",
      render: (item: ExtendedUser) => (
        <Badge variant={item.isActive ? "success" : "danger"} size="sm" dot>
          {item.isActive ? "Hoạt động" : "Đã khóa"}
        </Badge>
      ),
    },
    {
      header: "Thao Tác",
      className: "text-right",
      render: (item: ExtendedUser) => {
        const itemId = item._id || item.id || "";
        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenEdit(item)}
              aria-label={`Sửa quyền hạn của ${item.hoTen}`}
            >
              <Edit className="w-4 h-4 text-slate-500 hover:text-slate-900" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDelete(itemId)}
              aria-label={`Xóa tài khoản của ${item.hoTen}`}
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
        title="Quản Trị Người Dùng & Phân Quyền"
        description="Quản lý danh sách tài khoản cán bộ tổ dân phố, cấp quyền truy cập và giám sát hoạt động"
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Cấp tài khoản mới
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Tìm theo họ tên cán bộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field pl-8"
            aria-label="Tìm kiếm theo họ tên cán bộ"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="field w-auto min-w-[140px]"
          aria-label="Lọc theo chức vụ"
        >
          <option value="">Tất cả chức vụ</option>
          <option value={UserRole.TO_TRUONG}>Tổ trưởng</option>
          <option value={UserRole.TO_PHO}>Tổ phó</option>
          <option value={UserRole.KE_TOAN}>Kế toán</option>
          <option value={UserRole.CAN_BO}>Cán bộ</option>
        </select>

        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="field w-auto min-w-[150px]"
          aria-label="Lọc theo trạng thái hoạt động"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã khóa / vô hiệu</option>
        </select>

        <div className="text-xs text-slate-500 ml-auto shrink-0 hidden sm:block">
          Tổng số: <strong className="text-slate-800 tabular-nums">{filteredList.length}</strong> cán bộ
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={pagedList}
        keyExtractor={(item: ExtendedUser, index: number) => item._id || item.id || `user-${index}`}
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as Error)?.message || "Không thể tải danh sách cán bộ"}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
        emptyMessage="Không tìm thấy cán bộ nào phù hợp với bộ lọc"
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredList.length,
          onPageChange: setCurrentPage,
        }}
      />

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
