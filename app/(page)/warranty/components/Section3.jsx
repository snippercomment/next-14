export default function Section3() {
  return (
    <div className="bg-white border-l-4 shadow-lg rounded-lg overflow-hidden animate-fadeIn">
      <div className="bg-green-50 p-4 border-b">
        <h2 className="text-2xl font-bold">
          III. Bảo hành mở rộng
        </h2>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-green-100">
              <tr>
                <th className="p-4 text-left font-semibold border border-gray-300">Loại sản phẩm</th>
                <th className="p-4 text-left font-semibold border border-gray-300">Đổi mới miễn phí (*)</th>
                <th className="p-4 text-left font-semibold border border-gray-300">Quy định nhặp lại, trả lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="p-4 border border-gray-300 font-medium">
                  Màn hình máy tính
                </td>
                <td className="p-4 text-center font-bold text-green-500 border border-gray-300">
                  15 ngày
                </td>
                <td className="p-4 text-sm border border-gray-300">
                  <div className="space-y-2">
                    <div className="flex items-start">
                    
                      <span>Trong 15 ngày đầu nhặp lại máy, trừ phí <strong className="text-green-500">20%</strong> trên giá hiện tại (hoặc giá mua nếu giá mua thấp hơn giá hiện tại)</span>
                    </div>
                    <div className="flex items-start">
                     
                      <span>Sau 15 ngày nhặp lại máy theo giá thoả thuận</span>
                    </div>
                  </div>
                </td>
              </tr>
              
              <tr className="hover:bg-gray-50 transition-colors bg-yellow-50">
                <td className="p-4 border border-gray-300 font-medium">
                  Tai nghe cao cấp
                </td>
                <td className="p-4 text-center font-bold text-green-500 border border-gray-300">
                  15 ngày
                </td>
                <td className="p-4 text-sm border border-gray-300">
                  <div className="space-y-2">
                    <div className="flex items-start">                    
                      <span>Trong 30 ngày đầu: Nhặp lại trừ phí <strong className="text-green-500">40%</strong> trên giá mua ban đầu</span>
                    </div>
                    <div className="flex items-start">                   
                      <span>Từ 31 - 60 ngày: Nhặp lại trừ phí <strong className="text-green-500">50%</strong> trên giá mua ban đầu</span>
                    </div>
                    <div className="flex items-start">                     
                      <span className="text-red-600 font-medium">Lưu ý: Quá 60 ngày tính từ ngày mua ban đầu, không áp dụng chính sách này</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Extended warranty packages */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-green-700 mb-3 flex items-center">
             
              Gói Cơ Bản
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Bảo hành 12 tháng</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Hỗ trợ kỹ thuật</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Đổi mới trong 15 ngày</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-blue-700 mb-3 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Gói Nâng Cao
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Bảo hành 24 tháng</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Hỗ trợ 24/7</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Bảo vệ rơi vỡ 1 lần</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Thu cũ đổi mới ưu đãi</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-purple-700 mb-3 flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              Gói VIP
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>Bảo hành 36 tháng</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>Hỗ trợ ưu tiên</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>Bảo vệ toàn diện</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>Đổi máy mới 100%</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>Tận nơi lấy - giao</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Special notes for extended warranty */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <h3 className="font-bold text-green-800 mb-4">Điều kiện áp dụng bảo hành mở rộng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ Được áp dụng:</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Lỗi kỹ thuật từ nhà sản xuất</li>
                <li>• Hỏng hóc trong quá trình sử dụng bình thường</li>
                <li>• Sản phẩm còn trong thời hạn bảo hành</li>
                <li>• Có đầy đủ chứng từ mua hàng</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700 mb-2">❌ Không áp dụng:</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Hỏng do tác động vật lý</li>
                <li>• Ngấm nước, ẩm ướt</li>
                <li>• Tự ý sửa chữa, can thiệp</li>
                <li>• Hết thời hạn bảo hành</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Audio equipment specific warranty */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4">
          <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">🎧</span>
            Chính sách đặc biệt cho Tai nghe cao cấp
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600 mb-1">0-30 ngày</div>
              <div className="text-sm text-gray-600">Nhập lại trừ phí 40%</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-orange-600 mb-1">31-60 ngày</div>
              <div className="text-sm text-gray-600">Nhập lại trừ phí 50%</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-red-600 mb-1">60+ ngày</div>
              <div className="text-sm text-gray-600">Không áp dụng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}