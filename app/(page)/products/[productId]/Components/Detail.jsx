"use client"

import {

    getProductCategoryInfo,
    detectProductType,
    getColorById
} from "@/app/admin/products/form/components/Colors";
import AddToCartButton from "@/app/components/AddToCartButton";
import FavoriteButton from "@/app/components/FavoriteButton";
import MyRating from "@/app/components/MyRating";
import AuthContextProvider from "@/contexts/AuthContext";
import { getBrand } from "@/lib/firestore/brands/read_server";
import { getCategory } from "@/lib/firestore/categories/read_server";
import { getProductReviewCounts } from "@/lib/firestore/products/count/read";

import Link from "next/link";
import { Suspense, useState } from "react";

export default function Details({ product, brands, categories }) {
    const [selectedStorage, setSelectedStorage] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    // Lấy thông tin brand và category
    const selectedBrand = brands?.find(brand => brand.id === product?.brandId);
    const selectedCategory = categories?.find(category => category.id === product?.categoryId);

    // Xác định loại sản phẩm
    const productType = detectProductType(selectedBrand?.name, selectedCategory?.name);

    // Lấy thông tin cấu hình theo loại sản phẩm
    const categoryInfo = getProductCategoryInfo(productType);

    // ===== THAY ĐỔI: Chỉ lấy các options đã được chọn cho sản phẩm này =====

    // Lấy các màu sắc đã được chọn cho sản phẩm này
    const getSelectedColors = () => {
        if (Array.isArray(product?.colorIds) && product.colorIds.length > 0) {
            return product.colorIds.map(colorId => getColorById(colorId)).filter(Boolean);
        }
        return [];
    };

    // Lấy các dung lượng đã được chọn cho sản phẩm này
    const getSelectedStorages = () => {
        const storageField = categoryInfo.storageField;
        const storageData = product?.[storageField];

        // Ưu tiên cấu trúc mới dựa trên productType
        if (Array.isArray(storageData) && storageData.length > 0) {
            return storageData;
        }
        // Fallback cho field 'storages' cũ
        else if (Array.isArray(product?.storages) && product.storages.length > 0) {
            return product.storages;
        }
        // Fallback cho field 'specifications' cũ (ví dụ laptop với data cũ)
        else if (Array.isArray(product?.specifications) && product.specifications.length > 0) {
            return product.specifications;
        }
        // Fallback cho single 'storage' field
        else if (product?.storage) {
            return [product.storage];
        }

        return [];
    };

    const availableColors = getSelectedColors();
    const storageOptions = getSelectedStorages();

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex gap-3">
                <Category categoryId={product?.categoryId} />
                <Brand brandId={product?.brandId} />
            </div>

            <h1 className="font-semibold text-xl md:text-4xl">{product?.title}</h1>

            <Suspense fallback="Failed To Load">
                <RatingReview product={product} />
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

            {/* Phần hiển thị các tùy chọn dung lượng/cấu hình - CHỈ HIỂN THỊ NẾU CÓ DATA */}
            {storageOptions && storageOptions.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h4 className="font-semibold text-gray-800">Phiên bản- Dung lượng</h4>
                    <div className="flex flex-wrap gap-3">
                        {storageOptions.map((storage, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedStorage(storage)}
                                className={`relative px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedStorage === storage
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                            >
                                {storage}
                                {selectedStorage === storage && (
                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Phần hiển thị các tùy chọn màu sắc - CHỈ HIỂN THỊ NẾU CÓ DATA */}
            {availableColors && availableColors.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h4 className="font-semibold text-gray-800">Màu sắc</h4>
                    <div className="flex flex-wrap gap-3">
                        {availableColors.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => setSelectedColor(color.id)}
                                className={`relative flex flex-col items-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 min-w-[120px] ${selectedColor === color.id
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 bg-white hover:border-gray-400'
                                    }`}
                            >
                                {/* Icon màu sắc */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                                        style={{ backgroundColor: color.hexColor }}
                                    ></div>
                                    <span className={`text-sm font-medium ${selectedColor === color.id ? 'text-red-700' : 'text-gray-700'
                                        }`}>
                                        {color.title}
                                    </span>
                                </div>

                                {/* Giá tiền (nếu có biến thể giá theo màu) */}
                                <span className={`text-sm font-semibold ${selectedColor === color.id ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    {product?.salePrice?.toLocaleString('vi-VN')}đ
                                </span>

                                {/* Checkmark khi được chọn */}
                                {selectedColor === color.id && (
                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Hiển thị lựa chọn hiện tại */}
            {(selectedStorage || selectedColor) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 mb-2">Lựa chọn của bạn:</h5>
                    <div className="flex flex-wrap gap-2">
                        {selectedStorage && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {categoryInfo.storageLabel}: {selectedStorage}
                            </span>
                        )}
                        {selectedColor && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: getColorById(selectedColor)?.hexColor }}
                                ></div>
                                Màu: {getColorById(selectedColor)?.title}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
                <Link href={`/checkout?type=buynow&productId=${product?.id}${selectedStorage ? `&storage=${selectedStorage}` : ''}${selectedColor ? `&color=${selectedColor}` : ''}`}>
                    <button className="bg-black text-white rounded-lg px-6 py-2.5 font-medium hover:bg-gray-800 transition-colors">
                        Mua Ngay
                    </button>
                </Link>
                <AuthContextProvider>
                    <AddToCartButton
                        type={"cute"}
                        productId={product?.id}
                        selectedOptions={{
                            storage: selectedStorage,
                            color: selectedColor
                        }}
                    />
                </AuthContextProvider>
                <AuthContextProvider>
                    <FavoriteButton productId={product?.id} />
                </AuthContextProvider>
            </div>

            {product?.stock <= (product?.orders ?? 0) && (
                <div className="flex">
                    <h3 className="text-red-500 py-1 rounded-lg text-sm font-semibold">
                        Hết Hàng
                    </h3>
                </div>
            )}

            <div className="flex flex-col gap-2 py-2">
                <div
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{ __html: product?.description ?? "" }}
                ></div>
            </div>
        </div>
    );
}

async function Category({ categoryId }) {
    const category = await getCategory({ id: categoryId });
    return (
        <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
            <img className="h-4" src={category?.imageURL} alt="" />
            <h4 className="text-xs font-semibold">{category?.name}</h4>
        </div>
    );
}

async function Brand({ brandId }) {
    const brand = await getBrand({ id: brandId });
    return (
        <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
            <img className="h-4" src={brand?.imageURL} alt="" />

        </div>
    );
}

async function RatingReview({ product }) {
    const counts = await getProductReviewCounts({ productId: product?.id });
    return (
        <div className="flex gap-3 items-center">
            <MyRating value={counts?.averageRating ?? 0} />
            <h1 className="text-sm text-gray-400">
                <span>{counts?.averageRating?.toFixed(1)}</span> ({counts?.totalReviews})
            </h1>
        </div>
    );
}