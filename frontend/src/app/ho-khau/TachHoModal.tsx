"use client";

import React, { useState, useEffect } from "react";
import { Users, MapPin, CheckSquare, AlertTriangle } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import {
  HoKhau,
  TachHoParams,
  DiaChi,
  getChuHoInfo,
} from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TachHoParams) => void;
  hoKhau: HoKhau | null;
  isLoading: boolean;
}

const defaultDiaChi: DiaChi = {
  soNha: "",
  duong: "",
  phuongXa: "",
  quanHuyen: "",
  tinhThanh: "",
};

export default function TachHoModal({
  isOpen,
  onClose,
  onSubmit,
  hoKhau,
  isLoading,
}: Props) {
  const [selectedNhanKhauIds, setSelectedNhanKhauIds] = useState<string[]>([]);
  const [chuHoMoiId, setChuHoMoiId] = useState("");
  const [chuHoMoiTen, setChuHoMoiTen] = useState("");
  const [diaChi, setDiaChi] = useState<DiaChi>(defaultDiaChi);
  const [chuHoMoiChoHoGocId, setChuHoMoiChoHoGocId] = useState("");
  const [chuHoMoiChoHoGocTen, setChuHoMoiChoHoGocTen] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedNhanKhauIds([]);
      setChuHoMoiId("");
      setChuHoMoiTen("");
      setDiaChi(defaultDiaChi);
      setChuHoMoiChoHoGocId("");
      setChuHoMoiChoHoGocTen("");
    }
  }, [isOpen]);

  if (!isOpen || !hoKhau) return null;

  const hoKhauId = hoKhau._id || hoKhau.id || "";
  const thanhVienList = hoKhau.thanhVien || [];

  const getChuHoHienTaiId = () => {
    const chuHoInfo = getChuHoInfo(hoKhau.chuHo);
    return chuHoInfo?.id || "";
  };

  const chuHoHienTaiId = getChuHoHienTaiId();
  const chuHoBiTach = selectedNhanKhauIds.includes(chuHoHienTaiId);
  const thanhVienConLai = thanhVienList.filter((tv) => {
    const id = typeof tv.nhanKhauId === "object" ? tv.nhanKhauId._id : tv.nhanKhauId;
    return !selectedNhanKhauIds.includes(id);
  });

  const toggleSelectNhanKhau = (nkId: string) => {
    setSelectedNhanKhauIds((prev) => {
      if (prev.includes(nkId)) {
        if (chuHoMoiId === nkId) {
          setChuHoMoiId("");
          setChuHoMoiTen("");
        }
        if (chuHoMoiChoHoGocId === nkId) {
          setChuHoMoiChoHoGocId("");
          setChuHoMoiChoHoGocTen("");
        }
        return prev.filter((id) => id !== nkId);
      } else {
        return [...prev, nkId];
      }
    });
  };

  const handleSelectChuHoMoi = (nkId: string, hoTen: string) => {
    setChuHoMoiId(nkId);
    setChuHoMoiTen(hoTen);
  };

  const handleDiaChiChange = (field: keyof DiaChi, value: string) => {
    setDiaChi((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedNhanKhauIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 nhân khẩu để tách hộ!");
      return;
    }

    if (!chuHoMoiId || !chuHoMoiTen) {
      alert("Vui lòng chọn chủ hộ mới cho hộ khẩu tách ra!");
      return;
    }

    if (chuHoBiTach && thanhVienConLai.length > 0 && !chuHoMoiChoHoGocId) {
      alert("Chủ hộ hiện tại nằm trong danh sách tách. Vui lòng chọn chủ hộ mới cho hộ gốc!");
      return;
    }

    const data: TachHoParams = {
      hoKhauGocId: hoKhauId,
      chuHoMoi: {
        nhanKhauId: chuHoMoiId,
        hoTen: chuHoMoiTen,
      },
      diaChi,
      danhSachNhanKhauMoi: selectedNhanKhauIds.map((nkId) => {
        const tv = thanhVienList.find((t) => {
          const id = typeof t.nhanKhauId === "object" ? t.nhanKhauId._id : t.nhanKhauId;
          return id === nkId;
        });
        return {
          nhanKhauId: nkId,
          hoTen: tv?.hoTen || "",
          quanHeVoiChuHo: nkId === chuHoMoiId ? "Chủ hộ" : tv?.quanHeVoiChuHo || "Khác",
        };
      }),
      ...(chuHoBiTach && thanhVienConLai.length > 0 && chuHoMoiChoHoGocId
        ? {
            chuHoMoiChoHoGoc: {
              nhanKhauId: chuHoMoiChoHoGocId,
              hoTen: chuHoMoiChoHoGocTen,
            },
          }
        : {}),
    };

    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tách Sổ Hộ Khẩu"
      description={`Tách nhân khẩu từ hộ #${hoKhauId.slice(-8).toUpperCase()} thành một hộ khẩu mới độc lập`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Bước 1: Chọn nhân khẩu */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="section-heading flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              Bước 1: Chọn nhân khẩu chuyển sang hộ mới
            </h3>
            {selectedNhanKhauIds.length > 0 && (
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Đã chọn {selectedNhanKhauIds.length} người
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-2.5">
            Đánh dấu chọn những thành viên sẽ được tách ra khỏi hộ khẩu hiện tại.
          </p>

          {thanhVienList.length > 0 ? (
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto bg-white">
              {thanhVienList.map((tv, index) => {
                const nkId = typeof tv.nhanKhauId === "object" ? tv.nhanKhauId._id : tv.nhanKhauId;
                const nkHoTen =
                  typeof tv.nhanKhauId === "object" && tv.nhanKhauId.hoTen
                    ? tv.nhanKhauId.hoTen
                    : tv.hoTen;
                const isSelected = selectedNhanKhauIds.includes(nkId);
                const isChuHo = tv.quanHeVoiChuHo === "Chủ hộ";

                return (
                  <label
                    key={nkId || index}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectNhanKhau(nkId)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900">{nkHoTen}</span>
                        {isChuHo && (
                          <span className="ml-1.5 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Chủ hộ hiện tại
                          </span>
                        )}
                        <p className="text-[11px] text-slate-500">{tv.quanHeVoiChuHo || "Thành viên"}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-xs text-slate-500 py-4 border border-slate-200 rounded-lg">
              Không có thành viên để tách
            </div>
          )}
        </div>

        {/* Bước 2: Chọn chủ hộ mới cho hộ tách */}
        {selectedNhanKhauIds.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <h3 className="section-heading flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              Bước 2: Chọn chủ hộ mới cho hộ tách <span className="text-rose-500">*</span>
            </h3>
            <label className="field-label" htmlFor="select-chu-ho-moi">
              Chủ hộ mới cho hộ tách <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-chu-ho-moi"
              value={chuHoMoiId}
              onChange={(e) => {
                const selected = thanhVienList.find((tv) => {
                  const id = typeof tv.nhanKhauId === "object" ? tv.nhanKhauId._id : tv.nhanKhauId;
                  return id === e.target.value;
                });
                if (selected) {
                  const hoTen =
                    typeof selected.nhanKhauId === "object" && selected.nhanKhauId.hoTen
                      ? selected.nhanKhauId.hoTen
                      : selected.hoTen;
                  handleSelectChuHoMoi(e.target.value, hoTen);
                }
              }}
              className="field"
              required
            >
              <option value="">-- Chọn chủ hộ mới từ danh sách người tách --</option>
              {thanhVienList
                .filter((tv) => {
                  const id = typeof tv.nhanKhauId === "object" ? tv.nhanKhauId._id : tv.nhanKhauId;
                  return selectedNhanKhauIds.includes(id);
                })
                .map((tv) => {
                  const id = typeof tv.nhanKhauId === "object" ? tv.nhanKhauId._id : tv.nhanKhauId;
                  const hoTen =
                    typeof tv.nhanKhauId === "object" && tv.nhanKhauId.hoTen
                      ? tv.nhanKhauId.hoTen
                      : tv.hoTen;
                  return (
                    <option key={id} value={id}>
                      {hoTen}
                    </option>
                  );
                })}
            </select>
          </div>
        )}

        {/* Cảnh báo & chọn chủ hộ mới cho hộ gốc (nếu chủ hộ gốc bị tách đi) */}
        {chuHoBiTach && thanhVienConLai.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Chủ hộ hiện tại được tách sang hộ mới
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Vì chủ hộ hiện tại ({getChuHoInfo(hoKhau.chuHo)?.hoTen || "N/A"}) rời khỏi hộ gốc, vui lòng chỉ định một thành viên còn lại làm chủ hộ mới cho hộ gốc.
            </p>
            <label className="field-label" htmlFor="select-chu-ho-ho-goc">
              Chủ hộ mới cho hộ gốc <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-chu-ho-ho-goc"
              value={chuHoMoiChoHoGocId}
              onChange={(e) => {
                const selected = thanhVienConLai.find((tv) => {
                  const id = typeof tv.nhanKhauId === "object" ? tv.nhanKhauId._id : tv.nhanKhauId;
                  return id === e.target.value;
                });
                if (selected) {
                  const hoTen =
                    typeof selected.nhanKhauId === "object" && selected.nhanKhauId.hoTen
                      ? selected.nhanKhauId.hoTen
                      : selected.hoTen;
                  setChuHoMoiChoHoGocId(e.target.value);
                  setChuHoMoiChoHoGocTen(hoTen);
                } else {
                  setChuHoMoiChoHoGocId("");
                  setChuHoMoiChoHoGocTen("");
                }
              }}
              className="field bg-white"
              required
            >
              <option value="">-- Chọn chủ hộ mới cho hộ gốc --</option>
              {thanhVienConLai.map((tv) => {
                const id = typeof tv.nhanKhauId === "object" ? tv.nhanKhauId._id : tv.nhanKhauId;
                const hoTen =
                  typeof tv.nhanKhauId === "object" && tv.nhanKhauId.hoTen
                    ? tv.nhanKhauId.hoTen
                    : tv.hoTen;
                return (
                  <option key={id} value={id}>
                    {hoTen} ({tv.quanHeVoiChuHo})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Bước 3: Địa chỉ hộ khẩu mới */}
        {chuHoMoiId && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="section-heading flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Bước 3: Địa chỉ thường trú hộ mới
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="input-tach-sonha">
                  Số nhà
                </label>
                <input
                  id="input-tach-sonha"
                  type="text"
                  value={diaChi.soNha || ""}
                  onChange={(e) => handleDiaChiChange("soNha", e.target.value)}
                  className="field"
                  placeholder="VD: Số 12A"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="input-tach-duong">
                  Đường / Phố
                </label>
                <input
                  id="input-tach-duong"
                  type="text"
                  value={diaChi.duong || ""}
                  onChange={(e) => handleDiaChiChange("duong", e.target.value)}
                  className="field"
                  placeholder="VD: Đường Nguyễn Trãi"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="input-tach-phuong">
                  Phường / Xã
                </label>
                <input
                  id="input-tach-phuong"
                  type="text"
                  value={diaChi.phuongXa || ""}
                  onChange={(e) => handleDiaChiChange("phuongXa", e.target.value)}
                  className="field"
                  placeholder="VD: Phường La Khê"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="input-tach-quan">
                  Quận / Huyện
                </label>
                <input
                  id="input-tach-quan"
                  type="text"
                  value={diaChi.quanHuyen || ""}
                  onChange={(e) => handleDiaChiChange("quanHuyen", e.target.value)}
                  className="field"
                  placeholder="VD: Quận Hà Đông"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="input-tach-tinh">
                  Tỉnh / Thành phố
                </label>
                <input
                  id="input-tach-tinh"
                  type="text"
                  value={diaChi.tinhThanh || ""}
                  onChange={(e) => handleDiaChiChange("tinhThanh", e.target.value)}
                  className="field"
                  placeholder="VD: TP. Hà Nội"
                />
              </div>
            </div>
          </div>
        )}

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
            disabled={isLoading || selectedNhanKhauIds.length === 0 || !chuHoMoiId}
            isLoading={isLoading}
          >
            Tách hộ khẩu
          </Button>
        </div>
      </form>
    </Modal>
  );
}
