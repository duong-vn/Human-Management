"use client";

import React, { useEffect, useState, useCallback, useMemo, useId } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  Calendar,
  RotateCw,
  Search,
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Receipt,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  History,
  Coins,
} from "lucide-react";
import {
  getDanhSachDotThu,
  getChiTietHoDaNop,
  getChiTietHoChuaNop,
  getLichSuHo,
} from "./api";
import {
  PageHeader,
  Button,
  Badge,
  Card,
  StatCard,
  Modal,
  Skeleton,
  useStatsVisibility,
  StatsToggle,
} from "@/components/ui";

interface DotThuItem {
  kyThu: string;
  tongTien?: number;
  soHoDaNop?: number;
  soHo?: number;
  soHoChuaNop?: number;
}

interface ChiTietKhoanThu {
  khoanThuId?: string;
  tenKhoanThu?: string;
  soTien?: number;
  ghiChu?: string;
}

interface ChiTietHoItem {
  _id: string;
  maPhieuThu?: string;
  hoKhauId?: {
    _id?: string;
    maHoKhau?: string;
  } | string;
  tenChuHo?: string;
  diaChi?: string;
  ngayThu?: string;
  trangThai?: string;
  tongTien?: number;
  chiTietThu?: ChiTietKhoanThu[];
}

interface PhieuThuLichSu {
  _id: string;
  maPhieuThu?: string;
  tenChuHo?: string;
  diaChi?: string;
  ngayThu?: string;
  tongTien?: number;
  trangThai?: string;
  ghiChu?: string;
  chiTietThu?: ChiTietKhoanThu[];
}

interface LichSuHoData {
  tongKet?: {
    daNop?: number;
    conNo?: number;
  };
  danhSachPhieuThu?: PhieuThuLichSu[];
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

export default function ThongKePage() {
  const statsGridId = useId();
  const { showStats, toggleStats } = useStatsVisibility("hide_stats_thong_ke");
  const [nam, setNam] = useState<number>(new Date().getFullYear());
  const [dotThu, setDotThu] = useState<DotThuItem[]>([]);
  const [dotFilterText, setDotFilterText] = useState<string>("");
  const [dotCurrentPage, setDotCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDot, setSelectedDot] = useState<string | null>(null);
  const [chiTietHoDaNop, setChiTietHoDaNop] = useState<ChiTietHoItem[] | null>(null);
  const [chiTietHoChuaNop, setChiTietHoChuaNop] = useState<ChiTietHoItem[] | null>(null);
  const [chiTietLoading, setChiTietLoading] = useState(false);
  const [chiTietFilterText, setChiTietFilterText] = useState<string>("");
  const [chiTietFeeFilter, setChiTietFeeFilter] = useState<string>("");

  const [selectedHo, setSelectedHo] = useState<string | null>(null);
  const [lichSuHo, setLichSuHo] = useState<LichSuHoData | null>(null);
  const [lichSuLoading, setLichSuLoading] = useState(false);

  const [selectedPhieu, setSelectedPhieu] = useState<PhieuThuLichSu | null>(null);

  // Helper format VND
  const formatVND = (v: unknown): string => {
    if (v == null) return "0 đ";
    const n = typeof v === "number" ? v : Number(v);
    if (isNaN(n)) return String(v) + " đ";
    return n.toLocaleString("vi-VN") + " đ";
  };

  // Fetch list of dot thu
  const fetchDotThu = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDotCurrentPage(1);
    try {
      const data = await getDanhSachDotThu(nam);
      if (Array.isArray(data)) {
        const seen = new Map<string, DotThuItem>();
        const deduplicated = data.filter((item: DotThuItem) => {
          const key = (item.kyThu || "").toString().toLowerCase();
          if (!seen.has(key)) {
            seen.set(key, item);
            return true;
          }
          return false;
        });
        setDotThu(deduplicated);
      } else {
        setDotThu([]);
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Lỗi khi tải danh sách đợt thu"));
      setDotThu([]);
    } finally {
      setLoading(false);
    }
  }, [nam]);

  useEffect(() => {
    fetchDotThu();
  }, [fetchDotThu]);

  // Notifications for search misses
  useEffect(() => {
    if (!dotFilterText.trim()) return;
    if (loading) return;
    const q = dotFilterText.trim().toLowerCase();
    const filtered = dotThu.filter((d) =>
      (d.kyThu || "").toString().toLowerCase().includes(q)
    );
    if (filtered.length === 0) {
      toast.info(`Không tìm thấy kết quả cho "${dotFilterText}"`);
    }
  }, [dotFilterText, dotThu, loading]);

