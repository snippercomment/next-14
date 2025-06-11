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

  return (
    <select
      value={order?.status}
      onChange={(e) => {
        handleChangeStatus(e.target.value);
      }}
      name="change-order-status"
      id="change-order-status"
      className="px-4 py-2 border rounded-lg bg-white"
    >
      <option value="">Cập nhật trạng thái</option>
      <option value="pending">Chờ xử lý</option>
      <option value="confirmed">Đã xác nhận</option>
      <option value="shipped">Đang giao hàng</option>
      <option value="delivered">Đã giao hàng</option>
      <option value="cancelled">Đã hủy</option>
    </select>
  );
}