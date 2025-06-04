"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@nextui-org/react";
import confetti from "canvas-confetti";
import { CheckSquare2Icon, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

// Format tiền tệ
const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

export default function Checkout({ productList }) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState("prepaid");
  const [address, setAddress] = useState({});
  const { user } = useAuth();
  const router = useRouter();

  const handleAddress = (key, value) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
  };

  const totalPrice = productList?.reduce((sum, item) => {
    return sum + item.quantity * item.product.salePrice;
  }, 0);

  const createPaymentIntentCheckout = async (orderData) => {
    const res = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Không thể tạo phiên thanh toán");
    }

    const { url } = await res.json();
    return url;
  };

  const createCheckoutCODAndGetId = async ({ uid, products, address }) => {
    const checkoutId = `cod_${doc(collection(db, `ids`)).id}`;
    const ref = doc(db, `users/${uid}/checkout_sessions_cod/${checkoutId}`);
    
    let line_items = [];
    products.forEach((item) => {
      line_items.push({
        price_data: {
          currency: "vnd",
          product_data: {
            name: item?.product?.title ?? "",
            description: item?.product?.shortDescription ?? "",
            images: [
              item?.product?.featureImageURL ??
                `${process.env.NEXT_PUBLIC_DOMAIN}/logo.png`,
            ],
            metadata: {
              productId: item?.id,
            },
          },
          unit_amount: item?.product?.salePrice,
        },
        quantity: item?.quantity ?? 1,
      });
    });

    await setDoc(ref, {
      id: checkoutId,
      line_items: line_items,
      metadata: {
        checkoutId: checkoutId,
        uid: uid,
        address: JSON.stringify(address),
        payment_mode: 'cod',
      },
      createdAt: Timestamp.now(),
    });

    return checkoutId;
  };

  const handlePlaceOrder = async () => {
    try {
      setIsLoading(true);

      if (totalPrice <= 0) throw new Error("Giá trị đơn hàng phải lớn hơn 0");
      if (!productList?.length) throw new Error("Giỏ hàng trống");
      if (!address.fullName || !address.mobile || !address.addressLine1)
        throw new Error("Vui lòng điền đầy đủ thông tin địa chỉ");

      const orderData = {
        uid: user?.uid,
        userEmail: user?.email,
        products: productList.map(({ product, quantity }) => ({
          id: product.id,
          title: product.title,
          price: product.salePrice,
          quantity,
          image: product.featureImageURL,
          shortDescription: product.shortDescription || "",
        })),
        address: {
          fullName: address.fullName,
          mobile: address.mobile,
          email: address.email || user?.email || "",
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || "",
          pincode: address.pincode || "",
          city: address.city || "",
          state: address.state || "",
          orderNote: address.orderNote || "",
        },
        totalAmount: totalPrice,
        paymentMode,
        currency: "VND",
      };

      if (paymentMode === "prepaid") {
        const url = await createPaymentIntentCheckout(orderData);
        window.location.href = url;
      } else {
        // Tạo COD checkout và lưu vào Firebase
        const checkoutId = await createCheckoutCODAndGetId({
          uid: user?.uid,
          products: productList,
          address: orderData.address,
        });

        toast.success("Đơn hàng COD đã được xác nhận! Chúng tôi sẽ liên hệ với bạn sớm.");
        confetti();
        router.push(`/checkout-success?checkout_id=${checkoutId}`);
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
      <section className="flex-1 flex flex-col gap-4 border rounded-xl p-4">
        <h1 className="text-xl font-semibold">Địa chỉ giao hàng</h1>
        {[
          { id: "fullName", label: "Họ và tên", type: "text", required: true },
          { id: "mobile", label: "Số điện thoại", type: "tel", required: true },
          { id: "email", label: "Email", type: "email" },
          { id: "addressLine1", label: "Số nhà, tên đường", required: true },
          { id: "addressLine2", label: "Tên tòa nhà, căn hộ (nếu có)" },
          { id: "pincode", label: "Mã bưu điện" },
          { id: "city", label: "Quận / Huyện" },
          { id: "state", label: "Tỉnh / Thành phố" },
        ].map(({ id, label, type = "text", required }) => (
          <input
            key={id}
            type={type}
            placeholder={label}
            value={address?.[id] || ""}
            onChange={(e) => handleAddress(id, e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            required={required}
          />
        ))}
        <textarea
          placeholder="Ghi chú đơn hàng (tuỳ chọn)"
          rows={3}
          value={address?.orderNote || ""}
          onChange={(e) => handleAddress("orderNote", e.target.value)}
          className="border px-4 py-2 rounded-lg w-full focus:outline-none"
        />
      </section>

      {/* Phần đơn hàng + thanh toán */}
      <div className="flex-1 flex flex-col gap-3">
        <section className="flex flex-col gap-3 border rounded-xl p-4">
          <h1 className="text-xl font-semibold">Sản phẩm</h1>
          {productList.map((item) => (
            <div className="flex gap-3 items-center" key={item.product.id}>
              <img src={item.product.featureImageURL} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1">
                <h2 className="text-sm">{item.product.title}</h2>
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

        <section className="flex flex-col gap-3 border rounded-xl p-4">
          <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>
          {[
            {
              value: "prepaid",
              title: "Thanh toán trực tuyến",
              description: "Stripe, thẻ tín dụng (VND)",
            },
            {
              value: "cod",
              title: "Thanh toán khi nhận hàng",
              description: "Tiền mặt khi giao hàng",
            },
          ].map(({ value, title, description }) => (
            <button
              key={value}
              onClick={() => setPaymentMode(value)}
              className={`flex items-start gap-2 p-3 rounded-lg border transition-colors ${
                paymentMode === value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {paymentMode === value ? <CheckSquare2Icon size={16} className="text-blue-500" /> : <Square size={16} />}
              <div className="text-left">
                <div className="font-medium">{title}</div>
                <div className="text-xs text-gray-500">{description}</div>
              </div>
            </button>
          ))}

          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
            <CheckSquare2Icon size={16} className="text-blue-500" />
            <p className="text-sm text-gray-700">
              Tôi đồng ý với <span className="text-blue-600 underline cursor-pointer">điều khoản và điều kiện</span>
            </p>
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