  useEffect(() => {
    if (!chiTietFilterText.trim()) return;
    if (chiTietLoading) return;
    const q = chiTietFilterText.trim().toLowerCase();
    const combined = [...(chiTietHoDaNop || []), ...(chiTietHoChuaNop || [])];
    const filtered = combined.filter((pt) => {
      const name = (pt.tenChuHo || "").toString().toLowerCase();
      const code = (pt.maPhieuThu || "").toString().toLowerCase();
      const rawHid = typeof pt.hoKhauId === "object" ? pt.hoKhauId?._id : pt.hoKhauId;
      const hid = (rawHid || "").toString().toLowerCase();
      return name.includes(q) || code.includes(q) || hid.includes(q);
    });
    if (filtered.length === 0) {
      toast.info(`Không tìm thấy hộ nào cho "${chiTietFilterText}"`);
    }
  }, [chiTietFilterText, chiTietHoDaNop, chiTietHoChuaNop, chiTietLoading]);

  // Refresh household history when selectedHo or year changes
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      if (selectedHo) {
        setLichSuLoading(true);
        try {
          const data = await getLichSuHo(selectedHo, nam);
          if (!mounted) return;
          if (data && Array.isArray(data.danhSachPhieuThu)) {
            const seen = new Map<string, boolean>();
            const deduped: PhieuThuLichSu[] = [];
            for (const ph of data.danhSachPhieuThu) {
              const key = ph._id ?? ph.maPhieuThu ?? JSON.stringify(ph);
              if (!seen.has(key)) {
                seen.set(key, true);
                deduped.push(ph);
              }
            }
            data.danhSachPhieuThu = deduped;
          }
          setLichSuHo(data || null);
        } catch (err: unknown) {
          if (!mounted) return;
          toast.error(extractErrorMessage(err, "Lỗi khi tải lịch sử hộ"));
        } finally {
          if (mounted) setLichSuLoading(false);
        }
      }
    };

    refresh();
    return () => {
      mounted = false;
    };
  }, [selectedHo, nam]);

  const openHoDetails = async (hoKhauId?: string | null) => {
    setLichSuLoading(true);
    setError(null);
    if (!hoKhauId) {
      setSelectedHo(null);
      setLichSuHo(null);
      setLichSuLoading(false);
      setError("Không có mã hộ khẩu cho phiếu thu này.");
      toast.error("Không có mã hộ khẩu cho phiếu thu này.");
      return;
    }

    setSelectedHo(hoKhauId);
    try {
      const data = await getLichSuHo(hoKhauId, nam);
      if (data && Array.isArray(data.danhSachPhieuThu)) {
        const seen = new Map<string, boolean>();
        const deduped: PhieuThuLichSu[] = [];
        for (const ph of data.danhSachPhieuThu) {
          const key = ph._id ?? ph.maPhieuThu ?? JSON.stringify(ph);
          if (!seen.has(key)) {
            seen.set(key, true);
            deduped.push(ph);
          }
        }
        data.danhSachPhieuThu = deduped;
      }
      setLichSuHo(data || null);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, "Lỗi khi tải lịch sử hộ"));
      setLichSuHo(null);
    } finally {
      setLichSuLoading(false);
    }
  };

  const openDotDetails = async (kyThu: string) => {
    setChiTietLoading(true);
    setSelectedDot(kyThu);
    try {
      const dataDaNop = await getChiTietHoDaNop(kyThu, nam);
      const dataChuaNop = await getChiTietHoChuaNop(kyThu, nam);
      setChiTietHoDaNop(Array.isArray(dataDaNop) ? dataDaNop : []);
      setChiTietHoChuaNop(Array.isArray(dataChuaNop) ? dataChuaNop : []);

      const firstHoId =
        Array.isArray(dataDaNop) && dataDaNop.length > 0
          ? typeof dataDaNop[0].hoKhauId === "object"
            ? dataDaNop[0].hoKhauId?._id
            : dataDaNop[0].hoKhauId
          : Array.isArray(dataChuaNop) && dataChuaNop.length > 0
          ? typeof dataChuaNop[0].hoKhauId === "object"
            ? dataChuaNop[0].hoKhauId?._id
            : dataChuaNop[0].hoKhauId
          : null;

      if (firstHoId) {
        await openHoDetails(firstHoId);
      } else {
        setSelectedHo(null);
        setLichSuHo(null);
      }
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, "Lỗi khi tải chi tiết đợt thu"));
      setChiTietHoDaNop([]);
      setChiTietHoChuaNop([]);
    } finally {
      setChiTietFilterText("");
      setChiTietLoading(false);
    }
  };

  // Compute derived totals for lich su
  const derivedLichSuTotals = useMemo(() => {
    const list = lichSuHo?.danhSachPhieuThu ?? [];
    let daNop = 0;
    let conNo = 0;
    for (const ph of list) {
      let sum = 0;
      if (Array.isArray(ph.chiTietThu) && ph.chiTietThu.length > 0) {
        sum = ph.chiTietThu.reduce(
          (s: number, ct: ChiTietKhoanThu) => s + (Number(ct.soTien) || 0),
          0
        );
      } else {
        sum = Number(ph.tongTien) || 0;
      }

      if (ph.trangThai === "Đã thu") daNop += sum;
      else if (ph.trangThai === "Đang nợ") conNo += sum;
      else daNop += sum;
    }
    return { daNop, conNo };
  }, [lichSuHo]);

  // Filtered dots
  const filteredDotThu = useMemo(() => {
    const q = dotFilterText.trim().toLowerCase();
    if (!q) return dotThu;
    return dotThu.filter((d) =>
      (d.kyThu || "").toString().toLowerCase().includes(q)
    );
  }, [dotThu, dotFilterText]);

  const totalDotPages = Math.ceil(filteredDotThu.length / ITEMS_PER_PAGE);
  const pagedDotThu = useMemo(() => {
    const startIdx = (dotCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredDotThu.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredDotThu, dotCurrentPage]);

  // Overall statistics
  const yearSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalPaidHouseholds = 0;
    let totalUnpaidHouseholds = 0;

    dotThu.forEach((d) => {
      totalRevenue += Number(d.tongTien) || 0;
      totalPaidHouseholds += Number(d.soHoDaNop ?? d.soHo ?? 0);
      totalUnpaidHouseholds += Number(d.soHoChuaNop ?? 0);
    });

    return {
      totalRevenue,
      totalPaidHouseholds,
      totalUnpaidHouseholds,
      totalPeriods: dotThu.length,
    };
  }, [dotThu]);

  const [daNopPage, setDaNopPage] = useState(1);
  const [chuaNopPage, setChuaNopPage] = useState(1);
  const DETAIL_PAGE_SIZE = 10;

  useEffect(() => {
    setDaNopPage(1);
    setChuaNopPage(1);
  }, [selectedDot, chiTietFilterText, chiTietFeeFilter]);

  const filteredChiTietHoDaNop = useMemo(() => {
    if (!chiTietHoDaNop) return [];
    const q = chiTietFilterText.trim().toLowerCase();
    const feeQ = chiTietFeeFilter.trim().toLowerCase();
    return chiTietHoDaNop.filter((pt) => {
      if (q) {
        const name = (pt.tenChuHo || "").toString().toLowerCase();
        const code = (pt.maPhieuThu || "").toString().toLowerCase();
        const rawHid = typeof pt.hoKhauId === "object" ? pt.hoKhauId?._id : pt.hoKhauId;
        const hid = (rawHid || "").toString().toLowerCase();
        if (!name.includes(q) && !code.includes(q) && !hid.includes(q)) return false;
      }
      if (feeQ) {
        const fees = (pt.chiTietThu || []).map((ct) => (ct.tenKhoanThu || "").toString().toLowerCase());
        if (!fees.some((f) => f.includes(feeQ))) return false;
      }
      return true;
    });
  }, [chiTietHoDaNop, chiTietFilterText, chiTietFeeFilter]);

  const totalDaNopPages = Math.max(1, Math.ceil(filteredChiTietHoDaNop.length / DETAIL_PAGE_SIZE));
  const pagedChiTietHoDaNop = useMemo(() => {
    const start = (daNopPage - 1) * DETAIL_PAGE_SIZE;
    return filteredChiTietHoDaNop.slice(start, start + DETAIL_PAGE_SIZE);
  }, [filteredChiTietHoDaNop, daNopPage]);

  const filteredChiTietHoChuaNop = useMemo(() => {
    if (!chiTietHoChuaNop) return [];
    const q = chiTietFilterText.trim().toLowerCase();
    const feeQ = chiTietFeeFilter.trim().toLowerCase();
    return chiTietHoChuaNop.filter((pt) => {
      if (q) {
        const name = (pt.tenChuHo || "").toString().toLowerCase();
        const code = (pt.maPhieuThu || "").toString().toLowerCase();
        const rawHid = typeof pt.hoKhauId === "object" ? pt.hoKhauId?._id : pt.hoKhauId;
        const hid = (rawHid || "").toString().toLowerCase();
        if (!name.includes(q) && !code.includes(q) && !hid.includes(q)) return false;
      }
      if (feeQ) {
        const fees = (pt.chiTietThu || []).map((ct) => (ct.tenKhoanThu || "").toString().toLowerCase());
        if (!fees.some((f) => f.includes(feeQ))) return false;
      }
      return true;
    });
  }, [chiTietHoChuaNop, chiTietFilterText, chiTietFeeFilter]);

  const totalChuaNopPages = Math.max(1, Math.ceil(filteredChiTietHoChuaNop.length / DETAIL_PAGE_SIZE));
  const pagedChiTietHoChuaNop = useMemo(() => {
    const start = (chuaNopPage - 1) * DETAIL_PAGE_SIZE;
    return filteredChiTietHoChuaNop.slice(start, start + DETAIL_PAGE_SIZE);
  }, [filteredChiTietHoChuaNop, chuaNopPage]);

  return (
    <div className="page-stack">
      {/* Page Header */}
      <PageHeader
        title="Thống Kê Thu Phí & Đối Soát"
        description="Tổng hợp số liệu thu nộp theo từng đợt, đối soát hộ đã nộp/chưa nộp và tra cứu lịch sử đóng góp"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/" },
          { label: "Thống kê thu phí" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <StatsToggle
              expanded={showStats}
              onToggle={toggleStats}
              controls={statsGridId}
            />
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <label htmlFor="year-select" className="text-xs font-medium text-slate-600">
                Năm:
              </label>
              <input
                id="year-select"
                aria-label="Năm thu phí"
                type="number"
                value={nam}
                onChange={(e) => setNam(parseInt(e.target.value || "0", 10))}
                className="w-16 font-bold text-xs text-slate-900 bg-transparent outline-none tabular-nums"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCw className="w-3.5 h-3.5" />}
              onClick={fetchDotThu}
              isLoading={loading}
            >
              Làm mới
            </Button>
          </div>
        }
      />

      {/* Year Summary Stat Cards */}
      <div
        id={statsGridId}
        hidden={!showStats}
        className={showStats ? "grid grid-cols-2 lg:grid-cols-4 gap-2.5" : "hidden"}
      >
        <StatCard
          variant="compact"
          title="TỔNG THU TRONG NĂM"
          value={formatVND(yearSummary.totalRevenue)}
          subtitle={`Số liệu tổng hợp năm ${nam}`}
          icon={<Coins className="w-4 h-4" />}
          trend={{
            value: `${yearSummary.totalPeriods} đợt`,
            neutral: true,
          }}
        />
        <StatCard
          variant="compact"
          title="LƯỢT HỘ ĐÃ NỘP"
          value={`${yearSummary.totalPaidHouseholds} lượt`}
          subtitle="Số lượt hoàn thành nộp phí"
          icon={<CheckCircle2 className="w-4 h-4" />}
          trend={{
            value: "Đã thu",
            isPositive: true,
          }}
        />
        <StatCard
          variant="compact"
          title="LƯỢT HỘ CHƯA NỘP"
          value={`${yearSummary.totalUnpaidHouseholds} lượt`}
          subtitle="Ghi nhận chưa hoàn thành nghĩa vụ"
          icon={<AlertCircle className="w-4 h-4" />}
          trend={{
            value: "Cần thu",
            isPositive: false,
          }}
        />
        <StatCard
          variant="compact"
          title="ĐỢT THU ĐANG CHỌN"
          value={selectedDot || "Chưa chọn"}
          subtitle="Nhấn vào đợt thu bên dưới để đối soát"
          icon={<FileText className="w-4 h-4" />}
          trend={{
            value: selectedDot ? "Đang xem" : "Mặc định",
            neutral: true,
          }}
        />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Danh Sách Đợt Thu Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Các Đợt Thu Phí Trong Năm {nam}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn một đợt thu để đối soát danh sách hộ đã nộp hoặc chưa nộp
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-dot-thu-input"
                aria-label="Tìm kiếm đợt thu phí"
                type="text"
                placeholder="Tìm đợt thu (ví dụ: Tháng 1, Đợt 2)..."
                value={dotFilterText}
                onChange={(e) => {
                  setDotFilterText(e.target.value);
                  setDotCurrentPage(1);
                }}
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
              />
              {dotFilterText && (
                <button
                  type="button"
                  onClick={() => {
                    setDotFilterText("");
                    setDotCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : filteredDotThu.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-600">
              Không có dữ liệu đợt thu nào
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Thử chọn năm khác hoặc làm mới lại dữ liệu từ hệ thống
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedDotThu.map((d, idx) => {
              const isSelected = selectedDot === d.kyThu;

              return (
                <Card
                  key={`${d.kyThu}_${idx}`}
                  className={`p-4 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-500/10 shadow-sm"
                      : "hover:border-slate-300 hover:shadow-xs"
                  }`}
                  onClick={() => openDotDetails(d.kyThu)}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {d.kyThu}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          Kỳ thu phí năm {nam}
                        </span>
                      </div>
                      <Badge
                        variant={isSelected ? "primary" : "neutral"}
                        size="sm"
                      >
                        {isSelected ? "Đang xem" : "Đợt thu"}
                      </Badge>
                    </div>

                    <div className="space-y-2 py-2 border-y border-slate-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Tổng thu được:</span>
                        <span className="font-bold text-emerald-700 tabular-nums">
                          {formatVND(d.tongTien)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Số hộ đã nộp:</span>
                        <span className="font-bold text-blue-700 tabular-nums">
                          {d.soHoDaNop ?? d.soHo ?? 0} hộ
                        </span>
                      </div>

                      {typeof d.soHoChuaNop !== "undefined" && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Số hộ chưa nộp:</span>
                          <span className="font-bold text-rose-600 tabular-nums">
                            {d.soHoChuaNop} hộ
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Bấm để đối soát
                    </span>
                    <Button
                      variant={isSelected ? "primary" : "outline"}
                      size="sm"
                      rightIcon={<ArrowRight className="w-3 h-3" />}
                    >
                      Đối soát
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalDotPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <button
              type="button"
              onClick={() => setDotCurrentPage((p) => Math.max(1, p - 1))}
              disabled={dotCurrentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
              Trước
            </button>
            {Array.from({ length: totalDotPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setDotCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                  dotCurrentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setDotCurrentPage((p) => Math.min(totalDotPages, p + 1))}
              disabled={dotCurrentPage === totalDotPages}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sau
              <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Chi Tiết Đợt Thu Section */}
      {selectedDot && (
        <Card className="p-5 border-blue-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <h3 className="text-sm md:text-base font-bold text-slate-900">
                  Đối Soát Chi Tiết: {selectedDot}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh sách chi tiết các hộ gia đình đã đóng hoặc còn nợ trong đợt này
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedDot(null);
                setChiTietHoDaNop(null);
                setChiTietHoChuaNop(null);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Đóng chi tiết"
              aria-label="Đóng chi tiết"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {chiTietLoading ? (
            <div className="space-y-3 py-6">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filter bar for detail */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="search-chi-tiet-ho-input"
                    aria-label="Tìm kiếm hộ gia đình theo tên chủ hộ, mã phiếu, mã hộ"
                    type="text"
                    placeholder="Tìm theo tên chủ hộ / mã phiếu / mã hộ..."
                    value={chiTietFilterText}
                    onChange={(e) => setChiTietFilterText(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                  />
                  {chiTietFilterText && (
                    <button
                      type="button"
                      onClick={() => setChiTietFilterText("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {selectedDot.toLowerCase().includes("tháng") && (
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="filter-chi-tiet-fee-input"
                      aria-label="Lọc theo tên khoản phí"
                      type="text"
                      placeholder="Lọc theo khoản phí..."
                      value={chiTietFeeFilter}
                      onChange={(e) => setChiTietFeeFilter(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                    />
                    {chiTietFeeFilter && (
                      <button
                        type="button"
                        onClick={() => setChiTietFeeFilter("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 1. Danh sách hộ đã nộp */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Hộ Đã Nộp Tiền ({chiTietHoDaNop?.length || 0})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Bấm vào dòng để xem lịch sử nộp của hộ
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto max-h-[300px]">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead className="bg-slate-50/90 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                          <th className="p-3">Mã Phiếu</th>
                          {selectedDot.toLowerCase().includes("tháng") && (
                            <th className="p-3">Khoản Phí</th>
                          )}
                          <th className="p-3">Mã Hộ</th>
                          <th className="p-3">Chủ Hộ</th>
                          <th className="p-3">Địa Chỉ</th>
                          <th className="p-3">Ngày Nộp</th>
                          <th className="p-3 text-center">Trạng Thái</th>
                          <th className="p-3 text-right">Tổng Tiền</th>
                          <th className="p-3 text-right">Lịch Sử</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredChiTietHoDaNop.length === 0 ? (
                          <tr>
                            <td
                              colSpan={selectedDot.toLowerCase().includes("tháng") ? 9 : 8}
                              className="p-8 text-center text-slate-400 italic"
                            >
                              Không có hộ nào đã nộp trong đợt này
                            </td>
                          </tr>
                        ) : (
                          pagedChiTietHoDaNop.map((pt) => {
                            const hoId =
                                typeof pt.hoKhauId === "object"
                                  ? pt.hoKhauId?._id
                                  : pt.hoKhauId;
                              const isCurrentHo = selectedHo === hoId;

                              return (
                                <tr
                                  key={pt._id}
                                  onClick={() => openHoDetails(hoId)}
                                  className={`cursor-pointer transition-colors ${
                                    isCurrentHo
                                      ? "bg-blue-50/70"
                                      : "hover:bg-slate-50/70"
                                  }`}
                                >
                                  <td className="p-3 font-mono font-bold text-blue-700">
                                    {pt.maPhieuThu || "—"}
                                  </td>
                                  {selectedDot.toLowerCase().includes("tháng") && (
                                    <td className="p-3 text-slate-700 max-w-[150px] truncate">
                                      {pt.chiTietThu && pt.chiTietThu.length > 0
                                        ? pt.chiTietThu.map((ct) => ct.tenKhoanThu).join(", ")
                                        : "—"}
                                    </td>
                                  )}
                                  <td className="p-3 font-mono text-slate-500">
                                    {(hoId || "").toString().slice(0, 8)}...
                                  </td>
                                  <td className="p-3 font-bold text-slate-900">
                                    {pt.tenChuHo || "—"}
                                  </td>
                                  <td className="p-3 text-slate-600 max-w-[160px] truncate">
                                    {pt.diaChi || "—"}
                                  </td>
                                  <td className="p-3 text-slate-600 tabular-nums">
                                    {pt.ngayThu
                                      ? new Date(pt.ngayThu).toLocaleDateString("vi-VN")
                                      : "—"}
                                  </td>
                                  <td className="p-3 text-center">
                                    <Badge variant="success" size="sm" dot>
                                      {pt.trangThai || "Đã thu"}
                                    </Badge>
                                  </td>
                                  <td className="p-3 text-right font-bold text-emerald-700 tabular-nums">
                                    {formatVND(pt.tongTien)}
                                  </td>
                                  <td className="p-3 text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        setSelectedPhieu(pt);
                                      }}
                                      leftIcon={<Receipt className="w-3.5 h-3.5" />}
                                    >
                                      Biên lai
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                  {filteredChiTietHoDaNop.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-2.5 bg-slate-50/50">
                      <p className="text-xs text-slate-500">
                        Tổng số <strong className="tabular-nums text-slate-800">{filteredChiTietHoDaNop.length}</strong> hộ · Trang <strong className="tabular-nums text-slate-800">{daNopPage}</strong> / {totalDaNopPages}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDaNopPage((p) => Math.max(1, p - 1))}
                          disabled={daNopPage <= 1}
                          leftIcon={<ChevronLeft className="h-3 w-3" />}
                        >
                          Trước
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDaNopPage((p) => Math.min(totalDaNopPages, p + 1))}
                          disabled={daNopPage >= totalDaNopPages}
                          rightIcon={<ChevronRight className="h-3 w-3" />}
                        >
                          Sau
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Danh sách hộ chưa nộp */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Hộ Chưa Nộp / Đang Nợ ({chiTietHoChuaNop?.length || 0})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Cần theo dõi đôn đốc thu nộp
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto max-h-[300px]">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead className="bg-slate-50/90 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                          <th className="p-3">Mã Phiếu</th>
                          {selectedDot.toLowerCase().includes("tháng") && (
                            <th className="p-3">Khoản Phí</th>
                          )}
                          <th className="p-3">Mã Hộ</th>
                          <th className="p-3">Chủ Hộ</th>
                          <th className="p-3">Địa Chỉ</th>
                          <th className="p-3">Ngày Lập</th>
                          <th className="p-3 text-center">Trạng Thái</th>
                          <th className="p-3 text-right">Số Nợ</th>
                          <th className="p-3 text-right">Lịch Sử</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredChiTietHoChuaNop.length === 0 ? (
                          <tr>
                            <td
                              colSpan={selectedDot.toLowerCase().includes("tháng") ? 9 : 8}
                              className="p-8 text-center text-emerald-600 italic bg-emerald-50/30"
                            >
                              Tất cả các hộ đều đã hoàn thành nộp tiền trong đợt này
                            </td>
                          </tr>
                        ) : (
                          pagedChiTietHoChuaNop.map((pt) => {
                            const hoId =
                              typeof pt.hoKhauId === "object"
                                ? pt.hoKhauId?._id
                                : pt.hoKhauId;
                            const isCurrentHo = selectedHo === hoId;

                            return (
                              <tr
                                key={pt._id}
                                onClick={() => openHoDetails(hoId)}
                                className={`cursor-pointer transition-colors ${
                                  isCurrentHo
                                    ? "bg-rose-50/60"
                                    : "hover:bg-slate-50/70"
                                }`}
                              >
                                <td className="p-3 font-mono font-bold text-rose-700">
                                  {pt.maPhieuThu || "—"}
                                </td>
                                {selectedDot.toLowerCase().includes("tháng") && (
                                  <td className="p-3 text-slate-700 max-w-[150px] truncate">
                                    {pt.chiTietThu && pt.chiTietThu.length > 0
                                      ? pt.chiTietThu.map((ct) => ct.tenKhoanThu).join(", ")
                                      : "—"}
                                  </td>
                                )}
                                <td className="p-3 font-mono text-slate-500">
                                  {(hoId || "").toString().slice(0, 8)}...
                                </td>
                                <td className="p-3 font-bold text-slate-900">
                                  {pt.tenChuHo || "—"}
                                </td>
                                <td className="p-3 text-slate-600 max-w-[160px] truncate">
                                  {pt.diaChi || "—"}
                                </td>
                                <td className="p-3 text-slate-600 tabular-nums">
                                  {pt.ngayThu
                                    ? new Date(pt.ngayThu).toLocaleDateString("vi-VN")
                                    : "—"}
                                </td>
                                <td className="p-3 text-center">
                                  <Badge
                                    variant={pt.trangThai === "Đang nợ" ? "danger" : "warning"}
                                    size="sm"
                                    dot
                                  >
                                    {pt.trangThai || "Chưa nộp"}
                                  </Badge>
                                </td>
                                <td className="p-3 text-right font-bold text-rose-600 tabular-nums">
                                  {formatVND(pt.tongTien)}
                                </td>
                                <td className="p-3 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      openHoDetails(hoId);
                                    }}
                                    leftIcon={<History className="w-3.5 h-3.5" />}
                                  >
                                    Lịch sử
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  {filteredChiTietHoChuaNop.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-2.5 bg-slate-50/50">
                      <p className="text-xs text-slate-500">
                        Tổng số <strong className="tabular-nums text-slate-800">{filteredChiTietHoChuaNop.length}</strong> hộ · Trang <strong className="tabular-nums text-slate-800">{chuaNopPage}</strong> / {totalChuaNopPages}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setChuaNopPage((p) => Math.max(1, p - 1))}
                          disabled={chuaNopPage <= 1}
                          leftIcon={<ChevronLeft className="h-3 w-3" />}
                        >
                          Trước
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setChuaNopPage((p) => Math.min(totalChuaNopPages, p + 1))}
                          disabled={chuaNopPage >= totalChuaNopPages}
                          rightIcon={<ChevronRight className="h-3 w-3" />}
                        >
                          Sau
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Lịch Sử Nộp Tiền Của Hộ Được Chọn */}
      {selectedHo && (
        <Card className="p-5 border-emerald-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm md:text-base font-bold text-slate-900">
                  Lịch Sử Nộp Tiền Của Hộ Khẩu: {selectedHo}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng hợp các biên lai đã nộp và các khoản còn tồn đọng trong năm {nam}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedHo(null);
                setLichSuHo(null);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Đóng lịch sử"
              aria-label="Đóng lịch sử"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {lichSuLoading ? (
            <div className="space-y-3 py-6">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Summary stat cards for household */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                  title="TỔNG ĐÃ NỘP"
                  value={formatVND(
                    Math.max(
                      derivedLichSuTotals.daNop,
                      Number(lichSuHo?.tongKet?.daNop ?? 0)
                    )
                  )}
                  subtitle="Số tiền đã đóng đủ"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  accent="emerald"
                />

                <StatCard
                  title="TỔNG CÒN NỢ"
                  value={formatVND(
                    Math.max(
                      derivedLichSuTotals.conNo,
                      Number(lichSuHo?.tongKet?.conNo ?? 0)
                    )
                  )}
                  subtitle="Các khoản chưa thanh toán"
                  icon={<AlertCircle className="w-5 h-5" />}
                  accent="rose"
                />
              </div>

              {/* Receipts Table for Household */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-blue-600" />
                    <span>Danh Sách Phiếu Thu ({lichSuHo?.danhSachPhieuThu?.length ?? 0})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Bấm &quot;Chi tiết&quot; để xem các khoản cấu thành phiếu
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead className="bg-slate-50/90 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-3">Mã Phiếu</th>
                          <th className="p-3">Ngày Lập</th>
                          <th className="p-3 text-right">Tổng Tiền</th>
                          <th className="p-3 text-center">Trạng Thái</th>
                          <th className="p-3 text-right">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lichSuHo?.danhSachPhieuThu &&
                        lichSuHo.danhSachPhieuThu.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-8 text-center text-slate-400 italic"
                            >
                              Chưa có phiếu thu nào được lưu cho hộ khẩu này
                            </td>
                          </tr>
                        ) : (
                          lichSuHo?.danhSachPhieuThu?.map((phieu) => (
                            <tr
                              key={phieu._id}
                              className="hover:bg-slate-50/70 transition-colors"
                            >
                              <td className="p-3 font-mono font-bold text-blue-700">
                                {phieu.maPhieuThu}
                              </td>
                              <td className="p-3 text-slate-600 tabular-nums">
                                {phieu.ngayThu
                                  ? new Date(phieu.ngayThu).toLocaleDateString("vi-VN")
                                  : "—"}
                              </td>
                              <td className="p-3 text-right font-bold text-slate-900 tabular-nums">
                                {formatVND(phieu.tongTien)}
                              </td>
                              <td className="p-3 text-center">
                                <Badge
                                  variant={
                                    phieu.trangThai === "Đã thu"
                                      ? "success"
                                      : phieu.trangThai === "Đang nợ"
                                      ? "danger"
                                      : "warning"
                                  }
                                  size="sm"
                                  dot
                                >
                                  {phieu.trangThai ?? "—"}
                                </Badge>
                              </td>
                              <td className="p-3 text-right">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => setSelectedPhieu(phieu)}
                                  leftIcon={<Receipt className="w-3.5 h-3.5" />}
                                >
                                  Chi tiết
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Modal Chi Tiết Phiếu Thu */}
      {selectedPhieu && (
        <Modal
          isOpen={!!selectedPhieu}
          onClose={() => setSelectedPhieu(null)}
          title={
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <span>Biên Lai Thu Tiền: {selectedPhieu.maPhieuThu}</span>
            </div>
          }
          description="Chi tiết các khoản phí hoặc đóng góp trong phiếu thu"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Header info box */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Chủ hộ:</span>
                <span className="font-bold text-slate-900">{selectedPhieu.tenChuHo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Địa chỉ:</span>
                <span className="text-slate-700">{selectedPhieu.diaChi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày lập phiếu:</span>
                <span className="text-slate-700 tabular-nums">
                  {selectedPhieu.ngayThu
                    ? new Date(selectedPhieu.ngayThu).toLocaleDateString("vi-VN")
                    : "—"}
                </span>
              </div>
            </div>

            {/* Fee Items Breakdown */}
            <div>
              <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 text-[11px] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                <span>Các Khoản Phí / Đóng Góp Chi Tiết</span>
              </h5>

              {selectedPhieu.chiTietThu && selectedPhieu.chiTietThu.length > 0 ? (
                <div className="space-y-2">
                  {selectedPhieu.chiTietThu.map((ct, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="font-bold text-slate-800 truncate">
                          {ct.tenKhoanThu}
                        </p>
                        {ct.ghiChu && (
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {ct.ghiChu}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-emerald-700 tabular-nums text-xs">
                          {formatVND(ct.soTien)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-400 italic bg-slate-50 rounded-lg border border-slate-200">
                  Không có khoản thu chi tiết nào được ghi nhận
                </div>
              )}
            </div>

            {/* Summary Box */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
                  Số lượng khoản
                </span>
                <span className="text-base font-bold text-blue-900 tabular-nums">
                  {selectedPhieu.chiTietThu?.length || 0} khoản
                </span>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                  Tổng tiền phiếu
                </span>
                <span className="text-base font-bold text-emerald-900 tabular-nums">
                  {formatVND(selectedPhieu.tongTien)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-semibold text-slate-700">Trạng thái phiếu:</span>
              <Badge
                variant={
                  selectedPhieu.trangThai === "Đã thu"
                    ? "success"
                    : selectedPhieu.trangThai === "Đang nợ"
                    ? "danger"
                    : "warning"
                }
                size="md"
                dot
              >
                {selectedPhieu.trangThai ?? "—"}
              </Badge>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedPhieu(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
