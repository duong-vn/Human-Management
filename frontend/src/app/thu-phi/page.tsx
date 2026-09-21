"use client";

import React, { useState, useEffect, useMemo, useId } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Plus,
  Heart,
  CreditCard,
  Building2,
  Coins,
  Receipt,
  FileText,
  AlertCircle,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getAllThuPhi,
  getKhoanThuBatBuoc,
  getKhoanThuTuNguyen,
  deletePhieuThu,
  createKhoanThu,
  updatePhieuThu,
} from "./api";
import {
  PageHeader,
  StatCard,
  Button,
  Badge,
  Card,
  Modal,
  ConfirmDialog,
  Skeleton,
  useStatsVisibility,
  StatsToggle,
} from "@/components/ui";

interface PhieuThuItem {
  _id?: string;
  id?: string;
  maPhieuThu?: string;
  tenChuHo?: string;
  kyThu?: string;
  ngayThu?: string;
  trangThai?: "Đã thu" | "Chưa thu" | "Đang nợ" | string;
  tongTien?: number;
  chiTietThu?: Array<{
    khoanThuId?: string;
    tenKhoanThu?: string;
    soTien?: number;
    ghiChu?: string;
  }>;
}

interface KhoanThuDef {
  _id?: string;
  id?: string;
  tenKhoanThu?: string;
  soTien?: number;
  loaiKhoanThu?: string;
}

interface DetailStatItem {
  maPhieu?: string;
  tenChuHo?: string;
  tenKhoanThu?: string;
  ngayThu?: string;
  soTien: number;
  ghiChu?: string;
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (
      (err.response?.data as { message?: string })?.message ||
      err.message ||
      fallback
    );
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export default function QuanLyThuPhiPage() {
  const queryClient = useQueryClient();
  const statsGridId = useId();
  const { showStats, toggleStats } = useStatsVisibility("hide_stats_thu_phi");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<"Bắt buộc" | "Tự nguyện">("Bắt buộc");
  const [formData, setFormData] = useState({
    tenKhoanThu: "",
    soTien: "",
    ngayBatDau: new Date().toISOString().split("T")[0],
  });

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    type: "bat-buoc" | "tu-nguyen" | "dang-no" | null;
    title: string;
    data: DetailStatItem[];
  }>({
    isOpen: false,
    type: null,
    title: "",
    data: [],
  });

  // State for confirm delete dialog
  const [deleteTarget, setDeleteTarget] = useState<PhieuThuItem | null>(null);

