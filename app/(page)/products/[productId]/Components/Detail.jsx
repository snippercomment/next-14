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
import { Suspense, useState, useEffect } from "react";

export default function Details({ product, brands, categories, reviewCounts }) {
    const [selectedStorage, setSelectedStorage] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    // Lấy thông tin brand và category từ props đã được truyền xuống
    const selectedBrand = brands?.find(brand => brand.id === product?.brandId);
    const selectedCategory = categories?.find(category => category.id === product?.categoryId);

    // Xác định loại sản phẩm
    const productType = detectProductType(selectedBrand?.name, selectedCategory?.name);

    // Lấy thông tin cấu hình theo loại sản phẩm
    const categoryInfo = getProductCategoryInfo(productType);

    // Lấy các màu sắc đã được chọn cho sản phẩm này
    const getSelectedColors = () => {
        if (Array.isArray(product?.colorIds) && product.colorIds.length > 0) {
            return product.colorIds.map(colorId => getColorById(colorId)).filter(Boolean);
        }
        return [];
    };

    // Lấy các dung lượng đã được chọn cho sản phẩm này
    const getSelectedStorages = () => {
        const storageField = categoryInfo?.storageField;
        const storageData = product?.[storageField];

        
        if (Array.isArray(storageData) && storageData.length > 0) {
            return storageData;
        }
        // Fallback cho field 'storages' cũ
        else if (Array.isArray(product?.storages) && product.storages.length > 0) {
            return product.storages;
        }
        // Fallback cho field 'specifications' cũ
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

            {/* Phần hiển thị các tùy chọn dung lượng/cấu hình */}
            {storageOptions && storageOptions.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h4 className="font-semibold text-gray-800">Phiên bản - Dung lượng</h4>
                    <div className="flex flex-wrap gap-2">
                        {storageOptions.map((storage, index) => (
                            <button
                                key={`storage-${index}`}
                                onClick={() => setSelectedStorage(storage)}
                                className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    selectedStorage === storage
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

            {/* Phần hiển thị các tùy chọn màu sắc */}
            {availableColors && availableColors.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h4 className="font-semibold text-gray-800">Màu sắc</h4>
                    <div className="flex flex-wrap gap-3">
                        {availableColors.map((color) => (
                            <button
                                key={`color-${color.id}`}
                                onClick={() => setSelectedColor(color.id)}
                                className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all duration-200 min-w-[140px] ${
                                    selectedColor === color.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 bg-white hover:border-gray-400'
                                }`}
                            >
                                {/* Icon màu sắc */}
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm flex-shrink-0"
                                    style={{ backgroundColor: color.hexColor || '#000000' }}
                                ></div>
                                
                                <div className="flex flex-col items-start">
                                    <span className={`text-sm font-medium ${
                                        selectedColor === color.id ? 'text-blue-700' : 'text-gray-700'
                                    }`}>
                                        {color.title}
                                    </span>
                                    
                                    {/* Giá tiền */}
                                    <span className={`text-sm font-semibold ${
                                        selectedColor === color.id ? 'text-blue-600' : 'text-green-600'
                                    }`}>
                                        {product?.salePrice?.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
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
                {/* Kiểm tra điều kiện trước khi cho phép mua */}
                {(() => {
                    const hasStorageOptions = storageOptions && storageOptions.length > 0;
                    const hasColorOptions = availableColors && availableColors.length > 0;
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
                            <div className="relative">
                                <button 
                                    className="bg-gray-400 text-white rounded-lg px-6 py-2.5 font-medium cursor-not-allowed"
                                    disabled
                                    title={`Vui lòng chọn ${missingSelections.join(' và ')} để tiếp tục`}
                                >
                                    Mua Ngay
                                </button>
                                <div className="absolute -bottom-8 left-0 text-xs text-red-500 whitespace-nowrap">
                                    Chọn {missingSelections.join(' và ')} để mua
                                </div>
                            </div>
                        );
                    }
                })()}
                
                <AuthContextProvider>
                    <AddToCartButton
                        type={"lagre"}
                        productId={product?.id}
                        selectedOptions={{
                            storage: selectedStorage,
                            color: selectedColor
                        }}
                        disabled={(() => {
                            const hasStorageOptions = storageOptions && storageOptions.length > 0;
                            const hasColorOptions = availableColors && availableColors.length > 0;
                            const needsStorage = hasStorageOptions && !selectedStorage;
                            const needsColor = hasColorOptions && !selectedColor;
                            return needsStorage || needsColor;
                        })()}
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

// Chuyển thành async components để fetch data từ server
async function Category({ categoryId }) {
    const category = await getCategory({ id: categoryId });
    
    if (!category) return null;
    
    return (
        <Link href={`/categories/${categoryId}`}>
            <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
                {category.imageURL && (
                    <img className="h-4 w-4 object-contain" src={category.imageURL} alt={category.name || ""} />
                )}
                <h4 className="text-xs font-semibold">{category.name}</h4>
            </div>
        </Link>
    );
}

async function Brand({ brandId }) {
    const brand = await getBrand({ id: brandId });
    
    if (!brand) return null;
    
    return (
        <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
            {brand.imageURL && (
                <img className="h-4 w-4 object-contain" src={brand.imageURL} alt={brand.name || ""} />
            )}
            {brand.name && (
                <h4 className="text-xs font-semibold">{brand.name}</h4>
            )}
        </div>
    );
}

async function RatingReview({ product }) {
    const counts = await getProductReviewCounts({ productId: product?.id });
    
    return (
        <div className="flex gap-3 items-center">
            <MyRating value={counts?.averageRating ?? 0} />
            <h1 className="text-sm text-gray-400">
                <span>{counts?.averageRating?.toFixed(1) || '0.0'}</span> ({counts?.totalReviews || 0})
            </h1>
        </div>
    );
}