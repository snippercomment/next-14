"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/lib/firestore/orders/read";
import { CircularProgress } from "@nextui-org/react";


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

export default function Page() {
  const { user, loading: authLoading } = useAuth();
  
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
  
  return (
    <main className="flex flex-col gap-4 p-5">
      <h1 className="text-2xl font-semibold">Đơn hàng của tôi</h1>
      {(!orders || orders?.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-3 py-11">
          <div className="flex justify-center">
            <img className="h-44" src="/svgs/Empty-pana.svg" alt="" />
          </div>
          <h1>Bạn chưa có đơn hàng nào</h1>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {orders?.map((item, orderIndex) => {
          const totalAmount = calculateTotalAmount(item);
          // Sử dụng hàm chuẩn hóa
          const paymentInfo = getPaymentModeLabel(item?.paymentMode || item?.payment_method);
          const statusInfo = getStatusLabel(item?.status);
          return (
            <div
              key={item.id || orderIndex}
              className="flex flex-col gap-2 border rounded-lg p-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex gap-3 items-center">
                  <h3>#{orderIndex + 1}</h3>
                  <h3 className={`${paymentInfo.color} text-xs rounded-lg px-2 py-1 uppercase font-medium`}>
                    {paymentInfo.text}
                  </h3>
                  <h3 className={`${statusInfo.color} text-xs rounded-lg px-2 py-1 font-medium`}>
                    {statusInfo.text}
                  </h3>
                  <h3 className="text-green-600 font-semibold">
                    {formatPrice(totalAmount)} đ
                  </h3>
                </div>
                <h4 className="text-gray-600 text-xs">
                  {item?.timestampCreate?.toDate()?.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) || item?.createdAt?.toDate()?.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </h4>
              </div>
              <div className="flex flex-col gap-2">
               
                {(item?.line_items || item?.checkout?.line_items)?.map((product, productIndex) => {
                  // Kiểm tra xem đây là COD hay Online payment
                  const isOnlinePayment = item?.paymentMode === 'prepaid' || item?.payment_method === 'card';
                  const unitAmount = product?.price_data?.unit_amount || 0;
                  
                  return (
                    <div
                      key={productIndex}
                      className="flex gap-3 items-center"
                    >
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={product?.price_data?.product_data?.images?.[0]}
                        alt="Hình ảnh sản phẩm"
                      />
                      <div className="flex-1">
                        <h1 className="text-sm font-medium">
                          {product?.price_data?.product_data?.name}
                        </h1>
                        <p className="text-xs text-gray-600">
                          {formatPrice(unitAmount)} đ × {product?.quantity}
                        </p>
                      </div>
                      <strong className="text-sm">
                        {formatPrice(unitAmount * (product?.quantity || 0))} đ
                      </strong>
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