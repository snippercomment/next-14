"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useProduct } from "@/lib/firestore/products/read";
import { useUser } from "@/lib/firestore/user/read";
import { updateCarts, updateFavorites } from "@/lib/firestore/user/write";
import { Button, CircularProgress } from "@nextui-org/react";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Trash2, Heart, Ticket, Gift } from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

// Hàm format giá tiền
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
};

// Cấu hình voucher cho điện thoại và laptop
const VOUCHER_CONFIG = [
    {
        id: 'voucher_1m',
        name: 'Giảm 100K',
        minOrder: 1000000,
        discount: 100000,
        description: 'Cho đơn từ 1 triệu'
    },
    {
        id: 'voucher_3m',
        name: 'Giảm 300K',
        minOrder: 3000000,
        discount: 300000,
        description: 'Cho đơn từ 3 triệu'
    },
    {
        id: 'voucher_5m',
        name: 'Giảm 500K',
        minOrder: 5000000,
        discount: 500000,
        description: 'Cho đơn từ 5 triệu'
    },
    {
        id: 'voucher_10m',
        name: 'Giảm 1 triệu',
        minOrder: 10000000,
        discount: 1000000,
        description: 'Cho đơn từ 10 triệu'
    },
    {
        id: 'voucher_20m',
        name: 'Giảm 2 triệu',
        minOrder: 20000000,
        discount: 2000000,
        description: 'Cho đơn từ 20 triệu'
    }
];

