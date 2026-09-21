"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui";

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
  title = "Xác nhận thao tác",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  confirmColor = "red",
}: Props) {
  const variant = confirmColor === "red" ? "danger" : confirmColor === "blue" ? "primary" : "warning";

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title={title}
      message={message}
      confirmText={confirmText}
      variant={variant}
    />
  );
}
