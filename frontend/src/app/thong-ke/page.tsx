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

  const openHoDetails = async (hoKhauId: string) => {
    setLichSuLoading(true);
    setSelectedHo(hoKhauId);
    const data = await getLichSuHo(hoKhauId, nam);
    console.log('getLichSuHo response:', data);
    setLichSuHo(data || null);
    setLichSuLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Thống kê thu phí</h1>

      <div className="flex items-center gap-4">
        <label>Năm:</label>
        <input
          type="number"
          value={nam}
          onChange={(e) => setNam(parseInt(e.target.value || '0'))}
          className="border px-2 py-1 rounded w-32"
        />
        <button
          onClick={fetchDotThu}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Tải
        </button>
      </div>

      {loading && <div className="text-gray-600">Đang tải...</div>}
      {error && <div className="text-red-600 font-semibold">{error}</div>}

      <div>
        <h2 className="text-lg font-semibold">Các đợt thu ({nam})</h2>
        {dotThu.length === 0 && !loading && <div>Không có dữ liệu.</div>}
        {dotThu.length > 0 && (
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left border p-2">Đợt thu</th>
                <th className="text-left border p-2">Tổng tiền</th>
                <th className="text-left border p-2">Số hộ đã nộp</th>
                <th className="border p-2"></th>
              </tr>
            </thead>
            <tbody>
              {dotThu.map((d: any) => (
                <tr key={d.kyThu} className="border-t">
                  <td className="border p-2">{d.kyThu}</td>
                  <td className="border p-2">{d.tongTien?.toLocaleString?.('vi-VN') ?? d.tongTien} đ</td>
                  <td className="border p-2">{d.soHoDaNop ?? d.soHo ?? 0}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => openDotDetails(d.kyThu)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedDot && (
        <div className="mt-4 border p-4 rounded">
          <h3 className="font-medium mb-3">Chi tiết đợt: {selectedDot}</h3>
          {chiTietLoading && <div className="text-gray-600">Đang tải chi tiết...</div>}
          {chiTietHoDaNop && chiTietHoDaNop.length === 0 && (
            <div>Không có hộ nào đã nộp.</div>
          )}
          {chiTietHoDaNop && chiTietHoDaNop.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left border p-2">Mã phiếu</th>
                    <th className="text-left border p-2">Chủ hộ</th>
                    <th className="text-left border p-2">Địa chỉ</th>
                    <th className="text-left border p-2">Tổng tiền</th>
                    <th className="border p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {chiTietHoDaNop.map((pt: any) => (
                    <tr key={pt._id} className="border-t">
                      <td className="border p-2">{pt.maPhieuThu}</td>
                      <td className="border p-2">{pt.tenChuHo}</td>
                      <td className="border p-2">{pt.diaChi}</td>
                      <td className="border p-2">{pt.tongTien?.toLocaleString?.('vi-VN') ?? pt.tongTien} đ</td>
                      <td className="border p-2">
                        <button
                          onClick={() => openHoDetails(pt.hoKhauId?._id ?? pt.hoKhauId)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Xem lịch sử hộ
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

      {lichSuHo && selectedHo && (
        <div className="mt-4 border p-4 rounded">
          <h3 className="font-medium mb-3">Lịch sử nộp tiền hộ: {selectedHo}</h3>
          <div className="mt-2">
            <div className="font-semibold text-green-600">Tổng đã nộp: {lichSuHo.tongKet?.daNop?.toLocaleString?.('vi-VN') ?? 0} đ</div>
            <div className="font-semibold text-red-600">Còn nợ: {lichSuHo.tongKet?.conNo?.toLocaleString?.('vi-VN') ?? 0} đ</div>
          </div>
          <div className="mt-3">
            <h4 className="font-semibold">Danh sách phiếu thu</h4>
            {lichSuHo.danhSachPhieuThu.length === 0 && <div>Không có phiếu thu.</div>}
            {lichSuHo.danhSachPhieuThu.length > 0 && (
              <table className="min-w-full border border-gray-300 mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left border p-2">Mã</th>
                    <th className="text-left border p-2">Ngày</th>
                    <th className="text-left border p-2">Tổng tiền</th>
                    <th className="text-left border p-2">Khoản thu</th>
                  </tr>
                </thead>
                <tbody>
                  {lichSuHo.danhSachPhieuThu.map((pt: any) => (
                    <tr key={pt._id} className="border-t">
                      <td className="border p-2">{pt.maPhieuThu}</td>
                      <td className="border p-2">{new Date(pt.ngayThu).toLocaleDateString('vi-VN')}</td>
                      <td className="border p-2">{pt.tongTien?.toLocaleString?.('vi-VN') ?? pt.tongTien} đ</td>
                      <td className="border p-2">
                        <ul className="list-disc list-inside">
                          {pt.chiTietThu?.map((ct: any, idx: number) => (
                            <li key={idx}>{ct.tenKhoanThu} - {ct.soTien?.toLocaleString?.('vi-VN')} đ</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {lichSuLoading && <div className="text-gray-600">Đang tải lịch sử...</div>}
    </div>
  );
}
