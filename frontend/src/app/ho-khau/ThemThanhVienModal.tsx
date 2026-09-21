"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Search, CreditCard, Check, AlertCircle } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { NhanKhauBasic, ThemThanhVienParams } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ThemThanhVienParams) => void;
  onSearchByCCCD?: (cccd: string) => Promise<NhanKhauBasic | null>;
  nhanKhauList: NhanKhauBasic[];
  currentThanhVienIds: string[];
  isLoading: boolean;
}

const quanHeOptions = [
  "Vợ",
  "Chồng",
  "Con",
  "Cha",
  "Mẹ",
  "Anh",
  "Chị",
  "Em",
  "Ông",
  "Bà",
  "Cháu",
  "Cô",
  "Chú",
  "Dì",
  "Dượng",
  "Khác",
];

export default function ThemThanhVienModal({
  isOpen,
  onClose,
  onSubmit,
  onSearchByCCCD,
  nhanKhauList,
  currentThanhVienIds,
  isLoading,
}: Props) {
  const [selectedNhanKhau, setSelectedNhanKhau] = useState<NhanKhauBasic | null>(null);
  const [quanHeVoiChuHo, setQuanHeVoiChuHo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cccdSearch, setCccdSearch] = useState("");
  const [isSearchingCCCD, setIsSearchingCCCD] = useState(false);
  const [cccdSearchError, setCccdSearchError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedNhanKhau(null);
      setQuanHeVoiChuHo("");
      setSearchTerm("");
      setCccdSearch("");
      setCccdSearchError("");
    }
  }, [isOpen]);

  const availableNhanKhau = nhanKhauList.filter((nk) => {
    if (currentThanhVienIds.includes(nk._id)) return false;
    return !nk.hoKhauId;
  });

  const filteredNhanKhau = availableNhanKhau.filter((nk) =>
    nk.hoTen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchByCCCD = async () => {
    if (!cccdSearch.trim() || !onSearchByCCCD) return;

    setIsSearchingCCCD(true);
    setCccdSearchError("");

    try {
      const result = await onSearchByCCCD(cccdSearch.trim());
      if (result) {
        if (currentThanhVienIds.includes(result._id)) {
          setCccdSearchError("Nhân khẩu này đã là thành viên của hộ khẩu!");
        } else {
          setSelectedNhanKhau(result);
          setCccdSearchError("");
        }
      } else {
        setCccdSearchError("Không tìm thấy nhân khẩu với số CMND/CCCD này");
      }
    } catch {
      setCccdSearchError("Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setIsSearchingCCCD(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNhanKhau || !quanHeVoiChuHo) {
      alert("Vui lòng chọn nhân khẩu và quan hệ với chủ hộ!");
      return;
    }

    onSubmit({
      nhanKhauId: selectedNhanKhau._id,
      hoTen: selectedNhanKhau.hoTen,
      quanHeVoiChuHo,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Thành Viên Vào Hộ Khẩu"
      description="Tìm kiếm nhân khẩu chưa có hộ khẩu hoặc nhập số CCCD để thêm vào sổ hộ"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tìm kiếm nhanh theo CCCD */}
        <div>
          <label className="field-label" htmlFor="input-search-cccd">
            Tìm nhanh theo số CMND / CCCD
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                id="input-search-cccd"
                type="text"
                placeholder="Nhập số CCCD / CMND cần tìm..."
                value={cccdSearch}
                onChange={(e) => setCccdSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchByCCCD();
                  }
                }}
                className="field pl-9 font-mono"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleSearchByCCCD}
              disabled={isSearchingCCCD || !cccdSearch.trim()}
              isLoading={isSearchingCCCD}
              leftIcon={<Search className="w-4 h-4" />}
            >
              Tìm
            </Button>
          </div>
          {cccdSearchError && (
            <p className="flex items-center gap-1.5 text-xs text-rose-600 mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {cccdSearchError}
            </p>
          )}
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2.5 text-slate-400 font-medium">hoặc chọn từ danh sách cư dân</span>
          </div>
        </div>

        {/* Tìm kiếm trong danh sách nhân khẩu */}
        <div>
          <label className="field-label" htmlFor="input-search-name">
            Chọn nhân khẩu từ danh sách <span className="text-rose-500">*</span>
          </label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              id="input-search-name"
              type="text"
              placeholder="Lọc nhanh theo họ tên cư dân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="field pl-9"
            />
          </div>

          <div className="border border-slate-200 rounded-lg max-h-52 overflow-y-auto divide-y divide-slate-100 bg-white">
            {filteredNhanKhau.length > 0 ? (
              filteredNhanKhau.map((nk) => {
                const isSelected = selectedNhanKhau?._id === nk._id;
                return (
                  <button
                    key={nk._id}
                    type="button"
                    onClick={() => setSelectedNhanKhau(nk)}
                    className={`w-full p-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected ? "bg-blue-50/80 text-blue-900" : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold leading-tight">{nk.hoTen}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                        {nk.ngaySinh ? new Date(nk.ngaySinh).toLocaleDateString("vi-VN") : "—"} • Giới tính: {nk.gioiTinh || "—"}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        Đã chọn
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                Không tìm thấy nhân khẩu chưa có hộ khẩu phù hợp
              </div>
            )}
          </div>

          {selectedNhanKhau && (
            <div className="mt-2.5 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
              <span className="text-blue-900">
                Đã chọn nhân khẩu: <strong>{selectedNhanKhau.hoTen}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedNhanKhau(null)}
                className="text-xs text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
              >
                Chọn lại
              </button>
            </div>
          )}
        </div>

        {/* Quan hệ với chủ hộ */}
        <div>
          <label className="field-label" htmlFor="select-quan-he-tv">
            Quan hệ với chủ hộ <span className="text-rose-500">*</span>
          </label>
          <select
            id="select-quan-he-tv"
            value={quanHeVoiChuHo}
            onChange={(e) => setQuanHeVoiChuHo(e.target.value)}
            className="field"
            required
          >
            <option value="">-- Chọn quan hệ --</option>
            {quanHeOptions.map((qh) => (
              <option key={qh} value={qh}>
                {qh}
              </option>
            ))}
          </select>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading || !selectedNhanKhau || !quanHeVoiChuHo}
            isLoading={isLoading}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Thêm vào hộ khẩu
          </Button>
        </div>
      </form>
    </Modal>
  );
}
