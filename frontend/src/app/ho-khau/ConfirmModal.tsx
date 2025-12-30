"use client";
import React from "react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  confirmColor?: "red" | "blue" | "green";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  confirmColor = "red",
}: Props) {
  if (!isOpen) return null;

  const colorClasses = {
    red: "bg-red-600 hover:bg-red-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-bold ${
              confirmColor === "red" ? "text-red-600" : "text-gray-800"
            }`}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Huỷ
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-xl transition font-medium disabled:opacity-50 ${colorClasses[confirmColor]}`}
          >
            {isLoading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
