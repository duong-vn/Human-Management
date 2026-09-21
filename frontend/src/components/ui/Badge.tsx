import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "neutral" | "info" | "primary";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant = "neutral",
  size = "md",
  dot = true,
  ...props
}) => {
  const variantStyles: Record<string, { badge: string; dot: string }> = {
    success: {
      badge: "bg-slate-50 text-slate-800 border-slate-200",
      dot: "bg-emerald-500",
    },
    warning: {
      badge: "bg-slate-50 text-slate-800 border-slate-200",
      dot: "bg-amber-500",
    },
    danger: {
      badge: "bg-slate-50 text-slate-800 border-slate-200",
      dot: "bg-rose-500",
    },
    info: {
      badge: "bg-slate-50 text-slate-800 border-slate-200",
      dot: "bg-sky-500",
    },
    primary: {
      badge: "bg-slate-50 text-slate-800 border-slate-200",
      dot: "bg-blue-600",
    },
    neutral: {
      badge: "bg-slate-50 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
    },
  };

  const sizeStyles: Record<string, string> = {
    sm: "text-[11px] px-2 py-0.5 font-medium gap-1.5",
    md: "text-xs px-2.5 py-1 font-medium gap-1.5",
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-normal whitespace-nowrap transition-colors ${
        style.badge
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
