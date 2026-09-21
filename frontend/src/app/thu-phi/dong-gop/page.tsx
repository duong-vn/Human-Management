"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  Heart,
  Plus,
  ChevronDown,
  ChevronUp,
  User,
  CheckCircle2,
  Trash2,
  Calendar,
  Building2,
  FileText,
  AlertCircle,
  Coins,
  Sparkles,
  RotateCw,
} from "lucide-react";
import {
  getAllHoKhau,
  createPhieuThu,
  createKhoanThu,
  getAllThuPhi,
  updatePhieuThu,
  deleteKhoanThu,
  getKhoanThuTuNguyen,
  deletePhieuThu,
} from "../api";
import {
  PageHeader,
  Button,
  Badge,
  Card,
  StatCard,
  Modal,
  ConfirmDialog,
  Skeleton,
} from "@/components/ui";

interface KhoanThuTuNguyen {
  _id?: string;
  id?: string;
  tenKhoanThu?: string;
  soTien?: number;
  moTa?: string;
  ngayBatDau?: string;
}

interface PhieuThuDonation {
  _id?: string;
  id?: string;
  maPhieuThu?: string;
  hoKhauId?: string;
  tenChuHo?: string;
  diaChi?: string;
  ngayThu?: string;
  trangThai?: string;
  tongTien?: number;
  chiTietThu?: Array<{
    khoanThuId?: string;
    tenKhoanThu?: string;
    soTien?: number;
    ghiChu?: string;
  }>;
}

interface HoKhauDonationItem {
  _id?: string;
  id?: string;
  maHoKhau?: string;
  chuHo?: {
    hoTen?: string;
  };
  soNhanKhau?: number;
  diaChi?: {
    soNha?: string;
    duong?: string;
    phuongXa?: string;
  };
}

