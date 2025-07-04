"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/lib/firestore/orders/read";
import { CircularProgress } from "@nextui-org/react";
import Link from "next/link";
import { useState } from "react";

const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

// Hàm tính tổng tiền 
const calculateTotalAmount = (item) => {
  if (item?.total_amount) {
    return item.total_amount;
  }
  const lineItems = item?.line_items || item?.checkout?.line_items;
  
  if (!lineItems?.length) {
    return 0;
  }

  // Kiểm tra phương thức thanh toán
  const isOnlinePayment = item?.paymentMode === 'prepaid' || 
                         item?.paymentMode === 'online' || 
                         item?.payment_method === 'card';

  return lineItems.reduce((total, curr) => {
    let unitAmount = curr?.price_data?.unit_amount || 0;
    
    if (isOnlinePayment && unitAmount > 1000) {
      unitAmount = unitAmount;
    }
    
    return total + (unitAmount * (curr?.quantity || 0));
  }, 0);
};

// 
const getPaymentModeLabel = (mode) => {
  const labels = {
    'prepaid': { text: 'Trực tuyến', color: 'bg-blue-100 text-blue-500' },
    'cod': { text: 'COD', color: 'bg-orange-100 text-orange-500' },
    'online': { text: 'Trực tuyến', color: 'bg-blue-100 text-blue-500' },
    'cash': { text: 'Tiền mặt', color: 'bg-yellow-100 text-yellow-500' },
    'card': { text: 'Trực tuyến', color: 'bg-blue-100 text-blue-500' }
  };
  return labels[mode] || { text: 'COD', color: 'bg-orange-100 text-orange-500' };
};

