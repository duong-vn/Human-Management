"use client";

import React, { useState, useEffect, useMemo, useId } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  Edit,
  Trash2,
  Plus,
  User,
  Search,
  Users,
  Calendar,
  Baby,
  Sparkles,
  MapPin,
  Home,
  Briefcase,
  Skull,
} from "lucide-react";

import {
  createNhanKhau,
  deleteNhanKhau,
  getAllNhanKhau,
  updateNhanKhau,
  getAllHoKhau,
  createMoiSinh,
  getThongKeNhanKhau,
} from "./api";
import { NhanKhau } from "./types";
import {
  PageHeader,
  Button,
  Badge,
  DataTable,
  Modal,
  StatCard,
  ConfirmDialog,
  useStatsVisibility,
  StatsToggle,
} from "@/components/ui";
import type { Column } from "@/components/ui";

import NhanKhauModal, { NhanKhauFormData } from "./nhanKhauModal";

interface ExtendedNhanKhau extends NhanKhau {
  _id?: string;
}

interface HoKhauOption {
  _id: string;
  maHoKhau?: string;
  chuHo?: { hoTen?: string } | string;
}

export default function NhanKhauPage() {
  const queryClient = useQueryClient();

  // --- STATES ---
  const statsGridId = useId();
  const { showStats, toggleStats } = useStatsVisibility("hide_stats_nhan_khau");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoiSinhModalOpen, setIsMoiSinhModalOpen] = useState(false);
  const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);

  const [deathItem, setDeathItem] = useState<ExtendedNhanKhau | null>(null);
  const [deathForm, setDeathForm] = useState({ ngayMat: "", lyDo: "" });

  const [editingItem, setEditingItem] = useState<ExtendedNhanKhau | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<ExtendedNhanKhau | null>(null);

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [searchID, setSearchID] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [searchGender, setSearchGender] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchID, searchYear, searchGender]);

  const [moiSinhForm, setMoiSinhForm] = useState({
    hoTen: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    hoKhauId: "",
    quanHeVoiChuHo: "Con",
    noiSinh: "",
    queQuan: "",
  });

  // --- DATA FETCHING ---
  const {
    data: list = [],
    isLoading: isLoadingList,
    isError: isErrorList,
    error: errorList,
    refetch,
  } = useQuery({
    queryKey: ["nhan-khau"],
    queryFn: getAllNhanKhau,
  });

  const { data: statsData } = useQuery({
    queryKey: ["nhan-khau-stats"],
    queryFn: getThongKeNhanKhau,
    placeholderData: { total: 0, male: 0, female: 0, avgAge: 0 },
  });

  const { data: listHoKhau = [] } = useQuery<HoKhauOption[]>({
    queryKey: ["ho-khau"],
    queryFn: async () => {
      const res = await getAllHoKhau();
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: isMoiSinhModalOpen,
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

  // --- MUTATIONS ---
  const onSuccessCommon = (mess: string) => {
    queryClient.invalidateQueries({ queryKey: ["nhan-khau"] });
    queryClient.invalidateQueries({ queryKey: ["nhan-khau-stats"] });
    toast.success(mess);
  };

  const addMutation = useMutation({
    mutationFn: (newNhanKhau: Parameters<typeof createNhanKhau>[0]) => createNhanKhau(newNhanKhau),
    onSuccess: () => {
      onSuccessCommon("Thêm nhân khẩu thành công!");
      setIsModalOpen(false);
    },
    onError: (err: unknown) => {
      toast.error("Lỗi: " + getErrorMessage(err, "Có lỗi xảy ra"));
    },
  });

  const addMoiSinhMutation = useMutation({
    mutationFn: (data: Parameters<typeof createMoiSinh>[0]) => createMoiSinh(data),
    onSuccess: () => {
      onSuccessCommon("Đã thêm trẻ mới sinh thành công!");
      setIsMoiSinhModalOpen(false);
      setMoiSinhForm({
        hoTen: "",
        ngaySinh: "",
        gioiTinh: "Nam",
        hoKhauId: "",
        quanHeVoiChuHo: "Con",
        noiSinh: "",
        queQuan: "",
      });
    },
    onError: (err: unknown) => {
      toast.error("Lỗi: " + getErrorMessage(err, "Có lỗi xảy ra"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NhanKhau> }) => updateNhanKhau(id, data),
    onSuccess: () => {
      onSuccessCommon("Cập nhật thành công!");
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (err: unknown) => {
      toast.error("Lỗi: " + getErrorMessage(err, "Có lỗi xảy ra"));
    },
  });

  const deathMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NhanKhau> }) => updateNhanKhau(id, data),
    onSuccess: () => {
      onSuccessCommon("Đã ghi nhận khai tử thành công!");
      setIsDeathModalOpen(false);
      setDeathItem(null);
    },
    onError: (err: unknown) => {
      toast.error("Lỗi: " + getErrorMessage(err, "Có lỗi xảy ra!"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNhanKhau(id),
    onSuccess: () => {
      onSuccessCommon("Đã xóa nhân khẩu thành công!");
      setDeleteId(null);
    },
    onError: (err: unknown) => {
      toast.error("Lỗi: " + getErrorMessage(err, "Xóa thất bại"));
    },
  });

  // --- HANDLERS ---
  const handleSubmitMoiSinh = () => {
    if (!moiSinhForm.hoTen || !moiSinhForm.ngaySinh || !moiSinhForm.hoKhauId) {
      return toast.error("Vui lòng điền đủ: Họ tên, Ngày sinh, Hộ khẩu");
    }
    addMoiSinhMutation.mutate(moiSinhForm);
  };

  const handleOpenDeath = (item: ExtendedNhanKhau) => {
    setDeathItem(item);
    setDeathForm({ ngayMat: new Date().toISOString().split("T")[0], lyDo: "" });
    setIsDeathModalOpen(true);
  };

  const handleSubmitDeath = () => {
    if (!deathItem || !deathForm.ngayMat) return toast.error("Vui lòng chọn ngày mất");
    const id = deathItem._id || deathItem.id || "";
    const deathNote = `[Qua đời] Mất ngày ${new Date(deathForm.ngayMat).toLocaleDateString(
      "vi-VN"
    )}. Lý do: ${deathForm.lyDo || "Không rõ"}.`;
    const finalGhiChu = deathItem.ghiChu ? `${deathItem.ghiChu}\n${deathNote}` : deathNote;
    deathMutation.mutate({ id, data: { trangThai: "Đã qua đời", ghiChu: finalGhiChu } });
  };

  const handleOpenEdit = (item: ExtendedNhanKhau) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (formData: NhanKhauFormData) => {
    if (editingItem) {
      const id = editingItem._id || editingItem.id || "";
      updateMutation.mutate({ id, data: formData as unknown as Partial<NhanKhau> });
    } else {
      addMutation.mutate(formData as unknown as Parameters<typeof createNhanKhau>[0]);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  // --- FILTER & LOGIC ---
  const safeList = useMemo(() => (Array.isArray(list) ? (list as ExtendedNhanKhau[]) : []), [list]);

  const checkIsMoiSinh = (ngaySinh?: string) => {
    if (!ngaySinh) return false;
    const birth = new Date(ngaySinh);
    const now = new Date();
    const monthDiff =
      (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    return monthDiff < 12 && monthDiff >= 0;
  };

  const filteredList = useMemo(() => {
    return safeList.filter((item: ExtendedNhanKhau) => {
      const matchName = searchName
        ? item.hoTen?.toLowerCase().includes(searchName.toLowerCase().trim())
        : true;
      const matchID = searchID
        ? (item.soDinhDanh?.so || "").toString().toLowerCase().includes(searchID.toLowerCase().trim())
        : true;
      const matchYear = searchYear
        ? item.ngaySinh && new Date(item.ngaySinh).getFullYear().toString().includes(searchYear.trim())
        : true;
      const matchGender = searchGender ? item.gioiTinh === searchGender : true;
      return matchName && matchID && matchYear && matchGender;
    });
  }, [safeList, searchName, searchID, searchYear, searchGender]);

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

  // Columns for DataTable
  const columns: Column<ExtendedNhanKhau>[] = [
    {
      header: "Họ và tên",
      className: "min-w-[200px]",
      render: (item: ExtendedNhanKhau) => {
        const itemId = item._id || item.id || "";
        const isBaby = checkIsMoiSinh(item.ngaySinh);
        const isDead = item.trangThai === "Đã qua đời";

        return (
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                isDead
                  ? "bg-slate-100 text-slate-400 border-slate-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {item.hoTen?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`font-semibold text-sm leading-tight ${
                    isDead ? "text-slate-400 line-through" : "text-slate-900"
                  }`}
                >
                  {item.hoTen}
                </span>
                {isBaby && !isDead && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                    <Sparkles className="w-2.5 h-2.5" /> Mới sinh
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                #{String(itemId).slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Ngày sinh",
      className: "w-28 text-xs tabular-nums text-slate-700",
      render: (item: ExtendedNhanKhau) =>
        item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString("vi-VN") : "—",
    },
    {
      header: "Giới tính",
      className: "w-24 text-center",
      headerClassName: "text-center",
      render: (item: ExtendedNhanKhau) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
            item.gioiTinh === "Nam"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-pink-50 text-pink-700 border border-pink-200"
          }`}
        >
          {item.gioiTinh || "—"}
        </span>
      ),
    },
    {
      header: "Số CCCD / Định danh",
      className: "w-36 font-mono text-xs tabular-nums text-slate-700",
      render: (item: ExtendedNhanKhau) => item.soDinhDanh?.so || <span className="text-slate-400 font-sans">—</span>,
    },
    {
      header: "Trạng thái",
      className: "w-32 text-center",
      headerClassName: "text-center",
      render: (item: ExtendedNhanKhau) => {
        const isDead = item.trangThai === "Đã qua đời";
        if (isDead) {
          return <Badge variant="neutral" size="sm">Đã qua đời</Badge>;
        }
        if (item.trangThai === "Thường trú") {
          return <Badge variant="success" size="sm">Thường trú</Badge>;
        }
        if (item.trangThai === "Tạm trú") {
          return <Badge variant="primary" size="sm">Tạm trú</Badge>;
        }
        if (item.trangThai === "Tạm vắng") {
          return <Badge variant="warning" size="sm">Tạm vắng</Badge>;
        }
        return <Badge variant="neutral" size="sm">{item.trangThai || "Chưa ĐK"}</Badge>;
      },
    },
    {
      header: "Thao tác",
      className: "w-28 text-center",
      headerClassName: "text-center",
      render: (item: ExtendedNhanKhau) => {
        const itemId = item._id || item.id || "";
        const isDead = item.trangThai === "Đã qua đời";

        return (
          <div
            className="flex items-center justify-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => handleOpenEdit(item)}
              className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
              title="Chỉnh sửa nhân khẩu"
              aria-label={`Sửa thông tin ${item.hoTen}`}
            >
              <Edit className="w-4 h-4" />
            </button>
            {!isDead && (
              <button
                type="button"
                onClick={() => handleOpenDeath(item)}
                className="p-1 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded transition-colors"
                title="Khai báo qua đời"
                aria-label={`Khai báo qua đời cho ${item.hoTen}`}
              >
                <Skull className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setDeleteId(itemId)}
              className="p-1 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded transition-colors"
              title="Xóa nhân khẩu"
              aria-label={`Xóa nhân khẩu ${item.hoTen}`}
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
        title="Quản Lý Nhân Khẩu"
        description="Tra cứu, cập nhật thông tin lý lịch và thống kê dân số trong tổ dân phố"
        actions={
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <StatsToggle
              expanded={showStats}
              onToggle={toggleStats}
              controls={statsGridId}
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsMoiSinhModalOpen(true)}
              leftIcon={<Baby className="w-4 h-4" />}
            >
              Khai sinh
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Thêm nhân khẩu
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div
        id={statsGridId}
        hidden={!showStats}
        className={showStats ? "grid grid-cols-2 lg:grid-cols-4 gap-2.5" : "hidden"}
      >
        <StatCard
          variant="compact"
          title="Tổng nhân khẩu"
          value={statsData?.total ?? 0}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          variant="compact"
          title="Nam giới"
          value={statsData?.male ?? 0}
          icon={<User className="w-4 h-4" />}
        />
        <StatCard
          variant="compact"
          title="Nữ giới"
          value={statsData?.female ?? 0}
          icon={<User className="w-4 h-4" />}
        />
        <StatCard
          variant="compact"
          title="Tuổi trung bình"
          value={`${statsData?.avgAge ?? 0} tuổi`}
          icon={<Calendar className="w-4 h-4" />}
        />
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo họ tên cư dân..."
            className="field pl-9"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            aria-label="Tìm theo họ tên cư dân"
          />
        </div>

        <div className="w-44 shrink-0">
          <input
            type="text"
            placeholder="Số CMND / CCCD"
            className="field font-mono"
            value={searchID}
            onChange={(e) => setSearchID(e.target.value)}
            aria-label="Tìm theo số CMND hoặc CCCD"
          />
        </div>

        <div className="w-32 shrink-0">
          <input
            type="number"
            placeholder="Năm sinh"
            className="field"
            value={searchYear}
            onChange={(e) => setSearchYear(e.target.value)}
            aria-label="Tìm theo năm sinh"
          />
        </div>

        <div className="w-40 shrink-0">
          <select
            className="field"
            value={searchGender}
            onChange={(e) => setSearchGender(e.target.value)}
            aria-label="Lọc theo giới tính"
          >
            <option value="">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={pagedList}
        keyExtractor={(item: ExtendedNhanKhau, index: number) => item._id || item.id || `nhan-khau-${index}`}
        isLoading={isLoadingList}
        isError={isErrorList}
        errorMessage={errorList ? (errorList as Error).message : "Không tải được danh sách nhân khẩu"}
        onRetry={() => refetch()}
        emptyMessage="Không tìm thấy nhân khẩu nào phù hợp với bộ lọc"
        onRowClick={(item: ExtendedNhanKhau) => setViewingItem(item)}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredList.length,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Modal Chi tiết Hồ Sơ Nhân Khẩu */}
      {viewingItem && (
        <Modal
          isOpen={!!viewingItem}
          onClose={() => setViewingItem(null)}
          title="Hồ Sơ Nhân Khẩu"
          description={`Mã cư dân: #${String(viewingItem._id || viewingItem.id).slice(-6).toUpperCase()}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold shrink-0 border border-blue-200">
                {viewingItem.hoTen?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">{viewingItem.hoTen}</h3>
                  {viewingItem.trangThai === "Đã qua đời" && (
                    <Badge variant="neutral" size="sm">Đã qua đời</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bí danh: <span className="text-slate-800 font-medium">{viewingItem.biDanh || "Không có"}</span>
                </p>
                <div className="mt-1">
                  <Badge variant={viewingItem.trangThai === "Thường trú" ? "success" : "neutral"} size="sm">
                    {viewingItem.trangThai || "Chưa ĐK"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <DetailField
                icon={<Calendar className="w-3.5 h-3.5 text-slate-400" />}
                label="Ngày sinh"
                value={viewingItem.ngaySinh ? new Date(viewingItem.ngaySinh).toLocaleDateString("vi-VN") : "—"}
              />
              <DetailField
                icon={<User className="w-3.5 h-3.5 text-slate-400" />}
                label="Giới tính"
                value={viewingItem.gioiTinh || "—"}
              />
              <DetailField
                icon={<User className="w-3.5 h-3.5 text-slate-400" />}
                label="Số CCCD / Định danh"
                value={viewingItem.soDinhDanh?.so || "—"}
              />
              <DetailField
                icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
                label="Nơi sinh"
                value={viewingItem.noiSinh || "—"}
              />
              <DetailField
                icon={<Home className="w-3.5 h-3.5 text-slate-400" />}
                label="Quê quán"
                value={viewingItem.queQuan || "—"}
              />
              <DetailField
                icon={<Users className="w-3.5 h-3.5 text-slate-400" />}
                label="Dân tộc / Tôn giáo"
                value={`${viewingItem.danToc || "—"} / ${viewingItem.tonGiao || "Không"}`}
              />
              <DetailField
                icon={<Briefcase className="w-3.5 h-3.5 text-slate-400" />}
                label="Nghề nghiệp"
                value={viewingItem.ngheNghiep || "—"}
              />
              <DetailField
                icon={<Home className="w-3.5 h-3.5 text-slate-400" />}
                label="Quan hệ với chủ hộ"
                value={viewingItem.quanHeVoiChuHo || "—"}
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-500 uppercase block mb-1">
                Địa chỉ thường trú
              </span>
              <p className="font-medium text-slate-800">
                {viewingItem.diaChiThuongTru
                  ? [
                      viewingItem.diaChiThuongTru.soNha,
                      viewingItem.diaChiThuongTru.duong,
                      viewingItem.diaChiThuongTru.phuongXa,
                      viewingItem.diaChiThuongTru.quanHuyen,
                      viewingItem.diaChiThuongTru.tinhThanh,
                    ]
                      .filter(Boolean)
                      .join(", ")
                  : "—"}
              </p>
            </div>

            {viewingItem.ghiChu && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                <span className="font-semibold text-amber-800 uppercase block mb-1">Ghi chú</span>
                <p className="text-amber-950 italic whitespace-pre-line">{viewingItem.ghiChu}</p>
              </div>
            )}

            <div className="modal-footer">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setViewingItem(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Khai tử */}
      {isDeathModalOpen && (
        <Modal
          isOpen={isDeathModalOpen}
          onClose={() => setIsDeathModalOpen(false)}
          title="Khai Báo Qua Đời"
          description={`Ghi nhận thông tin qua đời cho cư dân: ${deathItem?.hoTen || ""}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="input-death-date">
                Ngày mất <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-death-date"
                type="date"
                className="field"
                value={deathForm.ngayMat}
                onChange={(e) => setDeathForm({ ...deathForm, ngayMat: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="input-death-reason">
                Nguyên nhân / Lý do
              </label>
              <textarea
                id="input-death-reason"
                rows={3}
                className="field min-h-[5rem] resize-none"
                value={deathForm.lyDo}
                onChange={(e) => setDeathForm({ ...deathForm, lyDo: e.target.value })}
                placeholder="VD: Tuổi già, bệnh lý..."
              />
            </div>

            <div className="modal-footer">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setIsDeathModalOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={handleSubmitDeath}
                isLoading={deathMutation.isPending}
              >
                Xác nhận khai tử
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Khai báo Mới sinh */}
      {isMoiSinhModalOpen && (
        <Modal
          isOpen={isMoiSinhModalOpen}
          onClose={() => setIsMoiSinhModalOpen(false)}
          title="Khai Báo Trẻ Mới Sinh"
          description="Đăng ký khai sinh và nhập hộ khẩu cho trẻ sơ sinh trong tổ dân phố"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="input-baby-name">
                Họ và tên trẻ <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-baby-name"
                type="text"
                className="field"
                placeholder="VD: Nguyễn Bảo An"
                value={moiSinhForm.hoTen}
                onChange={(e) => setMoiSinhForm({ ...moiSinhForm, hoTen: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="input-baby-dob">
                  Ngày sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-baby-dob"
                  type="date"
                  className="field"
                  value={moiSinhForm.ngaySinh}
                  onChange={(e) => setMoiSinhForm({ ...moiSinhForm, ngaySinh: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="select-baby-gender">
                  Giới tính
                </label>
                <select
                  id="select-baby-gender"
                  className="field"
                  value={moiSinhForm.gioiTinh}
                  onChange={(e) => setMoiSinhForm({ ...moiSinhForm, gioiTinh: e.target.value })}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="input-baby-birthplace">
                  Nơi sinh
                </label>
                <input
                  id="input-baby-birthplace"
                  type="text"
                  className="field"
                  placeholder="Bệnh viện / Trạm y tế..."
                  value={moiSinhForm.noiSinh}
                  onChange={(e) => setMoiSinhForm({ ...moiSinhForm, noiSinh: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="input-baby-origin">
                  Quê quán
                </label>
                <input
                  id="input-baby-origin"
                  type="text"
                  className="field"
                  placeholder="Xã, Huyện, Tỉnh..."
                  value={moiSinhForm.queQuan}
                  onChange={(e) => setMoiSinhForm({ ...moiSinhForm, queQuan: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="select-baby-hokhau">
                Sổ hộ khẩu tiếp nhận <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-baby-hokhau"
                className="field"
                value={moiSinhForm.hoKhauId}
                onChange={(e) => setMoiSinhForm({ ...moiSinhForm, hoKhauId: e.target.value })}
                required
              >
                <option value="">-- Chọn sổ hộ khẩu --</option>
                {listHoKhau.map((hk: HoKhauOption) => {
                  const chuHoName = typeof hk.chuHo === "object" ? hk.chuHo?.hoTen : hk.chuHo;
                  return (
                    <option key={hk._id} value={hk._id}>
                      {hk.maHoKhau || `#${String(hk._id).slice(-6).toUpperCase()}`} — Chủ hộ: {chuHoName || "Chưa có"}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="modal-footer">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setIsMoiSinhModalOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSubmitMoiSinh}
                isLoading={addMoiSinhMutation.isPending}
              >
                Xác nhận khai sinh
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Thêm/Sửa Nhân Khẩu */}
      <NhanKhauModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editingItem}
        isLoading={addMutation.isPending || updateMutation.isPending}
      />

      {/* Dialog Xác nhận Xóa */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Xác nhận xóa nhân khẩu"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa vĩnh viễn bản ghi nhân khẩu này?"
        confirmText="Xóa nhân khẩu"
        variant="danger"
      />
    </div>
  );
}

function DetailField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center gap-1.5 text-slate-500 uppercase font-semibold text-[10px]">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 font-medium text-slate-800 truncate">{value}</p>
    </div>
  );
}
