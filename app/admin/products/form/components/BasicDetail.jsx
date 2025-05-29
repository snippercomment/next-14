"use client";

import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";
import {
    phoneColors,
    getColorsByProductType,
    getStorageOptionsByProductType,
    getProductCategoryInfo,
    detectProductType,
    getColorById
} from "./colors"; // Import từ file colors.js đã cập nhật

export default function BasicDetails({ data, handleData }) {
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();

    // Xác định loại sản phẩm dựa trên brand và category
    const selectedBrand = brands?.find(brand => brand.id === data?.brandId);
    const selectedCategory = categories?.find(category => category.id === data?.categoryId);
    const productType = detectProductType(selectedBrand?.name, selectedCategory?.name);

    // Lấy thông tin cấu hình theo loại sản phẩm
    const categoryInfo = getProductCategoryInfo(productType);
    const availableColors = getColorsByProductType(productType);
    const storageOptions = getStorageOptionsByProductType(productType);

    // Hàm xử lý chọn/bỏ chọn màu
    const handleColorToggle = (colorId) => {
        const currentColors = data?.colorIds || [];
        const updatedColors = currentColors.includes(colorId)
            ? currentColors.filter(id => id !== colorId) // Bỏ chọn màu
            : [...currentColors, colorId]; // Thêm màu mới

        handleData("colorIds", updatedColors);
    };

    // Hàm xử lý chọn/bỏ chọn dung lượng/cấu hình
    const handleStorageToggle = (storage) => {
        const currentStorages = data?.[categoryInfo.storageField] || [];
        const updatedStorages = currentStorages.includes(storage)
            ? currentStorages.filter(s => s !== storage) // Bỏ chọn
            : [...currentStorages, storage]; // Thêm mới

        handleData(categoryInfo.storageField, updatedStorages);
    };

    // Reset màu sắc và cấu hình khi thay đổi loại sản phẩm 
    const handleBrandChange = (brandId) => {
        handleData("brandId", brandId);
        // Reset colors and storage when product type might change
        handleData("colorIds", []);
        handleData("storages", []);
        handleData("specifications", []);
    };

    const handleCategoryChange = (categoryId) => {
        handleData("categoryId", categoryId);
        // Reset colors and storage when product type might change
        handleData("colorIds", []);
        handleData("storages", []);
        handleData("specifications", []);
    };

    return (
        <section className="flex-1 flex flex-col gap-3 bg-white rounded-xl p-4 border">
            <h1 className="font-semibold">Thông tin cơ bản</h1>

            {/* tên sản phẩm */}
            <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-xs" htmlFor="product-title">
                    Tên sản phẩm <span className="text-red-500">*</span>{" "}
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
                    className="border px-4 py-2 rounded-lg w-full outline-none"
                    required
                />
            </div>

            {/* mô tả ngắn */}
            <div className="flex flex-col gap-1">
                <label
                    className="text-gray-500 text-xs"
                    htmlFor="product-short-decription"
                >
                    Mô tả ngắn <span className="text-red-500">*</span>{" "}
                </label>
                <input
                    type="text"
                    placeholder="Nhập mô tả ngắn"
                    id="product-short-decription"
                    name="product-short-decription"
                    value={data?.shortDescription ?? ""}
                    onChange={(e) => {
                        handleData("shortDescription", e.target.value);
                    }}
                    className="border px-4 py-2 rounded-lg w-full outline-none"
                    required
                />
            </div>

            {/* thương hiệu */}
            <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-xs" htmlFor="product-brand">
                    Thương hiệu <span className="text-red-500">*</span>{" "}
                </label>
                <select
                    type="text"
                    id="product-brand"
                    name="product-brand"
                    value={data?.brandId ?? ""}
                    onChange={(e) => {
                        handleBrandChange(e.target.value);
                    }}
                    className="border px-4 py-2 rounded-lg w-full outline-none"
                    required
                >
                    <option value="">Chọn thương hiệu</option>
                    {brands?.map((item) => {
                        return (
                            <option value={item?.id} key={item?.id}>
                                {item?.name}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* danh mục */}
            <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-xs" htmlFor="product-category">
                    Danh mục <span className="text-red-500">*</span>{" "}
                </label>
                <select
                    type="text"
                    id="product-category"
                    name="product-category"
                    value={data?.categoryId ?? ""}
                    onChange={(e) => {
                        handleCategoryChange(e.target.value);
                    }}
                    className="border px-4 py-2 rounded-lg w-full outline-none"
                    required
                >
                    <option value="">Chọn danh mục</option>
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
            {(selectedBrand || selectedCategory) && (
                <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm">
                        <span className="text-gray-600">Loại sản phẩm được phát hiện: </span>
                        <span className="font-medium text-blue-600">
                            {categoryInfo.name}
                        </span>
                    </div>
                </div>
            )}

            {/* kho hàng */}
            <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-xs" htmlFor="product-stock">
                    Kho hàng <span className="text-red-500">*</span>{" "}
                </label>
                <input
                    type="number"
                    placeholder="Nhập kho hàng"
                    id="product-stock"
                    name="product-stock"
                    value={data?.stock ?? ""}
                    onChange={(e) => {
                        handleData("stock", e.target.valueAsNumber);
                    }}
                    className="border px-4 py-2 rounded-lg w-full outline-none"
                    required
                />
            </div>

            {/* giá sản phẩm */}
            <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-xs" htmlFor="product-price">
                    Giá sản phẩm <span className="text-red-500">*</span>{" "}
                </label>
                <input
                    type="number"
                    placeholder="Nhập giá sản phẩm"
                    id="product-price"
                    name="product-price"
                    value={data?.price ?? ""}
                    onChange={(e) => {
                        handleData("price", e.target.valueAsNumber);
                    }}
                    className="border px-4 py-2 rounded-lg w-full outline-none"
                    required
                />
            </div>

            {/* giá khuyến mãi */}
            <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-xs" htmlFor="product-sale-price">
                    Giá khuyến mãi <span className="text-red-500">*</span>{" "}
                </label>
                <input
                    type="number"
                    placeholder="Nhập giá khuyến mãi"
                    id="product-sale-price"
                    name="product-sale-price"
                    value={data?.salePrice ?? ""}
                    onChange={(e) => {
                        handleData("salePrice", e.target.valueAsNumber);
                    }}
                    className="border px-4 py-2 rounded-lg w-full outline-none"
                    required
                />
            </div>

            {/* sản phẩm nổi bật */}
            <div className="flex flex-col gap-1">
                <label
                    className="text-gray-500 text-xs"
                    htmlFor="product-is-featured-product"
                >
                    Sản phẩm nổi bật <span className="text-red-500">*</span>{" "}
                </label>
                <select
                    type="number"
                    placeholder="Nhập sản phẩm nổi bật"
                    id="product-is-featured-product"
                    name="product-is-featured-product"
                    value={data?.isFeatured ? "yes" : "no"}
                    onChange={(e) => {
                        handleData("isFeatured", e.target.value === "yes" ? true : false);
                    }}
                    className="border px-4 py-2 rounded-lg w-full outline-none"
                    required
                >
                    <option value={"no"}>Không</option>
                    <option value={"yes"}>Có</option>
                </select>
            </div>

            {/* dung lượng/cấu hình - chọn nhiều */}
            {storageOptions.length > 0 && (
                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 text-xs">
                        {categoryInfo.storageLabel} <span className="text-red-500">*</span>{" "}
                    </label>
                    <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-2">
                            {storageOptions.map((storage) => {
                                const isSelected = (data?.[categoryInfo.storageField] || []).includes(storage);
                                return (
                                    <label
                                        key={storage}
                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${isSelected
                                            ? 'bg-blue-50 border-blue-300'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleStorageToggle(storage)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">{storage}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                    {/* Hiển thị cấu hình đã chọn */}
                    {data?.[categoryInfo.storageField] && data[categoryInfo.storageField].length > 0 && (
                        <div className="mt-2">
                            <span className="text-xs text-gray-500">{categoryInfo.storageLabel} đã chọn: </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                                {data[categoryInfo.storageField].map((storage, index) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {storage}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* màu sắc - chọn nhiều */}
            {availableColors.length > 0 && (
                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 text-xs">
                        Màu sắc <span className="text-red-500">*</span>{" "}
                    </label>
                    <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                            {availableColors.map((color) => {
                                const isSelected = (data?.colorIds || []).includes(color.id);
                                return (
                                    <label
                                        key={color.id}
                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${isSelected
                                            ? 'bg-blue-50 border-blue-300'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleColorToggle(color.id)}
                                            className="w-4 h-4"
                                        />
                                        <div
                                            className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"
                                            style={{ backgroundColor: color.hexColor }}
                                        ></div>
                                        <span className="text-sm">{color.title}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Hiển thị preview màu đã chọn */}
                    {data?.colorIds && data.colorIds.length > 0 && (
                        <div className="mt-2">
                            <span className="text-xs text-gray-500">Màu đã chọn:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {data.colorIds.map(colorId => {
                                    const selectedColor = getColorById(colorId);
                                    return selectedColor ? (
                                        <div key={colorId} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                style={{ backgroundColor: selectedColor.hexColor }}
                                            ></div>
                                            <span className="text-xs">{selectedColor.title}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Thông báo nếu chưa chọn brand/category */}
            {!selectedBrand && !selectedCategory && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <div className="text-sm text-yellow-800">
                        <span className="font-medium">Lưu ý:</span> Vui lòng chọn thương hiệu và danh mục để hiển thị màu sắc và cấu hình phù hợp.
                    </div>
                </div>
            )}
        </section>
    );
}