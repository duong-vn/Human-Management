"use client";

import { getUser, subscribeAuth, User } from "@/lib/AuthToken";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  Building2,
  Users,
  CreditCard,
  FileCheck,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  Receipt,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  PageHeader,
} from "@/components/ui";

// Type definitions for clean type safety
interface HoKhauStats {
  tong: number;
  dangHoatDong: number;
  daTachHo: number;
  daXoa: number;
}

interface NhanKhauStats {
  tong: number;
}

interface TuoiTrungBinhStats {
  tuoiTrungBinh: number;
}

interface TamTruTamVangStats {
  tamTru: number;
  tamVang: number;
}

interface ThuPhiStats {
  tongThu: number;
  soPhieuThu: number;
}

interface KhoanThuItem {
  _id: string;
  tenKhoanThu: string;
  loaiKhoanThu: "bat_buoc" | "tu_nguyen";
  soTien: number;
}

// Landing Page cho khách / cư dân truy cập chưa đăng nhập
function LandingPage() {
  const publicServices = [
    {
      icon: Building2,
      title: "Hộ tịch & Cư trú",
      description:
        "Đăng ký thường trú, nhập hộ, tách hộ và xác nhận cư trú theo Luật Cư trú hiện hành.",
    },
    {
      icon: Users,
      title: "Quản lý Nhân khẩu",
      description:
        "Đăng ký nhân khẩu mới, theo dõi biến động dân số và quản lý thông tin cư dân trên địa bàn.",
    },
    {
      icon: CreditCard,
      title: "Thu nộp Công khai",
      description:
        "Thu phí vệ sinh môi trường, các quỹ tự nguyện Vì người nghèo, Đền ơn đáp nghĩa minh bạch.",
    },
    {
      icon: FileCheck,
      title: "Tạm trú & Tạm vắng",
      description:
        "Tiếp nhận khai báo tạm trú cho người thuê nhà, xác nhận tạm vắng đi học tập, công tác.",
    },
    {
      icon: FileText,
      title: "Biên lai Điện tử",
      description:
        "Cấp phiếu thu, hóa đơn đóng góp điện tử giúp người dân thuận tiện lưu trữ và đối soát.",
    },
    {
      icon: BarChart3,
      title: "Công khai Số liệu",
      description:
        "Báo cáo tổng hợp tình hình dân số và tiến độ các cuộc vận động toàn dân tại tổ dân phố.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Civic Administration Banner & Hero */}
      <section className="bg-slate-900 border-b border-slate-800 text-white py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Civic Copy */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-950/80 border border-blue-800 text-blue-200 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Tổ Dân Phố 7 — Phường La Khê</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Cổng Thông Tin Dân Cư &amp;
                <span className="block text-blue-400 text-xl sm:text-3xl font-bold mt-1.5">
                  Dịch Vụ Hành Chính Cơ Sở
                </span>
              </h1>

              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Hệ thống quản lý hành chính cấp cơ sở, số hóa công tác quản lý
                hộ khẩu, nhân khẩu và đối soát các nguồn quỹ dân cư tại Tổ dân
                phố 7, Phường La Khê.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                {/* Clean Link without nested Button */}
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Đăng nhập Cán bộ Quản lý</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Civic Overview Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/90 rounded-lg border border-slate-700 p-6 shadow-sm text-white space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                  <div className="w-10 h-10 rounded-lg bg-blue-700 border border-blue-500/40 flex items-center justify-center shrink-0 text-white">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-white tracking-tight">
                      Hệ Thống Quản Lý Dân Cư
                    </h2>
                    <p className="text-xs text-slate-400">
                      Tổ Dân Phố 7 — Phường La Khê
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center py-1 border-b border-slate-700/60">
                    <span className="text-slate-400">Đơn vị quản lý:</span>
                    <span className="font-medium text-right text-slate-200">
                      Ban Quản Lý TDP 7
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-700/60">
                    <span className="text-slate-400">Địa bàn:</span>
                    <span className="font-medium text-slate-200">
                      Phường La Khê, Quận Hà Đông
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Phạm vi nghiệp vụ:</span>
                    <span className="font-medium text-slate-200">
                      Hộ tịch, nhân khẩu, thu quỹ dân cư
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <Badge variant="primary" size="sm">
            Dịch Vụ Hành Chính Cơ Sở
          </Badge>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Nhiệm vụ quản lý và phục vụ nhân dân
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Ứng dụng công nghệ thông tin giúp việc tra cứu hồ sơ và thực hiện các
            thủ tục hành chính cơ sở diễn ra chuẩn xác, thuận tiện và minh bạch.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {publicServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="p-5 space-y-3 rounded-lg border-slate-200 hover:border-blue-300 transition-colors shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 text-blue-700 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {service.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Official Civic Footer */}
      <footer className="py-6 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span className="font-semibold text-slate-800">
              Tổ Dân Phố 7 — Phường La Khê, Quận Hà Đông, TP. Hà Nội
            </span>
          </div>
          <p>© 2025 — 2026 Bản quyền thuộc Ban Quản lý TDP 7.</p>
        </div>
      </footer>
    </div>
  );
}

// Management Dashboard dành cho cán bộ đã đăng nhập
function Dashboard() {
  const {
    data: hoKhauStats,
    isLoading: isHoKhauLoading,
    isError: isHoKhauError,
  } = useQuery<HoKhauStats>({
    queryKey: ["hoKhauThongKe"],
    queryFn: async () => {
      const res = await api.get("/ho-khau/thong-ke");
      return res.data;
    },
  });

  const {
    data: nhanKhauStats,
    isLoading: isNhanKhauLoading,
    isError: isNhanKhauError,
  } = useQuery<NhanKhauStats>({
    queryKey: ["nhanKhauTongQuan"],
    queryFn: async () => {
      const res = await api.get("/nhan-khau/thong-ke/tong-quan");
      return res.data;
    },
  });

  const {
    data: gioiTinhStats,
    isLoading: isGioiTinhLoading,
    isError: isGioiTinhError,
  } = useQuery<{ nam: number; nu: number }>({
    queryKey: ["nhanKhauGioiTinh"],
    queryFn: async () => {
      const res = await api.get("/nhan-khau/thong-ke/gioi-tinh");
      const data = res.data as Array<{ _id: string; soLuong: number }>;
      const nam = data.find((item) => item._id === "Nam")?.soLuong ?? 0;
      const nu = data.find((item) => item._id === "Nữ")?.soLuong ?? 0;
      return { nam, nu };
    },
  });

  const {
    data: tuoiTrungBinh,
    isLoading: isTuoiLoading,
    isError: isTuoiError,
  } = useQuery<TuoiTrungBinhStats>({
    queryKey: ["tuoiTrungBinh"],
    queryFn: async () => {
      const res = await api.get("/nhan-khau/thong-ke/tuoi-trung-binh");
      return res.data;
    },
  });

  const {
    data: tamTruTamVangStats,
    isLoading: isTamTruLoading,
    isError: isTamTruError,
  } = useQuery<TamTruTamVangStats>({
    queryKey: ["tamTruTamVangThongKe"],
    queryFn: async () => {
      const res = await api.get("/tam-tru-tam-vang/thong-ke");
      return res.data;
    },
  });

  const currentYear = new Date().getFullYear();
  const {
    data: thuPhiStats,
    isLoading: isThuPhiLoading,
    isError: isThuPhiError,
  } = useQuery<ThuPhiStats>({
    queryKey: ["thuPhiThongKe", currentYear],
    queryFn: async () => {
      const res = await api.get(`/thu-phi/thong-ke/nam/${currentYear}`);
      return res.data;
    },
  });

  const {
    data: khoanThuActive,
    isLoading: isKhoanThuLoading,
    isError: isKhoanThuError,
  } = useQuery<KhoanThuItem[]>({
    queryKey: ["khoanThuActive"],
    queryFn: async () => {
      const res = await api.get("/khoan-thu/active");
      return res.data;
    },
  });

  const formatCurrency = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)} tỷ`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)} triệu`;
    }
    return new Intl.NumberFormat("vi-VN").format(num) + "đ";
  };

  const quickActions = [
    {
      title: "Thêm Hộ Khẩu",
      description: "Lập sổ hộ mới",
      icon: Building2,
      href: "/ho-khau",
    },
    {
      title: "Nhập Nhân Khẩu",
      description: "Thêm cư dân",
      icon: UserPlus,
      href: "/nhan-khau",
    },
    {
      title: "Lập Phiếu Thu",
      description: "Thu tiền các quỹ",
      icon: Receipt,
      href: "/thu-phi",
    },
    {
      title: "Đăng Ký Cư Trú",
      description: "Tạm trú, tạm vắng",
      icon: FileCheck,
      href: "/tam-tru-tam-vang",
    },
    {
      title: "Thống Kê Quy Mô",
      description: "Báo cáo hộ dân",
      icon: Layers,
      href: "/ho-khau/thong-ke",
    },
    {
      title: "Báo Cáo Đối Soát",
      description: "Tổng hợp thu nộp",
      icon: BarChart3,
      href: "/thong-ke",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Bảng Điều Khiển Quản Lý Dân Cư"
        description={`Theo dõi chỉ số hộ tịch, biến động nhân khẩu và tiến độ thu quỹ năm ${currentYear}`}
        badge={<Badge variant="primary" size="sm">TDP 7 Phường La Khê</Badge>}
        actions={
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        }
      />

      {/* Row 1: KPI StatCards - Error handling via query flags (no errors converted to 0) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TỔNG SỐ HỘ KHẨU"
          value={
            isHoKhauError
              ? "Lỗi tải"
              : isHoKhauLoading
              ? "..."
              : (hoKhauStats?.tong ?? "—")
          }
          subtitle={
            isHoKhauError
              ? "Không thể tải số liệu"
              : isHoKhauLoading
              ? "Đang tải dữ liệu..."
              : `${hoKhauStats?.dangHoatDong ?? 0} hộ đang thường trú`
          }
          icon={<Building2 className="w-5 h-5" />}
          accent="blue"
          trend={{
            value: isHoKhauError ? "Lỗi truy vấn" : "100% sổ hộ",
            neutral: true,
          }}
        />

        <StatCard
          title="TỔNG SỐ NHÂN KHẨU"
          value={
            isNhanKhauError
              ? "Lỗi tải"
              : isNhanKhauLoading
              ? "..."
              : (nhanKhauStats?.tong ?? "—")
          }
          subtitle={
            isGioiTinhError
              ? "Không thể tải cơ cấu giới tính"
              : isGioiTinhLoading
              ? "Đang tải cơ cấu..."
              : `Nam: ${gioiTinhStats?.nam ?? 0} • Nữ: ${gioiTinhStats?.nu ?? 0}`
          }
          icon={<Users className="w-5 h-5" />}
          accent="blue"
          trend={{
            value: isTuoiError
              ? "Lỗi tải tuổi"
              : `TB: ${
                  tuoiTrungBinh?.tuoiTrungBinh
                    ? tuoiTrungBinh.tuoiTrungBinh.toFixed(1)
                    : "—"
                } tuổi`,
            neutral: true,
          }}
        />

        <StatCard
          title={`THU QUỸ NĂM ${currentYear}`}
          value={
            isThuPhiError
              ? "Lỗi tải"
              : isThuPhiLoading
              ? "..."
              : thuPhiStats?.tongThu
              ? formatCurrency(thuPhiStats.tongThu)
              : "0đ"
          }
          subtitle={
            isThuPhiError
              ? "Không thể tải số liệu thu quỹ"
              : isThuPhiLoading
              ? "Đang tải tiến độ..."
              : `${thuPhiStats?.soPhieuThu ?? 0} phiếu thu hoàn thành`
          }
          icon={<CreditCard className="w-5 h-5" />}
          accent="blue"
          trend={{
            value: isThuPhiError ? "Lỗi truy vấn" : "Kỳ hiện hành",
            neutral: true,
          }}
        />

        <StatCard
          title="BIẾN ĐỘNG CƯ TRÚ"
          value={
            isTamTruError
              ? "Lỗi tải"
              : isTamTruLoading
              ? "..."
              : (tamTruTamVangStats?.tamTru ?? 0) +
                (tamTruTamVangStats?.tamVang ?? 0)
          }
          subtitle={
            isTamTruError
              ? "Không thể tải số liệu cư trú"
              : isTamTruLoading
              ? "Đang tải..."
              : `Tạm trú: ${tamTruTamVangStats?.tamTru ?? 0} • Tạm vắng: ${
                  tamTruTamVangStats?.tamVang ?? 0
                }`
          }
          icon={<FileCheck className="w-5 h-5" />}
          accent="slate"
          trend={{
            value: isTamTruError ? "Lỗi truy vấn" : "Đã xác nhận",
            neutral: true,
          }}
        />
      </div>

      {/* Row 2: Demographic & Fee Distribution Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Nhân khẩu Card */}
        <Card className="rounded-lg border-slate-200 shadow-2xs">
          <CardHeader className="py-3 px-5 border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" />
              <CardTitle className="text-sm">Cơ cấu nhân khẩu</CardTitle>
            </div>
            <Link
              href="/nhan-khau"
              className="text-xs text-blue-700 hover:text-blue-800 font-semibold"
            >
              Chi tiết →
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-2.5">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Độ tuổi trung bình:</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {isTuoiError
                  ? "Lỗi tải"
                  : isTuoiLoading
                  ? "..."
                  : tuoiTrungBinh?.tuoiTrungBinh
                  ? `${tuoiTrungBinh.tuoiTrungBinh.toFixed(1)} tuổi`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Nhân khẩu Nam:</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {isGioiTinhError
                  ? "Lỗi tải"
                  : isGioiTinhLoading
                  ? "..."
                  : `${gioiTinhStats?.nam ?? 0} người`}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Nhân khẩu Nữ:</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {isGioiTinhError
                  ? "Lỗi tải"
                  : isGioiTinhLoading
                  ? "..."
                  : `${gioiTinhStats?.nu ?? 0} người`}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 text-xs">
              <span className="text-slate-500">Tỷ lệ giới tính (Nam/Nữ):</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {isGioiTinhError
                  ? "Lỗi tải"
                  : isGioiTinhLoading
                  ? "..."
                  : gioiTinhStats?.nam && gioiTinhStats?.nu
                  ? `${((gioiTinhStats.nam / gioiTinhStats.nu) * 100).toFixed(0)}%`
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Hộ khẩu Card */}
        <Card className="rounded-lg border-slate-200 shadow-2xs">
          <CardHeader className="py-3 px-5 border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-700" />
              <CardTitle className="text-sm">Trạng thái hộ khẩu</CardTitle>
            </div>
            <Link
              href="/ho-khau"
              className="text-xs text-blue-700 hover:text-blue-800 font-semibold"
            >
              Chi tiết →
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-2.5">
            {isHoKhauError ? (
              <p className="text-xs text-rose-600 py-4 text-center">
                Không thể tải trạng thái hộ khẩu
              </p>
            ) : (
              <>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-500">Hộ đang hoạt động:</span>
                  <Badge variant="success" size="sm">
                    {isHoKhauLoading ? "..." : `${hoKhauStats?.dangHoatDong ?? 0} hộ`}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-500">Hộ đã tách:</span>
                  <Badge variant="warning" size="sm">
                    {isHoKhauLoading ? "..." : `${hoKhauStats?.daTachHo ?? 0} hộ`}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1.5 text-xs">
                  <span className="text-slate-500">Sổ hộ đã xóa / chuyển đi:</span>
                  <Badge variant="neutral" size="sm">
                    {isHoKhauLoading ? "..." : `${hoKhauStats?.daXoa ?? 0} hộ`}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Khoản thu đang vận động Card */}
        <Card className="rounded-lg border-slate-200 shadow-2xs">
          <CardHeader className="py-3 px-5 border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-700" />
              <CardTitle className="text-sm">Đợt thu đang mở</CardTitle>
            </div>
            <Link
              href="/thu-phi"
              className="text-xs text-blue-700 hover:text-blue-800 font-semibold"
            >
              Quản lý →
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-2">
            {isKhoanThuError ? (
              <p className="text-center py-4 text-xs text-rose-600">
                Không thể tải danh sách đợt thu
              </p>
            ) : isKhoanThuLoading ? (
              <p className="text-center py-4 text-xs text-slate-400">
                Đang tải danh sách đợt thu...
              </p>
            ) : khoanThuActive && khoanThuActive.length > 0 ? (
              khoanThuActive.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-semibold text-slate-800 truncate">
                      {item.tenKhoanThu}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {item.loaiKhoanThu === "bat_buoc"
                        ? "Phí bắt buộc"
                        : "Tự nguyện"}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-800 shrink-0 tabular-nums">
                    {item.soTien ? formatCurrency(item.soTien) : "Tùy tâm"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-xs text-slate-400">
                Hiện không có đợt thu nào đang mở
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Quick Actions */}
      <Card className="rounded-lg border-slate-200 shadow-2xs">
        <CardHeader className="py-3 px-5 border-slate-100">
          <CardTitle className="text-sm">Lối tắt nghiệp vụ thường dùng</CardTitle>
          <span className="text-xs text-slate-400">Thao tác nhanh cho cán bộ</span>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  href={action.href}
                  className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-700 hover:bg-slate-50 transition-colors flex flex-col items-center text-center group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-blue-700 group-hover:bg-blue-700 group-hover:text-white flex items-center justify-center transition-colors mb-2 border border-slate-200/60">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {action.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Component
export default function Home() {
  const [user, setUser] = useState<User>(getUser());

  useEffect(() => {
    const sync = () => {
      const nextUser = getUser();
      setUser((prev) => (prev === nextUser ? prev : nextUser));
    };
    sync();
    const unsubscribe = subscribeAuth(sync);
    return () => {
      unsubscribe();
    };
  }, []);

  return user ? <Dashboard /> : <LandingPage />;
}
