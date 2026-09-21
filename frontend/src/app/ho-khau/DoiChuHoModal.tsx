"use client";

import React, { useState, useEffect } from "react";
import { UserCheck } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { HoKhau, DoiChuHoParams, getChuHoInfo } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DoiChuHoParams) => void;
  hoKhau: HoKhau | null;
  isLoading: boolean;
}

export default function DoiChuHoModal({
  isOpen,
  onClose,
  onSubmit,
  hoKhau,
  isLoading,
}: Props) {
  const [chuHoMoiId, setChuHoMoiId] = useState("");
  const [chuHoMoiTen, setChuHoMoiTen] = useState("");
  const [lyDo, setLyDo] = useState("");

  useEffect(() => {
    if (isOpen) {
      setChuHoMoiId("");
      setChuHoMoiTen("");
      setLyDo("");
    }
  }, [isOpen]);

  if (!isOpen || !hoKhau) return null;

  const chuHoInfo = getChuHoInfo(hoKhau.chuHo);
  const currentChuHoId = chuHoInfo?.id || "";
  const currentChuHoTen = chuHoInfo?.hoTen || "Chưa có chủ hộ";

  const thanhVienList = (hoKhau.thanhVien || []).filter((tv) => {
    const id = typeof tv.nhanKhauId === "object" ? tv.nhanKhauId._id : tv.nhanKhauId;
    return id !== currentChuHoId;
  });

  const handleSelectChuHoMoi = (nkId: string) => {
    setChuHoMoiId(nkId);
    const selected = thanhVienList.find((tv) => {
      const id = typeof tv.nhanKhauId === "object" ? tv.nhanKhauId._id : tv.nhanKhauId;
      return id === nkId;
    });
    if (selected) {
      const hoTen =
        typeof selected.nhanKhauId === "object" && selected.nhanKhauId.hoTen
          ? selected.nhanKhauId.hoTen
          : selected.hoTen;
      setChuHoMoiTen(hoTen);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!chuHoMoiId || !chuHoMoiTen) {
      alert("Vui lòng chọn chủ hộ mới!");
      return;
    }

    onSubmit({
      chuHoMoiId,
      hoTenChuHoMoi: chuHoMoiTen,
      lyDo: lyDo || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thay Đổi Chủ Hộ"
      description="Chuyển quyền đại diện chủ hộ cho một thành viên khác trong sổ hộ khẩu"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Chủ hộ hiện tại */}
        <div>
          <label className="field-label" htmlFor="current-chu-ho-static">
            Chủ hộ hiện tại
          </label>
          <div
            id="current-chu-ho-static"
            className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold"
          >
            {currentChuHoTen}
          </div>
        </div>

        {/* Chọn chủ hộ mới */}
        <div>
          <label className="field-label" htmlFor="select-chu-ho-moi">
            Chọn chủ hộ mới <span className="text-rose-500">*</span>
          </label>
          {thanhVienList.length > 0 ? (
            <select
              id="select-chu-ho-moi"
              value={chuHoMoiId}
              onChange={(e) => handleSelectChuHoMoi(e.target.value)}
              className="field"
              required
            >
              <option value="">-- Chọn thành viên thay thế --</option>
              {thanhVienList.map((tv, index) => {
                const id = typeof tv.nhanKhauId === "object" ? tv.nhanKhauId._id : tv.nhanKhauId;
                const hoTen =
                  typeof tv.nhanKhauId === "object" && tv.nhanKhauId.hoTen
                    ? tv.nhanKhauId.hoTen
                    : tv.hoTen;
                return (
                  <option key={id || index} value={id}>
                    {hoTen} ({tv.quanHeVoiChuHo || "Thành viên"})
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
              Không có thành viên nào khác trong hộ để chuyển đổi chủ hộ.
            </div>
          )}
        </div>

        {/* Lý do */}
        <div>
          <label className="field-label" htmlFor="input-ly-do-doi">
            Lý do thay đổi
          </label>
          <textarea
            id="input-ly-do-doi"
            value={lyDo}
            onChange={(e) => setLyDo(e.target.value)}
            className="field min-h-[5rem] resize-none"
            rows={3}
            placeholder="VD: Chủ hộ cũ đi làm ăn xa, chuyển công tác, qua đời..."
          />
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
            disabled={isLoading || !chuHoMoiId || thanhVienList.length === 0}
            isLoading={isLoading}
            leftIcon={<UserCheck className="w-4 h-4" />}
          >
            Xác nhận đổi chủ hộ
          </Button>
        </div>
      </form>
    </Modal>
  );
}
