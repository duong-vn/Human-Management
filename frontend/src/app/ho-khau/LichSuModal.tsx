"use client";
import React from "react";
import { X, History, Calendar, User } from "lucide-react";
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <History className="text-gray-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Lịch sử biến động
              </h2>
              <p className="text-sm text-gray-500">
                Hộ khẩu #{hoKhauId.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            </div>
          ) : lichSu && lichSu.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Timeline items */}
              <div className="space-y-6">
                {lichSu
                  .slice()
                  .reverse() // Hiển thị mới nhất lên trước
                  .map((item, index) => (
                    <div key={index} className="relative pl-10">
                      {/* Dot */}
                      <div className="absolute left-2.5 w-3 h-3 bg-gray-400 rounded-full border-2 border-white shadow"></div>

                      {/* Content */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-800 font-medium mb-2">
                          {item.noiDung}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {item.ngayThayDoi
                              ? new Date(item.ngayThayDoi).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "---"}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {item.nguoiThucHien || "---"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <History size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Chưa có lịch sử biến động</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-gray-300 rounded-xl hover:bg-white transition font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
