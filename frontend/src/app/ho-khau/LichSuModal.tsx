"use client";

import React from "react";
import { History, Calendar, User } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { LichSuThayDoi } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lichSu: LichSuThayDoi[];
  hoKhauId: string;
  isLoading: boolean;
}

export default function LichSuModal({
  isOpen,
  onClose,
  lichSu,
  hoKhauId,
  isLoading,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lịch Sử Biến Động Sổ Hộ Khẩu"
      description={`Ghi nhận các thay đổi nhân khẩu và thông tin hộ khẩu #${hoKhauId.slice(-8).toUpperCase()}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-700" />
          </div>
        ) : lichSu && lichSu.length > 0 ? (
          <div className="relative pl-6 py-2">
            {/* Timeline line */}
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-200" />

            {/* Timeline items */}
            <div className="space-y-4">
              {lichSu
                .slice()
                .reverse()
                .map((item, index) => (
                  <div key={index} className="relative group">
                    {/* Dot */}
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white border border-blue-700" />

                    {/* Content */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">
                        {item.noiDung}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 tabular-nums">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.ngayThayDoi
                            ? new Date(item.ngayThayDoi).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Người thực hiện: <strong className="font-medium text-slate-700">{item.nguoiThucHien || "—"}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-3 rounded-lg bg-slate-100 text-slate-400 mb-2">
              <History className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-600">Chưa có lịch sử biến động</p>
            <p className="text-xs text-slate-400 mt-0.5">Các thay đổi về thành viên hoặc chủ hộ sẽ xuất hiện tại đây</p>
          </div>
        )}

        <div className="modal-footer">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
