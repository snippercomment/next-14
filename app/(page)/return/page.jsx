'use client';

import React, { useState } from 'react';
import { ChevronDown, Phone, Mail, MessageCircle, Package, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function ReturnExchangePage() {
  const [expandedSection, setExpandedSection] = useState('policy');
  const [selectedProduct, setSelectedProduct] = useState('');

  const returnPolicies = [
    {
      category: 'Điện thoại/  Macbook',
      newCondition: { days: 30, percentage: 20 },
      usedCondition: { days: 30, percentage: 15 },
      outsideStandard: 'Thỏa thuận'
    },
    {
      category: 'Laptop',
      newCondition: { days: 30, percentage: 20 },
      usedCondition: { days: 30, percentage: 'Không áp dụng' },
      outsideStandard: 'Không áp dụng'
    },
    {
      category: 'Phụ kiện < 1 triệu',
      newCondition: { days: 1, percentage: 'Không áp dụng' },
      usedCondition: { days: 30, percentage: 'Không áp dụng' },
      outsideStandard: 'Không áp dụng'
    },
    {
      category: 'Phụ kiện > 1 triệu',
      newCondition: { days: 15, percentage: 'Không áp dụng(*)' },
      usedCondition: { days: 15, percentage: 'Không áp dụng(*)' },
      outsideStandard: 'Không áp dụng(**)'
    },
    {
      category: 'Bảo hành mở rộng',
      newCondition: { days: 15, percentage: 50 },
      usedCondition: { days: 15, percentage: 50},
      outsideStandard: 'Không áp dụng'
    }
  ];

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chính Sách Đổi Trả Hàng</h1>
              
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
              <nav className="space-y-2">
                <button
                  onClick={() => toggleSection('policy')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    expandedSection === 'policy' 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Chính sách đổi trả
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      expandedSection === 'policy' ? 'rotate-180' : ''
                    }`} />
                  </div>
                </button>
                
                <button
                  onClick={() => toggleSection('contact')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    expandedSection === 'contact' 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Liên hệ hỗ trợ
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      expandedSection === 'contact' ? 'rotate-180' : ''
                    }`} />
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Policy Section */}
            {expandedSection === 'policy' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">

                <div className="p-6">
                  {/* Conditions */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Điều kiện hủy giao dịch
                    </h3>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                      <p className="text-gray-700">
                        Khách hàng có thể hủy giao dịch kể từ lúc bấm nút "Đặt hàng" đến trước thời điểm nhận hàng thành công
                      </p>
                    </div>
                  </div>

                  {/* Exchange Methods */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-blue-600" />
                      Phương thức hủy giao dịch
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-gray-700">Sau khi đặt hàng thành công, khi muốn hủy giao dịch, quý khách hàng vui lòng:</p>
                      </div>
                      <div className="ml-6 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>Gọi điện thoại lên tổng đài <strong className="text-blue-600">1800.2097 (Miền Nam)</strong> hoặc <strong className="text-blue-600">1800.2044 (Miền Bắc)</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>Hoặc email đến <strong className="text-blue-600">cskh@discount.com.vn</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MessageCircle className="w-4 h-4" />
                          <span>Hoặc nhắn tin trên fanpage: Discount - Hệ thống bán lẻ di động toàn quốc để báo hủy giao dịch</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-gray-700">Tự chủ nhận hàng và xác nhận hủy mua sản phẩm khi bên vận chuyển giao hàng</p>
                      </div>
                    </div>
                  </div>

                  {/* Policy Table */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Thời gian đổi trả
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Loại sản phẩm</th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold" colSpan="2">
                              Thời gian đổi mới tiêu chuẩn
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold" colSpan="2">
                              Trong thời gian tiêu chuẩn
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold" colSpan="2">
                              Ngoài thời gian tiêu chuẩn
                            </th>
                          </tr>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2"></th>
                            <th className="border border-gray-300 px-2 py-2 text-xs">Mới</th>
                            <th className="border border-gray-300 px-2 py-2 text-xs">Cũ</th>
                            <th className="border border-gray-300 px-2 py-2 text-xs">Mới</th>
                            <th className="border border-gray-300 px-2 py-2 text-xs">Cũ</th>
                            <th className="border border-gray-300 px-2 py-2 text-xs">Mới</th>
                            <th className="border border-gray-300 px-2 py-2 text-xs">Cũ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {returnPolicies.map((policy, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                                {policy.category}
                              </td>
                              <td className="border border-gray-300 px-2 py-3 text-center text-sm">
                                {policy.newCondition.days} ngày
                              </td>
                              <td className="border border-gray-300 px-2 py-3 text-center text-sm">
                                30 ngày
                              </td>
                              <td className="border border-gray-300 px-2 py-3 text-center text-sm">
                                {typeof policy.newCondition.percentage === 'number' 
                                  ? `${policy.newCondition.percentage}%` 
                                  : policy.newCondition.percentage}
                              </td>
                              <td className="border border-gray-300 px-2 py-3 text-center text-sm">
                                {typeof policy.usedCondition.percentage === 'number' 
                                  ? `${policy.usedCondition.percentage}% ` 
                                  : policy.usedCondition.percentage}
                              </td>
                              <td className="border border-gray-300 px-2 py-3 text-center text-sm">
                                {policy.outsideStandard}
                              </td>
                              <td className="border border-gray-300 px-2 py-3 text-center text-sm">
                                {policy.outsideStandard}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">(*)</span> Airpod nhận trả từ 20%.</p>
                      <p><span className="font-medium">(**)</span> Airpod nhận theo giá thỏa thuận.</p>
                    
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {expandedSection === 'contact' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-green-50 border-b">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    Liên Hệ Hỗ Trợ
                  </h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                        <Phone className="w-6 h-6 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Hotline Miền Nam</h3>
                          <p className="text-blue-600 font-medium">1800.2097</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                        <Phone className="w-6 h-6 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Hotline Miền Bắc</h3>
                          <p className="text-blue-600 font-medium">1800.2044</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                        <Mail className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Email hỗ trợ</h3>
                          <p className="text-green-600 font-medium">cskh@discount.com.vn</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-purple-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Facebook</h3>
                          <p className="text-purple-600 font-medium">Discount - Hệ thống bán lẻ di động toàn quốc</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Lưu ý quan trọng</h4>
                        <p className="text-yellow-700 mt-1">
                          Vui lòng liên hệ với chúng tôi trong thời gian sớm nhất để được hỗ trợ tốt nhất. 
                          Chính sách đổi trả có thể thay đổi tùy theo từng sản phẩm và thời điểm.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}