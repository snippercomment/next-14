"use client";

import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";
import {  useMemo } from "react";
import {
    getColorsByProductType,
    getStorageOptionsByProductType,
    getProductCategoryInfo,
    detectProductType,

} from "./Colors";

// Định nghĩa các danh mục thương hiệu
const BRAND_CATEGORIES = {
    iphone: { value: "iphone", label: "iPhone", description: "Thương hiệu điện thoại iPhone" },
    laptop: { value: "laptop", label: "Laptop", description: "Thương hiệu máy tính xách tay" },
    mouse: { value: "mouse", label: "Chuột", description: "Thương hiệu chuột máy tính" },
    headphone: { value: "headphone", label: "Tai nghe", description: "Thương hiệu tai nghe và âm thanh" }
};

export default function BasicDetails({ data, handleData }) {
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();

    // Lọc thương hiệu theo danh mục
    const filteredBrands = useMemo(() => {
        if (!data?.brandCategory) return brands || [];
        return brands?.filter(brand => brand.category === data.brandCategory) || [];
    }, [brands, data?.brandCategory]);

    // Thông tin sản phẩm
    const productInfo = useMemo(() => {
        const selectedBrand = brands?.find(brand => brand.id === data?.brandId);
        const selectedCategory = categories?.find(category => category.id === data?.categoryId);
        const productType = detectProductType(selectedBrand?.name, selectedCategory?.name);
        
        return {
            selectedBrand,
            selectedCategory,
            productType,
            categoryInfo: getProductCategoryInfo(productType),
            availableColors: getColorsByProductType(productType),
            storageOptions: getStorageOptionsByProductType(productType)
        };
    }, [brands, categories, data?.brandId, data?.categoryId]);

    // Xử lý chọn/bỏ chọn màu
    const handleColorToggle = (colorId) => {
        const currentColors = data?.colorIds || [];
        const updatedColors = currentColors.includes(colorId)
            ? currentColors.filter(id => id !== colorId)
            : [...currentColors, colorId];
        handleData("colorIds", updatedColors);
    };

    // Xử lý chọn/bỏ chọn dung lượng
    const handleStorageToggle = (storage) => {
        const currentStorages = data?.[productInfo.categoryInfo.storageField] || [];
        const updatedStorages = currentStorages.includes(storage)
            ? currentStorages.filter(s => s !== storage)
            : [...currentStorages, storage];
        handleData(productInfo.categoryInfo.storageField, updatedStorages);
    };

    // Reset dữ liệu khi thay đổi danh mục - FIX: Reset tất cả các trường liên quan
    const resetProductData = () => {
        handleData("colorIds", []);
        // Reset tất cả các trường storage có thể có
        handleData("storageOptions", []);
        handleData("storageCapacity", []);
        handleData("ramOptions", []);
        handleData("diskOptions", []);
        handleData("configOptions", []);
    };

    const handleBrandCategoryChange = (categoryValue) => {
        handleData("brandCategory", categoryValue);
        handleData("brandId", "");
        resetProductData();
    };

    const handleBrandChange = (brandId) => {
        handleData("brandId", brandId);
        resetProductData();
    };

    const handleCategoryChange = (categoryId) => {
        handleData("categoryId", categoryId);
        resetProductData();
    };

    return (
        <section className="flex-1 flex flex-col gap-4 bg-white rounded-xl p-6 border shadow-sm">
            <h1 className="font-bold text-xl text-gray-800 border-b pb-3">Thông tin sản phẩm</h1>

            {/* Tên sản phẩm */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-medium">
                    Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    placeholder="Nhập tên sản phẩm"
                    value={data?.title ?? ""}
                    onChange={(e) => handleData("title", e.target.value)}
                    className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            {/* Mô tả ngắn */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-medium">
                    Mô tả ngắn <span className="text-red-500">*</span>
                </label>
                <textarea
                    placeholder="Nhập mô tả ngắn về sản phẩm"
                    value={data?.shortDescription ?? ""}
                    onChange={(e) => handleData("shortDescription", e.target.value)}
                    className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    required
                />
            </div>

            {/* Danh mục thương hiệu */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-medium">
                    Danh mục thương hiệu <span className="text-red-500">*</span>
                </label>
                <select
                    value={data?.brandCategory ?? ""}
                    onChange={(e) => handleBrandCategoryChange(e.target.value)}
                    className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
                    required
                >
                    <option value="">Chọn danh mục thương hiệu</option>
                    {Object.values(BRAND_CATEGORIES).map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Thương hiệu */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-medium">
                    Thương hiệu <span className="text-red-500">*</span>
                </label>
                <select
                    value={data?.brandId ?? ""}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!data?.brandCategory}
                >
                    <option value="">
                        {!data?.brandCategory ? "Vui lòng chọn danh mục trước" : "Chọn thương hiệu"}
                    </option>
                    {filteredBrands.map((item) => (
                        <option value={item?.id} key={item?.id}>
                            {item?.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Danh mục sản phẩm */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-medium">
                    Danh mục sản phẩm <span className="text-red-500">*</span>
                </label>
                <select
                    value={data?.categoryId ?? ""}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
                    required
                >
                    <option value="">Chọn danh mục sản phẩm</option>
                    {categories?.map((item) => (
                        <option value={item?.id} key={item?.id}>
                            {item?.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Kho hàng và Nổi bật */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium">
                        Kho hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        placeholder="0"
                        value={data?.stock ?? ""}
                        onChange={(e) => handleData("stock", e.target.valueAsNumber)}
                        className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium">
                        Sản phẩm nổi bật
                    </label>
                    <select
                        value={data?.isFeatured ? "yes" : "no"}
                        onChange={(e) => handleData("isFeatured", e.target.value === "yes")}
                        className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="no">Không</option>
                        <option value="yes">Có</option>
                    </select>
                </div>
            </div>

            {/* Giá sản phẩm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium">
                        Giá sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="0"
                            value={data?.price ?? ""}
                            onChange={(e) => handleData("price", e.target.valueAsNumber)}
                            className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 pl-12"
                            min="0"
                            required
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            VNĐ
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium">
                        Giá khuyến mãi
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="0"
                            value={data?.salePrice ?? ""}
                            onChange={(e) => handleData("salePrice", e.target.valueAsNumber)}
                            className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 pl-12"
                            min="0"
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            VNĐ
                        </span>
                    </div>
                </div>
            </div>

            {/* Dung lượng/Cấu hình */}
            {productInfo.storageOptions.length > 0 && (
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium">
                        {productInfo.categoryInfo.storageLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {productInfo.storageOptions.map((storage) => {
                                const isSelected = (data?.[productInfo.categoryInfo.storageField] || []).includes(storage);
                                return (
                                    <label
                                        key={storage}
                                        className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                                            isSelected
                                                ? 'bg-blue-100 border-blue-400'
                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleStorageToggle(storage)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm font-medium">{storage}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Màu sắc */}
            {productInfo.availableColors.length > 0 && (
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium">
                        Màu sắc <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {productInfo.availableColors.map((color) => {
                                const isSelected = (data?.colorIds || []).includes(color.id);
                                return (
                                    <label
                                        key={color.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                                            isSelected
                                                ? 'bg-blue-100 border-blue-400'
                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleColorToggle(color.id)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <div
                                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                                            style={{ backgroundColor: color.hexColor }}
                                        ></div>
                                        <span className="text-sm font-medium">{color.title}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Thông báo nếu chưa chọn brand/category */}
            {!productInfo.selectedBrand && !productInfo.selectedCategory && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2">   
                        <span className="text-sm text-yellow-700">
                            Vui lòng chọn thương hiệu và danh mục để hiển thị màu sắc và cấu hình phù hợp.
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
}