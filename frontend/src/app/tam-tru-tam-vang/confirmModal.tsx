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
      title="Xác nhận xóa đăng ký cư trú"
      message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa đăng ký tạm trú / tạm vắng này không?"
      confirmText="Xóa đăng ký"
      variant="danger"
    />
  );
}
