"use client";

import { useAllOrders } from "@/lib/firestore/orders/read";
import { useUser } from "@/lib/firestore/user/read";
import { Avatar, Button, CircularProgress } from "@nextui-org/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

const ITEMS_PER_PAGE = 5;

// Format tiền tệ VND
const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

// Hàm tính tổng tiền dựa trên phương thức thanh toán
const calculateTotalAmount = (item) => {
  if (item?.total_amount) {
    return item.total_amount;
  }

  const lineItems = item?.line_items || item?.checkout?.line_items;
  
  if (!lineItems?.length) {
    return 0;
  }

  const isOnlinePayment = item?.paymentMode === 'prepaid' || 
                         item?.payment_method === 'card';

  return lineItems.reduce((total, curr) => {
    let unitAmount = curr?.price_data?.unit_amount || 0;
    
    if (isOnlinePayment && unitAmount > 1000) {
      unitAmount = unitAmount;
    }
    
    return total + (unitAmount * (curr?.quantity || 0));
  }, 0);
};

// Hàm tính tổng số lượng sản phẩm
const calculateTotalProducts = (item) => {
  if (item?.line_items?.length) {
    return item.line_items.reduce((total, curr) => {
      return total + (curr?.quantity || 0);
    }, 0);
  }
  
  if (item?.checkout?.line_items?.length) {
    return item.checkout.line_items.reduce((total, curr) => {
      return total + (curr?.quantity || 0);
    }, 0);
  }
  
  if (item?.products?.length) {
    return item.products.reduce((total, curr) => {
      return total + (curr?.quantity || 0);
    }, 0);
  }
  
  if (item?.items?.length) {
    return item.items.reduce((total, curr) => {
      return total + (curr?.quantity || 0);
    }, 0);
  }
  
  return 0;
};

export default function ListView() {
  const [currentPage, setCurrentPage] = useState(1);

  // Load tất cả orders
  const {
    data: orders,
    error,
    isLoading,
  } = useAllOrders({
    pageLimit: 1000, // Load nhiều để có tất cả orders
    lastSnapDoc: null,
  });

  // Tính toán pagination
  const totalPages = Math.ceil((orders?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOrders = orders?.slice(startIndex, endIndex) || [];

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full">
        <div className="flex items-center justify-center py-20">
          <CircularProgress size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full">
        <div className="text-red-500 text-center py-10">
          Lỗi: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng cộng: {orders?.length || 0} đơn hàng
          </p>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                STT
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Khách hàng
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Tổng tiền
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Tổng sản phẩm
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Thanh toán
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Trạng thái
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((item, index) => (
                <Row
                  key={item.id}
                  index={startIndex + index}
                  item={item}
                />
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  Không có dữ liệu đơn hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, orders?.length || 0)} của {orders?.length || 0} kết quả
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              className="min-w-8 h-8"
            >
              <ChevronLeft size={16} />
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {(() => {
                const pageNumbers = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                // Điều chỉnh startPage nếu endPage đã tới maximum
                if (endPage === totalPages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                // Hiển thị trang đầu và dấu ...
                if (startPage > 1) {
                  pageNumbers.push(
                    <Button
                      key={1}
                      variant={currentPage === 1 ? "solid" : "flat"}
                      size="sm"
                      onPress={() => handlePageChange(1)}
                      className={`min-w-8 h-8 ${currentPage === 1
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                        }`}
                    >
                      1
                    </Button>
                  );

                  if (startPage > 2) {
                    pageNumbers.push(
                      <span key="start-ellipsis" className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                }

                // Hiển thị các trang ở giữa
                for (let i = startPage; i <= endPage; i++) {
                  if (i !== 1 && i !== totalPages) {
                    pageNumbers.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "solid" : "flat"}
                        size="sm"
                        onPress={() => handlePageChange(i)}
                        className={`min-w-8 h-8 ${currentPage === i
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100"
                          }`}
                      >
                        {i}
                      </Button>
                    );
                  }
                }

                // Hiển thị dấu ... và trang cuối
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pageNumbers.push(
                      <span key="end-ellipsis" className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }

                  pageNumbers.push(
                    <Button
                      key={totalPages}
                      variant={currentPage === totalPages ? "solid" : "flat"}
                      size="sm"
                      onPress={() => handlePageChange(totalPages)}
                      className={`min-w-8 h-8 ${currentPage === totalPages
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                        }`}
                    >
                      {totalPages}
                    </Button>
                  );
                }

                return pageNumbers;
              })()}
            </div>

            {/* Next Button */}
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              className="min-w-8 h-8"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ item, index }) {
  const totalAmount = calculateTotalAmount(item);
  const totalProducts = calculateTotalProducts(item); 
  const { data: user } = useUser({ uid: item?.uid }); 
  
  // Chuẩn hóa phương thức thanh toán
  const getPaymentModeLabel = (mode) => {
    const labels = {
      'prepaid': { text: 'Trực tuyến', color: 'bg-blue-100 text-blue-600' },
      'cod': { text: 'COD', color: 'bg-orange-100 text-orange-600' },
    };
    return labels[mode] || { text: 'COD', color: 'bg-orange-100 text-orange-600' };
  };

  // Chuẩn hóa trạng thái đơn hàng 
  const getStatusLabel = (status) => {
    const labels = {
      'pending': { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-600' },
      'confirmed': { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-600' },
      'paid': { text: 'Đã thanh toán', color: 'bg-indigo-100 text-indigo-600' },
      'completed': { text: 'Đã giao hàng', color: 'bg-green-100 text-green-600' },
      'succeeded': { text: 'Đã giao hàng', color: 'bg-green-100 text-green-600' },
      'cancelled': { text: 'Đã huỷ', color: 'bg-red-100 text-red-600' },
    };

    return labels[status] || { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-600' };
  };

  const paymentInfo = getPaymentModeLabel(item?.paymentMode);
  const statusInfo = getStatusLabel(item?.status);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4 text-gray-700">
        {index + 1}
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2 items-center">
          <Avatar size="sm" src={user?.photoURL} />
          <div className="flex flex-col">
            <h1 className="font-medium text-gray-900">{user?.displayName}</h1>
            <h1 className="text-xs text-gray-600">{user?.email}</h1>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="font-medium">
          {formatPrice(totalAmount || 0)} đ
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="font-medium">{totalProducts}</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex">
          <span className={`${paymentInfo.color} text-xs rounded-lg px-2 py-1 uppercase font-medium`}>
            {paymentInfo.text}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex">
          <span className={`${statusInfo.color} text-xs rounded-lg px-2 py-1 font-medium`}>
            {statusInfo.text}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex justify-center">
          <Link href={`/admin/orders/${item?.id}`}>
            <Button
              size="sm"
              variant="flat"
              className="bg-black text-white hover:bg-gray-800"
            >
              Xem
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );
}