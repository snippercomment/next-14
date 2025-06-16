"use client";

import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { useState, useEffect, useMemo } from "react";
import {
    getColorsByProductType,
    getStorageOptionsByProductType,
    getProductCategoryInfo,
    detectProductType,
    getColorById
} from "./Colors"; 

// Định nghĩa các danh mục thương hiệu - đồng bộ với form thương hiệu
const BRAND_CATEGORIES = {
    iphone: {
        value: "iphone",
        label: "iPhone",
        description: "Thương hiệu điện thoại iPhone"
    },
    laptop: {
        value: "laptop",
        label: "Laptop",
        description: "Thương hiệu máy tính xách tay"
    },
    mouse: {
        value: "mouse",
        label: "Chuột",
        description: "Thương hiệu chuột máy tính"
    },
    headphone: {
        value: "headphone",
        label: "Tai nghe",
        description: "Thương hiệu tai nghe và âm thanh"
    }
};

export default function BasicDetails({ data, handleData }) {
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();
    const [forceUpdate, setForceUpdate] = useState(0);

    // Lọc thương hiệu theo danh mục đã chọn
    const getFilteredBrands = () => {
        if (!data?.brandCategory) {
            return brands || [];
        }
        return brands?.filter(brand => brand.category === data.brandCategory) || [];
    };

    // Sử dụng useMemo để tự động cập nhật khi có thay đổi
    const productInfo = useMemo(() => {
        const selectedBrand = brands?.find(brand => brand.id === data?.brandId);
        const selectedCategory = categories?.find(category => category.id === data?.categoryId);
        const productType = detectProductType(selectedBrand?.name, selectedCategory?.name);
        
        // Force re-calculation by including forceUpdate
        const categoryInfo = getProductCategoryInfo(productType);
        const availableColors = getColorsByProductType(productType);
        const storageOptions = getStorageOptionsByProductType(productType);

        // Debug log - sẽ tự động cập nhật khi file colors thay đổi
        console.log('🔄 Product Info Updated:', {
            brand: selectedBrand?.name,
            category: selectedCategory?.name,
            productType,
            colorsCount: availableColors?.length,
            storageCount: storageOptions?.length,
            forceUpdate
        });

        return {
            selectedBrand,
            selectedCategory,
            productType,
            categoryInfo,
            availableColors,
            storageOptions
        };
    }, [brands, categories, data?.brandId, data?.categoryId, forceUpdate]);

    // Auto refresh khi có thay đổi trong development
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const interval = setInterval(() => {
                const newColors = getColorsByProductType(productInfo.productType);
                if (JSON.stringify(newColors) !== JSON.stringify(productInfo.availableColors)) {
                    console.log('🎨 Colors updated, forcing refresh...');
                    setForceUpdate(prev => prev + 1);
                }
            }, 1000); // Check every second in development

            return () => clearInterval(interval);
        }
    }, [productInfo.productType, productInfo.availableColors]);

    // Hàm xử lý chọn/bỏ chọn màu
    const handleColorToggle = (colorId) => {
        const currentColors = data?.colorIds || [];
        const updatedColors = currentColors.includes(colorId)
            ? currentColors.filter(id => id !== colorId)
            : [...currentColors, colorId];

        handleData("colorIds", updatedColors);
    };

    // Hàm xử lý chọn/bỏ chọn dung lượng/cấu hình
    const handleStorageToggle = (storage) => {
        const currentStorages = data?.[productInfo.categoryInfo.storageField] || [];
        const updatedStorages = currentStorages.includes(storage)
            ? currentStorages.filter(s => s !== storage)
            : [...currentStorages, storage];

        handleData(productInfo.categoryInfo.storageField, updatedStorages);
    };

    // Reset màu sắc và cấu hình khi thay đổi danh mục thương hiệu
    const handleBrandCategoryChange = (categoryValue) => {
        handleData("brandCategory", categoryValue);
        handleData("brandId", "");
        handleData("colorIds", []);
        handleData("storages", []);
        handleData("specifications", []);
        setForceUpdate(prev => prev + 1); // Force refresh
    };

    // Reset màu sắc và cấu hình khi thay đổi thương hiệu
    const handleBrandChange = (brandId) => {
        handleData("brandId", brandId);
        handleData("colorIds", []);
        handleData("storages", []);
        handleData("specifications", []);
        setForceUpdate(prev => prev + 1); // Force refresh
    };

    const handleCategoryChange = (categoryId) => {
        handleData("categoryId", categoryId);
        handleData("colorIds", []);
        handleData("storages", []);
        handleData("specifications", []);
        setForceUpdate(prev => prev + 1); // Force refresh
    };

    // Manual refresh button for development
    const handleManualRefresh = () => {
        setForceUpdate(prev => prev + 1);
        console.log('🔄 Manual refresh triggered');
    };

    return (
        <section className="flex-1 flex flex-col gap-4 bg-white rounded-xl p-6 border shadow-sm">
            <div className="border-b pb-3 flex justify-between items-center">
                <h1 className="font-bold text-xl text-gray-800">Thông tin sản phẩm</h1>
                {process.env.NODE_ENV === 'development' && (
                    <button
                        onClick={handleManualRefresh}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                        title="Refresh colors & storage data"
                    >
                        🔄 Refresh
                    </button>
                )}
            </div>

            {/* tên sản phẩm */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-medium" htmlFor="product-title">
                    Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    placeholder="Nhập tên sản phẩm"
                    id="product-title"
                    name="product-title"
                    value={data?.title ?? ""}
                    onChange={(e) => {
                        handleData("title", e.target.value);
                    }}
                    className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                />
            </div>

            {/* mô tả ngắn */}
            <div className="flex flex-col gap-2">
                <label
                    className="text-gray-700 text-sm font-medium"
                    htmlFor="product-short-decription"
                >
                    Mô tả ngắn <span className="text-red-500">*</span>
                </label>
                <textarea
                    placeholder="Nhập mô tả ngắn về sản phẩm"
                    id="product-short-decription"
                    name="product-short-decription"
                    value={data?.shortDescription ?? ""}
                    onChange={(e) => {
                        handleData("shortDescription", e.target.value);
                    }}
                    className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                    required
                />
            </div>

            {/* danh mục thương hiệu */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-medium" htmlFor="brand-category">
                    Danh mục thương hiệu <span className="text-red-500">*</span>
                </label>
                <select
                    id="brand-category"
                    name="brand-category"
                    value={data?.brandCategory ?? ""}
                    onChange={(e) => {
                        handleBrandCategoryChange(e.target.value);
                    }}
                    className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                >
                    <option value="">Chọn danh mục thương hiệu</option>
                    {Object.values(BRAND_CATEGORIES).map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>
                {data?.brandCategory && (
                    <p className="text-xs text-gray-500">
                        {BRAND_CATEGORIES[data.brandCategory]?.description}
                    </p>
                )}
            </div>

            {/* thương hiệu */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-medium" htmlFor="product-brand">
                    Thương hiệu <span className="text-red-500">*</span>
                </label>
                <select
                    id="product-brand"
                    name="product-brand"
                    value={data?.brandId ?? ""}
                    onChange={(e) => {
                        handleBrandChange(e.target.value);
                    }}
                    className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={!data?.brandCategory}
                >
                    <option value="">
                        {!data?.brandCategory ? "Vui lòng chọn danh mục trước" : "Chọn thương hiệu"}
                    </option>
                    {getFilteredBrands().map((item) => {
                        return (
                            <option value={item?.id} key={item?.id}>
                                {item?.name}
                            </option>
                        );
                    })}
                </select>
                {data?.brandCategory && getFilteredBrands().length === 0 && (
                    <p className="text-xs text-amber-600">
                        Chưa có thương hiệu nào trong danh mục này
                    </p>
                )}
            </div>

            {/* danh mục sản phẩm */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-medium" htmlFor="product-category">
                    Danh mục sản phẩm <span className="text-red-500">*</span>
                </label>
                <select
                    id="product-category"
                    name="product-category"
                    value={data?.categoryId ?? ""}
                    onChange={(e) => {
                        handleCategoryChange(e.target.value);
                    }}
                    className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                >
                    <option value="">Chọn danh mục sản phẩm</option>
                    {categories?.map((item) => {
                        return (
                            <option value={item?.id} key={item?.id}>
                                {item?.name}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Hiển thị loại sản phẩm được phát hiện */}
            {(productInfo.selectedBrand || productInfo.selectedCategory) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Loại sản phẩm được phát hiện:</span>
                        <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-sm">
                            {productInfo.categoryInfo.name}
                        </span>
                        <span className="text-xs text-gray-500">
                            (Colors: {productInfo.availableColors?.length || 0}, Storage: {productInfo.storageOptions?.length || 0})
                        </span>
                    </div>
                </div>
            )}

            {/* kho hàng và giá cả */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* kho hàng */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium" htmlFor="product-stock">
                        Kho hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        placeholder="0"
                        id="product-stock"
                        name="product-stock"
                        value={data?.stock ?? ""}
                        onChange={(e) => {
                            handleData("stock", e.target.valueAsNumber);
                        }}
                        className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        min="0"
                        required
                    />
                </div>

                {/* sản phẩm nổi bật */}
                <div className="flex flex-col gap-2">
                    <label
                        className="text-gray-700 text-sm font-medium"
                        htmlFor="product-is-featured-product"
                    >
                        Sản phẩm nổi bật
                    </label>
                    <select
                        id="product-is-featured-product"
                        name="product-is-featured-product"
                        value={data?.isFeatured ? "yes" : "no"}
                        onChange={(e) => {
                            handleData("isFeatured", e.target.value === "yes");
                        }}
                        className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="no">Không</option>
                        <option value="yes">Có</option>
                    </select>
                </div>
            </div>

            {/* giá sản phẩm và giá khuyến mãi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* giá sản phẩm */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium" htmlFor="product-price">
                        Giá sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="0"
                            id="product-price"
                            name="product-price"
                            value={data?.price ?? ""}
                            onChange={(e) => {
                                handleData("price", e.target.valueAsNumber);
                            }}
                            className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pl-12"
                            min="0"
                            required
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            VNĐ
                        </span>
                    </div>
                </div>

                {/* giá khuyến mãi */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium" htmlFor="product-sale-price">
                        Giá khuyến mãi
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="0"
                            id="product-sale-price"
                            name="product-sale-price"
                            value={data?.salePrice ?? ""}
                            onChange={(e) => {
                                handleData("salePrice", e.target.valueAsNumber);
                            }}
                            className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pl-12"
                            min="0"
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            VNĐ
                        </span>
                    </div>
                    {data?.price && data?.salePrice && data.salePrice < data.price && (
                        <p className="text-xs text-green-600">
                            Tiết kiệm: {((1 - data.salePrice / data.price) * 100).toFixed(0)}%
                        </p>
                    )}
                </div>
            </div>

            {/* dung lượng/cấu hình - chọn nhiều */}
            {productInfo.storageOptions.length > 0 && (
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium">
                        {productInfo.categoryInfo.storageLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {productInfo.storageOptions.map((storage) => {
                                const isSelected = (data?.[productInfo.categoryInfo.storageField] || []).includes(storage);
                                return (
                                    <label
                                        key={storage}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all ${isSelected
                                            ? 'bg-blue-100 border-blue-400 shadow-md'
                                            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleStorageToggle(storage)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                                            {storage}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                    {/* Hiển thị cấu hình đã chọn */}
                    {data?.[productInfo.categoryInfo.storageField] && data[productInfo.categoryInfo.storageField].length > 0 && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="text-sm font-medium text-blue-800">{productInfo.categoryInfo.storageLabel} đã chọn:</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {data[productInfo.categoryInfo.storageField].map((storage, index) => (
                                    <span key={index} className="text-xs bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
                                        {storage}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* màu sắc - chọn nhiều */}
            {productInfo.availableColors.length > 0 && (
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium">
                        Màu sắc <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {productInfo.availableColors.map((color) => {
                                const isSelected = (data?.colorIds || []).includes(color.id);
                                return (
                                    <label
                                        key={color.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all ${isSelected
                                            ? 'bg-blue-100 border-blue-400 shadow-md'
                                            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleColorToggle(color.id)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <div
                                            className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 shadow-sm"
                                            style={{ backgroundColor: color.hexColor }}
                                        ></div>
                                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                                            {color.title}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Hiển thị preview màu đã chọn */}
                    {data?.colorIds && data.colorIds.length > 0 && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="text-sm font-medium text-blue-800">Màu đã chọn:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {data.colorIds.map(colorId => {
                                    const selectedColor = getColorById(colorId);
                                    return selectedColor ? (
                                        <div key={colorId} className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-blue-200 shadow-sm">
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                style={{ backgroundColor: selectedColor.hexColor }}
                                            ></div>
                                            <span className="text-xs font-medium text-blue-800">{selectedColor.title}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Thông báo nếu chưa chọn brand/category */}
            {!productInfo.selectedBrand && !productInfo.selectedCategory && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 text-yellow-600 mt-0.5">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-yellow-800">Lưu ý quan trọng</div>
                            <div className="text-sm text-yellow-700 mt-1">
                                Vui lòng chọn đầy đủ danh mục thương hiệu, thương hiệu và danh mục sản phẩm để hiển thị màu sắc và cấu hình phù hợp.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}