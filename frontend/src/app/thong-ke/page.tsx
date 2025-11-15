"use client";

export default function ThongKePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Thống kê & Báo cáo
        </h1>
        <p className="text-gray-600">
          Xem các báo cáo chi tiết và thống kê tổng quan
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">🏠</div>
            <div className="text-right">
              <p className="text-3xl font-bold">1,234</p>
              <p className="text-sm opacity-90">Hộ khẩu</p>
            </div>
          </div>
          <div className="text-sm opacity-90">↑ 12% so với tháng trước</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">👥</div>
            <div className="text-right">
              <p className="text-3xl font-bold">4,567</p>
              <p className="text-sm opacity-90">Nhân khẩu</p>
            </div>
          </div>
          <div className="text-sm opacity-90">↑ 8% so với tháng trước</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">💰</div>
            <div className="text-right">
              <p className="text-3xl font-bold">45M</p>
              <p className="text-sm opacity-90">Thu tháng này</p>
            </div>
          </div>
          <div className="text-sm opacity-90">↑ 15% so với tháng trước</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">📊</div>
            <div className="text-right">
              <p className="text-3xl font-bold">92%</p>
              <p className="text-sm opacity-90">Tỷ lệ đóng phí</p>
            </div>
          </div>
          <div className="text-sm opacity-90">↑ 5% so với tháng trước</div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📈 Biểu đồ dân số theo độ tuổi
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Biểu đồ sẽ được hiển thị ở đây</p>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            💵 Biểu đồ thu phí theo tháng
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Biểu đồ sẽ được hiển thị ở đây</p>
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📋 Báo cáo có sẵn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-gray-800 mb-1">
              Báo cáo hộ khẩu
            </h4>
            <p className="text-sm text-gray-600">
              Thống kê chi tiết về hộ khẩu
            </p>
          </button>

          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left">
            <div className="text-2xl mb-2">👨‍👩‍👧‍👦</div>
            <h4 className="font-semibold text-gray-800 mb-1">
              Báo cáo nhân khẩu
            </h4>
            <p className="text-sm text-gray-600">
              Thống kê dân số theo các tiêu chí
            </p>
          </button>

          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition text-left">
            <div className="text-2xl mb-2">💰</div>
            <h4 className="font-semibold text-gray-800 mb-1">
              Báo cáo thu phí
            </h4>
            <p className="text-sm text-gray-600">
              Chi tiết các khoản thu và tỷ lệ đóng góp
            </p>
          </button>

          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left">
            <div className="text-2xl mb-2">📝</div>
            <h4 className="font-semibold text-gray-800 mb-1">
              Báo cáo phiếu thu
            </h4>
            <p className="text-sm text-gray-600">Thống kê phiếu thu theo kỳ</p>
          </button>

          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition text-left">
            <div className="text-2xl mb-2">📉</div>
            <h4 className="font-semibold text-gray-800 mb-1">
              Báo cáo công nợ
            </h4>
            <p className="text-sm text-gray-600">Danh sách hộ chưa đóng phí</p>
          </button>

          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
            <div className="text-2xl mb-2">📈</div>
            <h4 className="font-semibold text-gray-800 mb-1">
              Báo cáo tổng hợp
            </h4>
            <p className="text-sm text-gray-600">Tổng hợp tất cả các chỉ số</p>
          </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-xl font-bold mb-2">📥 Xuất báo cáo</h3>
        <p className="mb-4 opacity-90">
          Tải xuống các báo cáo dưới dạng Excel hoặc PDF
        </p>
        <div className="flex space-x-4">
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
            📊 Xuất Excel
          </button>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
            📄 Xuất PDF
          </button>
        </div>
      </div>
    </div>
  );
}
