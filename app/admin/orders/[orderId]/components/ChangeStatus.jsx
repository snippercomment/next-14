"use client";

import { updateOrderStatus } from "@/lib/firestore/orders/write";
import toast from "react-hot-toast";

export default function ChangeOrderStatus({ order }) {
  const handleChangeStatus = async (status) => {
    try {
      if (!status) {
        toast.error("Vui lòng chọn trạng thái");
        return;
      }
      await toast.promise(
        updateOrderStatus({ id: order?.id, status: status }),
        {
          error: (e) => e?.message,
          loading: "Đang cập nhật...",
          success: "Đã cập nhật thành công",
        }
      );
    } catch (error) {
      toast.error(error?.message);
    }
  };

  // Kiểm tra xem đơn hàng có thể chỉnh sửa hay không
  const isOrderEditable = () => {
    const currentStatus = order?.status;
    // Không cho phép sửa nếu đã giao hàng hoặc đã hủy
    return currentStatus !== 'delivered' && currentStatus !== 'cancelled';
  };

  return (
    <div className="relative">
      <select
        value={order?.status}
        onChange={(e) => {
          handleChangeStatus(e.target.value);
        }}
        name="change-order-status"
        id="change-order-status"
        className={`px-4 py-2 border rounded-lg ${
          isOrderEditable() 
            ? 'bg-white cursor-pointer' 
            : 'bg-gray-100 cursor-not-allowed text-gray-500'
        }`}
        disabled={!isOrderEditable()}
      >
        <option value="pending">Chờ xác nhận</option>
        <option value="confirmed">Đã xác nhận</option>
        <option value="shipped">Đang vận chuyển</option>
        <option value="delivered">Đã giao hàng</option>
        <option value="cancelled">Đã hủy</option>
      </select>
      
      {!isOrderEditable() && (
        <div className="absolute top-full left-0 mt-1 text-xs text-gray-500">
        
        </div>
      )}
    </div>
  );
}