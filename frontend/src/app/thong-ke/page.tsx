"use client";
import { useEffect, useState, useCallback } from 'react';
import {
  getDanhSachDotThu,
  getChiTietHoDaNop,
  getChiTietHoChuaNop,
  getLichSuHo,
} from './api';

export default function ThongKePage() {
  const [nam, setNam] = useState<number>(new Date().getFullYear());
  const [dotThu, setDotThu] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDot, setSelectedDot] = useState<string | null>(null);
  const [chiTietHoDaNop, setChiTietHoDaNop] = useState<any[] | null>(null);
  const [chiTietHoChuaNop, setChiTietHoChuaNop] = useState<any[] | null>(null);
  const [chiTietLoading, setChiTietLoading] = useState(false);
  const [chiTietFilterText, setChiTietFilterText] = useState<string>('');
  const [chiTietFilterStatus, setChiTietFilterStatus] = useState<string>('all');
  const [selectedHo, setSelectedHo] = useState<any | null>(null);
  const [lichSuHo, setLichSuHo] = useState<any | null>(null);
  const [lichSuLoading, setLichSuLoading] = useState(false);
  const [lichSuFilterText, setLichSuFilterText] = useState<string>('');
  const [lichSuFilterStatus, setLichSuFilterStatus] = useState<string>('all');
  const [selectedPhieu, setSelectedPhieu] = useState<any | null>(null);

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      @keyframes underlineGrow { from { transform: scaleX(0); opacity: 0.4; } to { transform: scaleX(1); opacity: 1; } }
      .animate-slide-in { animation: slideIn 0.32s ease-out; }
      .animate-fade-in { animation: fadeIn 0.4s ease-out; }
      .animate-pulse-light { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      .heading-emoji { display: inline-block; transition: transform 220ms ease; }
      .heading-emoji:hover { transform: translateY(-4px) rotate(-8deg); }
      .heading-underline { transform-origin: left; transform: scaleX(0); animation: underlineGrow 600ms cubic-bezier(0.2,0.8,0.2,1) forwards; }
    `;
    document.head.appendChild(style);
  }, []);

  // Fetch list of đợt thu
  const fetchDotThu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDanhSachDotThu(nam);
      console.log('getDanhSachDotThu response:', data);
      if (Array.isArray(data)) setDotThu(data);
      else setDotThu([]);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải danh sách đợt thu');
      setDotThu([]);
    }
    setLoading(false);
  }, [nam]);

  useEffect(() => {
    fetchDotThu();
  }, [fetchDotThu]);

  // Refresh data when selectedHo/selectedDot/nam changes
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      if (selectedHo) {
        setLichSuLoading(true);
        const data = await getLichSuHo(selectedHo, nam);
        if (!mounted) return;
        setLichSuHo(data || null);
        setLichSuLoading(false);
      }
      if (selectedDot) {
        setChiTietLoading(true);
        const data = await getChiTietHoDaNop(selectedDot, nam);
        if (!mounted) return;
        setChiTietHoDaNop(Array.isArray(data) ? data : []);
        setChiTietLoading(false);
      }
    };

    refresh();
    return () => {
      mounted = false;
    };
  }, [selectedHo, selectedDot, nam]);

  const openDotDetails = async (kyThu: string) => {
    setChiTietLoading(true);
    setSelectedDot(kyThu);
    try {
      const dataDaNop = await getChiTietHoDaNop(kyThu, nam);
      const dataChuaNop = await getChiTietHoChuaNop(kyThu, nam);
      console.log('getChiTietHoDaNop response:', dataDaNop);
      console.log('getChiTietHoChuaNop response:', dataChuaNop);
      setChiTietHoDaNop(Array.isArray(dataDaNop) ? dataDaNop : []);
      setChiTietHoChuaNop(Array.isArray(dataChuaNop) ? dataChuaNop : []);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết:', err);
      setChiTietHoDaNop([]);
      setChiTietHoChuaNop([]);
    }
    // reset filters when opening a dot
    setChiTietFilterText('');
    setChiTietFilterStatus('all');
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
    // reset filters when opening household
    setLichSuFilterText('');
    setLichSuFilterStatus('all');
    setLichSuLoading(false);
  };

  const openPhieuDetails = (phieu: any) => {
    setSelectedPhieu(phieu);
  };

  const closePhieuDetails = () => setSelectedPhieu(null);

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
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <span className="heading-emoji text-4xl">📊</span>
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Thống kê thu phí</span>
        </h1>
        <div className="heading-underline bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full h-1 w-40 mb-2"></div>
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
            onClick={() => getDanhSachDotThu(nam).then((data) => {
              if (data) setDotThu(data);
            })}
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
                  {typeof d.soHoChuaNop !== 'undefined' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">🚫 Số hộ chưa nộp</span>
                      <span className="font-semibold text-lg text-rose-600">
                        {d.soHoChuaNop ?? 0} hộ
                      </span>
                    </div>
                  )}

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
                setChiTietHoChuaNop(null);
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

          {!chiTietLoading && (
            <>
              {/* Hộ đã nộp */}
              <div className="mb-8">
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span>✓</span> Hộ đã nộp ({chiTietHoDaNop?.length || 0})
                  </h4>
                  <div className="h-0.5 w-12 bg-green-500 rounded-full mt-2"></div>
                </div>

                {chiTietHoDaNop && chiTietHoDaNop.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500">📭 Không có hộ nào đã nộp</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-base">
                      <thead>
                        <tr className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-300">
                          <th className="text-left px-4 py-3 font-bold text-gray-800">Mã phiếu</th>
                          {selectedDot && selectedDot.toLowerCase().includes('tháng') && (
                            <th className="text-left px-4 py-3 font-bold text-gray-800">Phí</th>
                          )}
                          <th className="text-left px-4 py-3 font-bold text-gray-800">Mã hộ</th>
                          <th className="text-left px-4 py-3 font-bold text-gray-800">Chủ hộ</th>
                          <th className="text-left px-4 py-3 font-bold text-gray-800">Địa chỉ</th>
                          <th className="text-left px-4 py-3 font-bold text-gray-800">Thời gian nộp</th>
                          <th className="text-center px-4 py-3 font-bold text-gray-800">Trạng thái</th>
                          <th className="text-right px-4 py-3 font-bold text-gray-800">Tổng tiền</th>
                          <th className="text-center px-4 py-3 font-bold text-gray-800">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chiTietHoDaNop
                          ?.filter((pt: any) => {
                            const q = chiTietFilterText.trim().toLowerCase();
                            if (q) {
                              const name = (pt.tenChuHo || '').toString().toLowerCase();
                              const code = (pt.maPhieuThu || '').toString().toLowerCase();
                              const hid = (pt.hoKhauId?._id || pt.hoKhauId || '').toString().toLowerCase();
                              if (!name.includes(q) && !code.includes(q) && !hid.includes(q)) return false;
                            }
                            return true;
                          })
                          .map((pt: any) => (
                            <tr
                              key={pt._id}
                              className="border-b border-gray-200 hover:bg-green-50 transition-colors"
                            >
                              <td className="px-4 py-3 font-mono text-sm font-semibold text-blue-600">{pt.maPhieuThu}</td>
                              {selectedDot && selectedDot.toLowerCase().includes('tháng') && (
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {pt.chiTietThu && pt.chiTietThu.length > 0
                                    ? pt.chiTietThu.map((ct: any) => ct.tenKhoanThu).join(', ')
                                    : '—'}
                                </td>
                              )}
                              <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                {(pt.hoKhauId?._id || pt.hoKhauId || '').toString().slice(0, 8)}...
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900">{pt.tenChuHo}</td>
                              <td className="px-4 py-3 text-gray-700">{pt.diaChi}</td>
                              <td className="px-4 py-3 text-gray-700">
                                {pt.ngayThu ? new Date(pt.ngayThu).toLocaleDateString('vi-VN') : '—'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-green-200 text-green-800">
                                  {pt.trangThai || 'Đã thu'}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-bold text-green-600 text-right">
                                {pt.tongTien?.toLocaleString?.('vi-VN') ?? pt.tongTien} đ
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => openHoDetails(pt.hoKhauId?._id ?? pt.hoKhauId)}
                                  className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
                                >
                                  Chi tiết
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Hộ chưa nộp */}
              <div>
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span>🚫</span> Hộ chưa nộp ({chiTietHoChuaNop?.length || 0})
                  </h4>
                  <div className="h-0.5 w-12 bg-red-500 rounded-full mt-2"></div>
                </div>

                {chiTietHoChuaNop && chiTietHoChuaNop.length === 0 ? (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-8 text-center">
                    <p className="text-green-700 font-semibold">✓ Tất cả các hộ đều đã nộp</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-base">
                      <thead>
                        <tr className="bg-gradient-to-r from-red-50 to-rose-50 border-b-2 border-red-300">
                          <th className="text-left px-4 py-3 font-bold text-gray-800">Mã phiếu</th>
                          {selectedDot && selectedDot.toLowerCase().includes('tháng') && (
                            <th className="text-left px-4 py-3 font-bold text-gray-800">Phí</th>
                          )}
                          <th className="text-left px-4 py-3 font-bold text-gray-800">Mã hộ</th>
                          <th className="text-left px-4 py-3 font-bold text-gray-800">Chủ hộ</th>
                          <th className="text-left px-4 py-3 font-bold text-gray-800">Địa chỉ</th>
                          <th className="text-left px-4 py-3 font-bold text-gray-800">Thời gian nộp</th>
                          <th className="text-center px-4 py-3 font-bold text-gray-800">Trạng thái</th>
                          <th className="text-right px-4 py-3 font-bold text-gray-800">Tổng tiền</th>
                          <th className="text-center px-4 py-3 font-bold text-gray-800">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chiTietHoChuaNop
                          ?.filter((pt: any) => {
                            const q = chiTietFilterText.trim().toLowerCase();
                            if (q) {
                              const name = (pt.tenChuHo || '').toString().toLowerCase();
                              const code = (pt.maPhieuThu || '').toString().toLowerCase();
                              const hid = (pt.hoKhauId?._id || pt.hoKhauId || '').toString().toLowerCase();
                              if (!name.includes(q) && !code.includes(q) && !hid.includes(q)) return false;
                            }
                            return true;
                          })
                          .map((pt: any) => (
                            <tr
                              key={pt._id}
                              className="border-b border-gray-200 hover:bg-red-50 transition-colors"
                            >
                              <td className="px-4 py-3 font-mono text-sm font-semibold text-blue-600">{pt.maPhieuThu}</td>
                              {selectedDot && selectedDot.toLowerCase().includes('tháng') && (
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {pt.chiTietThu && pt.chiTietThu.length > 0
                                    ? pt.chiTietThu.map((ct: any) => ct.tenKhoanThu).join(', ')
                                    : '—'}
                                </td>
                              )}
                              <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                {(pt.hoKhauId?._id || pt.hoKhauId || '').toString().slice(0, 8)}...
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900">{pt.tenChuHo}</td>
                              <td className="px-4 py-3 text-gray-700">{pt.diaChi}</td>
                              <td className="px-4 py-3 text-gray-700">
                                {pt.ngayThu ? new Date(pt.ngayThu).toLocaleDateString('vi-VN') : '—'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${pt.trangThai === 'Đang nợ'
                                    ? 'bg-red-200 text-red-800'
                                    : 'bg-yellow-200 text-yellow-800'
                                    }`}
                                >
                                  {pt.trangThai}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-bold text-red-600 text-right">
                                {pt.tongTien?.toLocaleString?.('vi-VN') ?? pt.tongTien} đ
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => openHoDetails(pt.hoKhauId?._id ?? pt.hoKhauId)}
                                  className="inline-block bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
                                >
                                  Chi tiết
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Paid Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 font-semibold text-sm mb-1">✓ Đã nộp</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatVND(lichSuHo?.tongKet?.daNop ?? 0)}
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
                    {formatVND(lichSuHo?.tongKet?.conNo ?? 0)}
                  </p>
                  <p className="text-red-600 text-xs mt-2">đ</p>
                </div>
                <div className="text-5xl opacity-20">📌</div>
              </div>
            </div>
          </div>

          {/* Danh Sách Phiếu Thu */}
          <div className="bg-white border-t mt-4 pt-4">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">Danh sách phiếu thu</h4>
              <span className="text-sm text-gray-500">{(lichSuHo?.danhSachPhieuThu?.length ?? 0) + ' phiếu'}</span>
            </div>

            {lichSuHo?.danhSachPhieuThu && lichSuHo.danhSachPhieuThu.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500">📭 Không có phiếu thu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left px-4 py-3 font-bold text-gray-800">Mã phiếu</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-800">Ngày</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-800">Tổng tiền</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-800">Trạng thái</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-800">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lichSuHo?.danhSachPhieuThu?.map((phieu: any) => (
                      <tr key={phieu._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm font-semibold text-blue-600">{phieu.maPhieuThu}</td>
                        <td className="px-4 py-3 text-gray-700">{phieu.ngayThu ? new Date(phieu.ngayThu).toLocaleDateString('vi-VN') : '—'}</td>
                        <td className="px-4 py-3 font-bold text-gray-800">{phieu.tongTien?.toLocaleString?.('vi-VN') ?? phieu.tongTien} đ</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${phieu.trangThai === 'Đã thu' ? 'bg-green-200 text-green-800' : phieu.trangThai === 'Đang nợ' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                            {phieu.trangThai ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openPhieuDetails(phieu)}
                            className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

      {/* Phiếu details modal */}
      {selectedPhieu && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold">Chi tiết phiếu: {selectedPhieu.maPhieuThu}</h4>
                <p className="text-sm text-gray-600">Chủ hộ: {selectedPhieu.tenChuHo}</p>
                <p className="text-sm text-gray-600">Địa chỉ: {selectedPhieu.diaChi}</p>
                <p className="text-sm text-gray-600">Ngày: {selectedPhieu.ngayThu ? new Date(selectedPhieu.ngayThu).toLocaleDateString('vi-VN') : '—'}</p>
              </div>
              <button onClick={closePhieuDetails} className="text-gray-500 hover:text-gray-800 text-2xl">✕</button>
            </div>

            <div className="divide-y space-y-4">
              {/* All fee items */}
              <div className="pb-4">
                <h5 className="font-semibold mb-3 text-gray-800">Các khoản phí / Đóng góp</h5>
                {selectedPhieu.chiTietThu && selectedPhieu.chiTietThu.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPhieu.chiTietThu.map((ct: any, i: number) => {
                      // Determine fee category
                      let icon = '💰';
                      const tenKhoan = ct.tenKhoanThu?.toLowerCase() || '';
                      if (tenKhoan.includes('cố định') || tenKhoan.includes('quản lý')) {
                        icon = '📋';
                      } else if (tenKhoan.includes('đóng góp') || tenKhoan.includes('ủng hộ')) {
                        icon = '🤝';
                      } else if (tenKhoan.includes('vệ sinh') || tenKhoan.includes('vệ sinh')) {
                        icon = '🧹';
                      } else if (tenKhoan.includes('dịch vụ')) {
                        icon = '🔧';
                      }

                      return (
                        <div
                          key={i}
                          className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{icon}</span>
                              <span className="text-sm font-medium text-gray-800">{ct.tenKhoanThu}</span>
                            </div>
                            {ct.ghiChu && (
                              <p className="text-xs text-gray-500 mt-1 ml-6">{ct.ghiChu}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm font-bold text-green-600">{formatVND(ct.soTien)} đ</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">Không có khoản thu chi tiết.</div>
                )}
              </div>

              {/* Summary */}
              <div className="pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Số lượng khoản</p>
                    <p className="text-lg font-bold text-blue-600">{selectedPhieu.chiTietThu?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Tổng cộng</p>
                    <p className="text-lg font-bold text-green-600">{formatVND(selectedPhieu.tongTien)} đ</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Trạng thái</span>
                  <span
                    className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${selectedPhieu.trangThai === 'Đã thu'
                      ? 'bg-green-200 text-green-800'
                      : selectedPhieu.trangThai === 'Đang nợ'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-yellow-200 text-yellow-800'
                      }`}
                  >
                    {selectedPhieu.trangThai ?? '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
