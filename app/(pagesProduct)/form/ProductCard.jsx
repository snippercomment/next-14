"use client";

import { getColorById, detectProductType, getProductCategoryInfo } from "@/app/admin/products/form/components/Colors";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product, brands, categories, allowedProductTypes = null }) {
    const [imageError, setImageError] = useState(false);

    // Lấy thông tin brand và category
    const brand = brands?.find(b => b.id === product?.brandId);
    const category = categories?.find(c => c.id === product?.categoryId);

    // Xác định loại sản phẩm
    const productType = detectProductType(brand?.name, category?.name);

    // Nếu có giới hạn loại sản phẩm và sản phẩm hiện tại không nằm trong danh sách cho phép
    if (allowedProductTypes && !allowedProductTypes.includes(productType)) {
        return null;
    }

    const categoryInfo = getProductCategoryInfo(productType);

    // Tính phần trăm giảm giá
    const discountPercent = product?.price > product?.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    // Format tiền VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(price);
    };

    // Hiển thị màu sắc - cho tất cả sản phẩm có màu
    const renderColors = () => {
        let colors = [];

        if (product?.colorIds && Array.isArray(product.colorIds)) {
            colors = product.colorIds.map(colorId => getColorById(colorId)).filter(Boolean);
        } else if (product?.colors && Array.isArray(product.colors)) {
            colors = product.colors.map(color => ({ hexColor: color, title: color }));
        }

        if (colors.length === 0) return null;

        return (
            <div className="flex gap-1 mt-2">
                {colors.slice(0, 4).map((color, idx) => (
                    <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: color.hexColor }}
                        title={color.title}
                    />
                ))}
                {colors.length > 4 && (
                    <span className="text-xs text-gray-500 ml-1">+{colors.length - 4}</span>
                )}
            </div>
        );
    };

    // Hiển thị cấu hình - cho tất cả loại sản phẩm
    const renderSpecs = () => {
        let specs = [];

        // Lấy cấu hình theo loại sản phẩm
        if (productType === 'phone' && product?.storages && Array.isArray(product.storages)) {
            specs = product.storages;
        } else if (productType === 'laptop' && product?.specifications && Array.isArray(product.specifications)) {
            specs = product.specifications;
        }

        if (specs.length === 0) return null;

        const label = productType === 'phone' ? 'Dung lượng' : 'Cấu hình';

        return (
            <div className="text-xs text-gray-600 mt-1">
                <span className="text-gray-500">{label}: </span>
                {specs.slice(0, 2).join(', ')}
                {specs.length > 2 && ` +${specs.length - 2}`}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden group">
            <Link href={`/products/${product?.id}`}>
                {/* Hình ảnh sản phẩm */}
                <div className="relative aspect-square p-4 bg-gray-50">
                    {/* Badge */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                        {product?.isFeatured && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Mới
                            </span>
                        )}
                        {discountPercent > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                                -{discountPercent}%
                            </span>
                        )}
                    </div>

                    {/* Hình ảnh */}
                    <div className="w-full h-full flex items-center justify-center">
                        {!imageError ? (
                            <img
                                src={product?.featureImageURL}
                                alt={product?.title}
                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-sm">Không có ảnh</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="p-4 pt-2">
                    {/* Tên sản phẩm */}
                    <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2 min-h-[40px]">
                        {product?.title}
                    </h3>

                    {/* Thông tin cấu hình */}
                    {renderSpecs()}

                    {/* Màu sắc */}
                    {renderColors()}

                    {/* Giá */}
                    <div className="mt-3 space-y-1">
                        {discountPercent > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 line-through text-sm">
                                    {formatPrice(product?.price)}
                                </span>
                                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded">
                                    -{discountPercent}%
                                </span>
                            </div>
                        )}
                        <div className="text-red-600 font-bold text-lg">
                            {formatPrice(product?.salePrice)}
                        </div>
                    </div>

                    {/* Trạng thái kho */}
                    <div className="mt-2">
                        {(product?.stock - (product?.orders ?? 0)) > 0 ? (
                            <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded">
                                Còn hàng
                            </span>
                        ) : (
                            <span className="text-red-500 text-xs bg-red-50 px-2 py-1 rounded">
                                Hết hàng
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}