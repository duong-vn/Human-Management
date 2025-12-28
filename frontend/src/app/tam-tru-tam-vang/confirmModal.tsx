"use client";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold mb-2 text-red-600">Xác nhận xoá?</h3>
        <p className="text-gray-600 mb-6">
          Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xoá đăng ký tạm trú/tạm vắng này không?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Huỷ
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? "Đang xoá..." : "Xoá ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}