export default function Page() {
    const { user } = useAuth();
    const { data, isLoading } = useUser({ uid: user?.uid });
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    // Component để tính tổng tiền từ các ProductItem
    const CartSummary = ({ carts }) => {
        const [productPrices, setProductPrices] = useState({});

        const updateProductPrice = (productId, price, quantity) => {
            setProductPrices(prev => ({
                ...prev,
                [productId]: { price, quantity }
            }));
        };

        const totalAmount = useMemo(() => {
            return Object.values(productPrices).reduce((total, item) => {
                return total + (item.price * item.quantity);
            }, 0);
        }, [productPrices]);

        const totalItems = carts?.reduce((total, item) => total + item?.quantity, 0) || 0;

        return {
            totalAmount,
            totalItems,
            updateProductPrice
        };
    };

    const { totalAmount, totalItems, updateProductPrice } = CartSummary({ carts: data?.carts });

    // Tự động chọn voucher tốt nhất
    useEffect(() => {
        const bestVoucher = getBestVoucher(totalAmount);
        setSelectedVoucher(bestVoucher);
    }, [totalAmount]);

    // Lấy voucher tốt nhất có thể áp dụng
    const getBestVoucher = (amount) => {
        const availableVouchers = VOUCHER_CONFIG.filter(voucher => amount >= voucher.minOrder);
        return availableVouchers.length > 0
            ? availableVouchers[availableVouchers.length - 1] // Lấy voucher có giá trị cao nhất
            : null;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <CircularProgress size="lg" color="primary" />
                    <p className="mt-4 text-gray-600 font-medium">Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-xl">
                                <ShoppingBag className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng</h1>
                                <p className="text-sm text-gray-500">{totalItems} sản phẩm</p>
                            </div>
                        </div>
                        {data?.carts?.length > 0 && (
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Tổng cộng</p>
                                <p className="text-2xl font-bold text-blue-600">{formatPrice(totalAmount)} đ</p>
                                {selectedVoucher && (
                                    <p className="text-sm text-green-600">Tiết kiệm {formatPrice(selectedVoucher.discount)} đ</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {(!data?.carts || data?.carts?.length === 0) ? (
                    <EmptyCartState />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Sản phẩm trong giỏ</h2>
                                <div className="space-y-4">
                                    {data?.carts?.map((item, key) => (
                                        <ProductItem
                                            item={item}
                                            key={item?.id}
                                            onPriceUpdate={updateProductPrice}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Voucher Section */}
                            <VoucherSection
                                totalAmount={totalAmount}
                                selectedVoucher={selectedVoucher}
                                onVoucherSelect={setSelectedVoucher}
                            />
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-6">
                            <OrderSummary
                                totalAmount={totalAmount}
                                totalItems={totalItems}
                                selectedVoucher={selectedVoucher}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function VoucherSection({ totalAmount, selectedVoucher, onVoucherSelect }) {
    const availableVouchers = VOUCHER_CONFIG.filter(voucher => totalAmount >= voucher.minOrder);
    const unavailableVouchers = VOUCHER_CONFIG.filter(voucher => totalAmount < voucher.minOrder);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
                <Ticket className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Voucher giảm giá</h3>
            </div>

            {/* Available Vouchers */}
            {availableVouchers.length > 0 && (
                <div className="space-y-3 mb-4">
                    <p className="text-sm font-medium text-green-600">Có thể áp dụng:</p>
                    {availableVouchers.map((voucher) => (
                        <div
                            key={voucher.id}
                            onClick={() => onVoucherSelect(voucher)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedVoucher?.id === voucher.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 bg-gray-50 hover:border-orange-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500 text-white rounded-lg">
                                        <Gift className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{voucher.name}</p>
                                        <p className="text-sm text-gray-600">{voucher.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-orange-600">
                                        -{formatPrice(voucher.discount)} đ
                                    </p>
                                    {selectedVoucher?.id === voucher.id && (
                                        <p className="text-xs text-green-600 font-medium">Đã chọn</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Unavailable Vouchers */}
            {unavailableVouchers.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500">Mua thêm để mở khóa:</p>
                    {unavailableVouchers.map((voucher) => {
                        const remaining = voucher.minOrder - totalAmount;
                        return (
                            <div
                                key={voucher.id}
                                className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-60"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-400 text-white rounded-lg">
                                            <Gift className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-700">{voucher.name}</p>
                                            <p className="text-sm text-gray-500">
                                                Mua thêm {formatPrice(remaining)} đ
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-500">
                                            -{formatPrice(voucher.discount)} đ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Remove voucher option */}
            {selectedVoucher && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                        onClick={() => onVoucherSelect(null)}
                        variant="light"
                        size="sm"
                        className="text-gray-600 hover:text-red-600"
                    >
                        Bỏ chọn voucher
                    </Button>
                </div>
            )}
        </div>
    );
}

function EmptyCartState() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 max-w-md text-center">
                <div className="mb-6">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
                    <p className="text-gray-600">Hãy thêm sản phẩm yêu thích vào giỏ hàng để bắt đầu mua sắm</p>
                </div>
                <Link href="/">
                    <Button
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                        endContent={<ArrowRight className="h-4 w-4" />}
                    >
                        Khám phá sản phẩm
                    </Button>
                </Link>
            </div>
        </div>
    );
}

function ProductItem({ item, onPriceUpdate }) {
    const { user } = useAuth();
    const { data } = useUser({ uid: user?.uid });
    const [isRemoving, setIsRemoving] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const { data: product } = useProduct({ productId: item?.id });

    // Cập nhật giá khi product data thay đổi
    useEffect(() => {
        if (product && onPriceUpdate) {
            const currentPrice = product?.salePrice || product?.price || 0;
            onPriceUpdate(item?.id, currentPrice, item?.quantity);
        }
    }, [product, item?.quantity, item?.id, onPriceUpdate]);

    const handleRemove = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
        setIsRemoving(true);
        try {
            const newList = data?.carts?.filter((d) => d?.id != item?.id);
            await updateCarts({ list: newList, uid: user?.uid });
            // Xóa sản phẩm khỏi tính tổng
            onPriceUpdate(item?.id, 0, 0);
        } catch (error) {
            console.error(error?.message);
        }
        setIsRemoving(false);
    };

    const handleUpdate = async (quantity) => {
        if (quantity < 1) return;
        setIsUpdating(true);
        try {
            const newList = data?.carts?.map((d) => {
                if (d?.id === item?.id) {
                    return { ...d, quantity: parseInt(quantity) };
                }
                return d;
            });
            await updateCarts({ list: newList, uid: user?.uid });

            // Cập nhật tổng tiền
            const currentPrice = product?.salePrice || product?.price || 0;
            onPriceUpdate(item?.id, currentPrice, parseInt(quantity));
        } catch (error) {
            console.error(error?.message);
        }
        setIsUpdating(false);
    };

    const itemTotal = (product?.salePrice || product?.price || 0) * item?.quantity;

    return (
        <div className="group relative bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-300">
            <div className="flex gap-4">
                {/* Product Image */}
                <div className="relative">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                        <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            src={product?.featureImageURL}
                            alt={product?.title}
                        />
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 truncate pr-4">{product?.title}</h3>
                        <Button
                            onClick={handleRemove}
                            isLoading={isRemoving}
                            isDisabled={isRemoving}
                            variant="light"
                            isIconOnly
                            size="sm"
                            className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-green-600">
                            {formatPrice(product?.salePrice || product?.price || 0)} đ
                        </span>
                        {product?.price !== product?.salePrice && product?.price && (
                            <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product?.price)} đ
                            </span>
                        )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <Button
                                onClick={() => handleUpdate(item?.quantity - 1)}
                                isDisabled={isUpdating || item?.quantity <= 1}
                                variant="light"
                                isIconOnly
                                size="sm"
                                className="h-8 w-8 min-w-8"
                            >
                                <Minus size={14} />
                            </Button>
                            <span className="mx-3 font-semibold text-gray-900 min-w-[2ch] text-center">
                                {item?.quantity}
                            </span>
                            <Button
                                onClick={() => handleUpdate(item?.quantity + 1)}
                                isDisabled={isUpdating}
                                variant="light"
                                isIconOnly
                                size="sm"
                                className="h-8 w-8 min-w-8"
                            >
                                <Plus size={14} />
                            </Button>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500">Thành tiền</p>
                            <p className="font-bold text-gray-900">{formatPrice(itemTotal)} đ</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrderSummary({ totalAmount, totalItems, selectedVoucher }) {
    // Logic tính phí ship
    const FREE_SHIPPING_THRESHOLD = 500000; // 500k để miễn phí ship
    const STANDARD_SHIPPING_FEE = 30000; // 30k phí ship chuẩn

    const calculateShipping = () => {
        // Miễn phí ship nếu đơn hàng >= 500k
        if (totalAmount >= FREE_SHIPPING_THRESHOLD) {
            return { fee: 0, isFree: true, reason: 'Miễn phí cho đơn từ 500k' };
        }
        return { fee: STANDARD_SHIPPING_FEE, isFree: false, reason: null };
    };

    const shipping = calculateShipping();
    const voucherDiscount = selectedVoucher ? selectedVoucher.discount : 0;
    const finalTotal = totalAmount + shipping.fee - voucherDiscount;
    const remainingForFreeShip = shipping.isFree ? 0 : FREE_SHIPPING_THRESHOLD - totalAmount;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                    <span>Tạm tính ({totalItems} sản phẩm)</span>
                    <span>{formatPrice(totalAmount)} đ</span>
                </div>

                {/* Voucher discount */}
                {selectedVoucher && (
                    <div className="flex justify-between text-green-600">
                        <span className="flex items-center gap-2">
                            <Ticket className="h-4 w-4" />
                            Voucher giảm giá
                        </span>
                        <span>-{formatPrice(voucherDiscount)} đ</span>
                    </div>
                )}

                <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <div className="text-right">
                        {shipping.isFree ? (
                            <div>
                                <span className="text-green-600 font-medium">Miễn phí</span>
                                {shipping.reason && (
                                    <p className="text-xs text-green-500">{shipping.reason}</p>
                                )}
                            </div>
                        ) : (
                            <span>{formatPrice(shipping.fee)} đ</span>
                        )}
                    </div>
                </div>

                {/* Thông báo về miễn phí ship */}
                {!shipping.isFree && remainingForFreeShip > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">
                            Mua thêm <strong>{formatPrice(remainingForFreeShip)} đ</strong> để được miễn phí vận chuyển!
                        </p>
                    </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Tổng cộng</span>
                        <span className="text-blue-600">{formatPrice(finalTotal)} đ</span>
                    </div>
                    {voucherDiscount > 0 && (
                        <p className="text-sm text-green-600 text-right mt-1">
                            Tiết kiệm {formatPrice(voucherDiscount)} đ
                        </p>
                    )}
                </div>
            </div>

            <Link href={`/checkout?type=cart${selectedVoucher ? `&voucher=${selectedVoucher.id}` : ''}`}>
                <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                    size="lg"
                    endContent={<ArrowRight className="h-5 w-5" />}
                >
                    Tiến hành thanh toán
                </Button>
            </Link>
        </div>
    );
}