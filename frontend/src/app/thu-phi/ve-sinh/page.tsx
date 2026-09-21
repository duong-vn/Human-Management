"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  CheckCircle2,
  Calendar,
  Layers,
  Trash2,
  Search,
  Filter,
  Building2,
  FileText,
  Heart,
  DollarSign,
  Users,
  AlertCircle,
  Clock,
  RotateCw,
} from "lucide-react";
import {
  getAllHoKhau,
  createPhieuThu,
  getKhoanThuBatBuoc,
  getAllThuPhi,
  deleteKhoanThu,
  deletePhieuThu,
} from "../api";
import {
  PageHeader,
  Button,
  Badge,
  Card,
  StatCard,
  ConfirmDialog,
  Skeleton,
} from "@/components/ui";

interface KhoanThuItem {
  _id?: string;
  id?: string;
  tenKhoanThu?: string;
  soTien?: number;
  donViTinh?: string;
  loaiKhoanThu?: string;
}

interface DiaChiItem {
  soNha?: string;
  duong?: string;
  phuongXa?: string;
}

interface HoKhauItem {
  _id?: string;
  id?: string;
  maHoKhau?: string;
  chuHo?: {
    hoTen?: string;
  };
  thanhVien?: unknown[];
  diaChi?: DiaChiItem;
  diaChiThuongTru?: DiaChiItem;
  soNhanKhau?: number;
}

interface ChiTietThuItem {
  khoanThuId?: string;
  tenKhoanThu?: string;
  soTien?: number;
  ghiChu?: string;
}

interface PhieuThuVeSinhItem {
  _id?: string;
  id?: string;
  hoKhauId?: string;
  kyThu?: string;
  trangThai?: string;
  chiTietThu?: ChiTietThuItem[];
  tongTien?: number;
}

interface PhieuThuPayload {
  hoKhauId: string;
  maPhieuThu: string;
  tenChuHo: string;
  diaChi: string;
  soNhanKhau: number;
  nam: number;
  kyThu: string;
  ngayThu: string;
  trangThai: "Đã thu" | "Chưa thu";
  chiTietThu: Array<{
    khoanThuId: string;
    tenKhoanThu: string;
    soTien: number;
    ghiChu: string;
  }>;
  tongTien: number;
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

export default function QuanLyCacKhoanThuPage() {
  const queryClient = useQueryClient();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeKhoanThu, setActiveKhoanThu] = useState<KhoanThuItem | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Confirmation dialogs
  const [deleteFeeTarget, setDeleteFeeTarget] = useState<KhoanThuItem | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<{
    hoKhau: HoKhauItem;
    status: "Đã thu" | "Chưa thu";
    tongTien: number;
    kyThuLabel: string;
    diaChiString: string;
  } | null>(null);

  // --- DATA FETCHING ---
  const {
    data: dsHoKhau = [],
    isLoading: isLoadingHoKhau,
    isError: isErrorHoKhau,
    error: errorHoKhau,
    refetch: refetchHoKhau,
  } = useQuery<HoKhauItem[]>({
    queryKey: ["ho-khau"],
    queryFn: async () => {
      const res = await getAllHoKhau();
      return Array.isArray(res) ? res : [];
    },
  });

