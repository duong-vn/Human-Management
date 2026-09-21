import React from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    neutral?: boolean;
  };
  accent?: "blue" | "emerald" | "amber" | "rose" | "purple" | "slate";
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accent = "blue",
  className = "",
}) => {
  const accentStyles: Record<string, { iconBg: string; iconColor: string; border: string }> = {
    blue: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      border: "hover:border-blue-200",
    },
    emerald: {
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      border: "hover:border-emerald-200",
    },
    amber: {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      border: "hover:border-amber-200",
    },
    rose: {
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      border: "hover:border-rose-200",
    },
    purple: {
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      border: "hover:border-purple-200",
    },
    slate: {
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      border: "hover:border-slate-300",
    },
  };

  const style = accentStyles[accent] || accentStyles.blue;

  return (
    <div
      className={`min-w-0 bg-white rounded-lg border border-slate-200 p-5 transition-colors ${style.border} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold leading-relaxed text-slate-500">
            {title}
          </p>
          <p className="break-words text-2xl font-extrabold leading-tight text-slate-900 tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        {icon && (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}
          >
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center font-semibold text-xs ml-auto ${
                trend.neutral
                  ? "text-slate-600"
                  : trend.isPositive
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
