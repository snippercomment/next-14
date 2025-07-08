"use client";

import { useAllOrders } from "@/lib/firestore/orders/read";
import { useUser } from "@/lib/firestore/user/read";
import { Avatar, Button, CircularProgress } from "@nextui-org/react";
import Link from "next/link";
import { useEffect, useState } from "react";


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
  const [pageLimit, setPageLimit] = useState(10);
  const [lastSnapDocList, setLastSnapDocList] = useState([]);

  useEffect(() => {
    setLastSnapDocList([]);
  }, [pageLimit]);

  const {
    data: orders,
    error,
    isLoading,
    lastSnapDoc,
  } = useAllOrders({
    pageLimit: pageLimit,
    lastSnapDoc:
      lastSnapDocList?.length === 0
        ? null
        : lastSnapDocList[lastSnapDocList?.length - 1],
  });

  const handleNextPage = () => {
    let newStack = [...lastSnapDocList];
    newStack.push(lastSnapDoc);
    setLastSnapDocList(newStack);
  };

  const handlePrePage = () => {
    let newStack = [...lastSnapDocList];
    newStack.pop();
    setLastSnapDocList(newStack);
  };

  if (isLoading) {
    return (
      <div>
        <CircularProgress />
      </div>
    );
  }
  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="flex-1 flex flex-col gap-3 md:pr-5 md:px-0 px-5 rounded-xl w-full overflow-x-auto">
      <table className="border-separate border-spacing-y-3">
        <thead>
          <tr>
            <th className="font-semibold border-y bg-white px-3 py-2 border-l rounded-l-lg">
              STT
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Khách hàng
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Tổng tiền
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Tổng sản phẩm
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Thanh toán
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Trạng thái
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 border-r rounded-r-lg text-center">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((item, index) => {
            return (
              <Row
                index={index + lastSnapDocList?.length * pageLimit}
                item={item}
                key={item?.id}
              />
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-between text-sm py-3">
        <Button
          isDisabled={isLoading || lastSnapDocList?.length === 0}
          onClick={handlePrePage}
          size="sm"
          variant="bordered"
        >
          Trước
        </Button>
        <select
          value={pageLimit}
          onChange={(e) => setPageLimit(e.target.value)}
          className="px-5 rounded-xl"
          name="perpage"
          id="perpage"
        >
          <option value={3}>3 mục</option>
          <option value={5}>5 mục</option>
          <option value={10}>10 mục</option>
          <option value={20}>20 mục</option>
          <option value={100}>100 mục</option>
        </select>
        <Button
          isDisabled={isLoading || orders?.length === 0}
          onClick={handleNextPage}
          size="sm"
          variant="bordered"
        >
          Tiếp
        </Button>
      </div>
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
    <tr>
      <td className="border-y bg-white px-3 py-2 border-l rounded-l-lg text-center">
        {index + 1}
      </td>
      <td className="border-y bg-white px-3 py-2 whitespace-nowrap">
        <div className="flex gap-2 items-center">
          <Avatar size="sm" src={user?.photoURL} />
          <div className="flex flex-col">
            <h1> {user?.displayName}</h1>
            <h1 className="text-xs text-gray-600"> {user?.email}</h1>
          </div>
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2 whitespace-nowrap">
        {formatPrice(totalAmount || 0)} đ
      </td>
      <td className="border-y bg-white px-3 py-2">
        {totalProducts}
      </td>
      <td className="border-y bg-white px-3 py-2">
        <div className="flex">
          <h3 className={`${paymentInfo.color} text-xs rounded-lg px-2 py-1 uppercase font-medium`}>
            {paymentInfo.text}
          </h3>
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2">
        <div className="flex">
          <h3 className={`${statusInfo.color} text-xs rounded-lg px-2 py-1 font-medium`}>
            {statusInfo.text}
          </h3>
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2 border-r rounded-r-lg">
        <div className="flex">
          <Link href={`/admin/orders/${item?.id}`}>
            <button className="bg-black text-white px-3 py-2 rounded-lg text-xs hover:bg-gray-800 transition-colors">
              Xem
            </button>
          </Link>
        </div>
      </td>
    </tr>
  );
}