export default function Section2() {
  return (
    <div className="bg-white border-l-4  shadow-lg rounded-lg overflow-hidden animate-fadeIn">
      <div className="bg-blue-50 p-4 border-b">
        <h2 className="text-2xl font-bold ">
          II. Bảo hành tiêu chuẩn
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
                      <span>Sau 30 ngày: Nhặp lại theo thoả thuận</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Additional laptop-specific warranty info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold mb-3 flex items-center">
             
              Bảo hành Laptop
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-gray-500 mr-2">•</span>
                <span>Bảo hành chính hãng từ 12-24 tháng</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-500 mr-2">•</span>
                <span>Bảo hành tại các trung tâm ủy quyền</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-500 mr-2">•</span>
                <span>Hỗ trợ cài đặt phần mềm cơ bản</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center">
             
              Dịch vụ hỗ trợ
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-gray-500 mr-2">•</span>
                <span>Tư vấn kỹ thuật 24/7</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-500 mr-2">•</span>
                <span>Hỗ trợ từ xa qua TeamViewer</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-500 mr-2">•</span>
                <span>Kiểm tra định kỳ miễn phí</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Warranty process */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-4">Quy trình bảo hành tiêu chuẩn</h3>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-col items-center text-center flex-1 min-w-[120px]">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">1</div>
              <span className="text-sm font-medium">Tiếp nhận</span>
            </div>
            <div className="hidden md:block text-blue-400">→</div>
            <div className="flex flex-col items-center text-center flex-1 min-w-[120px]">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">2</div>
              <span className="text-sm font-medium">Kiểm tra</span>
            </div>
            <div className="hidden md:block text-blue-400">→</div>
            <div className="flex flex-col items-center text-center flex-1 min-w-[120px]">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">3</div>
              <span className="text-sm font-medium">Sửa chữa</span>
            </div>
            <div className="hidden md:block text-blue-400">→</div>
            <div className="flex flex-col items-center text-center flex-1 min-w-[120px]">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">4</div>
              <span className="text-sm font-medium">Trả máy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}