// Chuẩn hóa trạng thái đơn hàng
const getStatusLabel = (status) => {
  const labels = {
    'pending': { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-500' },
    'confirmed': { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-500' },
    'shipped': { text: 'Đang giao hàng', color: 'bg-purple-100 text-purple-500' },
    'delivered': { text: 'Đã giao hàng', color: 'bg-green-100 text-green-500' },
    'cancelled': { text: 'Đã hủy', color: 'bg-red-100 text-red-500' },
    // Xử lý trạng thái cũ
    'processing': { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-500' },
    'completed': { text: 'Đã giao hàng', color: 'bg-green-100 text-green-500' },
    'succeeded': { text: 'Đã giao hàng', color: 'bg-green-100 text-green-500' }
  };
  
  return labels[status] || { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-500' };
};

// Định nghĩa các tabs
const statusTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'shipped', label: 'Đang vận chuyển' },
  { key: 'delivered', label: 'Đã giao hàng' },
  { key: 'cancelled', label: 'Đã hủy' }
];

export default function Page() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [startDate, setStartDate] = useState('2020-12-01');
  const [endDate, setEndDate] = useState('2025-06-17');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const { data: orders, error, isLoading } = useOrders({ uid: user?.uid });

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center py-48">
        <CircularProgress />
      </div>
    );
  }
  
  // Nếu user chưa đăng nhập
  if (!user) {
    return (
      <div className="flex justify-center py-48">
        <p>Vui lòng đăng nhập để xem đơn hàng của bạn</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center py-48">
        <p className="text-red-500">Lỗi khi tải đơn hàng: {error}</p>
      </div>
    );
  }

  // Lọc đơn hàng theo tab và date range
  const filteredOrders = orders?.filter(order => {
    // Filter by status
    if (activeTab !== 'all') {
      const status = order?.status;
      let statusMatch = false;
      
      switch (activeTab) {
        case 'pending':
          statusMatch = status === 'pending';
          break;
        case 'confirmed':
          statusMatch = status === 'confirmed' || status === 'processing';
          break;
        case 'shipped':
          statusMatch = status === 'shipped';
          break;
        case 'delivered':
          statusMatch = status === 'delivered' || status === 'completed' || status === 'succeeded';
          break;
        case 'cancelled':
          statusMatch = status === 'cancelled';
          break;
        default:
          statusMatch = true;
      }
      
      if (!statusMatch) return false;
    }
    
    // Filter by date range
    const orderDate = order?.timestampCreate?.toDate() || order?.createdAt?.toDate();
    if (orderDate) {
      const startDateTime = new Date(startDate).getTime();
      const endDateTime = new Date(endDate).setHours(23, 59, 59, 999);
      const orderDateTime = orderDate.getTime();
      
      if (orderDateTime < startDateTime || orderDateTime > endDateTime) {
        return false;
      }
    }
    
    return true;
  }) || [];
  
  return (
    <main className="flex flex-col gap-4 p-5">
      <h1 className="text-2xl font-semibold">Đơn hàng của tôi</h1>
      
      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="relative">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>Lịch sử mua hàng</span>
          <div 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 hover:text-gray-800 transition-colors cursor-pointer p-2 hover:bg-gray-50 rounded border"
          >
            <span>{new Date(startDate).toLocaleDateString('vi-VN')}</span>
            <span>→</span>
            <span>{new Date(endDate).toLocaleDateString('vi-VN')}</span>
            <div className="w-6 h-6 border border-gray-400 rounded flex items-center justify-center ml-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-10 z-10"
              onClick={() => setShowDatePicker(false)}
            ></div>
            
            {/* Modal */}
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-20 min-w-80">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-gray-800">Chọn khoảng thời gian</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                {/* Quick Select Buttons */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                      setStartDate(lastWeek.toISOString().split('T')[0]);
                      setEndDate(today.toISOString().split('T')[0]);
                    }}
                    className="px-2 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    7 ngày qua
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                      setStartDate(lastMonth.toISOString().split('T')[0]);
                      setEndDate(today.toISOString().split('T')[0]);
                    }}
                    className="px-2 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    30 ngày qua
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const thisYear = new Date(today.getFullYear(), 0, 1);
                      setStartDate(thisYear.toISOString().split('T')[0]);
                      setEndDate(today.toISOString().split('T')[0]);
                    }}
                    className="px-2 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Năm nay
                  </button>
                  <button
                    onClick={() => {
                      setStartDate('2020-12-01');
                      setEndDate('2025-06-17');
                    }}
                    className="px-2 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Tất cả
                  </button>
                </div>
                
                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Orders List */}
      {(!filteredOrders || filteredOrders?.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                </svg>
              </div>
            </div>
          </div>
          <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
         <Link href="/"> <button className="text-red-500 hover:text-red-600">Trang chủ</button></Link>
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        {filteredOrders?.map((item, orderIndex) => {
          const totalAmount = calculateTotalAmount(item);
          const paymentInfo = getPaymentModeLabel(item?.paymentMode || item?.payment_method);
          const statusInfo = getStatusLabel(item?.status);
          
          return (
            <div
              key={item.id || orderIndex}
              className="border rounded-lg p-4 bg-white"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="font-medium">#{orderIndex + 1}</span>
                  <span className={`${paymentInfo.color} text-xs rounded px-2 py-1 uppercase font-medium`}>
                    {paymentInfo.text}
                  </span>
                  <span className={`${statusInfo.color} text-xs rounded px-2 py-1 font-medium`}>
                    {statusInfo.text}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-semibold text-lg">
                    {formatPrice(totalAmount)} đ
                  </div>
                </div>
              </div>

              {/* Order Date */}
              <div className="text-gray-500 text-sm mb-3">
                {item?.timestampCreate?.toDate()?.toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                }) || item?.createdAt?.toDate()?.toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit', 
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>

              {/* Products */}
              <div className="space-y-3">
                {(item?.line_items || item?.checkout?.line_items)?.map((product, productIndex) => {
                  const unitAmount = product?.price_data?.unit_amount || 0;
                  
                  return (
                    <div
                      key={productIndex}
                      className="flex items-center gap-3"
                    >
                      <img
                        className="h-12 w-12 rounded-lg object-cover border"
                        src={product?.price_data?.product_data?.images?.[0]}
                        alt="Hình ảnh sản phẩm"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">
                          {product?.price_data?.product_data?.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatPrice(unitAmount)} đ × {product?.quantity}
                        </p>
                      </div>
                      <div className="text-right font-semibold">
                        {formatPrice(unitAmount * (product?.quantity || 0))} đ
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}