  const {
    data: dsKhoanThu = [],
    isLoading: isLoadingKhoanThu,
    isError: isErrorKhoanThu,
    error: errorKhoanThu,
    refetch: refetchKhoanThu,
  } = useQuery<KhoanThuItem[]>({
    queryKey: ["khoan-thu-bat-buoc"],
    queryFn: async () => {
      const res = await getKhoanThuBatBuoc();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  const {
    data: dsPhieuThu = [],
    isError: isErrorPhieuThu,
    error: errorPhieuThu,
    refetch: refetchPhieuThu,
  } = useQuery<PhieuThuVeSinhItem[]>({
    queryKey: ["thu-phi-history"],
    queryFn: async () => {
      const res = await getAllThuPhi();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  useEffect(() => {
    if (!activeKhoanThu && dsKhoanThu.length > 0) {
      setActiveKhoanThu(dsKhoanThu[0]);
    }
  }, [dsKhoanThu, activeKhoanThu]);

  const getCleanId = (obj: unknown): string => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    if (typeof obj === "object" && obj !== null) {
      const rec = obj as Record<string, unknown>;
      return String(rec._id || rec.id || "");
    }
    return String(obj);
  };

  // LOGIC TÍNH PHÍ (Preserve existing formulas)
  const calculateFee = useCallback(
    (hoKhau: HoKhauItem) => {
      if (!activeKhoanThu) return { tongTien: 0, kyThuLabel: "" };

      const donGia = Number(activeKhoanThu.soTien || 0);
      const tenKhoan = activeKhoanThu.tenKhoanThu?.toLowerCase() || "";
      const soNK = hoKhau.thanhVien?.length || 0;

      if (tenKhoan.includes("vệ sinh")) {
        return {
          // Công thức: Đơn giá * Số người * 12 tháng
          tongTien: donGia * soNK * 12,
          kyThuLabel: `Năm ${selectedYear}`,
        };
      }
      return {
        tongTien: donGia * soNK,
        kyThuLabel: `Tháng ${selectedMonth}/${selectedYear}`,
      };
    },
    [activeKhoanThu, selectedMonth, selectedYear]
  );

  // LOGIC XỬ LÝ TRẠNG THÁI
  const getSinglePaymentStatus = useCallback(
    (hoKhau: HoKhauItem) => {
      if (!activeKhoanThu) return "none";

      const hkId = getCleanId(hoKhau._id || hoKhau.id);
      const ktId = getCleanId(activeKhoanThu._id || activeKhoanThu.id);
      const { kyThuLabel } = calculateFee(hoKhau);

      const filterredPhieu = dsPhieuThu.filter((pt) => {
        const ptHoKhauId = getCleanId(pt.hoKhauId);
        return (
          ptHoKhauId === hkId &&
          pt.kyThu === kyThuLabel &&
          pt.chiTietThu?.some((ct) => getCleanId(ct.khoanThuId) === ktId)
        );
      });

      if (filterredPhieu.length === 0) return "none";

      const hasPaid = filterredPhieu.some((p) => p.trangThai === "Đã thu");
      if (hasPaid) return "Đã thu";

      const hasDebt = filterredPhieu.some((p) => p.trangThai === "Chưa thu");
      if (hasDebt) return "Chưa thu";

      return "none";
    },
    [activeKhoanThu, dsPhieuThu, calculateFee]
  );

  // --- MUTATIONS ---
  const thuPhiMutation = useMutation({
    mutationFn: async (payload: PhieuThuPayload) => await createPhieuThu(payload),
    onSuccess: (_, variables) => {
      const statusText =
        variables.trangThai === "Đã thu" ? "nộp phí" : "ghi nhận nợ";
      toast.success(`Đã ${statusText} thành công!`);
      queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
      setPaymentTarget(null);
    },
    onError: (err: unknown) => {
      toast.error("Lỗi: " + extractErrorMessage(err, "Có lỗi xảy ra"));
    },
  });

  const deleteKhoanThuMutation = useMutation({
    mutationFn: async (id: string) => {
      const relatedPhieus = dsPhieuThu.filter((pt) =>
        pt.chiTietThu?.some(
          (detail) => getCleanId(detail.khoanThuId) === id
        )
      );

      if (relatedPhieus.length > 0) {
        const deletePromises = relatedPhieus.map((pt) =>
          deletePhieuThu(getCleanId(pt))
        );
        await Promise.all(deletePromises);
      }

      return await deleteKhoanThu(id);
    },
    onSuccess: () => {
      toast.success("Đã xóa khoản thu và toàn bộ dữ liệu thu phí liên quan!");
      setActiveKhoanThu(null);
      queryClient.invalidateQueries({ queryKey: ["khoan-thu-bat-buoc"] });
      queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
      setDeleteFeeTarget(null);
    },
    onError: (err: unknown) => {
      toast.error("Lỗi xóa: " + extractErrorMessage(err, "Không xác định"));
    },
  });

  const executePaymentPayload = (
    hoKhau: HoKhauItem,
    status: "Đã thu" | "Chưa thu",
    tongTien: number,
    kyThuLabel: string,
    diaChiString: string
  ) => {
    if (!activeKhoanThu) return;

    const payload: PhieuThuPayload = {
      hoKhauId: getCleanId(hoKhau._id || hoKhau.id),
      maPhieuThu: `PT-${getCleanId(activeKhoanThu).slice(-4)}-${Date.now()}`,
      tenChuHo: hoKhau.chuHo?.hoTen || "Chủ hộ không xác định",
      diaChi: diaChiString,
      soNhanKhau: Number(hoKhau.thanhVien?.length || 0),
      nam: Number(selectedYear),
      kyThu: kyThuLabel,
      ngayThu: new Date().toISOString(),
      trangThai: status,
      chiTietThu: [
        {
          khoanThuId: getCleanId(activeKhoanThu._id || activeKhoanThu.id),
          tenKhoanThu: activeKhoanThu.tenKhoanThu || "Khoản thu",
          soTien: Number(tongTien),
          ghiChu: status === "Chưa thu" ? "Ghi nợ khoản thu" : "Nộp trực tiếp",
        },
      ],
      tongTien: Number(tongTien),
    };

    thuPhiMutation.mutate(payload);
  };

  const handleTriggerPayment = (
    hoKhau: HoKhauItem,
    status: "Đã thu" | "Chưa thu" = "Đã thu"
  ) => {
    if (!activeKhoanThu) {
      return toast.error("Vui lòng chọn một danh mục khoản thu!");
    }

    const { tongTien, kyThuLabel } = calculateFee(hoKhau);
    const dc = hoKhau.diaChi || hoKhau.diaChiThuongTru;
    const diaChiString =
      (dc?.soNha ? "Số " + dc.soNha + ", " : "") +
      (dc?.duong || "Chưa cập nhật");

    setPaymentTarget({
      hoKhau,
      status,
      tongTien,
      kyThuLabel,
      diaChiString,
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "H";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (
      parts[parts.length - 2][0] + parts[parts.length - 1][0]
    ).toUpperCase();
  };

  // Filtered and eligible households
  const eligibleHoKhau = useMemo(() => {
    return dsHoKhau.filter((hk) => {
      const soNK = hk.thanhVien?.length || 0;
      const { tongTien } = calculateFee(hk);
      return soNK > 0 && tongTien > 0;
    });
  }, [dsHoKhau, calculateFee]);

  const stats = useMemo(() => {
    let daThuCount = 0;
    let chuaThuCount = 0;
    let noneCount = 0;
    let totalExpectedMoney = 0;
    let totalCollectedMoney = 0;

    eligibleHoKhau.forEach((hk) => {
      const { tongTien } = calculateFee(hk);
      totalExpectedMoney += tongTien;
      const status = getSinglePaymentStatus(hk);
      if (status === "Đã thu") {
        daThuCount++;
        totalCollectedMoney += tongTien;
      } else if (status === "Chưa thu") {
        chuaThuCount++;
      } else {
        noneCount++;
      }
    });

    return {
      totalHouseholds: eligibleHoKhau.length,
      daThuCount,
      chuaThuCount,
      noneCount,
      totalExpectedMoney,
      totalCollectedMoney,
    };
  }, [eligibleHoKhau, calculateFee, getSinglePaymentStatus]);

  const filteredDisplayHoKhau = useMemo(() => {
    return eligibleHoKhau.filter((hk) => {
      const term = searchTerm.toLowerCase();
      const tenChuHo = (hk.chuHo?.hoTen || "").toLowerCase();
      const maHo = (hk.maHoKhau || "").toLowerCase();
      const soNha = (hk.diaChi?.soNha || hk.diaChiThuongTru?.soNha || "").toLowerCase();
      const duong = (hk.diaChi?.duong || hk.diaChiThuongTru?.duong || "").toLowerCase();
      const matchSearch =
        term === "" ||
        tenChuHo.includes(term) ||
        maHo.includes(term) ||
        soNha.includes(term) ||
        duong.includes(term);

      const status = getSinglePaymentStatus(hk);
      const matchStatus =
        statusFilter === "" ||
        (statusFilter === "Đã thu" && status === "Đã thu") ||
        (statusFilter === "Chưa thu" && status === "Chưa thu") ||
        (statusFilter === "none" && status === "none");

      return matchSearch && matchStatus;
    });
  }, [eligibleHoKhau, searchTerm, statusFilter, getSinglePaymentStatus]);

  const isAnyError = isErrorHoKhau || isErrorKhoanThu || isErrorPhieuThu;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Thu Phí Vệ Sinh & Định Kỳ"
        description="Theo dõi, đối soát và thu nộp các khoản phí vệ sinh môi trường, an ninh trật tự định kỳ theo hộ gia đình"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/" },
          { label: "Quản lý thu phí", href: "/thu-phi" },
          { label: "Thu phí vệ sinh & định kỳ" },
        ]}
      />

      {/* Finance Section Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        <Link
          href="/thu-phi"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Tổng quan & Lịch sử</span>
        </Link>
        <Link
          href="/thu-phi/ve-sinh"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs whitespace-nowrap"
        >
          <Building2 className="w-3.5 h-3.5" />
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
                errorKhoanThu || errorHoKhau || errorPhieuThu,
                "Không thể tải dữ liệu thu phí định kỳ"
              )}
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
            onClick={() => {
              refetchKhoanThu();
              refetchHoKhau();
              refetchPhieuThu();
            }}
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Fee Selection Bar */}
      <Card className="p-5">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Danh Mục Khoản Thu Cố Định
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chọn danh mục khoản thu để xem và đối chiếu theo danh sách hộ
              </p>
            </div>

            {/* Period selector */}
            <div className="flex items-center gap-2 shrink-0 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <label htmlFor="select-ve-sinh-thang" className="text-slate-500">Kỳ thu:</label>
              <select
                id="select-ve-sinh-thang"
                aria-label="Chọn tháng thu phí"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
              <span className="text-slate-300">/</span>
              <label htmlFor="select-ve-sinh-nam" className="sr-only">Năm thu phí</label>
              <select
                id="select-ve-sinh-nam"
                aria-label="Chọn năm thu phí"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          {/* Fee cards list */}
          {isLoadingKhoanThu ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ) : dsKhoanThu.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              Chưa có danh mục phí cố định nào. Hãy tạo khoản thu mới từ trang Tổng quan.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {dsKhoanThu.map((kt) => {
                const isActive =
                  activeKhoanThu &&
                  getCleanId(activeKhoanThu) === getCleanId(kt);
                const isVeSinh = kt.tenKhoanThu?.toLowerCase().includes("vệ sinh");

                return (
                  <div
                    key={getCleanId(kt)}
                    onClick={() => setActiveKhoanThu(kt)}
                    className={`group p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                      isActive
                        ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold truncate ${
                            isActive ? "text-blue-900" : "text-slate-800"
                          }`}
                        >
                          {kt.tenKhoanThu}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 tabular-nums">
                          <DollarSign className="w-3 h-3 text-slate-400" />
                          <span>
                            {Number(kt.soTien || 0).toLocaleString("vi-VN")} đ/người
                            {isVeSinh ? "/tháng (x12 cả năm)" : "/tháng"}
                          </span>
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        {isActive ? (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteFeeTarget(kt);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Xóa danh mục phí này"
                            aria-label="Xóa danh mục phí này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Progress & Stat Cards Row */}
      {activeKhoanThu && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="ĐÃ HOÀN THÀNH"
            value={`${stats.daThuCount} / ${stats.totalHouseholds} hộ`}
            subtitle={`Đã thu: ${Number(stats.totalCollectedMoney).toLocaleString("vi-VN")} đ`}
            icon={<CheckCircle2 className="w-5 h-5" />}
            accent="emerald"
            trend={{
              value: `${
                stats.totalHouseholds > 0
                  ? Math.round((stats.daThuCount / stats.totalHouseholds) * 100)
                  : 0
              }% hoàn thành`,
              isPositive: true,
            }}
          />

          <StatCard
            title="ĐANG NỢ KHOẢN THU"
            value={`${stats.chuaThuCount} hộ`}
            subtitle="Hộ đã ghi nhận nợ cần đôn đốc"
            icon={<AlertCircle className="w-5 h-5" />}
            accent="amber"
            trend={{
              value: "Cần đôn đốc",
              isPositive: false,
            }}
          />

          <StatCard
            title="CHƯA NỘP / CHƯA GHI NHẬN"
            value={`${stats.noneCount} hộ`}
            subtitle="Chưa phát sinh biên lai nộp kỳ này"
            icon={<Clock className="w-5 h-5" />}
            accent="slate"
            trend={{
              value: "Chưa thu",
              neutral: true,
            }}
          />
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                id="search-ve-sinh-input"
                aria-label="Tìm kiếm hộ gia đình theo chủ hộ, mã hộ, số nhà, đường"
                type="text"
                placeholder="Tìm theo chủ hộ, mã hộ, số nhà, đường..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            <div className="relative shrink-0">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
              <select
                id="filter-ve-sinh-status"
                aria-label="Lọc danh sách theo trạng thái nộp phí"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-8.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Đã thu">Đã hoàn thành</option>
                <option value="Chưa thu">Đang nợ</option>
                <option value="none">Chưa nộp</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 shrink-0 self-end sm:self-center">
            Hiển thị <strong className="text-slate-800 tabular-nums">{filteredDisplayHoKhau.length}</strong> hộ gia đình
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">Hộ Gia Đình</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-center">Số Nhân Khẩu</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-right">Mức Phải Nộp</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-center">Trạng Thái</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoadingHoKhau ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-5 py-4 text-center"><Skeleton className="h-4 w-16 mx-auto" /></td>
                    <td className="px-5 py-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
                    <td className="px-5 py-4 text-center"><Skeleton className="h-4 w-16 mx-auto" /></td>
                    <td className="px-5 py-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredDisplayHoKhau.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-600">
                      Không tìm thấy hộ gia đình nào phù hợp với bộ lọc
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDisplayHoKhau.map((hk) => {
                  const hkId = getCleanId(hk);
                  const soNK = hk.thanhVien?.length || 0;
                  const { tongTien } = calculateFee(hk);
                  const currentStatus = getSinglePaymentStatus(hk);

                  return (
                    <tr
                      key={hkId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        currentStatus === "Đã thu" ? "bg-slate-50/30" : ""
                      }`}
                    >
                      {/* Hộ gia đình */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200/90 shadow-2xs shrink-0">
                            {getInitials(hk.chuHo?.hoTen)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {hk.chuHo?.hoTen || "Chủ hộ không rõ"}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">
                              {hk.diaChi?.soNha ? `Số ${hk.diaChi.soNha}, ` : ""}
                              {hk.diaChi?.duong || "Phường La Khê"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Số nhân khẩu */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 tabular-nums">
                          {soNK} người
                        </span>
                      </td>

                      {/* Phải nộp */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right font-bold text-slate-900 text-xs tabular-nums">
                        {Number(tongTien).toLocaleString("vi-VN")} đ
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        {currentStatus === "Đã thu" ? (
                          <Badge variant="success" size="sm" dot>
                            Đã hoàn thành
                          </Badge>
                        ) : currentStatus === "Chưa thu" ? (
                          <Badge variant="danger" size="sm" dot>
                            Đang nợ
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm" dot>
                            Chưa nộp
                          </Badge>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        {currentStatus === "Đã thu" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Đã thu</span>
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleTriggerPayment(hk, "Đã thu")}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              Thu tiền
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleTriggerPayment(hk, "Chưa thu")}
                            >
                              Ghi nợ
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Payment Modal */}
      <ConfirmDialog
        isOpen={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onConfirm={() => {
          if (paymentTarget) {
            executePaymentPayload(
              paymentTarget.hoKhau,
              paymentTarget.status,
              paymentTarget.tongTien,
              paymentTarget.kyThuLabel,
              paymentTarget.diaChiString
            );
          }
        }}
        title={paymentTarget?.status === "Chưa thu" ? "Xác nhận ghi nợ" : "Xác nhận nộp phí"}
        message={`Xác nhận ${paymentTarget?.status === "Chưa thu" ? "ghi nhận nợ" : "thu phí"} cho hộ chủ hộ ${
          paymentTarget?.hoKhau?.chuHo?.hoTen || ""
        }? Khoản thu: "${activeKhoanThu?.tenKhoanThu}" (${
          paymentTarget?.kyThuLabel || ""
        }). Tổng số tiền: ${Number(
          paymentTarget?.tongTien || 0
        ).toLocaleString("vi-VN")} đ.`}
        confirmText={paymentTarget?.status === "Chưa thu" ? "Ghi nhận nợ" : "Xác nhận nộp tiền"}
        cancelText="Hủy bỏ"
        variant={paymentTarget?.status === "Chưa thu" ? "warning" : "primary"}
        isLoading={thuPhiMutation.isPending}
      />

      {/* Confirm Delete Khoan Thu Dialog */}
      <ConfirmDialog
        isOpen={!!deleteFeeTarget}
        onClose={() => setDeleteFeeTarget(null)}
        onConfirm={() => {
          if (deleteFeeTarget) {
            const id = getCleanId(deleteFeeTarget);
            deleteKhoanThuMutation.mutate(id);
          }
        }}
        title="Xác nhận xóa khoản thu"
        message={`CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn xóa khoản thu "${
          deleteFeeTarget?.tenKhoanThu || ""
        }"? Hành động này sẽ xóa vĩnh viễn danh mục khoản thu và TẤT CẢ lịch sử phiếu thu liên quan của các hộ gia đình. Không thể hoàn tác.`}
        confirmText="Xác nhận xóa tất cả"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={deleteKhoanThuMutation.isPending}
      />
    </div>
  );
}
