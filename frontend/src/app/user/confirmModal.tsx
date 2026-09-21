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
      title="Xác nhận xóa tài khoản cán bộ"
      message="Hành động này không thể hoàn tác. Tài khoản và quyền truy cập của cán bộ sẽ bị vô hiệu hóa hoàn toàn khỏi hệ thống."
      confirmText="Xóa tài khoản"
      variant="danger"
    />
  );
}
