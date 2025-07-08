"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/lib/firestore/user/read";
import { Button } from "@nextui-org/react";
import confetti from "canvas-confetti";
import { CheckSquare2Icon, Square, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { 
  createPaymentIntentCheckout, 
  createCheckoutCODAndGetId,
  validateOrderData, 
  prepareOrderData 
} from "@/lib/firestore/checkout/write";

const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

const ADDRESS_FIELDS = [
  { id: "fullName", label: "Họ và tên", required: true },
  { id: "mobile", label: "Số điện thoại", type: "tel", required: true },
  { id: "email", label: "Email", type: "email" },
  { id: "addressLine1", label: "Địa chỉ", required: true },
  { id: "district", label: "Quận/Huyện", required: true },
  { id: "city", label: "Tỉnh/Thành phố", required: true },
  { id: "notes", label: "Ghi chú" },
];

const PAYMENT_METHODS = [
  { value: "prepaid", title: "Thanh toán trực tuyến", description: "Stripe, thẻ tín dụng/ghi nợ" },
  { value: "cod", title: "Thanh toán khi nhận hàng", description: "Tiền mặt khi giao hàng" },
];

export default function Checkout({ productList }) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState("prepaid");
  const [address, setAddress] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedUserAddress, setSelectedUserAddress] = useState(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const { data: currentUser, isLoading: isUserLoading } = useUser({ uid: user?.uid });

  // Auto-fill address from user profile
  useEffect(() => {
    if (currentUser && !useCustomAddress) {
      const defaultAddress = currentUser.addresses?.find(addr => addr.isDefault);
      
      if (defaultAddress) {
        setSelectedUserAddress(defaultAddress);
        setAddress({
          fullName: defaultAddress.recipientName || currentUser.displayName || "",
          mobile: defaultAddress.phoneNumber || currentUser.phoneNumber || "",
          email: user?.email || "",
          addressLine1: defaultAddress.addressLine1 || defaultAddress.fullAddress || "",
          district: defaultAddress.district || "",
          city: defaultAddress.city || "",
          notes: defaultAddress.notes || "",
        });
      } else {
        setAddress({
          fullName: currentUser.displayName || "",
          mobile: currentUser.phoneNumber || "",
          email: user?.email || "",
          addressLine1: "",
          district: "",
          city: "",
          notes: "",
        });
      }
    }
  }, [currentUser, user, useCustomAddress]);

  const handleAddressChange = (key, value) => {
    setAddress(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectUserAddress = (userAddress) => {
    setSelectedUserAddress(userAddress);
    setAddress({
      fullName: userAddress.recipientName || currentUser?.displayName || "",
      mobile: userAddress.phoneNumber || currentUser?.phoneNumber || "",
      email: user?.email || "",
      addressLine1: userAddress.addressLine1 || userAddress.fullAddress || "",
      district: userAddress.district || "",
      city: userAddress.city || "",
      notes: userAddress.notes || "",
    });
  };

  const totalPrice = productList?.reduce((sum, item) => 
    sum + item.quantity * item.product.salePrice, 0
  );

  const handlePlaceOrder = async () => {
    if (!acceptedTerms) {
      toast.error("Vui lòng đồng ý với điều khoản và điều kiện");
      return;
    }

    try {
      setIsLoading(true);
      
      // Tạo fullAddress từ các trường riêng biệt
      const fullAddress = `${address.addressLine1}, ${address.district}, ${address.city}`;
      const orderAddress = {
        ...address,
        fullAddress: fullAddress
      };
      
      validateOrderData(productList, orderAddress, totalPrice);
      const orderData = prepareOrderData(user, productList, orderAddress, totalPrice, paymentMode);

      if (paymentMode === "prepaid") {
        const url = await createPaymentIntentCheckout(orderData);
        window.location.href = url;
      } else {
        const checkoutId = await createCheckoutCODAndGetId({
          uid: user?.uid,
          products: productList,
          address: orderData.address,
        });
        toast.success("Đơn hàng COD đã được tạo thành công!");
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

  if (isUserLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Address Section */}
      <div className="flex-1 border rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4">Địa chỉ giao hàng</h2>
        
        {/* Saved addresses */}
        {currentUser?.addresses?.length > 0 && !useCustomAddress && (
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Chọn từ địa chỉ đã lưu:</h3>
              <button
                onClick={() => setUseCustomAddress(true)}
                className="text-sm text-blue-600 underline"
              >
                Nhập địa chỉ mới
              </button>
            </div>
            
            {currentUser.addresses.map((addr) => (
              <button
                key={addr.id}
                onClick={() => handleSelectUserAddress(addr)}
                className={`w-full text-left p-3 rounded-lg border ${
                  selectedUserAddress?.id === addr.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  {selectedUserAddress?.id === addr.id ? (
                    <CheckSquare2Icon size={16} className="text-blue-500 mt-1" />
                  ) : (
                    <Square size={16} className="text-gray-400 mt-1" />
                  )}
                  <div>
                    <div className="font-medium">{addr.recipientName}</div>
                    <div className="text-sm text-gray-600">
                      {addr.phoneNumber}<br />
                      {addr.addressLine1 || addr.fullAddress}<br />
                      {addr.district}, {addr.city}
                      {addr.notes && <><br />Ghi chú: {addr.notes}</>}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Custom address form */}
        {(useCustomAddress || !currentUser?.addresses?.length) && (
          <div className="space-y-4">
            {currentUser?.addresses?.length > 0 && (
              <button
                onClick={() => setUseCustomAddress(false)}
                className="text-sm text-blue-600 underline"
              >
                Chọn từ địa chỉ đã lưu
              </button>
            )}

            {ADDRESS_FIELDS.map(({ id, label, type = "text", required }) => (
              <div key={id}>
                <label className="block text-sm font-medium mb-1">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={type}
                  placeholder={label}
                  value={address[id] || ""}
                  onChange={(e) => handleAddressChange(id, e.target.value)}
                  className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  required={required}
                />
              </div>
            ))}
          </div>
        )}

        {/* Address saving suggestion */}
        {!currentUser?.addresses?.length && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Gợi ý:</p>
                <p>
                  Bạn có thể lưu địa chỉ này vào{" "}
                  <Link href="/account" className="underline">trang cá nhân</Link>{" "}
                  để sử dụng cho lần mua sắm tiếp theo.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Summary & Payment */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Order Summary */}
        <div className="border rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm</h2>
          {productList.map((item) => (
            <div key={item.product.id} className="flex gap-3 items-center mb-3">
              <img 
                src={item.product.featureImageURL} 
                alt={item.product.title} 
                className="w-12 h-12 rounded-lg object-cover" 
              />
              <div className="flex-1">
                <h3 className="text-sm font-medium">{item.product.title}</h3>
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
            <span className="text-green-600">{formatPrice(totalPrice)} đ</span>
          </div>
        </div>

        {/* Payment Section */}
        <div className="border rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
          
          {PAYMENT_METHODS.map(({ value, title, description }) => (
            <button
              key={value}
              onClick={() => setPaymentMode(value)}
              className={`flex items-start gap-3 p-4 rounded-lg border w-full mb-3 ${
                paymentMode === value 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {paymentMode === value ? (
                <CheckSquare2Icon size={20} className="text-blue-500 mt-0.5" />
              ) : (
                <Square size={20} className="text-gray-400 mt-0.5" />
              )}
              <div className="text-left">
                <div className="font-medium">{title}</div>
                <div className="text-sm text-gray-600">{description}</div>
              </div>
            </button>
          ))}

          {/* Terms checkbox */}
          <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg mb-4">
            <button
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              className="mt-0.5"
            >
              {acceptedTerms ? (
                <CheckSquare2Icon size={16} className="text-blue-500" />
              ) : (
                <Square size={16} className="text-gray-400" />
              )}
            </button>
            <p className="text-sm text-gray-700">
              Tôi đồng ý với{" "}
              <Link href="/warranty" className="text-blue-600 underline">
                điều khoản và bảo hành
              </Link>{" "}
              của cửa hàng
            </p>
          </div>

          <Button
            isLoading={isLoading}
            isDisabled={isLoading || totalPrice <= 0 || !acceptedTerms}
            onClick={handlePlaceOrder}
            className={`font-semibold py-3 text-base w-full ${
              acceptedTerms 
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white" 
                : "bg-gray-300 text-gray-500"
            }`}
            size="lg"
          >
            {isLoading ? "Đang xử lý..." : `Đặt hàng • ${formatPrice(totalPrice)} đ`}
          </Button>
        </div>
      </div>
    </div>
  );
}