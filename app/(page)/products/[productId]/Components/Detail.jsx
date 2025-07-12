'use client';

import {
    getProductCategoryInfo,
    detectProductType,
    getColorById
} from "@/app/admin/products/form/components/Colors";
import AddToCartButton from "@/app/components/AddToCartButton";
import FavoriteButton from "@/app/components/FavoriteButton";
import AuthContextProvider from "@/contexts/AuthContext";
import ProductDescription from "./Des";
import TechnicalSpecificationsDisplay from "./TechnicalSpecificationsDisplay";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";

// Import các Server Components
import { Brand, Category, RatingReview } from "./ProductInfo";

export default function Details({ product, brands, categories }) {
    const [selectedStorage, setSelectedStorage] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    const selectedBrand = brands?.find(brand => brand.id === product?.brandId);
    const selectedCategory = categories?.find(category => category.id === product?.categoryId);
    const productType = detectProductType(selectedBrand?.name, selectedCategory?.name);
    const categoryInfo = getProductCategoryInfo(productType);

    // Tính toán số lượng còn lại
    const soldQuantity = product?.soldQuantity || product?.orders || 0;
    const remainingStock = product?.stock - soldQuantity;
    const isOutOfStock = remainingStock <= 0;

    const getSelectedColors = () => {
        if (Array.isArray(product?.colorIds) && product.colorIds.length > 0) {
            return product.colorIds.map(colorId => getColorById(colorId)).filter(Boolean);
        }
        return [];
    };

    const getSelectedStorages = () => {
        const storageField = categoryInfo?.storageField;
        const storageData = product?.[storageField];

        if (Array.isArray(storageData) && storageData.length > 0) return storageData;
        else if (Array.isArray(product?.storages) && product.storages.length > 0) return product.storages;
        else if (Array.isArray(product?.specifications) && product.specifications.length > 0) return product.specifications;
        else if (product?.storage) return [product.storage];
        return [];
    };

    const availableColors = getSelectedColors();
    const storageOptions = getSelectedStorages();

    useEffect(() => {
        if (storageOptions.length === 1 && !selectedStorage) setSelectedStorage(storageOptions[0]);
        if (availableColors.length === 1 && !selectedColor) setSelectedColor(availableColors[0].id);
    }, [storageOptions, availableColors, selectedStorage, selectedColor]);

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex gap-3">
                <Suspense fallback={<div className="h-8 w-20 bg-gray-200 animate-pulse rounded-full"></div>}>
                    <Category categoryId={product?.categoryId} />
                </Suspense>
                <Suspense fallback={<div className="h-8 w-20 bg-gray-200 animate-pulse rounded-full"></div>}>
                    <Brand brandId={product?.brandId} />
                </Suspense>
            </div>

            <h1 className="font-semibold text-xl md:text-4xl">{product?.title}</h1>

            <Suspense fallback={<div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>}>
                <RatingReview productId={product?.id} />
            </Suspense>

            <h2 className="text-gray-600 text-sm line-clamp-3 md:line-clamp-4">
                {product?.shortDescription}
            </h2>

            <h3 className="text-green-500 font-bold text-lg">
                {product?.salePrice?.toLocaleString('vi-VN')} đ
                <span className="line-through text-gray-700 text-sm ml-2">
                    {product?.price?.toLocaleString('vi-VN')} đ
                </span>
            </h3>

            {/* Hiển thị thông báo hết hàng ngay sau giá */}
            {isOutOfStock && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-600 font-semibold">Sản phẩm hiện tại đã hết hàng</span>
                    </div>
                    <p className="text-red-500 text-sm mt-1">
                        Sản phẩm sẽ được bổ sung trong thời gian sớm nhất. Vui lòng quay lại sau!
                    </p>
                </div>
            )}

            {/* Hiển thị số lượng còn lại nếu còn hàng */}
            {!isOutOfStock && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-600 font-medium text-sm">
                            Còn lại {remainingStock} sản phẩm trong kho
                        </span>
                    </div>
                </div>
            )}

            {storageOptions.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h4 className="font-semibold text-gray-800">Phiên bản - Dung lượng</h4>
                    <div className="flex flex-wrap gap-2">
                        {storageOptions.map((storage, index) => (
                            <button
                                key={`storage-${index}`}
                                onClick={() => !isOutOfStock && setSelectedStorage(storage)}
                                disabled={isOutOfStock}
                                className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isOutOfStock 
                                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : selectedStorage === storage
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                {storage}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {availableColors.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h4 className="font-semibold text-gray-800">Màu sắc</h4>
                    <div className="flex flex-wrap gap-3">
                        {availableColors.map((color) => (
                            <button
                                key={`color-${color.id}`}
                                onClick={() => !isOutOfStock && setSelectedColor(color.id)}
                                disabled={isOutOfStock}
                                className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all duration-200 min-w-[140px] ${
                                    isOutOfStock
                                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                                        : selectedColor === color.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 bg-white hover:border-gray-400'
                                }`}
                            >
                                <div
                                    className={`w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm flex-shrink-0 ${
                                        isOutOfStock ? 'opacity-50' : ''
                                    }`}
                                    style={{ backgroundColor: color.hexColor || '#000000' }}
                                ></div>

                                <div className="flex flex-col items-start">
                                    <span className={`text-sm font-medium ${
                                        isOutOfStock
                                            ? 'text-gray-400'
                                            : selectedColor === color.id 
                                            ? 'text-blue-700' 
                                            : 'text-gray-700'
                                    }`}>
                                        {color.title}
                                    </span>
                                    <span className={`text-sm font-semibold ${
                                        isOutOfStock
                                            ? 'text-gray-400'
                                            : selectedColor === color.id 
                                            ? 'text-blue-600' 
                                            : 'text-green-600'
                                    }`}>
                                        {product?.salePrice?.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {(selectedStorage || selectedColor) && !isOutOfStock && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 mb-2">Lựa chọn của bạn:</h5>
                    <div className="flex flex-wrap gap-2">
                        {selectedStorage && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {categoryInfo?.storageLabel || 'Dung lượng'}: {selectedStorage}
                            </span>
                        )}
                        {selectedColor && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: getColorById(selectedColor)?.hexColor || '#000000' }}
                                ></div>
                                Màu: {getColorById(selectedColor)?.title}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
                {(() => {
                    // Nếu hết hàng, hiển thị nút disabled
                    if (isOutOfStock) {
                        return (
                            <div className="relative group">
                                <button
                                    className="bg-gray-400 text-white rounded-lg px-6 py-2.5 font-medium cursor-not-allowed"
                                    disabled
                                >
                                    Hết hàng
                                </button>
                                <div className="absolute -bottom-8 left-0 text-xs text-red-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Sản phẩm hiện tại đã hết hàng
                                </div>
                            </div>
                        );
                    }

                    const hasStorageOptions = storageOptions.length > 0;
                    const hasColorOptions = availableColors.length > 0;
                    const needsStorage = hasStorageOptions && !selectedStorage;
                    const needsColor = hasColorOptions && !selectedColor;
                    const canPurchase = !needsStorage && !needsColor;

                    if (canPurchase) {
                        return (
                            <Link href={`/checkout?type=buynow&productId=${product?.id}${selectedStorage ? `&storage=${encodeURIComponent(selectedStorage)}` : ''}${selectedColor ? `&color=${selectedColor}` : ''}`}>
                                <button className="bg-black text-white rounded-lg px-6 py-2.5 font-medium hover:bg-gray-800 transition-colors">
                                    Mua Ngay
                                </button>
                            </Link>
                        );
                    } else {
                        const missingSelections = [];
                        if (needsStorage) missingSelections.push('dung lượng');
                        if (needsColor) missingSelections.push('màu sắc');

                        return (
                            <div className="relative group">
                                <button
                                    className="bg-gray-400 text-white rounded-lg px-6 py-2.5 font-medium cursor-not-allowed"
                                    disabled
                                >
                                    Mua Ngay
                                </button>
                                <div className="absolute -bottom-8 left-0 text-xs text-red-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Chọn {missingSelections.join(' và ')} để mua
                                </div>
                            </div>
                        );
                    }
                })()}

                <AuthContextProvider>
                    <AddToCartButton
                        type={"large"}
                        productId={product?.id}
                        selectedOptions={{ storage: selectedStorage, color: selectedColor }}
                        disabled={
                            isOutOfStock ||
                            (storageOptions.length > 0 && !selectedStorage) ||
                            (availableColors.length > 0 && !selectedColor)
                        }
                    />
                </AuthContextProvider>

                <AuthContextProvider>
                    <FavoriteButton productId={product?.id} />
                </AuthContextProvider>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-6">
                <div className="w-full md:w-1/2">
                    <ProductDescription product={product} />
                </div>
                <div className="w-full md:w-1/2">
                    <TechnicalSpecificationsDisplay 
                    product={product} 
                    brands={brands} 
                    categories={categories}
                    availableColors={availableColors}
                    storageOptions={storageOptions}
                    categoryInfo={categoryInfo}
                    />
                </div>
                </div>

            {/* Thông tin vận chuyển và chính sách */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h5 className="font-semibold text-green-800">Miễn phí vận chuyển</h5>
                    </div>
                    <p className="text-sm text-green-700">
                        Giao hàng miễn phí cho đơn hàng trên 500,000đ
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h5 className="font-semibold text-blue-800">Đổi trả dễ dàng</h5>
                    </div>
                    <p className="text-sm text-blue-700">
                        Đổi trả trong vòng 7 ngày nếu có lỗi từ nhà sản xuất
                    </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V7a2 2 0 00-2-2H8a2 2 0 00-2 2v2" />
                            </svg>
                        </div>
                        <h5 className="font-semibold text-orange-800">Bảo hành chính hãng</h5>
                    </div>
                    <p className="text-sm text-orange-700">
                        Bảo hành chính hãng theo quy định của nhà sản xuất
                    </p>
                </div>
            </div>
        </div>
    );
}