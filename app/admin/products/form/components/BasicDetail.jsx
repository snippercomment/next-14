"use client"

import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";

export default function BasicDetail({ data, handleData }) {
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();
    return (
        <section className="flex-1 flex flex-col gap-3 bg-white rounded-xl p-4 border">
            <h1 className="font-bold">Thông tin sản phẩm</h1>
            {/* Title */}
            <div className="flex flex-col gap-2">
                <label htmlFor="product-title" className="text-gray-500 text-xs">
                    Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input type="text"
                    placeholder="Tên sản phẩm"
                    id="product-title"
                    name="product-title"
                    value={data?.title ?? ""}
                    onChange={(e) => handleData("title", e.target.value)}
                    className="border px-4 py-2 rounded-lg w-full outline-none"
                    required
                />
            </div>
            {/* Description */}
            <div className="flex flex-col gap-2">
                <label htmlFor="product-short-decription" className="text-gray-500 text-xs">
                    Mô tả ngắn gọn <span className="text-red-500">*</span>
                </label>
                <input type="text"
                    placeholder="Mô tả ngắn gọn"
                    id="product-short-decription"
                    name="product-short-decription"
                    value={data?.shortDescription ?? ""}
                    onChange={(e) => handleData("shortDescription", e.target.value)}
                    className="border px-4 py-2 rounded-lg w-full outline-none"
                    required
                />
            </div>
            {/* Brand */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-500 text-xs" htmlFor="product-brand">
                    Thương hiệu <span className="text-red-500">*</span>
                </label>
                <select
                    type="text"
                    id="product-brand"
                    name="product-brand"
                    value={data?.brandId ?? ""}
                    onChange={(e) => {
                        handleData("brandId", e.target.value);
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

            {/* Category */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-500 text-xs" htmlFor="product-category">
                    Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                    type="text"
                    id="product-category"
                    name="product-category"
                    value={data?.categoryId ?? ""}
                    onChange={(e) => {
                        handleData("categoryId", e.target.value);
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
            {/* Stock */}
            <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-xs" htmlFor="product-stock">
                    Số lượng <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    placeholder="Nhập số lượng"
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
            {/* giá */}
            <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-xs" htmlFor="product-price">
                    Giá <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    placeholder="Nhập giá"
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
            {/* Sale Price */}
            <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-xs" htmlFor="product-sale-price">
                    Giá khuyến mãi <span className="text-red-500">*</span>
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

        </section>
    )
}
