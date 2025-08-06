"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/lib/firestore/orders/read";
import { updateOrder } from "@/lib/firestore/orders/write";
import { CircularProgress } from "@nextui-org/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";

const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

// Tính tổng tiền đơn hàng
const calculateTotalAmount = (item) => {
  if (item?.total_amount) return item.total_amount;
  
  const lineItems = item?.line_items || item?.checkout?.line_items;
  if (!lineItems?.length) return 0;

  return lineItems.reduce((total, curr) => {
    const unitAmount = curr?.price_data?.unit_amount || 0;
    return total + (unitAmount * (curr?.quantity || 0));
  }, 0);
};

// Labels cho phương thức thanh toán
const getPaymentModeLabel = (mode) => {
  const labels = {
    'prepaid': { text: 'Trực tuyến', color: 'bg-blue-100 text-blue-600' },
    'cod': { text: 'COD', color: 'bg-orange-100 text-orange-600' },
  };
  return labels[mode] || { text: 'COD', color: 'bg-orange-100 text-orange-600' };
};

// Labels cho trạng thái đơn hàng
const getStatusLabel = (status) => {
  const labels = {
    'pending': { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-600' },
    'confirmed': { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-600' },
    'shipped': { text: 'Đang vận chuyển', color: 'bg-purple-100 text-purple-600' },
    'delivered': { text: 'Đã giao hàng', color: 'bg-green-100 text-green-600' },
    'cancelled': { text: 'Đã hủy', color: 'bg-red-100 text-red-600' },
  };
  return labels[status] || { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-600' };
};

// Tabs trạng thái
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
  const [cancellingOrders, setCancellingOrders] = useState(new Set());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  
  const { data: orders, error, isLoading, mutate } = useOrders({ uid: user?.uid });

  // Function để set date range - THÊM FUNCTION NÀY
  const setDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (days === 'all') {
      setStartDate('2020-01-01');
      setEndDate(endDate.toISOString().split('T')[0]);
    } else {
      startDate.setDate(endDate.getDate() - days);
      setStartDate(startDate.toISOString().split('T')[0]);
      setEndDate(endDate.toISOString().split('T')[0]);
    }
  };

  // Hiển thị modal xác nhận hủy
  const showCancelConfirm = (orderId) => {
    setOrderToCancel(orderId);
    setShowCancelModal(true);
  };

  // Hủy đơn hàng
  const handleCancelOrder = async () => {
  if (!orderToCancel) return;
  try {
    setCancellingOrders(prev => new Set(prev).add(orderToCancel));   
    await updateOrder(orderToCancel, {
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date()
    });
    setShowCancelModal(false);
    mutate();
    toast.success("Đã hủy đơn hàng thành công");
    
  } catch (error) {
    console.error("Cancel order error:", error);
    toast.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
  } finally {
    setCancellingOrders(prev => {
      const newSet = new Set(prev);
      newSet.delete(orderToCancel);
      return newSet;
    });
    setOrderToCancel(null);
  }
};
  // Loading states
  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center py-48">
        <CircularProgress />
      </div>
    );
  }
  
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
  // Lọc đơn hàng
  const filteredOrders = orders?.filter(order => {
    // Lọc theo trạng thái
    if (activeTab !== 'all') {
      const status = order?.status;
      const statusMatches = {
        'pending': status === 'pending',
        'confirmed': status === 'confirmed' || status === 'processing',
        'shipped': status === 'shipped',
        'delivered': ['delivered', 'completed', 'succeeded'].includes(status),
        'cancelled': status === 'cancelled'
      };
      
      if (!statusMatches[activeTab]) return false;
    }
    // Lọc theo ngày
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
  // Quick date setters
  const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };
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
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
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

      {/* Date Filter */}
      <div className="relative">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>Lịch sử mua hàng</span>
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 hover:text-gray-800 transition-colors p-2 hover:bg-gray-50 rounded border"
          >
            <span>{new Date(startDate).toLocaleDateString('vi-VN')}</span>
            <span>→</span>
            <span>{new Date(endDate).toLocaleDateString('vi-VN')}</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-10 z-10"
              onClick={() => setShowDatePicker(false)}
            />
            
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-20 min-w-80">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Chọn khoảng thời gian</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                {/* Quick Select */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: '7 ngày qua', value: 7 },
                    { label: '30 ngày qua', value: 30 },
                    { label: 'Năm nay', value: getDayOfYear(new Date()) },
                    { label: 'Tất cả', value: 'all' }
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setDateRange(option.value)}
                      className="px-2 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold mb-4">Xác nhận hủy đơn hàng</h3>
              <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Không
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Có, hủy đơn
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {(!filteredOrders || filteredOrders?.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
          <Link href="/" className="text-red-500 hover:text-red-600 font-medium">
            Trang chủ
          </Link>
        </div>
      )}
      
      {/* Orders List */}
      <div className="flex flex-col gap-4">
        {filteredOrders?.map((item, orderIndex) => {
          const totalAmount = calculateTotalAmount(item);
          const paymentInfo = getPaymentModeLabel(item?.paymentMode || item?.payment_method);
          const statusInfo = getStatusLabel(item?.status);
          const canCancel = item?.status === 'pending';
          const isCancelling = cancellingOrders.has(item.id);
          
          return (
            <div
              key={item.id || orderIndex}
              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="font-medium">#{orderIndex + 1}</span>
                  <span className={`${paymentInfo.color} text-xs rounded-full px-2 py-1 uppercase font-medium`}>
                    {paymentInfo.text}
                  </span>
                  <span className={`${statusInfo.color} text-xs rounded-full px-2 py-1 font-medium`}>
                    {statusInfo.text}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-green-600 font-semibold text-lg">
                    {formatPrice(totalAmount)} đ
                  </div>
                  
                  {/* Cancel Button - Improved Design */}
                  {canCancel && (
                    <button
                      onClick={() => showCancelConfirm(item.id)}
                      disabled={isCancelling}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-full hover:bg-red-50 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      {isCancelling ? (
                        <>
                          <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          <span>Đang hủy...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Hủy đơn</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="text-gray-500 text-sm mb-3">
                {(item?.timestampCreate?.toDate() || item?.createdAt?.toDate())?.toLocaleDateString('vi-VN', {
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
                    <div key={productIndex} className="flex items-center gap-3">
                      <img
                        className="h-12 w-12 rounded-lg object-cover border"
                        src={product?.price_data?.product_data?.images?.[0]}
                        alt={product?.price_data?.product_data?.name || "Sản phẩm"}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm line-clamp-1">
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