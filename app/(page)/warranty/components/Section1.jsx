export default function Section1() {
  return (
    <div className="bg-white border-l-4  shadow-lg rounded-lg overflow-hidden animate-fadeIn">
      <div className="bg-red-50 p-4 border-b">
        <h2 className="text-2xl font-bold">
          I. Đổi mới 30 ngày miễn phí
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
            {/* dien thoai */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="p-4 border border-gray-300 font-medium">
                  Điện thoại / Macbook
                </td>
                <td className="p-4 text-center font-bold text-green-500 border border-gray-300">
                  30 ngày
                </td>
                <td className="p-4 text-sm border border-gray-300">
                  <div className="space-y-2">
                    <div className="flex items-start">                    
                      <span>Trong 30 ngày đầu nhặp lại máy, trừ phí <strong className="text-green-500">20%</strong> trên giá hiện tại (hoặc giá mua nếu giá mua thấp hơn giá hiện tại)</span>
                    </div>
                    <div className="flex items-start">                   
                      <span>Sau 30 ngày nhặp lại máy theo giá thoả thuận</span>
                    </div>
                  </div>
                </td>
              </tr>
              {/* laptop */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="p-4 border border-gray-300 font-medium">
                 Laptop
                </td>
                <td className="p-4 text-center font-bold text-green-500 border border-gray-300">
                  30 ngày
                </td>
                <td className="p-4 text-sm border border-gray-300">
                  <div className="space-y-2">
                    <div className="flex items-start">
                     
                      <span>Trong 30 ngày đầu nhặp lại máy, trừ phí <strong className="text-green-500">20%</strong> trên giá hiện tại (hoặc giá mua nếu giá mua thấp hơn giá hiện tại)</span>
                    </div>
                    <div className="flex items-start">
                   
                      <span>Sau 30 ngày nhặp lại máy theo giá thoả thuận</span>
                    </div>
                  </div>
                </td>
              </tr>
                {/* tai nghe */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="p-4 border border-gray-300 font-medium">
                 Tai nghe cao cấp
                </td>
                <td className="p-4 text-center font-bold text-green-500 border border-gray-300">
                  15 ngày
                </td>
                <td className="p-4 text-sm border border-gray-300">
                  <div className="space-y-2">
                    <div className="flex items-start">
                     
                      <span>Trong 30 ngày đầu nhặp lại máy, trừ phí <strong className="text-green-500">40%</strong> trên giá hiện tại (hoặc giá mua nếu giá mua thấp hơn giá hiện tại)</span>
                    </div>
                    <div className="flex items-start">
                     
                      <span>Từ 31 - 60 ngày: Nhập lại trừ phí   <strong className="text-green-500">50%</strong> trên giá mua ban đầu</span>
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
        
        {/* Additional Info for Section 1 */}
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <h3 className="font-bold text-red-700 mb-3 flex items-center">
            Lưu ý đặc biệt cho chính sách đổi mới 30 ngày
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Sản phẩm phải còn nguyên seal, chưa kích hoạt bảo hành</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Áp dụng cho khách hàng mua lần đầu tại CellphoneS</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Không áp dụng cho sản phẩm khuyến mãi đặc biệt</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}