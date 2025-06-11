"use client";

import { useOrder } from "@/lib/firestore/orders/read";
import { CircularProgress } from "@nextui-org/react";
import { useParams } from "next/navigation";
import ChangeOrderStatus from "./components/ChangeStatus";

// Format tiền tệ VND
const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

// Hàm tính tổng tiền dựa trên phương thức thanh toán
const calculateTotalAmount = (order) => {
  if (order?.total_amount) {
    return order.total_amount;
  }

  const lineItems = order?.line_items || order?.checkout?.line_items;
  if (!lineItems?.length) {
    return 0;
  }

  const isOnlinePayment = order?.paymentMode === 'prepaid' || 
                         order?.paymentMode === 'online' || 
                         order?.payment_method === 'card';

  return lineItems.reduce((total, curr) => {
    let unitAmount = curr?.price_data?.unit_amount || 0;
    
    if (isOnlinePayment && unitAmount > 1000) {
      unitAmount = unitAmount;
    }
    
    return total + (unitAmount * curr?.quantity);
  }, 0);
};

// Hàm lấy địa chỉ từ nhiều nguồn khác nhau
const getOrderAddress = (order) => {
  if (order?.checkout?.metadata?.address) {
    try {
      return JSON.parse(order.checkout.metadata.address);
    } catch (e) {
      console.log('Error parsing checkout address:', e);
    }
  }
  
  if (order?.address) {
    return order.address;
  }
  
  if (order?.shipping_address) {
    return order.shipping_address;
  }
  
  if (order?.customer_details) {
    return order.customer_details;
  }
  
  return {};
};

// Hàm tính giá từng sản phẩm
const calculateProductPrice = (product, isOnlinePayment) => {
  let unitAmount = product?.price_data?.unit_amount || 0;
  
  if (isOnlinePayment && unitAmount > 1000) {
    unitAmount = unitAmount;
  }
  
  return unitAmount;
};

export default function Page() {
  const { orderId } = useParams();
  const { data: order, error, isLoading } = useOrder({ id: orderId });

  if (isLoading) {
    return (
      <div className="flex justify-center py-48">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <>{error}</>;
  }

  const totalAmount = calculateTotalAmount(order);
  const address = getOrderAddress(order);
  
  const isOnlinePayment = order?.paymentMode === 'prepaid' || 
                         order?.paymentMode === 'online' || 
                         order?.payment_method === 'card';
  
  const lineItems = order?.line_items || order?.checkout?.line_items || [];
// phuong thức thanh toán
  const getPaymentModeLabel = (mode) => {
    const labels = {
      'prepaid': 'Thanh toán trực tuyến',
      'cod': 'Thanh toán khi nhận hàng (COD)',
      'online': 'Thanh toán trực tuyến',
      'cash': 'Thanh toán tiền mặt'
    };
    return labels[mode] || 'Thanh toán khi nhận hàng (COD)';
  };

  // Chuẩn hóa trạng thái đơn hàng
  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'shipped': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy',
      // Xử lý trạng thái cũ
      'processing': 'Đã xác nhận',
      'completed': 'Đã giao hàng',
      'succeeded': 'Đã giao hàng'
    };
    return labels[status] || 'Chờ xử lý';
  };

  // Lấy màu sắc cho trạng thái
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-600',
      'confirmed': 'bg-blue-100 text-blue-600',
      'shipped': 'bg-purple-100 text-purple-600',
      'delivered': 'bg-green-100 text-green-600',
      'cancelled': 'bg-red-100 text-red-600',
      // Xử lý trạng thái cũ
      'processing': 'bg-blue-100 text-blue-600',
      'completed': 'bg-green-100 text-green-600',
      'succeeded': 'bg-green-100 text-green-600'
    };
    return colors[status] || 'bg-yellow-100 text-yellow-600';
  };

  return (
    <main className="flex flex-col gap-4 p-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Chi tiết đơn hàng</h1>
        <ChangeOrderStatus order={order} />
      </div>
      
      <div className="flex flex-col gap-2 border rounded-lg p-4 bg-white">
        <div className="flex flex-col gap-2">
          <div className="flex gap-3 items-center">
            <h3 className="bg-blue-100 text-blue-600 text-xs rounded-lg px-2 py-1">
              {getPaymentModeLabel(order?.paymentMode)}
            </h3>
            <h3 className={`${getStatusColor(order?.status)} text-xs rounded-lg px-2 py-1`}>
              {getStatusLabel(order?.status)}
            </h3>
            <h3 className="text-green-600 font-semibold">
              {formatPrice(totalAmount || 0)} đ
            </h3>
          </div>
          <h4 className="text-gray-600 text-xs">
            Ngày tạo: {(order?.timestampCreate || order?.createdAt)?.toDate()?.toLocaleString('vi-VN')}
          </h4>
        </div>
        
        <div className="flex flex-col gap-3 mt-4">
          <h2 className="font-semibold text-lg">Sản phẩm đã đặt:</h2>
          {lineItems?.length > 0 ? (
            lineItems.map((product, index) => {
              const unitAmount = calculateProductPrice(product, isOnlinePayment);
              
              return (
                <div className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg" key={index}>
                  <img
                    className="h-12 w-12 rounded-lg object-cover"
                    src={product?.price_data?.product_data?.images?.[0] || '/placeholder-image.png'}
                    alt="Product Image"
                  />
                  <div className="flex-1">
                    <h1 className="font-medium">
                      {product?.price_data?.product_data?.name || 'Tên sản phẩm'}
                    </h1>
                    <h1 className="text-gray-500 text-sm">
                      {formatPrice(unitAmount)} đ × {product?.quantity?.toString()}
                    </h1>
                  </div>
                  <div className="text-right font-semibold">
                    {formatPrice(unitAmount * product?.quantity)} đ
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-gray-500 text-center py-4">
              Không có thông tin sản phẩm
            </div>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-semibold">Địa chỉ giao hàng</h1>
      <div className="flex flex-col gap-2 border rounded-lg p-4 bg-white">
        <table className="w-full">
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-medium text-gray-700 w-1/3">Họ và tên:</td>
              <td className="py-2">{address?.fullName || address?.name || address?.customer_name || 'Chưa cập nhật'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium text-gray-700">Số điện thoại:</td>
              <td className="py-2">{address?.mobile || address?.phone || address?.phoneNumber || 'Chưa cập nhật'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium text-gray-700">Email:</td>
              <td className="py-2">{address?.email || order?.customer_email || 'Chưa cập nhật'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium text-gray-700">Địa chỉ 1:</td>
              <td className="py-2">{address?.addressLine1 || address?.address || address?.street || 'Chưa cập nhật'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium text-gray-700">Địa chỉ 2:</td>
              <td className="py-2">{address?.addressLine2 || address?.address2 || 'Không có'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium text-gray-700">Mã bưu điện:</td>
              <td className="py-2">{address?.pincode || address?.zipCode || address?.postalCode || 'Chưa cập nhật'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium text-gray-700">Quận/Huyện:</td>
              <td className="py-2">{address?.city || address?.district || 'Chưa cập nhật'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium text-gray-700">Tỉnh/Thành phố:</td>
              <td className="py-2">{address?.state || address?.province || 'Chưa cập nhật'}</td>
            </tr>
            <tr>
              <td className="py-2 font-medium text-gray-700">Ghi chú:</td>
              <td className="py-2">{address?.orderNote || address?.note || order?.notes || 'Không có ghi chú'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}