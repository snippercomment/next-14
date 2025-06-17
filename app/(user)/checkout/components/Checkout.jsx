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

// Format tiền tệ
const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

// Form fields configuration
const ADDRESS_FIELDS = [
  { id: "fullName", label: "Họ và tên", type: "text", required: true },
  { id: "mobile", label: "Số điện thoại", type: "tel", required: true },
  { id: "email", label: "Email", type: "email" },
  { id: "addressLine1", label: "Địa chỉ chi tiết", required: true },
  { id: "addressLine2", label: "Ghi chú địa chỉ (nếu có)" },
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedUserAddress, setSelectedUserAddress] = useState(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  
  // Lấy thông tin user từ Firestore
  const {
    data: currentUser,
    isLoading: isUserLoading,
  } = useUser({ uid: user?.uid });

  // Auto-fill thông tin từ user profile khi load
  useEffect(() => {
    if (currentUser && !useCustomAddress) {
      // Tìm địa chỉ mặc định
      const defaultAddress = currentUser.addresses?.find(addr => addr.isDefault);
      
      if (defaultAddress) {
        setSelectedUserAddress(defaultAddress);
        setAddress({
          fullName: defaultAddress.recipientName || currentUser.displayName || "",
          mobile: defaultAddress.phoneNumber || currentUser.phoneNumber || "",
          email: user?.email || "",
          addressLine1: defaultAddress.fullAddress || "",
          addressLine2: "",
        });
      } else {
        // Nếu không có địa chỉ mặc định, dùng thông tin cơ bản
        setAddress({
          fullName: currentUser.displayName || "",
          mobile: currentUser.phoneNumber || "",
          email: user?.email || "",
          addressLine1: "",
          addressLine2: "",
        });
      }
    }
  }, [currentUser, user, useCustomAddress]);

  const handleAddress = (key, value) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectUserAddress = (userAddress) => {
    setSelectedUserAddress(userAddress);
    setAddress({
      fullName: userAddress.recipientName || currentUser?.displayName || "",
      mobile: userAddress.phoneNumber || currentUser?.phoneNumber || "",
      email: user?.email || "",
      addressLine1: userAddress.fullAddress || "",
      addressLine2: "",
    });
  };

  const totalPrice = productList?.reduce((sum, item) => {
    return sum + item.quantity * item.product.salePrice;
  }, 0);

  const handlePlaceOrder = async () => {
    if (!acceptedTerms) {
      toast.error("Vui lòng đồng ý với điều khoản và điều kiện");
      return;
    }

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
        currentUser={currentUser}
        isUserLoading={isUserLoading}
        selectedUserAddress={selectedUserAddress}
        onSelectUserAddress={handleSelectUserAddress}
        useCustomAddress={useCustomAddress}
        setUseCustomAddress={setUseCustomAddress}
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
          acceptedTerms={acceptedTerms}
          setAcceptedTerms={setAcceptedTerms}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
    </section>
  );
}

// Component con để quản lý form địa chỉ
function AddressForm({ 
  address, 
  onAddressChange, 
  currentUser, 
  isUserLoading, 
  selectedUserAddress,
  onSelectUserAddress,
  useCustomAddress,
  setUseCustomAddress
}) {
  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'home':
        return 'Nhà riêng';
      case 'office':
        return 'Văn phòng';
      default:
        return 'Khác';
    }
  };

  if (isUserLoading) {
    return (
      <section className="flex-1 flex flex-col gap-4 border rounded-xl p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col gap-4 border rounded-xl p-4">
      <h1 className="text-xl font-semibold">Địa chỉ giao hàng</h1>
      
      {/* Hiển thị địa chỉ đã lưu nếu có */}
      {currentUser?.addresses && currentUser.addresses.length > 0 && !useCustomAddress && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Chọn địa chỉ đã lưu:</h3>
            <button
              onClick={() => setUseCustomAddress(true)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Nhập địa chỉ mới
            </button>
          </div>
          
          <div className="space-y-2">
            {currentUser.addresses.map((userAddress) => (
              <button
                key={userAddress.id}
                onClick={() => onSelectUserAddress(userAddress)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  selectedUserAddress?.id === userAddress.id
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {selectedUserAddress?.id === userAddress.id ? (
                    <CheckSquare2Icon size={16} className="text-blue-500 mt-1" />
                  ) : (
                    <Square size={16} className="text-gray-400 mt-1" />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{getAddressTypeIcon(userAddress.type)}</span>
                      <span className="font-medium text-sm">{userAddress.label}</span>
                      {userAddress.isDefault && (
                        <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded">
                          Mặc định
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{userAddress.recipientName}</p>
                      <p>{userAddress.phoneNumber}</p>
                      <p>{userAddress.fullAddress}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form nhập địa chỉ tùy chỉnh */}
      {(useCustomAddress || !currentUser?.addresses || currentUser.addresses.length === 0) && (
        <div className="space-y-4">
          {currentUser?.addresses && currentUser.addresses.length > 0 && (
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Nhập địa chỉ mới:</h3>
              <button
                onClick={() => setUseCustomAddress(false)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Chọn từ địa chỉ đã lưu
              </button>
            </div>
          )}

          {/* Các trường input */}
          {ADDRESS_FIELDS.map(({ id, label, type = "text", required }) => (
            <div key={id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={type}
                placeholder={label}
                value={address?.[id] || ""}
                onChange={(e) => onAddressChange(id, e.target.value)}
                className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required={required}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú đơn hàng
            </label>
            <textarea
              placeholder="Ghi chú đơn hàng (tuỳ chọn)"
              rows={3}
              value={address?.orderNote || ""}
              onChange={(e) => onAddressChange("orderNote", e.target.value)}
              className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Gợi ý nếu chưa có địa chỉ đã lưu */}
      {(!currentUser?.addresses || currentUser.addresses.length === 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Gợi ý:</p>
              <p>
                Bạn có thể lưu địa chỉ này vào{" "}
                <Link href="/profile" className="underline hover:text-blue-800">
                  trang cá nhân
                </Link>{" "}
                để sử dụng cho lần mua sắm tiếp theo.
              </p>
            </div>
          </div>
        </div>
      )}
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
function PaymentSection({ paymentMode, setPaymentMode, isLoading, totalPrice, acceptedTerms, setAcceptedTerms, onPlaceOrder }) {
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

      {/* Checkbox điều khoản */}
      <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
        <button
          onClick={() => setAcceptedTerms(!acceptedTerms)}
          className="mt-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        >
          {acceptedTerms ? (
            <CheckSquare2Icon size={16} className="text-blue-500" />
          ) : (
            <Square size={16} className="text-gray-400" />
          )}
        </button>
        <p className="text-sm text-gray-700">
          Tôi đồng ý với{" "}
          <Link 
            href="/warranty"
            className="text-blue-600 underline hover:text-blue-800 transition-colors"
          >
            điều khoản và bảo hành
          </Link>{" "}
          của cửa hàng
        </p>
      </div>

      <Button
        isLoading={isLoading}
        isDisabled={isLoading || totalPrice <= 0 || !acceptedTerms}
        onClick={onPlaceOrder}
        className={`font-semibold py-3 text-base transition-all duration-200 ${
          acceptedTerms 
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" 
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        size="lg"
      >
        {isLoading ? "Đang xử lý..." : `Đặt hàng • ${formatPrice(totalPrice)} đ`}
      </Button>
    </section>
  );
}