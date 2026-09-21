"use client";

import Link from "next/link";
import { Badge } from "@/components/ui";
import { Building2, Lock, ArrowLeft, UserX } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left Column: Official Civic Identification (Desktop) */}
      <div className="hidden lg:flex flex-1 bg-slate-900 border-r border-slate-800 text-white p-12 flex-col justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-blue-700 border border-blue-500/40 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Tổ Dân Phố 7 — Phường La Khê
              </p>
              <h2 className="text-base font-bold text-white tracking-tight">
                Hệ Thống Quản Lý Dân Cư
              </h2>
            </div>
          </Link>
        </div>

        <div className="max-w-md space-y-4">
          <Badge variant="primary" size="sm">
            Tài Khoản Quản Trị Cán Bộ
          </Badge>

          <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Quản trị dữ liệu dân cư &amp; hộ tịch cơ sở
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Hệ thống thông tin nội bộ phục vụ công tác điều hành, quản lý hộ
            khẩu, nhân khẩu và các nguồn quỹ của Ban cán sự Tổ dân phố 7, Phường
            La Khê.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-400">
          UBND Phường La Khê — Ban Quản Lý Tổ Dân Phố 7
        </div>
      </div>

      {/* Right Column: Truthful Status Notice */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Mobile emblem */}
          <div className="lg:hidden flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Tổ Dân Phố 7 — Phường La Khê
              </p>
              <h2 className="text-sm font-bold text-slate-900">
                Hệ Thống Quản Lý Dân Cư
              </h2>
            </div>
          </div>

          <div className="text-center space-y-3 py-2">
            <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <UserX className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Cấp phát tài khoản cán bộ
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tự đăng ký hiện chưa được hỗ trợ. Liên hệ người quản trị để được
                cấp tài khoản.
              </p>
            </div>
          </div>

          {/* Action Links (Without nested Link > Button) */}
          <div className="space-y-2.5 pt-2">
            <Link
              href="/auth/login"
              className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>Đăng nhập hệ thống</span>
            </Link>

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-medium transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về trang thông tin</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
