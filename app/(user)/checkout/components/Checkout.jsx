"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@nextui-org/react";
import confetti from "canvas-confetti";
import { CheckSquare2Icon, Square, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { 
  createPaymentIntentCheckout, 
  createCheckoutCODAndGetId,
  validateOrderData, 
  prepareOrderData 
} from "@/lib/firestore/checkout/write";
import { VIETNAM_PROVINCES, getDistrictsByProvince } from "@/lib/data/vietnamAddress";

// Format tiền tệ
const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

// Form fields configuration
const ADDRESS_FIELDS = [
  { id: "fullName", label: "Họ và tên", type: "text", required: true },
  { id: "mobile", label: "Số điện thoại", type: "tel", required: true },
  { id: "email", label: "Email", type: "email" },
  { id: "addressLine1", label: "Số nhà, tên đường", required: true },
  { id: "addressLine2", label: "Tên tòa nhà, căn hộ (nếu có)" },
  { id: "pincode", label: "Mã bưu điện" },
];

const PAYMENT_METHODS = [
  {
    value: "prepaid",
    title: "Thanh toán trực tuyến",
    description: "Stripe, thẻ tín dụng/ghi nợ (VND)",
  },
  {
    value: "cod",
    title: "Thanh toán khi nhận hàng (COD)",
    description: "Tiền mặt khi giao hàng tận nơi",
  },
];

export default function Checkout({ productList }) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState("prepaid");
  const [address, setAddress] = useState({});
  const { user } = useAuth();
  const router = useRouter();

  const handleAddress = (key, value) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
    
    // Reset district khi đổi tỉnh
    if (key === "state") {
      setAddress((prev) => ({ ...prev, city: "" }));
    }
  };

  const totalPrice = productList?.reduce((sum, item) => {
    return sum + item.quantity * item.product.salePrice;
  }, 0);

  const handlePlaceOrder = async () => {
    try {
      setIsLoading(true);

      // Validate dữ liệu
      validateOrderData(productList, address, totalPrice);

      // Chuẩn bị dữ liệu order
      const orderData = prepareOrderData(user, productList, address, totalPrice, paymentMode);

      if (paymentMode === "prepaid") {
        const url = await createPaymentIntentCheckout(orderData);
        window.location.href = url;
      } else {
        // Tạo COD order với hàm mới
        const checkoutId = await createCheckoutCODAndGetId({
          uid: user?.uid,
          products: productList,
          address: orderData.address,
        });

        toast.success("Đơn hàng COD đã được tạo thành công! Chúng tôi sẽ liên hệ với bạn sớm.");
        confetti();
        router.push(`/checkout-cod?checkout_id=${checkoutId}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Có lỗi xảy ra khi đặt hàng");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col md:flex-row gap-3">
      {/* Form địa chỉ */}
      <AddressForm 
        address={address} 
        onAddressChange={handleAddress} 
      />

      {/* Phần đơn hàng + thanh toán */}
      <div className="flex-1 flex flex-col gap-3">
        <OrderSummary 
          productList={productList} 
          totalPrice={totalPrice} 
        />

        <PaymentSection
          paymentMode={paymentMode}
          setPaymentMode={setPaymentMode}
          isLoading={isLoading}
          totalPrice={totalPrice}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
    </section>
  );
}

// Component con để quản lý form địa chỉ
function AddressForm({ address, onAddressChange }) {
  const availableDistricts = getDistrictsByProvince(address?.state);

  return (
    <section className="flex-1 flex flex-col gap-4 border rounded-xl p-4">
      <h1 className="text-xl font-semibold">Địa chỉ giao hàng</h1>
      
      {/* Các trường input thông thường */}
      {ADDRESS_FIELDS.map(({ id, label, type = "text", required }) => (
        <input
          key={id}
          type={type}
          placeholder={label}
          value={address?.[id] || ""}
          onChange={(e) => onAddressChange(id, e.target.value)}
          className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:border-blue-500"
          required={required}
        />
      ))}

      {/* Dropdown Tỉnh/Thành phố */}
      <div className="relative">
        <select
          value={address?.state || ""}
          onChange={(e) => onAddressChange("state", e.target.value)}
          className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:border-blue-500 appearance-none bg-white"
          required
        >
          <option value="">Chọn Tỉnh / Thành phố</option>
          {VIETNAM_PROVINCES.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
      </div>

      {/* Dropdown Quận/Huyện */}
      <div className="relative">
        <select
          value={address?.city || ""}
          onChange={(e) => onAddressChange("city", e.target.value)}
          className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:border-blue-500 appearance-none bg-white"
          disabled={!address?.state}
        >
          <option value="">
            {address?.state ? "Chọn Quận / Huyện" : "Vui lòng chọn Tỉnh/Thành phố trước"}
          </option>
          {availableDistricts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
      </div>

      <textarea
        placeholder="Ghi chú đơn hàng (tuỳ chọn)"
        rows={3}
        value={address?.orderNote || ""}
        onChange={(e) => onAddressChange("orderNote", e.target.value)}
        className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:border-blue-500"
      />
    </section>
  );
}

// Component con để hiển thị tóm tắt đơn hàng
function OrderSummary({ productList, totalPrice }) {
  return (
    <section className="flex flex-col gap-3 border rounded-xl p-4">
      <h1 className="text-xl font-semibold">Sản phẩm</h1>
      {productList.map((item) => (
        <div className="flex gap-3 items-center" key={item.product.id}>
          <img 
            src={item.product.featureImageURL} 
            alt={item.product.title} 
            className="w-12 h-12 rounded-lg object-cover" 
          />
          <div className="flex-1">
            <h2 className="text-sm font-medium">{item.product.title}</h2>
            <p className="text-xs text-gray-600">
              {formatPrice(item.product.salePrice)} đ × {item.quantity}
            </p>
          </div>
          <strong className="text-sm">
            {formatPrice(item.product.salePrice * item.quantity)} đ
          </strong>
        </div>
      ))}
      <div className="flex justify-between border-t pt-3 font-bold text-lg">
        <span>Tổng cộng:</span>
        <div className="text-right">
          <span className="text-green-600">{formatPrice(totalPrice)} đ</span>
        </div>
      </div>
    </section>
  );
}

// Component con để quản lý phần thanh toán
function PaymentSection({ paymentMode, setPaymentMode, isLoading, totalPrice, onPlaceOrder }) {
  return (
    <section className="flex flex-col gap-3 border rounded-xl p-4">
      <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>
      
      {PAYMENT_METHODS.map(({ value, title, description }) => (
        <button
          key={value}
          onClick={() => setPaymentMode(value)}
          className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 ${
            paymentMode === value 
              ? "border-blue-500 bg-blue-50 shadow-sm" 
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          {paymentMode === value ? (
            <CheckSquare2Icon size={20} className="text-blue-500 mt-0.5" />
          ) : (
            <Square size={20} className="text-gray-400 mt-0.5" />
          )}
          <div className="text-left">
            <div className="font-medium text-gray-900">{title}</div>
            <div className="text-sm text-gray-600 mt-1">{description}</div>
          </div>
        </button>
      ))}

      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
        <CheckSquare2Icon size={16} className="text-blue-500" />
        <p className="text-sm text-gray-700">
          Tôi đồng ý với{" "}
          <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">
            điều khoản và điều kiện
          </span>{" "}
          của cửa hàng
        </p>
      </div>

      <Button
        isLoading={isLoading}
        isDisabled={isLoading || totalPrice <= 0}
        onClick={onPlaceOrder}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 text-base hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
        size="lg"
      >
        {isLoading ? "Đang xử lý..." : `Đặt hàng • ${formatPrice(totalPrice)} đ`}
      </Button>
    </section>
  );
}