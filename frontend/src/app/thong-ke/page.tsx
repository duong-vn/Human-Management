"use client";
import { useEffect, useState, useCallback } from 'react';
import {
  getDanhSachDotThu,
  getChiTietHoDaNop,
  getLichSuHo,
} from './api';

export default function ThongKePage() {
  const [nam, setNam] = useState<number>(new Date().getFullYear());
  const [dotThu, setDotThu] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDot, setSelectedDot] = useState<string | null>(null);
  const [chiTietHoDaNop, setChiTietHoDaNop] = useState<any[] | null>(null);
  const [chiTietLoading, setChiTietLoading] = useState(false);
  const [selectedHo, setSelectedHo] = useState<any | null>(null);
  const [lichSuHo, setLichSuHo] = useState<any | null>(null);
  const [lichSuLoading, setLichSuLoading] = useState(false);

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .animate-slide-in {
        animation: slideIn 0.3s ease-out;
      }
      .animate-fade-in {
        animation: fadeIn 0.4s ease-out;
      }
      .animate-pulse-light {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const fetchDotThu = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await getDanhSachDotThu(nam);
    console.log('getDanhSachDotThu response:', data);
    if (data && Array.isArray(data)) {
      setDotThu(data);
    } else if (data === null) {
      setError('Lỗi khi tải dữ liệu đợt thu');
      setDotThu([]);
    } else {
      setDotThu([]);
    }
    setLoading(false);
  }, [nam]);

  useEffect(() => {
    fetchDotThu();
  }, [fetchDotThu]);

  const openDotDetails = async (kyThu: string) => {
    setChiTietLoading(true);
    setSelectedDot(kyThu);
    const data = await getChiTietHoDaNop(kyThu, nam);
    console.log('getChiTietHoDaNop response:', data);
    setChiTietHoDaNop(Array.isArray(data) ? data : []);
    setChiTietLoading(false);
  };

  const openHoDetails = async (hoKhauId?: string | null) => {
    setLichSuLoading(true);
    setError(null);
    // Guard: do not call backend with null/undefined id (causes 500)
    if (!hoKhauId) {
      setSelectedHo(null);
      setLichSuHo(null);
      setLichSuLoading(false);
      setError('Không có mã hộ khẩu cho phiếu thu này.');
      return;
    }

    setSelectedHo(hoKhauId);
    const data = await getLichSuHo(hoKhauId, nam);
    console.log('getLichSuHo response:', data);
    setLichSuHo(data || null);
    setLichSuLoading(false);
  };

  // Helper to format numbers as VND
  const formatVND = (v: any) => {
    if (v == null) return '0';
    if (typeof v === 'number') return v.toLocaleString?.('vi-VN') ?? String(v);
    const n = Number(v);
    return isNaN(n) ? String(v) : n.toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      {/* Header */}
      <div className="animate-slide-in mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          📊 Thống kê thu phí
        </h1>
        <p className="text-gray-600">Quản lý và theo dõi tình hình thu tiền</p>
      </div>

      {/* Year Filter Card */}
      <div className="animate-slide-in mb-6 bg-white rounded-xl shadow-lg border border-blue-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="font-semibold text-gray-700">Chọn năm:</label>
            <input
              type="number"
              value={nam}
              onChange={(e) => setNam(parseInt(e.target.value || '0'))}
              className="border-2 border-blue-200 px-4 py-2 rounded-lg w-32 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={fetchDotThu}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            ⟳ Tải dữ liệu
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="animate-fade-in mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-pulse-light">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-blue-700 font-medium">Đang tải dữ liệu...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="animate-fade-in mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 font-semibold">⚠️ {error}</p>
        </div>
      )}

      {/* Dot Thu Section */}
      <div className="animate-slide-in mb-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Các đợt thu năm {nam}</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-2"></div>
        </div>

        {dotThu.length === 0 && !loading && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">📭 Không có dữ liệu đợt thu</p>
          </div>
        )}

        {dotThu.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dotThu.map((d: any, idx: number) => (
              <div
                key={d.kyThu}
                className="animate-slide-in bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden hover:border-blue-300 cursor-pointer group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
                  <h3 className="font-bold text-lg">{d.kyThu}</h3>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">💰 Tổng tiền</span>
                    <span className="font-bold text-lg text-green-600">
                      {d.tongTien?.toLocaleString?.('vi-VN') ?? d.tongTien} đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">👥 Số hộ đã nộp</span>
                    <span className="font-bold text-lg text-blue-600">
                      {d.soHoDaNop ?? d.soHo ?? 0} hộ
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => openDotDetails(d.kyThu)}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
                    >
                      Chi tiết →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chi Tiet Ho Da Nop Section */}
      {selectedDot && (
        <div className="animate-fade-in mb-8 bg-white rounded-xl shadow-xl border border-blue-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Chi tiết đợt: {selectedDot}</h3>
              <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mt-2"></div>
            </div>
            <button
              onClick={() => {
                setSelectedDot(null);
                setChiTietHoDaNop(null);
              }}
              className="text-2xl text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {chiTietLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              </div>
              <span className="ml-3 text-gray-600">Đang tải chi tiết...</span>
            </div>
          )}

          {chiTietHoDaNop && chiTietHoDaNop.length === 0 && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">📭 Không có hộ nào đã nộp</p>
            </div>
          )}

          {chiTietHoDaNop && chiTietHoDaNop.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Mã phiếu</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Chủ hộ</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Địa chỉ</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Tổng tiền</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {chiTietHoDaNop.map((pt: any, idx: number) => (
                    <tr
                      key={pt._id}
                      className="border-b border-gray-200 hover:bg-amber-50 transition-colors"
                    >
                      <td className="p-3 font-mono text-sm text-blue-600">{pt.maPhieuThu}</td>
                      <td className="p-3 font-semibold text-gray-800">{pt.tenChuHo}</td>
                      <td className="p-3 text-gray-600 text-sm">{pt.diaChi}</td>
                      <td className="p-3 font-bold text-green-600">
                        {pt.tongTien?.toLocaleString?.('vi-VN') ?? pt.tongTien} đ
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openHoDetails(pt.hoKhauId?._id ?? pt.hoKhauId)}
                          className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
                        >
                          Lịch sử
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Lich Su Ho Section */}
      {lichSuHo && selectedHo && (
        <div className="animate-fade-in bg-white rounded-xl shadow-xl border border-green-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Lịch sử nộp tiền hộ: {selectedHo}</h3>
              <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-2"></div>
            </div>
            <button
              onClick={() => {
                setSelectedHo(null);
                setLichSuHo(null);
              }}
              className="text-2xl text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Summary Cards */}
          {(() => {
            const danhSach = Array.isArray(lichSuHo.danhSachPhieuThu) ? lichSuHo.danhSachPhieuThu : [];
            const computedDaNop = danhSach
              .filter((pt: any) => pt?.trangThai === 'Đã thu')
              .reduce((s: number, pt: any) => {
                const v = pt?.tongTien ?? 0;
                return s + (typeof v === 'number' ? v : Number(v) || 0);
              }, 0);
            const computedConNo = danhSach
              .filter((pt: any) => pt?.trangThai !== 'Đã thu')
              .reduce((s: number, pt: any) => {
                const v = pt?.tongTien ?? 0;
                return s + (typeof v === 'number' ? v : Number(v) || 0);
              }, 0);
            const daNop = lichSuHo.tongKet?.daNop ?? computedDaNop;
            const conNo = lichSuHo.tongKet?.conNo ?? computedConNo;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Paid Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-700 font-semibold text-sm mb-1">✓ Đã nộp</p>
                      <p className="text-3xl font-bold text-green-600">
                        {formatVND(daNop)}
                      </p>
                      <p className="text-green-600 text-xs mt-2">đ</p>
                    </div>
                    <div className="text-5xl opacity-20">💰</div>
                  </div>
                </div>

                {/* Debt Card */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-700 font-semibold text-sm mb-1">⚠ Còn nợ</p>
                      <p className="text-3xl font-bold text-red-600">
                        {formatVND(conNo)}
                      </p>
                      <p className="text-red-600 text-xs mt-2">đ</p>
                    </div>
                    <div className="text-5xl opacity-20">📌</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Phieu Thu List */}
          <div>
            <h4 className="text-xl font-bold text-gray-800 mb-4">Danh sách phiếu thu</h4>
            {lichSuHo.danhSachPhieuThu.length === 0 && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">📭 Không có phiếu thu</p>
              </div>
            )}
            {lichSuHo.danhSachPhieuThu.length > 0 && (
              <div className="space-y-3">
                {lichSuHo.danhSachPhieuThu.map((pt: any) => (
                  <div
                    key={pt._id}
                    className={`rounded-lg border-l-4 p-4 ${pt.trangThai === 'Đã thu'
                      ? 'bg-green-50 border-l-green-500'
                      : 'bg-yellow-50 border-l-yellow-500'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-800">{pt.maPhieuThu}</p>
                        <p className="text-sm text-gray-600">
                          📅 {new Date(pt.ngayThu).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600">
                          {pt.tongTien?.toLocaleString?.('vi-VN') ?? pt.tongTien} đ
                        </p>
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-1 rounded-full mt-1 ${pt.trangThai === 'Đã thu'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-yellow-200 text-yellow-800'
                            }`}
                        >
                          {pt.trangThai}
                        </span>
                      </div>
                    </div>
                    {pt.chiTietThu && pt.chiTietThu.length > 0 && (
                      <div className="mt-3 pl-3 border-l-2 border-gray-200">
                        {pt.chiTietThu.map((ct: any, idx: number) => (
                          <p key={idx} className="text-sm text-gray-700 py-1">
                            • {ct.tenKhoanThu}:{' '}
                            <span className="font-semibold text-indigo-600">
                              {ct.soTien?.toLocaleString?.('vi-VN')} đ
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {lichSuLoading && (
        <div className="animate-fade-in fixed inset-0 bg-black/20 rounded-lg flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
            <div className="animate-spin mx-auto mb-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
            <p className="text-gray-700 font-semibold">Đang tải lịch sử nộp tiền...</p>
          </div>
        </div>
      )}
    </div>
  );
}
