'use client';

import React, { useState } from 'react';
import { 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Clock, 
  Shield, 
  RefreshCw,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const DeliveryPolicyPage = () => {
  const [activeTab, setActiveTab] = useState('order');

  const paymentMethods = [
    { name: 'Thanh toán khi nhận hàng', icon: '💵' },
    { name: 'Thẻ tín dụng/ATM', icon: '💳' },
    
  ];

  const deliveryZones = [
    {
      zone: 'TP.HCM & Hà Nội',
      inner: 'Giao nhanh 2 giờ (<10km) hoặc 24h',
      outer: 'Trong vòng 24h'
    },
    {
      zone: 'Các tỉnh có cửa hàng',
      inner: 'Trong vòng 24h',
      outer: '1-2 ngày'
    },
    {
      zone: 'Khu vực khác',
      inner: '2-4 ngày',
      outer: '2-4 ngày'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">          
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Hướng Dẫn Mua Hàng Từ Xa</h1>
            
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            {[
              { id: 'order', label: 'Đặt Hàng', icon: ShoppingCart },
              { id: 'payment', label: 'Thanh Toán', icon: CreditCard },
              { id: 'delivery', label: 'Giao Hàng', icon: Truck },
              { id: 'policy', label: 'Chính Sách', icon: Shield }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'order' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Phone className="w-6 h-6 mr-3" />
                  Cách Đặt Hàng
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Online</h3>
                    <p>Đặt hàng trực tiếp trên website</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Tổng đài</h3>
                    <p>Gọi miễn phí: 18002097</p>
                  </div>
                
                </div>
              </div>

              
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3" />
                  Phương Thức Thanh Toán
                </h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="bg-white/20 backdrop-blur-sm p-3 rounded-lg text-center">
                      <div className="text-2xl mb-2">{method.icon}</div>
                      <p className="text-sm">{method.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">Phí Vận Chuyển</h3>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <p>Dưới 300.000đ: Phí 15.000đ</p>
                      <p>Từ 300.000đ: Miễn phí</p>
                    </div>
                  </div>
                </div>

               
              </div>

              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                <h4 className="font-semibold text-orange-800 mb-2">Cú pháp chuyển khoản:</h4>
                <p className="font-mono bg-white p-2 rounded text-center">
                  Mã đơn hàng - SĐT người mua - Tên khách hàng
                </p>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Truck className="w-6 h-6 mr-3" />
                  Thời Gian Giao Hàng
                </h2>
                <div className="space-y-4">
                  {deliveryZones.map((zone, index) => (
                    <div key={index} className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">{zone.zone}</h3>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Nội thành:</span> {zone.inner}
                        </div>
                        <div>
                          <span className="font-medium">Ngoại thành:</span> {zone.outer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold text-green-800">Quy Định Giao Hàng</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>• Đơn hàng xác nhận trước 15h30</p>
                    <p>• Không giao Chủ nhật và ngày Lễ</p>
                    <p>• Kiểm tra CCCD với đơn ≥10 triệu</p>
                    <p>• Mã OTP cho đơn trả trước ≥2 triệu</p>
                  </div>
                </div>

                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <MapPin className="w-6 h-6 text-red-600" />
                    <h3 className="text-xl font-bold text-red-800">Thông Tin Cần Thiết</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>• Tên người nhận</p>
                    <p>• Địa chỉ chi tiết</p>
                    <p>• Số điện thoại</p>
                    <p>• Ghi chú xuất hóa đơn (nếu có)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-3" />
                  Chính Sách Đổi Trả
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <RefreshCw className="w-5 h-5" />
                      <h3 className="font-semibold">Thời Gian Đổi</h3>
                    </div>
                    <p className="text-sm">Trong vòng 35 ngày từ ngày xuất bán</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <h3 className="font-semibold">Bảo Hành</h3>
                    </div>
                    <p className="text-sm">Hỗ trợ vận chuyển trong 15 ngày đầu</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <h3 className="text-xl font-bold text-yellow-800 mb-4">⏰ Thời Gian Hoàn Tiền</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-semibold">Tiền mặt</p>
                      <p className="text-sm text-gray-600">Hoàn ngay tại cửa hàng</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-semibold">Thẻ tín dụng</p>
                      <p className="text-sm text-gray-600">7-15 ngày làm việc</p>
                    </div>                 
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>      
      </div>
    </div>
  );
};

export default DeliveryPolicyPage;