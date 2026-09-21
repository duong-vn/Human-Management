"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Info } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "danger",
  isLoading = false,
}) => {
  const iconConfig = {
    danger: {
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
      bg: "bg-rose-50",
      btnVariant: "danger" as const,
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50",
      btnVariant: "primary" as const,
    },
    primary: {
      icon: <Info className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
      btnVariant: "primary" as const,
    },
  }[variant];

  return (
    <Modal isOpen={isOpen} onClose={() => { if (!isLoading) onClose(); }} maxWidth="md" title={title} role="alertdialog">
      <div className="flex items-start gap-4">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${iconConfig.bg}`}
        >
          {iconConfig.icon}
        </div>
        <div className="space-y-1.5 flex-1">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          variant={iconConfig.btnVariant}
          size="md"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
