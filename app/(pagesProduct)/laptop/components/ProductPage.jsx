"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/lib/firestore/products/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";
import BrandProduct from "../../form/BrandProduct";
import Sort from "../../form/Sort";

import Panigation from "../../form/Panigation";

export default function ProductPage() {
    // State management
    const [selectedBrand, setSelectedBrand] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [itemsPerPage] = useState(12); // Cố định items per page
    const [allProducts, setAllProducts] = useState([]); // Lưu tất cả sản phẩm đã load
    const [lastSnapDoc, setLastSnapDoc] = useState(null);

    // API calls
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();

    const {
        data: products,
        error,
        isLoading,
        lastSnapDoc: newLastSnapDoc,
    } = useProducts({
        pageLimit: itemsPerPage,
        lastSnapDoc: lastSnapDoc,
        brandId: selectedBrand || null,
        sortBy: sortBy
    });

    // Reset khi filter thay đổi
    useEffect(() => {
        setAllProducts([]);
        setLastSnapDoc(null);
    }, [selectedBrand, sortBy]);

    // Cập nhật danh sách sản phẩm khi có data mới
    useEffect(() => {
        if (products && products.length > 0) {
            if (lastSnapDoc === null) {
                // Lần đầu load hoặc reset filter
                setAllProducts(products);
            } else {
                // Load more - thêm sản phẩm mới vào danh sách
                setAllProducts(prev => [...prev, ...products]);
            }
            setLastSnapDoc(newLastSnapDoc);
        }
    }, [products, newLastSnapDoc]);

    // Load more handler
    const handleLoadMore = () => {
        if (newLastSnapDoc && !isLoading) {
            setLastSnapDoc(newLastSnapDoc);
        }
    };

    // Kiểm tra còn sản phẩm để load không
    const hasMore = products && products.length === itemsPerPage && newLastSnapDoc;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col gap-4">
                        {/* Title */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Laptop
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Khám phá bộ sưu tập laptop mới nhất
                                </p>
                            </div>
                        </div>

                        {/* Brand Filter */}
                        <BrandProduct
                            brands={brands}
                            selectedBrand={selectedBrand}
                            onBrandChange={setSelectedBrand}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Sort and Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="text-sm text-gray-600">
                        {isLoading && allProducts.length === 0 ? (
                            <span>Đang tải...</span>
                        ) : (
                            <span>
                                Hiển thị {allProducts.length} sản phẩm
                                {selectedBrand && brands && (
                                    <span className="ml-1">
                                        · {brands.find(b => b.id === selectedBrand)?.name}
                                    </span>
                                )}
                            </span>
                        )}
                    </div>

                    <Sort
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                    />
                </div>

                {/* Products Grid */}
                {isLoading && allProducts.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            <span>Đang tải...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-600">
                        <span>Có lỗi xảy ra khi tải sản phẩm</span>
                    </div>
                ) : allProducts && allProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                            {allProducts.map((product, index) => (
                                <div key={`${product.id}-${index}`} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                    {/* Product card content sẽ được render ở đây */}
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">
                                            {product.name || 'Tên sản phẩm'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {product.description || 'Mô tả sản phẩm'}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-blue-600">
                                                {product.price ? `${product.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

            
                        <Panigation
                            onLoadMore={handleLoadMore}
                            isLoading={isLoading}
                            hasMore={hasMore}
                            totalProducts={allProducts.length}
                        />
                    </>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <span>Không tìm thấy sản phẩm nào</span>
                    </div>
                )}
            </div>
        </div>
    );
}