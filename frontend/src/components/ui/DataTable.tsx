"use client";

import React from "react";
import { AlertCircle, Inbox, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { Button } from "./Button";

export interface Column<T> {
  header: React.ReactNode;
  accessor?: keyof T | string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  columns, data, keyExtractor, isLoading = false, isError = false,
  errorMessage = "Không tải được dữ liệu. Vui lòng thử lại.", onRetry,
  emptyMessage = "Không tìm thấy dữ liệu phù hợp", emptyIcon, className = "", onRowClick, pagination,
}: DataTableProps<T>) {
  return (
    <div className={`min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white ${className}`} aria-busy={isLoading}>
      <div className="max-h-[70vh] overflow-auto overscroll-contain" tabIndex={0} role="region" aria-label="Bảng dữ liệu">
        <table className="w-full border-collapse text-left text-sm text-slate-700">
          <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-100 text-xs font-bold text-slate-600">
            <tr>{columns.map((column, index) => (
              <th key={index} scope="col" className={`whitespace-nowrap px-4 py-3 ${column.headerClassName || ""}`}>{column.header}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? Array.from({ length: 5 }, (_, row) => (
              <tr key={row} aria-hidden="true">{columns.map((_, column) => (
                <td key={column} className="px-4 py-3.5"><Skeleton className="h-4 w-full max-w-[120px]" /></td>
              ))}</tr>
            )) : isError ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center">
                <div role="alert" className="flex flex-col items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-rose-600" aria-hidden="true" />
                  <p className="text-sm text-slate-700">{errorMessage}</p>
                  {onRetry && <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>Thử lại</Button>}
                </div>
              </td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-14 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-3 text-slate-400">{emptyIcon || <Inbox className="h-6 w-6" aria-hidden="true" />}</div>
                  <p className="text-sm text-slate-500">{emptyMessage}</p>
                </div>
              </td></tr>
            ) : data.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (event) => {
                  if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault(); onRowClick(row);
                  }
                } : undefined}
                className={`transition-colors hover:bg-blue-50/40 ${onRowClick ? "cursor-pointer" : ""}`}
              >{columns.map((column, columnIndex) => (
                <td key={columnIndex} className={`px-4 py-3 align-middle ${column.className || ""}`}>
                  {column.render ? column.render(row, index) : column.accessor ? String((row as Record<string, unknown>)[column.accessor as string] ?? "") : null}
                </td>
              ))}</tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500">
            {pagination.totalItems !== undefined && <>Tổng số <strong className="tabular-nums text-slate-800">{pagination.totalItems}</strong> bản ghi · </>}
            Trang <strong className="tabular-nums text-slate-800">{pagination.currentPage}</strong> / {Math.max(1, pagination.totalPages)}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => pagination.onPageChange(pagination.currentPage - 1)} disabled={isLoading || pagination.currentPage <= 1} leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}>Trước</Button>
            <Button variant="secondary" size="sm" onClick={() => pagination.onPageChange(pagination.currentPage + 1)} disabled={isLoading || pagination.currentPage >= pagination.totalPages} rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>Sau</Button>
          </div>
        </div>
      )}
    </div>
  );
}
