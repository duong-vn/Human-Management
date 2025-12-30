"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { getAllHoKhau } from "../api";

export default function ThongKeHoKhauPage() {
  const { data: hoKhauList = [], isLoading } = useQuery({
    queryKey: ["ho-khau"],
    queryFn: () => getAllHoKhau({}),
  });

  // Tính toán thống kê
  const stats = React.useMemo(() => {
    const tong = hoKhauList.length;
    const dangHoatDong = hoKhauList.filter(
      (hk) => hk.trangThai === "Đang hoạt động"
    ).length;
    const daTachHo = hoKhauList.filter(
      (hk) => hk.trangThai === "Đã tách hộ"
    ).length;
    const daXoa = hoKhauList.filter((hk) => hk.trangThai === "Đã xóa").length;

    // Tính tổng số thành viên
    const tongThanhVien = hoKhauList.reduce(
      (sum, hk) => sum + (hk.thanhVien?.length || 0),
      0
    );

    // Tính trung bình số thành viên/hộ
    const trungBinhThanhVien =
      dangHoatDong > 0 ? (tongThanhVien / dangHoatDong).toFixed(1) : "0";

    // Tìm hộ có nhiều thành viên nhất
    const hoNhieuThanhVienNhat = hoKhauList.reduce((max, hk) => {
      return (hk.thanhVien?.length || 0) > (max.thanhVien?.length || 0)
        ? hk
        : max;
    }, hoKhauList[0] || { thanhVien: [] });

    // Tìm hộ có ít thành viên nhất (trong các hộ đang hoạt động)
    const hoItThanhVienNhat = hoKhauList
      .filter((hk) => hk.trangThai === "Đang hoạt động")
      .reduce((min, hk) => {
        return (hk.thanhVien?.length || 0) < (min.thanhVien?.length || Infinity)
          ? hk
          : min;
      }, hoKhauList.find((hk) => hk.trangThai === "Đang hoạt động") || { thanhVien: [] });

    // Phân phối theo số lượng thành viên
    const phanPhoiTheoSoLuong = hoKhauList
      .filter((hk) => hk.trangThai === "Đang hoạt động")
      .reduce((acc, hk) => {
        const soLuong = hk.thanhVien?.length || 0;
        const key =
          soLuong === 1
            ? "1"
            : soLuong <= 3
            ? "2-3"
            : soLuong <= 5
            ? "4-5"
            : "6+";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

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

  const getChuHoName = (chuHo: any) => {
    if (!chuHo) return "---";
    if (typeof chuHo === "string") return "---";
    return chuHo.hoTen || "---";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
          <BarChart3 className="text-gray-600" />
          Thống Kê Hộ Khẩu
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Tổng quan và phân tích dữ liệu hộ khẩu
        </p>
      </div>

      {/* CARDS THỐNG KÊ TỔNG QUAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tổng số hộ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                Tổng số hộ
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.tong}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Home className="text-blue-600" size={24} />
            </div>
          </div>
        </motion.div>

        {/* Đang hoạt động */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                Đang hoạt động
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.dangHoatDong}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {((stats.dangHoatDong / stats.tong) * 100).toFixed(1)}% tổng số
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </motion.div>

        {/* Đã tách hộ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                Đã tách hộ
              </p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.daTachHo}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.tong > 0
                  ? ((stats.daTachHo / stats.tong) * 100).toFixed(1)
                  : 0}
                % tổng số
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
          </div>
        </motion.div>

        {/* Đã xóa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                Đã xóa
              </p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {stats.daXoa}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.tong > 0
                  ? ((stats.daXoa / stats.tong) * 100).toFixed(1)
                  : 0}
                % tổng số
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* THỐNG KÊ CHI TIẾT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Thống kê thành viên */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-gray-600" />
            Thống kê thành viên
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600">Tổng số thành viên</span>
              <span className="text-xl font-bold text-gray-800">
                {stats.tongThanhVien}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600">
                Trung bình thành viên/hộ
              </span>
              <span className="text-xl font-bold text-blue-600">
                {stats.trungBinhThanhVien}
              </span>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">
                Hộ có nhiều thành viên nhất
              </p>
              <p className="font-semibold text-gray-800">
                {getChuHoName(stats.hoNhieuThanhVienNhat?.chuHo)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {stats.hoNhieuThanhVienNhat?.thanhVien?.length || 0} thành viên
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">
                Hộ có ít thành viên nhất
              </p>
              <p className="font-semibold text-gray-800">
                {getChuHoName(stats.hoItThanhVienNhat?.chuHo)}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                {stats.hoItThanhVienNhat?.thanhVien?.length || 0} thành viên
              </p>
            </div>
          </div>
        </motion.div>

        {/* Phân phối theo số lượng thành viên */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-600" />
            Phân phối theo quy mô
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.phanPhoiTheoSoLuong).map(([key, value]) => {
              const total = stats.dangHoatDong;
              const percent =
                total > 0 ? ((value / total) * 100).toFixed(1) : "0";
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">
                      {key === "1"
                        ? "1 người"
                        : key === "2-3"
                        ? "2-3 người"
                        : key === "4-5"
                        ? "4-5 người"
                        : "6+ người"}
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {value} hộ ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* BIỂU ĐỒ TRẠNG THÁI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-gray-600" />
          Biểu đồ trạng thái hộ khẩu
        </h3>
        <div className="flex items-end gap-4 h-64">
          {[
            {
              label: "Đang hoạt động",
              value: stats.dangHoatDong,
              color: "bg-green-500",
            },
            {
              label: "Đã tách hộ",
              value: stats.daTachHo,
              color: "bg-yellow-500",
            },
            { label: "Đã xóa", value: stats.daXoa, color: "bg-red-500" },
          ].map((item) => {
            const maxValue = Math.max(
              stats.dangHoatDong,
              stats.daTachHo,
              stats.daXoa
            );
            const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            return (
              <div
                key={item.label}
                className="flex-1 flex flex-col items-center"
              >
                <div
                  className="w-full flex flex-col items-center justify-end"
                  style={{ height: "200px" }}
                >
                  <span className="text-xl font-bold text-gray-800 mb-2">
                    {item.value}
                  </span>
                  <div
                    className={`w-full ${item.color} rounded-t-lg transition-all duration-500`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 font-medium mt-3 text-center">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