  // 1. DATA FETCHING
  const {
    data: listBatBuocDef = [],
    isError: isErrorBatBuoc,
    error: errorBatBuoc,
    refetch: refetchBatBuoc,
  } = useQuery<KhoanThuDef[]>({
    queryKey: ["khoan-thu-bat-buoc"],
    queryFn: async () => {
      const res = await getKhoanThuBatBuoc();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  const {
    data: listTuNguyenDef = [],
    isError: isErrorTuNguyen,
    error: errorTuNguyen,
    refetch: refetchTuNguyen,
  } = useQuery<KhoanThuDef[]>({
    queryKey: ["khoan-thu-tu-nguyen"],
    queryFn: async () => {
      const res = await getKhoanThuTuNguyen();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  const {
    data: dsPhieuThu = [],
    isLoading,
    isError: isErrorPhieuThu,
    error: errorPhieuThu,
    refetch: refetchPhieuThu,
  } = useQuery<PhieuThuItem[]>({
    queryKey: ["thu-phi-history"],
    queryFn: async () => {
      const res = await getAllThuPhi();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  // 2. MUTATIONS
  const createKhoanThuMutation = useMutation({
    mutationFn: async (payload: {
      tenKhoanThu: string;
      soTien: number;
      loaiKhoanThu: string;
      ngayBatDau: string;
    }) => await createKhoanThu(payload),
    onSuccess: () => {
      toast.success("Đã thêm khoản thu mới thành công!");
      queryClient.invalidateQueries({ queryKey: ["khoan-thu-bat-buoc"] });
      queryClient.invalidateQueries({ queryKey: ["khoan-thu-tu-nguyen"] });
      setIsAddModalOpen(false);
      setFormData({
        tenKhoanThu: "",
        soTien: "",
        ngayBatDau: new Date().toISOString().split("T")[0],
      });
    },
    onError: (err: unknown) =>
      toast.error(
        "Lỗi: " + extractErrorMessage(err, "Không thể tạo khoản thu")
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await deletePhieuThu(id),
    onSuccess: () => {
      toast.success("Đã xóa phiếu thu thành công!");
      queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
      setDeleteTarget(null);
    },
    onError: (err: unknown) => {
      toast.error("Lỗi xóa: " + extractErrorMessage(err, "Không xác định"));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { trangThai: string; ngayThu: string };
    }) => await updatePhieuThu(id, payload),
    onSuccess: () => {
      toast.success("Đã thu tiền thành công!");
      queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
    },
    onError: (err: unknown) =>
      toast.error("Lỗi cập nhật: " + extractErrorMessage(err, "Lỗi")),
  });

  // 3. HANDLERS
  const handleThuNo = (phieu: PhieuThuItem) => {
    const id = phieu._id || phieu.id || "";
    updateStatusMutation.mutate({
      id,
      payload: {
        trangThai: "Đã thu",
        ngayThu: new Date().toISOString(),
      },
    });
  };

  const handleOpenAdd = (type: "Bắt buộc" | "Tự nguyện") => {
    setAddType(type);
    setIsAddModalOpen(true);
  };

  const handleConfirmAdd = () => {
    if (!formData.tenKhoanThu.trim()) {
      return toast.error("Vui lòng nhập tên khoản thu");
    }
    if (addType === "Bắt buộc" && !formData.soTien) {
      return toast.error("Vui lòng nhập số tiền định mức");
    }

    createKhoanThuMutation.mutate({
      tenKhoanThu: formData.tenKhoanThu,
      soTien: addType === "Bắt buộc" ? Number(formData.soTien) : 0,
      loaiKhoanThu: addType,
      ngayBatDau: new Date(formData.ngayBatDau).toISOString(),
    });
  };

  // 4. STATS CALCULATION
  const stats = useMemo(() => {
    let totalBatBuoc = 0;
    let totalTuNguyen = 0;
    let totalDangNo = 0;
    const listDetailBatBuoc: DetailStatItem[] = [];
    const listDetailTuNguyen: DetailStatItem[] = [];
    const listDetailDangNo: DetailStatItem[] = [];

    const batBuocIds = new Set(listBatBuocDef.map((k) => k._id || k.id));
    const tuNguyenIds = new Set(listTuNguyenDef.map((k) => k._id || k.id));

    dsPhieuThu.forEach((pt) => {
      pt.chiTietThu?.forEach((detail) => {
        const amount = Number(detail.soTien) || 0;
        const kId = detail.khoanThuId;
        const detailItem: DetailStatItem = {
          maPhieu: pt.maPhieuThu,
          tenChuHo: pt.tenChuHo,
          tenKhoanThu: detail.tenKhoanThu,
          ngayThu: pt.ngayThu,
          soTien: amount,
          ghiChu: detail.ghiChu,
        };

        if (pt.trangThai === "Đã thu") {
          if (batBuocIds.has(kId)) {
            totalBatBuoc += amount;
            listDetailBatBuoc.push(detailItem);
          } else if (tuNguyenIds.has(kId)) {
            totalTuNguyen += amount;
            listDetailTuNguyen.push(detailItem);
          } else {
            totalBatBuoc += amount;
            listDetailBatBuoc.push(detailItem);
          }
        } else if (pt.trangThai === "Chưa thu" || pt.trangThai === "Đang nợ") {
          totalDangNo += amount;
          listDetailDangNo.push(detailItem);
        }
      });
    });

    listDetailBatBuoc.sort(
      (a, b) =>
        new Date(b.ngayThu || 0).getTime() - new Date(a.ngayThu || 0).getTime()
    );
    listDetailTuNguyen.sort(
      (a, b) =>
        new Date(b.ngayThu || 0).getTime() - new Date(a.ngayThu || 0).getTime()
    );
    listDetailDangNo.sort(
      (a, b) =>
        new Date(b.ngayThu || 0).getTime() - new Date(a.ngayThu || 0).getTime()
    );

    return {
      totalBatBuoc,
      totalTuNguyen,
      totalDangNo,
      listDetailBatBuoc,
      listDetailTuNguyen,
      listDetailDangNo,
    };
  }, [dsPhieuThu, listBatBuocDef, listTuNguyenDef]);

  const openModal = (type: "bat-buoc" | "tu-nguyen" | "dang-no") => {
    const titles = {
      "bat-buoc": "Chi tiết thu Phí Cố Định & Vệ Sinh",
      "tu-nguyen": "Chi tiết thu Đóng Góp / Ủng Hộ Tự Nguyện",
      "dang-no": "Chi tiết các khoản đang nợ / chưa thu",
    };
    const datas = {
      "bat-buoc": stats.listDetailBatBuoc,
      "tu-nguyen": stats.listDetailTuNguyen,
      "dang-no": stats.listDetailDangNo,
    };

    setDetailModal({
      isOpen: true,
      type,
      title: titles[type],
      data: datas[type],
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val) + " đ";
  };

  const getInitials = (name?: string) => {
    if (!name) return "H";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (
      parts[parts.length - 2][0] + parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const filteredData = useMemo(() => {
    return dsPhieuThu.filter((item) => {
      const term = searchTerm.toLowerCase();
      const matchName = item.tenChuHo?.toLowerCase().includes(term);
      const matchKy = item.kyThu?.toLowerCase().includes(term);
      const matchMa = item.maPhieuThu?.toLowerCase().includes(term);
      const matchSearch = term === "" || matchName || matchKy || matchMa;

      const matchStatus =
        statusFilter === "" || item.trangThai === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [dsPhieuThu, searchTerm, statusFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const isAnyError = isErrorBatBuoc || isErrorTuNguyen || isErrorPhieuThu;

  return (
    <div className="page-stack">
      {/* Page Header */}
      <PageHeader
        title="Quản Lý Thu Phí & Các Nguồn Quỹ"
        description="Lập phiếu thu tiền, theo dõi tiến độ nộp phí vệ sinh và các quỹ vận động tự nguyện toàn dân"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/" },
          { label: "Quản lý thu phí" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <StatsToggle
              expanded={showStats}
              onToggle={toggleStats}
              controls={statsGridId}
            />
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => handleOpenAdd("Bắt buộc")}
            >
              Tạo khoản thu mới
            </Button>
          </div>
        }
      />

      {/* Finance Section Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        <Link
          href="/thu-phi"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs whitespace-nowrap"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Tổng quan & Lịch sử</span>
        </Link>
        <Link
          href="/thu-phi/ve-sinh"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Thu phí vệ sinh & định kỳ</span>
        </Link>
        <Link
          href="/thu-phi/dong-gop"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          <Heart className="w-3.5 h-3.5 text-slate-500" />
          <span>Vận động đóng góp tự nguyện</span>
        </Link>
      </div>

      {/* Error state display */}
      {isAnyError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">
              {extractErrorMessage(
                errorPhieuThu || errorBatBuoc || errorTuNguyen,
                "Không thể tải lịch sử và dữ liệu thu phí"
              )}
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
            onClick={() => {
              refetchPhieuThu();
              refetchBatBuoc();
              refetchTuNguyen();
            }}
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Financial Stat Cards */}
      <div
        id={statsGridId}
        hidden={!showStats}
        className={showStats ? "grid grid-cols-1 sm:grid-cols-3 gap-2.5" : "hidden"}
      >
        <button
          type="button"
          onClick={() => openModal("bat-buoc")}
          aria-label="Xem chi tiết thu phí cố định"
          className="text-left w-full min-w-0 cursor-pointer p-0 bg-transparent border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        >
          <StatCard
            variant="compact"
            title="TỔNG THU PHÍ CỐ ĐỊNH"
            value={formatCurrency(stats.totalBatBuoc)}
            subtitle="Phí vệ sinh, an ninh (Click xem chi tiết)"
            icon={<CreditCard className="w-4 h-4" />}
            trend={{
              value: "Đã thu",
              isPositive: true,
            }}
          />
        </button>

        <button
          type="button"
          onClick={() => openModal("tu-nguyen")}
          aria-label="Xem chi tiết tổng quỹ đóng góp"
          className="text-left w-full min-w-0 cursor-pointer p-0 bg-transparent border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        >
          <StatCard
            variant="compact"
            title="TỔNG QUỸ ĐÓNG GÓP"
            value={formatCurrency(stats.totalTuNguyen)}
            subtitle="Đền ơn đáp nghĩa, người nghèo (Click xem)"
            icon={<Heart className="w-4 h-4" />}
            trend={{
              value: "Tự nguyện",
              isPositive: true,
            }}
          />
        </button>

        <button
          type="button"
          onClick={() => openModal("dang-no")}
          aria-label="Xem chi tiết tổng số tiền còn nợ"
          className="text-left w-full min-w-0 cursor-pointer p-0 bg-transparent border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        >
          <StatCard
            variant="compact"
            title="TỔNG SỐ TIỀN CÒN NỢ"
            value={formatCurrency(stats.totalDangNo)}
            subtitle="Các hộ chưa hoàn thành (Click xem)"
            icon={<Coins className="w-4 h-4" />}
            trend={{
              value: "Cần đôn đốc",
              isPositive: false,
            }}
          />
        </button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                id="search-receipt-input"
                aria-label="Tìm kiếm phiếu thu theo tên chủ hộ, mã phiếu, kỳ thu"
                type="text"
                placeholder="Tìm theo tên chủ hộ, mã phiếu, kỳ thu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            {/* Filter Status */}
            <div className="relative shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                id="filter-receipt-status"
                aria-label="Lọc phiếu thu theo trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-8.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Đã thu">Đã thu</option>
                <option value="Chưa thu">Chưa thu / Đang nợ</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 shrink-0 self-end sm:self-center">
            Hiển thị <strong className="text-slate-800 tabular-nums">{filteredData.length}</strong> phiếu thu
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">Mã Phiếu</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Hộ Gia Đình</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Kỳ Thu & Nội Dung</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-right">Tổng Tiền</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Ngày Thu</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-center">Trạng Thái</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-5 py-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-5 py-4 text-center"><Skeleton className="h-4 w-16 mx-auto" /></td>
                    <td className="px-5 py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-600">
                      Không tìm thấy phiếu thu nào phù hợp
                    </p>
                  </td>
                </tr>
              ) : (
                pagedData.map((item, index) => {
                  const itemId = item._id || item.id || "";
                  const isPaid = item.trangThai === "Đã thu";

                  return (
                    <tr
                      key={itemId || index}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Mã Phiếu */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 text-blue-700 rounded border border-slate-200">
                          {item.maPhieuThu || `#${itemId.slice(-6).toUpperCase()}`}
                        </span>
                      </td>

                      {/* Hộ gia đình */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200/90 shadow-2xs shrink-0">
                            {getInitials(item.tenChuHo)}
                          </div>
                          <span className="text-xs font-bold text-slate-900">
                            {item.tenChuHo}
                          </span>
                        </div>
                      </td>

                      {/* Kỳ thu & Chi tiết khoản */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-slate-800">
                            {item.kyThu || "Kỳ định kỳ"}
                          </div>
                          {item.chiTietThu && item.chiTietThu.length > 0 && (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {item.chiTietThu.map((ct, ctIdx) => (
                                <span
                                  key={ctIdx}
                                  className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] truncate max-w-[130px]"
                                >
                                  {ct.tenKhoanThu}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Tổng tiền */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right font-bold text-slate-900 text-xs tabular-nums">
                        {formatCurrency(item.tongTien || 0)}
                      </td>

                      {/* Ngày thu */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600 tabular-nums">
                        {item.ngayThu
                          ? new Date(item.ngayThu).toLocaleDateString("vi-VN")
                          : "Chưa ghi nhận"}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <Badge
                          variant={isPaid ? "success" : "warning"}
                          size="sm"
                          dot
                        >
                          {item.trangThai || "Chưa thu"}
                        </Badge>
                      </td>

                      {/* Thao tác */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid && (
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() => handleThuNo(item)}
                              isLoading={updateStatusMutation.isPending}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              Thu tiền
                            </Button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Xóa phiếu thu"
                            aria-label="Xóa phiếu thu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">
              Tổng số <strong className="tabular-nums text-slate-800">{filteredData.length}</strong> bản ghi · Trang <strong className="tabular-nums text-slate-800">{currentPage}</strong> / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={isLoading || currentPage <= 1}
                leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
              >
                Trước
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={isLoading || currentPage >= totalPages}
                rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm Khoản Thu */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={`Tạo Khoản Thu ${addType}`}
          description="Thiết lập danh mục khoản phí cố định hoặc quỹ tự nguyện"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setAddType("Bắt buộc")}
                className={`flex-1 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  addType === "Bắt buộc"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Phí bắt buộc
              </button>
              <button
                type="button"
                onClick={() => setAddType("Tự nguyện")}
                className={`flex-1 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  addType === "Tự nguyện"
                    ? "bg-white text-purple-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Quỹ tự nguyện
              </button>
            </div>

            <div>
              <label htmlFor="modal-ten-khoan-thu" className="block font-semibold text-slate-700 mb-1">
                Tên khoản thu <span className="text-rose-600">*</span>
              </label>
              <input
                id="modal-ten-khoan-thu"
                type="text"
                placeholder="Ví dụ: Phí vệ sinh môi trường 2026"
                value={formData.tenKhoanThu}
                onChange={(e) =>
                  setFormData({ ...formData, tenKhoanThu: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            {addType === "Bắt buộc" && (
              <div>
                <label htmlFor="modal-so-tien" className="block font-semibold text-slate-700 mb-1">
                  Đơn giá quy định (VNĐ/người hoặc cố định)
                </label>
                <input
                  id="modal-so-tien"
                  type="number"
                  placeholder="6000"
                  value={formData.soTien}
                  onChange={(e) =>
                    setFormData({ ...formData, soTien: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all tabular-nums"
                />
              </div>
            )}

            <div>
              <label htmlFor="modal-ngay-bat-dau" className="block font-semibold text-slate-700 mb-1">
                Ngày bắt đầu áp dụng
              </label>
              <input
                id="modal-ngay-bat-dau"
                type="date"
                value={formData.ngayBatDau}
                onChange={(e) =>
                  setFormData({ ...formData, ngayBatDau: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsAddModalOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmAdd}
                isLoading={createKhoanThuMutation.isPending}
              >
                Tạo khoản thu
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Chi Tiết Thống Kê */}
      {detailModal.isOpen && (
        <Modal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ ...detailModal, isOpen: false })}
          title={detailModal.title}
          description="Danh sách các phiếu thu và hộ gia đình tương ứng"
          maxWidth="3xl"
        >
          <div className="space-y-3">
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Mã Phiếu</th>
                    <th className="p-3">Chủ Hộ</th>
                    <th className="p-3">Khoản Thu</th>
                    <th className="p-3 text-right">Số Tiền</th>
                    <th className="p-3">Thời Gian</th>
                    <th className="p-3 text-center">Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailModal.data.length > 0 ? (
                    detailModal.data.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-semibold text-blue-700">
                          {item.maPhieu || "—"}
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {item.tenChuHo}
                        </td>
                        <td className="p-3 text-slate-700">{item.tenKhoanThu}</td>
                        <td className="p-3 text-right font-bold text-slate-900 tabular-nums">
                          {formatCurrency(item.soTien)}
                        </td>
                        <td className="p-3 tabular-nums text-slate-600">
                          {item.ngayThu
                            ? new Date(item.ngayThu).toLocaleDateString("vi-VN")
                            : "—"}
                        </td>
                        <td className="p-3 text-center text-slate-400 italic">
                          {item.ghiChu || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Không có dữ liệu trong danh mục này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            const id = deleteTarget._id || deleteTarget.id || "";
            deleteMutation.mutate(id);
          }
        }}
        title="Xác nhận xóa phiếu thu"
        message={`Bạn có chắc chắn muốn xóa phiếu thu mã ${
          deleteTarget?.maPhieuThu || ""
        } của chủ hộ ${
          deleteTarget?.tenChuHo || ""
        }? Hành động này sẽ xóa vĩnh viễn phiếu thu khỏi hệ thống.`}
        confirmText="Xóa phiếu thu"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
