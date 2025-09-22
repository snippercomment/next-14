"use client";

import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";
import {  useMemo } from "react";
import {
    getColorsByProductType,
    getStorageOptionsByProductType,
    getColorsByBrand,
     getStorageOptionsByBrand,
    getProductCategoryInfo,
    detectProductType,

} from "./Colors";

const getBrandDisplayName = (category) => {
    const brandNames = {
        'iphone': 'iPhone',
        'samsung': 'Samsung Galaxy',
        'vivo': 'Vivo',
        'oppo': 'OPPO',
        'xiaomi': 'Xiaomi',
        'macbook': 'MacBook', 
        'asus': 'ASUS',
        'lenovo': 'Lenovo',
        'dell': 'Dell',
        'hp': 'HP',
        'msi': 'MSI',
        'acer': 'Acer',
        'sony': 'Sony',
        'logitech': 'Logitech',
        'hyper': 'HyperX',
        'razer': 'Razer',
        'corsair': 'Corsair'
    };
    
    return brandNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

// Định nghĩa các Bộ sưu tập
const BRAND_CATEGORIES = {
    iphone: { value: "iphone", label: "iPhone", description: "Thương hiệu điện thoại iPhone" },
    laptop: { value: "laptop", label: "Laptop", description: "Thương hiệu máy tính xách tay" },
    mouse: { value: "mouse", label: "Chuột", description: "Thương hiệu chuột máy tính" },
    headphone: { value: "headphone", label: "Tai nghe", description: "Thương hiệu tai nghe và âm thanh" }
};

export default function BasicDetails({ data, handleData }) {
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();

    // Tổ chức categories thành cấu trúc cha-con (tương thích với file 1)
    const organizedCategories = useMemo(() => {
        if (!categories) return { parentCategories: [], childCategories: [] };
        
        // Categories ở đây là mảng các thể loại cha, mỗi thể loại có thể có children
        const parentCategories = categories; // Tất cả đều là thể loại cha
        
        // Lấy tất cả thể loại con từ children của các thể loại cha
        const childCategories = [];
        categories.forEach(parent => {
            if (parent.children && parent.children.length > 0) {
                parent.children.forEach(child => {
                    childCategories.push({
                        ...child,
                        parentId: parent.id,
                        parentName: parent.name
                    });
                });
            }
        });
        
        return {
            parentCategories,
            childCategories
        };
    }, [categories]);

    // Lọc Thể loại con theo Thể loại cha được chọn
    const filteredChildCategories = useMemo(() => {
        if (!data?.parentCategoryId || !organizedCategories.childCategories) return [];
        return organizedCategories.childCategories.filter(child => 
            child.parentId === data.parentCategoryId
        );
    }, [organizedCategories.childCategories, data?.parentCategoryId]);

    // Lọc thương hiệu theo Thể loại
    const filteredBrands = useMemo(() => {
        if (!data?.brandCategory) return brands || [];
        return brands?.filter(brand => brand.category === data.brandCategory) || [];
    }, [brands, data?.brandCategory]);

    // Thông tin sản phẩm
    const productInfo = useMemo(() => {
        const selectedBrand = brands?.find(brand => brand.id === data?.brandId);
        
        // Tìm category được chọn (ưu tiên con trước, sau đó đến cha)
        let selectedCategory;
        if (data?.categoryId) {
            // Tìm trong thể loại con
            selectedCategory = organizedCategories.childCategories.find(cat => cat.id === data.categoryId);
        }
        if (!selectedCategory && data?.parentCategoryId) {
            // Tìm trong thể loại cha
            selectedCategory = organizedCategories.parentCategories.find(cat => cat.id === data.parentCategoryId);
        }
        
        const productType = detectProductType(selectedBrand?.name, selectedCategory?.name);
        
        let availableColors = [];
        let storageOptions = [];
        
        if (selectedBrand?.name) {
            availableColors = getColorsByBrand(selectedBrand.name);
            storageOptions = getStorageOptionsByBrand(selectedBrand.name); 
        } else if (productType) {
            availableColors = getColorsByProductType(productType);
            storageOptions = getStorageOptionsByProductType(productType);
        }

        return {
            selectedBrand,
            selectedCategory,
            productType,
            categoryInfo: getProductCategoryInfo(productType),
            availableColors,
            storageOptions 
        };
    }, [brands, organizedCategories, data?.brandId, data?.categoryId, data?.parentCategoryId]);

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

    const handleParentCategoryChange = (parentCategoryId) => {
        handleData("parentCategoryId", parentCategoryId);
        handleData("categoryId", ""); 
        resetProductData();
    };

    const handleChildCategoryChange = (categoryId) => {
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

            {/* Bộ sưu tập*/}
            <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-medium">
                    Bộ sưu tập <span className="text-red-500">*</span>
                </label>
                <select
                    value={data?.brandCategory ?? ""}
                    onChange={(e) => handleBrandCategoryChange(e.target.value)}
                    className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
                    required
                >
                    <option value="">Chọn bộ sưu tập</option>
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
                        {!data?.brandCategory ? "Vui lòng chọn bộ sưu tập" : "Chọn thương hiệu"}
                    </option>
                    {filteredBrands.map((item) => (
                        <option value={item?.id} key={item?.id}>
                            {item?.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Thể loại sản phẩm cha */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-medium">
                    Thể loại sản phẩm <span className="text-red-500">*</span>
                </label>
                <select
                    value={data?.parentCategoryId ?? ""}
                    onChange={(e) => handleParentCategoryChange(e.target.value)}
                    className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
                    required
                >
                    <option value="">Chọn thể loại chính</option>
                    {organizedCategories.parentCategories?.map((item) => (
                        <option value={item?.id} key={item?.id}>
                            {item?.name}
                            {item.children && item.children.length > 0 && 
                                ` (${item.children.length} thể loại con)`
                            }
                        </option>
                    ))}
                </select>
            </div>

            {/* Thể loại sản phẩm con (nếu có) */}
            {filteredChildCategories.length > 0 && (
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium">
                        Thể loại con (tùy chọn)
                    </label>
                    <select
                        value={data?.categoryId ?? ""}
                        onChange={(e) => handleChildCategoryChange(e.target.value)}
                        className="border border-gray-300 px-4 py-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Trống - Thuộc trực tiếp thể loại chính</option>
                        {filteredChildCategories.map((item) => (
                            <option value={item?.id} key={item?.id}>
                                {item?.name}
                            </option>
                        ))}
                    </select>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                            <strong>Lưu ý:</strong> Để trống nếu sản phẩm thuộc trực tiếp thể loại chính. 
                            Chọn thể loại con nếu muốn phân loại chi tiết hơn.
                        </p>
                        {data?.parentCategoryId && (
                            <p className="text-xs text-blue-600 mt-1">
                                Thể loại chính đã chọn: <strong>
                                    {organizedCategories.parentCategories.find(cat => cat.id === data.parentCategoryId)?.name}
                                </strong>
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Hiển thị thông tin thể loại đã chọn */}
            {data?.parentCategoryId && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Thể loại đã chọn:</h4>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {organizedCategories.parentCategories.find(cat => cat.id === data.parentCategoryId)?.name}
                        </span>
                        {data?.categoryId && (
                            <>
                                <span className="text-gray-400">→</span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                    {filteredChildCategories.find(cat => cat.id === data.categoryId)?.name}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            )}

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
                <div className="flex flex-col gap-3">
                    <label className="text-gray-700 text-sm font-medium">
                        Màu sắc <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        {/* Nhóm màu theo thương hiệu */}
                        {Object.entries(
                            productInfo.availableColors.reduce((groups, color) => {
                                const brandKey = getBrandDisplayName(color.category);
                                if (!groups[brandKey]) groups[brandKey] = [];
                                groups[brandKey].push(color);
                                return groups;
                            }, {})
                        ).map(([brandName, colors]) => (
                            <div key={brandName} className="mb-4 last:mb-0">
                                {/* Tên thương hiệu */}
                                <h3 className="text-sm font-semibold text-gray-600 mb-3 pb-1 border-b border-gray-200 uppercase tracking-wide">
                                    {brandName}
                                </h3>
                                
                                {/* Grid màu sắc */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {colors.map((color) => {
                                        const isSelected = (data?.colorIds || []).includes(color.id);
                                        return (
                                            <label
                                                key={color.id}
                                                className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer border-2 transition-all duration-200 hover:shadow-sm ${
                                                    isSelected
                                                        ? 'bg-blue-50 border-blue-400 shadow-sm'
                                                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleColorToggle(color.id)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <div
                                                    className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 shadow-sm"
                                                    style={{ backgroundColor: color.hexColor }}
                                                    title={color.title}
                                                ></div>
                                                <span className="text-xs font-medium text-gray-700 leading-tight truncate">
                                                    {color.name}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Thông báo nếu chưa chọn brand/category */}
            {!productInfo.selectedBrand && !productInfo.selectedCategory && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2">   
                        <span className="text-sm text-yellow-700">
                            Vui lòng chọn thương hiệu và thể loại để hiển thị màu sắc và cấu hình phù hợp.
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
}