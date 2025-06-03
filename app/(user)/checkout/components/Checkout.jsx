"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@nextui-org/react";
import confetti from "canvas-confetti";
import { CheckSquare2Icon, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

// Hàm format giá tiền theo định dạng Việt Nam
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

// Hàm convert VND sang USD để hiển thị
const formatUSDPrice = (vndPrice) => {
  const exchangeRate = 24000; // 1 USD = 24,000 VND
  const usdPrice = vndPrice / exchangeRate;
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(usdPrice);
};

export default function Checkout({ productList }) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState("prepaid");
  const [address, setAddress] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleAddress = (key, value) => {
    setAddress({ ...(address ?? {}), [key]: value });
  };

  const totalPrice = productList?.reduce((prev, curr) => {
    return prev + curr?.quantity * curr?.product?.salePrice;
  }, 0);

  // Hàm tạo Payment Intent và redirect đến Stripe Checkout
  const createPaymentIntentCheckout = async (orderData) => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment intent checkout');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Payment intent checkout error:', error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      if (totalPrice <= 0) {
        throw new Error("Giá trị đơn hàng phải lớn hơn 0");
      }
      if (!address?.fullName || !address?.mobile || !address?.addressLine1) {
        throw new Error("Vui lòng điền đầy đủ thông tin địa chỉ");
      }

      if (!productList || productList?.length === 0) {
        throw new Error("Giỏ hàng trống");
      }

      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        uid: user?.uid,
        userEmail: user?.email,
        products: productList.map(item => ({
          id: item.product.id,
          title: item.product.title,
          price: item.product.salePrice,
          quantity: item.quantity,
          image: item.product.featureImageURL
        })),
        address: {
          fullName: address.fullName,
          mobile: address.mobile,
          email: address.email || user?.email || '',
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || '',
          pincode: address.pincode || '',
          city: address.city || '',
          state: address.state || '',
          orderNote: address.orderNote || ''
        },
        totalAmount: totalPrice,
        paymentMode: paymentMode,
        currency: 'USD'
      };

      if (paymentMode === "prepaid") {
        // Thanh toán qua Stripe với Payment Intent
        const checkoutUrl = await createPaymentIntentCheckout(orderData);
        window.location.href = checkoutUrl;
      } else {
        // COD - chuyển hướng trực tiếp với thông báo
        toast.success("Đơn hàng COD đã được xác nhận! Chúng tôi sẽ liên hệ với bạn sớm.");
        confetti();
        // Chuyển đến trang thành công với thông tin cơ bản
        router.push(`/order-success?payment_mode=cod&total=${totalPrice}&name=${encodeURIComponent(address.fullName)}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi đặt hàng');
    }
    setIsLoading(false);
  };

  return (
    <section className="flex flex-col md:flex-row gap-3">
      <section className="flex-1 flex flex-col gap-4 border rounded-xl p-4">
        <h1 className="text-xl">Địa chỉ giao hàng</h1>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            id="full-name"
            name="full-name"
            placeholder="Họ và tên"
            value={address?.fullName ?? ""}
            onChange={(e) => {
              handleAddress("fullName", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            maxLength={100}
            required
          />
          <input
            type="tel"
            id="mobile"
            name="mobile"
            placeholder="Số điện thoại"
            value={address?.mobile ?? ""}
            onChange={(e) => {
              handleAddress("mobile", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            maxLength={15}
            required
          />
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={address?.email ?? ""}
            onChange={(e) => {
              handleAddress("email", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            maxLength={100}
          />
          <input
            type="text"
            id="address-line-1"
            name="address-line-1"
            placeholder="Địa chỉ chi tiết (số nhà, tên đường)"
            value={address?.addressLine1 ?? ""}
            onChange={(e) => {
              handleAddress("addressLine1", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            maxLength={200}
            required
          />
          <input
            type="text"
            id="address-line-2"
            name="address-line-2"
            placeholder="Địa chỉ bổ sung (tòa nhà, căn hộ)"
            value={address?.addressLine2 ?? ""}
            onChange={(e) => {
              handleAddress("addressLine2", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            maxLength={200}
          />
          <input
            type="text"
            id="pincode"
            name="pincode"
            placeholder="Mã bưu điện"
            value={address?.pincode ?? ""}
            onChange={(e) => {
              handleAddress("pincode", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
          <input
            type="text"
            id="city"
            name="city"
            placeholder="Thành phố"
            value={address?.city ?? ""}
            onChange={(e) => {
              handleAddress("city", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            maxLength={50}
          />
          <input
            type="text"
            id="state"
            name="state"
            placeholder="Tỉnh/Thành phố"
            value={address?.state ?? ""}
            onChange={(e) => {
              handleAddress("state", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            maxLength={50}
          />
          <textarea
            type="text"
            id="delivery-notes"
            name="delivery-notes"
            placeholder="Ghi chú đặc biệt cho đơn hàng (tùy chọn)"
            value={address?.orderNote ?? ""}
            onChange={(e) => {
              handleAddress("orderNote", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            maxLength={200}
            rows={3}
          />
        </div>
      </section>
      <div className="flex-1 flex flex-col gap-3">
        <section className="flex flex-col gap-3 border rounded-xl p-4">
          <h1 className="text-xl">Sản phẩm</h1>
          <div className="flex flex-col gap-2">
            {productList?.map((item) => {
              return (
                <div className="flex gap-3 items-center" key={item?.product?.id}>
                  <img
                    className="w-12 h-12 object-cover rounded-lg"
                    src={item?.product?.featureImageURL}
                    alt={item?.product?.title}
                  />
                  <div className="flex-1 flex flex-col">
                    <h1 className="text-sm font-medium">{item?.product?.title}</h1>
                    <h3 className="text-green-600 font-semibold text-xs">
                      {formatPrice(item?.product?.salePrice)} đ {" "}
                      <span className="text-black">×</span>{" "}
                      <span className="text-gray-600">{item?.quantity}</span>
                    </h3>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">
                      {formatPrice(item?.product?.salePrice * item?.quantity)} đ
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between w-full items-center p-3 font-bold text-lg border-t">
            <h1>Tổng cộng: </h1>
            <div className="text-right">
              <h1 className="text-green-600">{formatPrice(totalPrice)} đ</h1>
              <p className="text-sm text-gray-500">≈ {formatUSDPrice(totalPrice)}</p>
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-3 border rounded-xl p-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl">Phương thức thanh toán</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setPaymentMode("prepaid");
                }}
                className={`flex items-center gap-2 text-sm p-3 border rounded-lg transition-colors ${
                  paymentMode === "prepaid" 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {paymentMode === "prepaid" ? (
                  <CheckSquare2Icon className="text-blue-500" size={16} />
                ) : (
                  <Square size={16} />
                )}
                <div className="flex flex-col items-start">
                  <span className="font-medium">Thanh toán trực tuyến</span>
                  <span className="text-xs text-gray-500">Stripe, thẻ tín dụng/ghi nợ (USD)</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setPaymentMode("cod");
                }}
                className={`flex items-center gap-2 text-sm p-3 border rounded-lg transition-colors ${
                  paymentMode === "cod" 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {paymentMode === "cod" ? (
                  <CheckSquare2Icon className="text-blue-500" size={16} />
                ) : (
                  <Square size={16} />
                )}
                <div className="flex flex-col items-start">
                  <span className="font-medium">Thanh toán khi nhận hàng</span>
                  <span className="text-xs text-gray-500">Tiền mặt khi giao hàng</span>
                </div>
              </button>
            </div>
          </div>
          <div className="flex gap-2 items-center p-2 bg-gray-50 rounded-lg">
            <CheckSquare2Icon className="text-blue-500" size={16} />
            <h4 className="text-sm text-gray-700">
              Tôi đồng ý với{" "}
              <span className="text-blue-600 underline cursor-pointer">điều khoản và điều kiện</span>
            </h4>
          </div>
          <Button
            isLoading={isLoading}
            isDisabled={isLoading || totalPrice <= 0}
            onClick={handlePlaceOrder}
            className="bg-black text-white font-semibold py-3 text-base"
            size="lg"
          >
            {isLoading ? "Đang xử lý..." : `Đặt hàng • ${formatPrice(totalPrice)} đ`}
          </Button>
        </section>
      </div>
    </section>
  );
}