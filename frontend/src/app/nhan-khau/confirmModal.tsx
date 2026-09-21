"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui";

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
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title="Xác nhận xóa nhân khẩu"
      message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa nhân khẩu này khỏi hệ thống cơ sở dữ liệu?"
      confirmText="Xóa nhân khẩu"
      variant="danger"
    />
  );
}