interface ProcessedCampaign extends KhoanThuTuNguyen {
  donations: PhieuThuDonation[];
  totalMoney: number;
  pendingMoney: number;
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

export default function QuanLyDongGopPage() {
  const queryClient = useQueryClient();

  // State UI
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  // State Form
  const [newCampaignName, setNewCampaignName] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<ProcessedCampaign | null>(null);
  const [selectedHoKhauId, setSelectedHoKhauId] = useState("");
  const [donationAmount, setDonationAmount] = useState<number>(50000);
  const [donationNote, setDonationNote] = useState("");
  const [donationStatus, setDonationStatus] = useState("Đã nộp");

  // Confirmation dialog states
  const [deleteCampaignTarget, setDeleteCampaignTarget] = useState<{
    id: string;
    name: string;
    hasDonations: boolean;
  } | null>(null);
  const [confirmPayId, setConfirmPayId] = useState<{
    id: string;
    tenChuHo?: string;
    soTien?: number;
  } | null>(null);

  // 1. DATA FETCHING
  const {
    data: dsKhoanThu = [],
    isLoading: isLoadingKhoanThu,
    isError: isErrorKhoanThu,
    error: errorKhoanThu,
    refetch: refetchKhoanThu,
  } = useQuery<KhoanThuTuNguyen[]>({
    queryKey: ["khoan-thu-tu-nguyen"],
    queryFn: async () => {
      const res = await getKhoanThuTuNguyen();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  const {
    data: dsPhieuThu = [],
    isLoading: isLoadingPhieuThu,
    isError: isErrorPhieuThu,
    error: errorPhieuThu,
    refetch: refetchPhieuThu,
  } = useQuery<PhieuThuDonation[]>({
    queryKey: ["thu-phi-history"],
    queryFn: async () => {
      const res = await getAllThuPhi();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  const { data: dsHoKhau = [] } = useQuery<HoKhauDonationItem[]>({
    queryKey: ["ho-khau"],
    queryFn: async () => {
      const res = await getAllHoKhau();
      return Array.isArray(res) ? res : [];
    },
  });

  // 2. DATA PROCESSING
  const campaigns: ProcessedCampaign[] = useMemo(() => {
    return dsKhoanThu
      .map((kt) => {
        const ktId = kt._id || kt.id;
        const donations = dsPhieuThu.filter((pt) =>
          pt.chiTietThu?.some((detail) => detail.khoanThuId === ktId)
        );

        const totalMoney = donations.reduce((sum: number, pt) => {
          if (pt.trangThai !== "Đã thu") return sum;
          const detail = pt.chiTietThu?.find((d) => d.khoanThuId === ktId);
          return sum + (Number(detail?.soTien) || 0);
        }, 0);

        const pendingMoney = donations.reduce((sum: number, pt) => {
          if (pt.trangThai !== "Chưa thu") return sum;
          const detail = pt.chiTietThu?.find((d) => d.khoanThuId === ktId);
          return sum + (Number(detail?.soTien) || 0);
        }, 0);

        return { ...kt, donations, totalMoney, pendingMoney };
      })
      .sort((a, b) => b.totalMoney - a.totalMoney);
  }, [dsKhoanThu, dsPhieuThu]);

  // Overall financial totals
  const overallStats = useMemo(() => {
    let totalCollected = 0;
    let totalPending = 0;
    let totalDonationsCount = 0;

    campaigns.forEach((camp) => {
      totalCollected += camp.totalMoney;
      totalPending += camp.pendingMoney;
      totalDonationsCount += camp.donations.length;
    });

    return {
      totalCampaigns: campaigns.length,
      totalCollected,
      totalPending,
      totalDonationsCount,
    };
  }, [campaigns]);

  // 3. MUTATIONS
  const createCampaignMutation = useMutation({
    mutationFn: async () =>
      await createKhoanThu({
        tenKhoanThu: newCampaignName,
        soTien: 0,
        loaiKhoanThu: "Tự nguyện",
        moTa: "Chiến dịch quyên góp tự nguyện",
        ngayBatDau: new Date().toISOString(),
      }),
    onSuccess: () => {
      toast.success("Tạo chiến dịch vận động thành công!");
      setIsCreateCampaignOpen(false);
      setNewCampaignName("");
      queryClient.invalidateQueries({ queryKey: ["khoan-thu-tu-nguyen"] });
    },
    onError: (err: unknown) => {
      toast.error(
        "Lỗi: " + extractErrorMessage(err, "Không thể tạo chiến dịch")
      );
    },
  });

  const donateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCampaign) throw new Error("Chưa chọn chiến dịch");
      const hk = dsHoKhau.find(
        (h) => (h._id || h.id) === selectedHoKhauId
      );
      if (!hk) throw new Error("Chưa chọn hộ khẩu");

      const campId = selectedCampaign._id || selectedCampaign.id || "";
      const campName = selectedCampaign.tenKhoanThu || "Quyên góp";
      const payload = {
        hoKhauId: hk._id || hk.id || "",
        maPhieuThu: `DG-${campName.slice(0, 3).toUpperCase()}-${Date.now()}`,
        tenChuHo: hk.chuHo?.hoTen,
        diaChi: (hk.diaChi?.soNha || "") + " " + (hk.diaChi?.duong || ""),
        soNhanKhau: Number(hk.soNhanKhau || 1),
        nam: new Date().getFullYear(),
        kyThu: campName,
        ngayThu: new Date().toISOString(),
        trangThai: donationStatus === "Đã nộp" ? "Đã thu" : "Chưa thu",
        chiTietThu: [
          {
            khoanThuId: campId,
            tenKhoanThu: campName,
            soTien: Number(donationAmount),
            ghiChu: donationNote,
          },
        ],
        tongTien: Number(donationAmount),
      };
      return await createPhieuThu(payload);
    },
    onSuccess: () => {
      toast.success("Ghi nhận đóng góp thành công!");
      setIsDonateModalOpen(false);
      setSelectedHoKhauId("");
      setDonationAmount(50000);
      setDonationNote("");
      setDonationStatus("Đã nộp");
      queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
    },
    onError: (err: unknown) =>
      toast.error("Lỗi: " + extractErrorMessage(err, "Không thể ghi nhận đóng góp")),
  });

  const payMutation = useMutation({
    mutationFn: async (id: string) => {
      return await updatePhieuThu(id, {
        trangThai: "Đã thu",
        ngayThu: new Date().toISOString(),
        ghiChu: "Đã xác nhận nộp tiền đóng góp",
      });
    },
    onSuccess: () => {
      toast.success("Xác nhận nộp tiền thành công!");
      queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
      setConfirmPayId(null);
    },
    onError: (err: unknown) =>
      toast.error("Lỗi: " + extractErrorMessage(err, "Không thể cập nhật nộp tiền")),
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const targetCamp = campaigns.find((c) => (c._id || c.id) === id);

      if (targetCamp && targetCamp.donations.length > 0) {
        const deletePromises = targetCamp.donations.map((d) =>
          deletePhieuThu(d._id || d.id || "")
        );
        await Promise.all(deletePromises);
      }

      return await deleteKhoanThu(id);
    },
    onSuccess: () => {
      toast.success("Đã xóa chiến dịch và toàn bộ dữ liệu liên quan!");
      queryClient.invalidateQueries({ queryKey: ["khoan-thu-tu-nguyen"] });
      queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
      setDeleteCampaignTarget(null);
    },
    onError: (err: unknown) => {
      toast.error("Lỗi khi xóa: " + extractErrorMessage(err, "Không xác định"));
    },
  });

  // 4. HANDLERS
  const toggleExpand = (id: string) =>
    setExpandedCampaignId((prev) => (prev === id ? null : id));

  const openDonateModal = (campaign: ProcessedCampaign) => {
    setSelectedCampaign(campaign);
    setIsDonateModalOpen(true);
  };

  const getInitials = (name?: string) => {
    if (!name) return "H";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (
      parts[parts.length - 2][0] + parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val) + " đ";
  };

  const isAnyError = isErrorKhoanThu || isErrorPhieuThu;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Vận Động Đóng Góp Tự Nguyện"
        description="Vận động và tiếp nhận các nguồn quyên góp tự nguyện, đền ơn đáp nghĩa và quỹ vì người nghèo"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/" },
          { label: "Quản lý thu phí", href: "/thu-phi" },
          { label: "Vận động đóng góp" },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateCampaignOpen(true)}
          >
            Tạo chiến dịch mới
          </Button>
        }
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
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Thu phí vệ sinh & định kỳ</span>
        </Link>
        <Link
          href="/thu-phi/dong-gop"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs whitespace-nowrap"
        >
          <Heart className="w-3.5 h-3.5" />
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
                errorKhoanThu || errorPhieuThu,
                "Không thể tải dữ liệu chiến dịch đóng góp"
              )}
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
            onClick={() => {
              refetchKhoanThu();
              refetchPhieuThu();
            }}
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Overall KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="TỔNG SỐ CHIẾN DỊCH"
          value={isLoadingKhoanThu ? "..." : `${overallStats.totalCampaigns} đợt`}
          subtitle={`Tổng lượt đóng góp: ${overallStats.totalDonationsCount} lượt`}
          icon={<Heart className="w-5 h-5" />}
          accent="purple"
          trend={{
            value: "Tự nguyện",
            neutral: true,
          }}
        />

        <StatCard
          title="TỔNG THỰC NHẬN"
          value={isLoadingPhieuThu ? "..." : formatCurrency(overallStats.totalCollected)}
          subtitle="Số tiền mặt/chuyển khoản đã hoàn thành"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="emerald"
          trend={{
            value: "Đã thu",
            isPositive: true,
          }}
        />

        <StatCard
          title="CHƯA NỘP (CAM KẾT)"
          value={isLoadingPhieuThu ? "..." : formatCurrency(overallStats.totalPending)}
          subtitle="Các hộ đã đăng ký ủng hộ chờ thu tiền"
          icon={<Coins className="w-5 h-5" />}
          accent="amber"
          trend={{
            value: "Chờ thu",
            isPositive: false,
          }}
        />
      </div>

      {/* List of Campaigns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-purple-600" />
            <span>Danh Sách Các Đợt Vận Động</span>
          </h2>
          <span className="text-xs text-slate-500">
            Hiển thị <strong className="text-slate-800 tabular-nums">{campaigns.length}</strong> chiến dịch
          </span>
        </div>

        {isLoadingKhoanThu || isLoadingPhieuThu ? (
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <Heart className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-600">
              Chưa có chiến dịch vận động nào được tạo
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Hãy bấm "Tạo chiến dịch mới" để phát động cuộc vận động ủng hộ
            </p>
          </Card>
        ) : (
          campaigns.map((camp) => {
            const campId = camp._id || camp.id || "";
            const isExpanded = expandedCampaignId === campId;
            const hasDonations = camp.donations.length > 0;

            return (
              <Card
                key={campId}
                className={`overflow-hidden transition-all ${
                  isExpanded
                    ? "border-purple-300 ring-2 ring-purple-500/10 shadow-sm"
                    : "hover:border-slate-300"
                }`}
              >
                {/* Campaign Header Bar */}
                <div
                  onClick={() => toggleExpand(campId)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 select-none transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isExpanded
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isExpanded ? "fill-purple-600 text-purple-600" : ""
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-base font-bold text-slate-900 truncate">
                        {camp.tenKhoanThu}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="neutral" size="sm">
                          {camp.donations.length} lượt đóng góp
                        </Badge>
                        {camp.ngayBatDau && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 tabular-nums">
                            <Calendar className="w-3 h-3" />
                            {new Date(camp.ngayBatDau).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    {camp.pendingMoney > 0 && (
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">
                          Chưa nộp (Cam kết)
                        </p>
                        <p className="text-xs font-bold text-amber-700 tabular-nums">
                          {formatCurrency(camp.pendingMoney)}
                        </p>
                      </div>
                    )}

                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        Tổng thực nhận
                      </p>
                      <p className="text-base sm:text-lg font-bold text-purple-700 tabular-nums">
                        {formatCurrency(camp.totalMoney)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                      <button
                        type="button"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setDeleteCampaignTarget({
                            id: campId,
                            name: camp.tenKhoanThu || "Chiến dịch",
                            hasDonations,
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Xóa chiến dịch này"
                        aria-label="Xóa chiến dịch này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="p-1 text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-purple-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>Danh sách hộ đã đăng ký đóng góp ({camp.donations.length})</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Chi tiết các khoản ủng hộ tự nguyện và biên lai thu tiền
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          openDonateModal(camp);
                        }}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Ghi nhận đóng góp
                      </Button>
                    </div>

                    {/* Donations Table */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600 border-collapse">
                          <thead className="bg-slate-50/80 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200/80">
                            <tr>
                              <th className="p-3">Hộ Đóng Góp</th>
                              <th className="p-3">Ngày Ghi Nhận</th>
                              <th className="p-3 text-center">Trạng Thái</th>
                              <th className="p-3 text-right">Số Tiền Ủng Hộ</th>
                              <th className="p-3">Ghi Chú</th>
                              <th className="p-3 text-right">Thao Tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {camp.donations.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="p-8 text-center text-slate-400 italic"
                                >
                                  Chưa có hộ gia đình nào đóng góp cho chiến dịch này
                                </td>
                              </tr>
                            ) : (
                              camp.donations.map((d, idx) => {
                                const detail = d.chiTietThu?.find(
                                  (x) => x.khoanThuId === campId
                                );
                                const isPaid = d.trangThai === "Đã thu";
                                const dId = d._id || d.id || "";

                                return (
                                  <tr
                                    key={dId || idx}
                                    className="hover:bg-slate-50/80 transition-colors"
                                  >
                                    <td className="p-3">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center border border-slate-200/90 shadow-2xs shrink-0">
                                          {getInitials(d.tenChuHo)}
                                        </div>
                                        <div>
                                          <span className="font-bold text-slate-900 block text-xs">
                                            {d.tenChuHo || "Chủ hộ"}
                                          </span>
                                          {d.diaChi && (
                                            <span className="text-[10px] text-slate-400 truncate max-w-[160px] block">
                                              {d.diaChi}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </td>

                                    <td className="p-3 text-slate-600 tabular-nums">
                                      {d.ngayThu
                                        ? new Date(d.ngayThu).toLocaleDateString("vi-VN")
                                        : "—"}
                                    </td>

                                    <td className="p-3 text-center">
                                      <Badge
                                        variant={isPaid ? "success" : "warning"}
                                        size="sm"
                                        dot
                                      >
                                        {isPaid ? "Đã thu" : "Chưa nộp"}
                                      </Badge>
                                    </td>

                                    <td className="p-3 text-right font-bold text-xs tabular-nums text-slate-900">
                                      {formatCurrency(detail?.soTien || d.tongTien || 0)}
                                    </td>

                                    <td className="p-3 text-slate-500 italic max-w-xs truncate">
                                      {detail?.ghiChu || "—"}
                                    </td>

                                    <td className="p-3 text-right">
                                      {!isPaid && (
                                        <Button
                                          variant="primary"
                                          size="sm"
                                          onClick={() =>
                                            setConfirmPayId({
                                              id: dId,
                                              tenChuHo: d.tenChuHo,
                                              soTien: detail?.soTien || d.tongTien,
                                            })
                                          }
                                        >
                                          Xác nhận thu
                                        </Button>
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
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Tạo Chiến Dịch Mới */}
      {isCreateCampaignOpen && (
        <Modal
          isOpen={isCreateCampaignOpen}
          onClose={() => setIsCreateCampaignOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Tạo Chiến Dịch Vận Động Mới</span>
            </div>
          }
          description="Khởi tạo chiến dịch vận động đóng góp từ thiện, ủng hộ cộng đồng"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label htmlFor="input-new-campaign-name" className="block font-semibold text-slate-700 mb-1.5">
                Tên chiến dịch / Quỹ vận động <span className="text-rose-600">*</span>
              </label>
              <input
                id="input-new-campaign-name"
                autoFocus
                type="text"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                placeholder="Ví dụ: Quỹ Vì Người Nghèo 2026, Quỹ Đền Ơn Đáp Nghĩa..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsCreateCampaignOpen(false)}
                disabled={createCampaignMutation.isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => createCampaignMutation.mutate()}
                disabled={!newCampaignName.trim()}
                isLoading={createCampaignMutation.isPending}
              >
                Tạo chiến dịch
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Tiếp Nhận Đóng Góp */}
      {isDonateModalOpen && selectedCampaign && (
        <Modal
          isOpen={isDonateModalOpen}
          onClose={() => setIsDonateModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-600" />
              <span>Ghi Nhận Đóng Góp: {selectedCampaign.tenKhoanThu}</span>
            </div>
          }
          description="Tiếp nhận ủng hộ tự nguyện từ hộ gia đình"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label htmlFor="select-donate-ho-khau" className="block font-semibold text-slate-700 mb-1.5">
                Hộ gia đình ủng hộ <span className="text-rose-600">*</span>
              </label>
              <select
                id="select-donate-ho-khau"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                value={selectedHoKhauId}
                onChange={(e) => setSelectedHoKhauId(e.target.value)}
              >
                <option value="">-- Chọn hộ khẩu --</option>
                {dsHoKhau.map((hk) => (
                  <option key={hk._id || hk.id} value={hk._id || hk.id}>
                    {hk.maHoKhau} - {hk.chuHo?.hoTen || "Chủ hộ không rõ"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="input-donate-amount" className="block font-semibold text-slate-700 mb-1.5">
                Số tiền đóng góp (VNĐ) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-donate-amount"
                  type="number"
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all tabular-nums"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  đ
                </span>
              </div>
            </div>

            <div>
              <span className="block font-semibold text-slate-700 mb-1.5">
                Trạng thái nộp tiền
              </span>
              <div className="grid grid-cols-2 gap-3">
                <label
                  htmlFor="radio-donation-status-da-nop"
                  className={`flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-all ${
                    donationStatus === "Đã nộp"
                      ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    id="radio-donation-status-da-nop"
                    type="radio"
                    name="donationStatus"
                    value="Đã nộp"
                    checked={donationStatus === "Đã nộp"}
                    onChange={(e) => setDonationStatus(e.target.value)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">
                      Đã nộp tiền
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Thu tiền mặt/chuyển khoản ngay
                    </span>
                  </div>
                </label>

                <label
                  htmlFor="radio-donation-status-chua-nop"
                  className={`flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-all ${
                    donationStatus === "Chưa nộp"
                      ? "bg-amber-50/60 border-amber-300 ring-1 ring-amber-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    id="radio-donation-status-chua-nop"
                    type="radio"
                    name="donationStatus"
                    value="Chưa nộp"
                    checked={donationStatus === "Chưa nộp"}
                    onChange={(e) => setDonationStatus(e.target.value)}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">
                      Chưa nộp (Cam kết)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Ghi nhận cam kết ủng hộ
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="textarea-donate-note" className="block font-semibold text-slate-700 mb-1.5">
                Ghi chú / Lời nhắn
              </label>
              <textarea
                id="textarea-donate-note"
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={donationNote}
                onChange={(e) => setDonationNote(e.target.value)}
                placeholder="Nhập lời nhắn hoặc ghi chú chi tiết..."
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsDonateModalOpen(false)}
                disabled={donateMutation.isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => donateMutation.mutate()}
                disabled={!selectedHoKhauId || donationAmount <= 0}
                isLoading={donateMutation.isPending}
              >
                Xác nhận ghi nhận
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Campaign Dialog */}
      <ConfirmDialog
        isOpen={!!deleteCampaignTarget}
        onClose={() => setDeleteCampaignTarget(null)}
        onConfirm={() => {
          if (deleteCampaignTarget) {
            deleteCampaignMutation.mutate(deleteCampaignTarget.id);
          }
        }}
        title="Xác nhận xóa chiến dịch"
        message={
          deleteCampaignTarget?.hasDonations
            ? `Chiến dịch "${deleteCampaignTarget.name}" đang có các lượt đóng góp đã ghi nhận. XÓA SẼ MẤT VĨNH VIỄN toàn bộ lịch sử đóng góp của chiến dịch này! Bạn có chắc chắn muốn tiếp tục?`
            : `Bạn có chắc chắn muốn xóa chiến dịch "${deleteCampaignTarget?.name}"?`
        }
        confirmText="Xóa tất cả"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={deleteCampaignMutation.isPending}
      />

      {/* Confirm Pay Donation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmPayId}
        onClose={() => setConfirmPayId(null)}
        onConfirm={() => {
          if (confirmPayId) {
            payMutation.mutate(confirmPayId.id);
          }
        }}
        title="Xác nhận đã nộp tiền"
        message={`Xác nhận hộ chủ hộ ${
          confirmPayId?.tenChuHo || ""
        } đã nộp đầy đủ số tiền ${Number(
          confirmPayId?.soTien || 0
        ).toLocaleString("vi-VN")} đ cho chiến dịch?`}
        confirmText="Xác nhận đã thu"
        cancelText="Hủy bỏ"
        variant="primary"
        isLoading={payMutation.isPending}
      />
    </div>
  );
}
