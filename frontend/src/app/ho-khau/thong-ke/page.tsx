"use client";

import React, { useId } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Building2,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Crown,
  UserCheck,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { getAllHoKhau } from "../api";
import type { HoKhau } from "../types";
import {
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Skeleton,
  useStatsVisibility,
  StatsToggle,
} from "@/components/ui";

export default function ThongKeHoKhauPage() {
  const statsGridId = useId();
  const { showStats, toggleStats } = useStatsVisibility("hide_stats_ho_khau_thong_ke");
  const {
    data: hoKhauList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<HoKhau[]>({
    queryKey: ["ho-khau"],
    queryFn: () => getAllHoKhau({}),
  });

  const stats = React.useMemo(() => {
    const tong = hoKhauList.length;
    const dangHoatDong = hoKhauList.filter(
      (hk) => hk.trangThai === "Đang hoạt động"
    ).length;
    const daTachHo = hoKhauList.filter(
      (hk) => hk.trangThai === "Đã tách hộ"
    ).length;
    const daXoa = hoKhauList.filter((hk) => hk.trangThai === "Đã xóa").length;

    const tongThanhVien = hoKhauList.reduce(
      (sum, hk) => sum + (hk.thanhVien?.length || 0),
      0
    );

    const trungBinhThanhVien =
      dangHoatDong > 0 ? (tongThanhVien / dangHoatDong).toFixed(1) : "0";

    const hoNhieuThanhVienNhat = hoKhauList.reduce((max, hk) => {
      return (hk.thanhVien?.length || 0) > (max.thanhVien?.length || 0)
        ? hk
        : max;
    }, hoKhauList[0] || ({ thanhVien: [] } as unknown as HoKhau));

    const hoItThanhVienNhat = hoKhauList
      .filter((hk) => hk.trangThai === "Đang hoạt động")
      .reduce((min, hk) => {
        return (hk.thanhVien?.length || 0) < (min.thanhVien?.length || Infinity)
          ? hk
          : min;
      }, hoKhauList.find((hk) => hk.trangThai === "Đang hoạt động") || ({ thanhVien: [] } as unknown as HoKhau));

    const phanPhoiTheoSoLuong = hoKhauList
      .filter((hk) => hk.trangThai === "Đang hoạt động")
      .reduce(
        (acc, hk) => {
          const soLuong = hk.thanhVien?.length || 0;
          const key =
            soLuong === 1
              ? "1 người"
              : soLuong <= 3
              ? "2-3 người"
              : soLuong <= 5
              ? "4-5 người"
              : "Từ 6 người";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        {
          "1 người": 0,
          "2-3 người": 0,
          "4-5 người": 0,
          "Từ 6 người": 0,
        } as Record<string, number>
      );

    return {
      tong,
      dangHoatDong,
      daTachHo,
      daXoa,
      tongThanhVien,
      trungBinhThanhVien,
      hoNhieuThanhVienNhat,
      hoItThanhVienNhat,
      phanPhoiTheoSoLuong,
    };
  }, [hoKhauList]);

  const getChuHoName = (chuHo: HoKhau["chuHo"] | undefined) => {
    if (!chuHo) return "---";
    if (typeof chuHo === "string") return "---";
    return chuHo.hoTen || "---";
  };

  const getDiaChi = (hk?: HoKhau) => {
    if (!hk?.diaChi) return "Phường La Khê, Quận Hà Đông";
    const soNha = hk.diaChi.soNha ? `${hk.diaChi.soNha}, ` : "";
    const duong = hk.diaChi.duong || "Phường La Khê";
    return `${soNha}${duong}`;
  };

  // Trạng thái đang tải (Loading)
  if (isLoading) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Thống Kê Quy Mô Hộ Khẩu"
          description="Đang tải và tổng hợp dữ liệu thống kê hộ tịch..."
          breadcrumbs={[
            { label: "Bảng điều khiển", href: "/" },
            { label: "Quản lý Hộ khẩu", href: "/ho-khau" },
            { label: "Thống kê quy mô" },
          ]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  // Trạng thái lỗi (Error) - Không biến lỗi thành số 0
  if (isError) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Thống Kê Quy Mô Hộ Khẩu"
          description="Báo cáo phân tích cơ cấu quy mô hộ gia đình trên địa bàn"
          breadcrumbs={[
            { label: "Bảng điều khiển", href: "/" },
            { label: "Quản lý Hộ khẩu", href: "/ho-khau" },
            { label: "Thống kê quy mô" },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <Link
                href="/ho-khau"
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Về danh sách hộ khẩu</span>
              </Link>
            </div>
          }
        />

        <Card
          className="p-8 text-center rounded-lg border-rose-200 bg-rose-50/40"
          role="alert"
        >
          <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-900 mb-1">
            Không thể tải dữ liệu thống kê hộ khẩu
          </h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto mb-4">
            {(error as Error)?.message ||
              "Có lỗi xảy ra trong quá trình truy vấn dữ liệu từ máy chủ. Vui lòng thử lại."}
          </p>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => refetch()}
          >
            Thử tải lại dữ liệu
          </Button>
        </Card>
      </div>
    );
  }

  // Trạng thái không có dữ liệu (Empty)
  if (hoKhauList.length === 0) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Thống Kê Quy Mô Hộ Khẩu"
          description="Báo cáo phân tích cơ cấu quy mô hộ gia đình trên địa bàn"
          breadcrumbs={[
            { label: "Bảng điều khiển", href: "/" },
            { label: "Quản lý Hộ khẩu", href: "/ho-khau" },
            { label: "Thống kê quy mô" },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <Link
                href="/ho-khau"
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Về danh sách hộ khẩu</span>
              </Link>
            </div>
          }
        />

        <Card className="p-10 text-center rounded-lg border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Chưa có dữ liệu hộ khẩu trên hệ thống
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Hệ thống chưa ghi nhận hồ sơ hộ khẩu nào để thực hiện thống kê cơ
            cấu quy mô.
          </p>
          <Link
            href="/ho-khau"
            className="inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            Chuyển tới danh sách hộ khẩu
          </Link>
        </Card>
      </div>
    );
  }

  const moTaQuyMo: Record<string, string> = {
    "1 người": "Hộ độc thân / đơn chiếc",
    "2-3 người": "Hộ gia đình nhỏ / hạt nhân",
    "4-5 người": "Hộ gia đình chuẩn (2 thế hệ)",
    "Từ 6 người": "Hộ gia đình đa thế hệ",
  };

  return (
    <div className="page-stack">
      {/* Page Header */}
      <PageHeader
        title="Thống Kê Quy Mô Hộ Khẩu"
        description="Tổng hợp cơ cấu quy mô hộ gia đình, tỷ lệ biến động tách hộ và mật độ thành viên trên địa bàn TDP 7"
        badge={<Badge variant="primary" size="sm">TDP 7 Phường La Khê</Badge>}
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/" },
          { label: "Quản lý Hộ khẩu", href: "/ho-khau" },
          { label: "Thống kê quy mô" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <StatsToggle
              expanded={showStats}
              onToggle={toggleStats}
              controls={statsGridId}
            />
            <Link
              href="/ho-khau"
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về danh sách hộ khẩu</span>
            </Link>
          </div>
        }
      />

      {/* Row 1: Compact Civic StatCards */}
      <div
        id={statsGridId}
        hidden={!showStats}
        className={showStats ? "grid grid-cols-2 lg:grid-cols-4 gap-2.5" : "hidden"}
      >
        <StatCard
          variant="compact"
          title="TỔNG SỐ HỘ KHẨU"
          value={stats.tong}
          subtitle="Tổng sổ hộ từng lập trên địa bàn"
          icon={<Building2 className="w-4 h-4" />}
        />

        <StatCard
          variant="compact"
          title="HỘ ĐANG CƯ TRÚ"
          value={stats.dangHoatDong}
          subtitle={`${
            stats.tong > 0
              ? ((stats.dangHoatDong / stats.tong) * 100).toFixed(1)
              : "0"
          }% trên tổng số`}
          icon={<CheckCircle className="w-4 h-4" />}
          trend={{
            value: "Hoạt động",
            neutral: true,
          }}
        />

        <StatCard
          variant="compact"
          title="HỘ ĐÃ TÁCH"
          value={stats.daTachHo}
          subtitle={`${
            stats.tong > 0
              ? ((stats.daTachHo / stats.tong) * 100).toFixed(1)
              : "0"
          }% tổng hộ`}
          icon={<AlertCircle className="w-4 h-4" />}
          trend={{
            value: "Biến động",
            neutral: true,
          }}
        />

        <StatCard
          variant="compact"
          title="HỘ ĐÃ XÓA"
          value={stats.daXoa}
          subtitle="Chuyển đi hoặc đã giải tỏa"
          icon={<XCircle className="w-4 h-4" />}
        />
      </div>

      {/* Row 2: Distribution Chart & Extremes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Card with Visual Bar and Table Equivalent */}
        <Card className="rounded-lg border-slate-200 shadow-2xs">
          <CardHeader className="py-3.5 px-5 border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" />
              <CardTitle className="text-sm">
                Cơ cấu theo quy mô thành viên
              </CardTitle>
            </div>
            <Badge variant="primary" size="sm">
              TB: {stats.trungBinhThanhVien} người/hộ
            </Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            {/* Visual Bar Marks (Dataviz: 4px rounded, anchored to baseline, sane color bg-blue-700) */}
            <div className="space-y-3">
              {Object.entries(stats.phanPhoiTheoSoLuong).map(
                ([label, count]) => {
                  const percentNum =
                    stats.dangHoatDong > 0
                      ? (count / stats.dangHoatDong) * 100
                      : 0;
                  const percent = percentNum.toFixed(1);

                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">
                          {label}
                        </span>
                        <span className="text-slate-500 tabular-nums">
                          <strong className="text-slate-800">{count}</strong> hộ{" "}
                          ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-blue-700 rounded-sm transition-all duration-300"
                          style={{ width: `${Math.min(percentNum, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Table Equivalent for Screen Readers & Tabular Inspection */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Bảng tổng hợp chi tiết theo nhóm quy mô
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Nhóm quy mô
                      </th>
                      <th
                        scope="col"
                        className="py-2 px-3 font-semibold text-right"
                      >
                        Số hộ
                      </th>
                      <th
                        scope="col"
                        className="py-2 px-3 font-semibold text-right"
                      >
                        Tỷ lệ
                      </th>
                      <th scope="col" className="py-2 pl-3 font-semibold">
                        Phân loại đặc thù
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {Object.entries(stats.phanPhoiTheoSoLuong).map(
                      ([label, count]) => {
                        const percent =
                          stats.dangHoatDong > 0
                            ? (
                                (count / stats.dangHoatDong) *
                                100
                              ).toFixed(1)
                            : "0";
                        return (
                          <tr key={label} className="hover:bg-slate-50/60">
                            <td className="py-2 pr-3 font-medium text-slate-800">
                              {label}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold tabular-nums">
                              {count}
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums text-slate-500">
                              {percent}%
                            </td>
                            <td className="py-2 pl-3 text-slate-500">
                              {moTaQuyMo[label] || "Cư dân cư trú"}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extremes & Density Indicators */}
        <Card className="rounded-lg border-slate-200 shadow-2xs">
          <CardHeader className="py-3.5 px-5 border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-700" />
              <CardTitle className="text-sm">
                Chỉ số cực trị &amp; mật độ dân cư
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Hộ đông thành viên nhất */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <Crown className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Hộ đông thành viên nhất
                  </span>
                </div>
                <Badge variant="primary" size="sm">
                  {stats.hoNhieuThanhVienNhat?.thanhVien?.length || 0} người
                </Badge>
              </div>
              <p className="text-sm font-bold text-slate-900">
                Chủ hộ: {getChuHoName(stats.hoNhieuThanhVienNhat?.chuHo)}
              </p>
              <p className="text-xs text-slate-500">
                Địa chỉ: {getDiaChi(stats.hoNhieuThanhVienNhat)}
              </p>
            </div>

            {/* Hộ ít thành viên nhất */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <UserCheck className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Hộ ít thành viên nhất (đang cư trú)
                  </span>
                </div>
                <Badge variant="neutral" size="sm">
                  {stats.hoItThanhVienNhat?.thanhVien?.length || 0} người
                </Badge>
              </div>
              <p className="text-sm font-bold text-slate-900">
                Chủ hộ: {getChuHoName(stats.hoItThanhVienNhat?.chuHo)}
              </p>
              <p className="text-xs text-slate-500">
                Địa chỉ: {getDiaChi(stats.hoItThanhVienNhat)}
              </p>
            </div>

            {/* General Density Summary Tile */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mật độ nhân khẩu bình quân:</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {stats.trungBinhThanhVien} người / hộ
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">
                  Tổng nhân khẩu thuộc hộ đang cư trú:
                </span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {stats.tongThanhVien} công dân
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
