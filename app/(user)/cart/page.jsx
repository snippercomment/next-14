"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useProduct } from "@/lib/firestore/products/read";
import { useUser } from "@/lib/firestore/user/read";
import { updateCarts } from "@/lib/firestore/user/write";
import { Button, CircularProgress, Input } from "@nextui-org/react";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
  const { user } = useAuth();
  const { data, isLoading } = useUser({ uid: user?.uid });
  const [cartValidation, setCartValidation] = useState({});
  
  if (isLoading) {
    // Check if cart is valid for checkout
  const checkCartValidity = () => {
    if (!data?.carts || data.carts.length === 0) return false;
    
    const hasInvalidItems = Object.values(cartValidation).some(item => 
      item.isOutOfStock || item.exceedsStock
    );
    
    return !hasInvalidItems;
  };

  const handleCheckout = () => {
    if (!checkCartValidity()) {
      toast.error("Không thể thanh toán! Vui lòng kiểm tra lại số lượng sản phẩm.");
      return;
    }
    // Proceed to checkout
    window.location.href = `/checkout?type=cart`;
  };

  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CircularProgress size="lg" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold mb-2">Giỏ hàng</h1>
          {data?.carts?.length > 0 && (
            <p className="text-gray-600">
              Bạn có {data?.carts?.reduce((total, item) => total + item.quantity, 0)} sản phẩm trong giỏ hàng
            </p>
          )}
        </div>

        {/* Empty State */}
        {(!data?.carts || data?.carts?.length === 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="mb-8">
              <img className="h-48 mx-auto" src="/svgs/Empty-pana.svg" alt="" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              Vui lòng thêm sản phẩm vào giỏ hàng
            </h2>
            <p className="text-gray-500 mb-8">
              Khám phá những sản phẩm tuyệt vời của chúng tôi
            </p>
            
          </div>
        )}

        {/* Cart Items */}
        {data?.carts?.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Sản phẩm đã chọn</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {data?.carts?.map((item, key) => (
                    <ProductItem 
                      item={item} 
                      key={item?.id} 
                      onValidationChange={(itemId, validationData) => {
                        setCartValidation(prev => ({
                          ...prev,
                          [itemId]: validationData
                        }));
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính ({data?.carts?.reduce((total, item) => total + item.quantity, 0)} sản phẩm)</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-500">Miễn phí</span>
                  </div>
                </div>

                <Link href={`/checkout?type=cart`}>
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-medium text-lg transition-colors mb-4">
                    Thanh toán
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductItem({ item }) {
  const { user } = useAuth();
  const { data } = useUser({ uid: user?.uid });

  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [inputQuantity, setInputQuantity] = useState(item?.quantity?.toString() || "1");

  const { data: product } = useProduct({ productId: item?.id });

  const handleRemove = async () => {
    if (!confirm("Bạn có chắc chắn không??")) return;
    setIsRemoving(true);
    try {
      const newList = data?.carts?.filter((d) => d?.id != item?.id);
      await updateCarts({ list: newList, uid: user?.uid });
    } catch (error) {
      toast.error(error?.message);
    }
    setIsRemoving(false);
  };

  const handleUpdate = async (quantity) => {
    // Kiểm tra tồn kho
    if (product?.stock && quantity > product.stock) {
      toast.error(`Bạn đã chọn hết! Chỉ còn ${product.stock} sản phẩm trong kho.`);
      setInputQuantity(product.stock.toString());
      return;
    }

    setIsUpdating(true);
    try {
      const newList = data?.carts?.map((d) => {
        if (d?.id === item?.id) {
          return {
            ...d,
            quantity: parseInt(quantity),
          };
        } else {
          return d;
        }
      });
      await updateCarts({ list: newList, uid: user?.uid });
    } catch (error) {
      toast.error(error?.message);
    }
    setIsUpdating(false);
  };

  const handleInputChange = (value) => {
    setInputQuantity(value);
  };

  const handleInputBlur = () => {
    const quantity = parseInt(inputQuantity);
    if (isNaN(quantity) || quantity < 1) {
      setInputQuantity("1");
      handleUpdate(1);
    } else {
      handleUpdate(quantity);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  // Helper function to format the price to Vietnamese Dong
  const formatPriceInVND = (price) => {
    if (typeof price !== 'number') return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-6">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={product?.featureImageURL}
              alt={product?.title}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product?.title}
          </h3>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl font-bold text-green-500">
              {formatPriceInVND(product?.salePrice)}
            </span>
            <span className="text-sm text-gray-500 line-through">
              {formatPriceInVND(product?.price)}
            </span>
            {product?.price && product?.salePrice && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                Giảm {Math.round(((product?.price - product?.salePrice) / product?.price) * 100)}%
              </span>
            )}
          </div>

          {/* Stock Info */}
          {product?.stock && (
            <div className="mb-2">
              <span className="text-sm text-gray-500">
                Còn lại: <span className="font-medium text-gray-700">{product.stock}</span> sản phẩm
              </span>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Số lượng:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <Button
                onClick={() => {
                  const newQuantity = Math.max(1, parseInt(inputQuantity) - 1);
                  setInputQuantity(newQuantity.toString());
                  handleUpdate(newQuantity);
                }}
                isDisabled={isUpdating || parseInt(inputQuantity) <= 1}
                isIconOnly
                size="sm"
                className="h-8 w-8 min-w-0 bg-transparent hover:bg-gray-100"
              >
                <Minus size={16} />
              </Button>
              
              <Input
                value={inputQuantity}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                onKeyPress={handleKeyPress}
                type="number"
                min="1"
                max={product?.stock || 999}
                className="w-16 text-center"
                classNames={{
                  input: "text-center font-medium",
                  inputWrapper: "border-0 shadow-none h-8 min-h-0"
                }}
                size="sm"
              />
              
              <Button
                onClick={() => {
                  const newQuantity = parseInt(inputQuantity) + 1;
                  if (product?.stock && newQuantity > product.stock) {
                    toast.error(`Bạn đã chọn hết! Chỉ còn ${product.stock} sản phẩm trong kho.`);
                    return;
                  }
                  setInputQuantity(newQuantity.toString());
                  handleUpdate(newQuantity);
                }}
                isDisabled={isUpdating || (product?.stock && parseInt(inputQuantity) >= product.stock)}
                isIconOnly
                size="sm"
                className="h-8 w-8 min-w-0 bg-transparent hover:bg-gray-100"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Price and Remove */}
        <div className="flex flex-col items-end gap-4">
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formatPriceInVND(product?.salePrice * item?.quantity)}
            </div>
            <div className="text-sm text-gray-500">
              {formatPriceInVND(product?.salePrice)} x {item?.quantity}
            </div>
          </div>
          
          <Button
            onClick={handleRemove}
            isLoading={isRemoving}
            isDisabled={isRemoving}
            isIconOnly
            color="danger"
            size="sm"
            className="h-10 w-10"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}