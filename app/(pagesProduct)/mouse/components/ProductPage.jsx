"use client";

import { useState, useEffect, useMemo } from "react";
import { useProducts } from "@/lib/firestore/products/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";
import BrandProduct from "../../form/BrandProduct";
import Sort from "../../form/Sort";
import Search from "../../form/SearchBar";

import Panigation from "../../form/Panigation";

export default function ProductPage() {
    // State management
    const [selectedBrand, setSelectedBrand] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastSnapDocList, setLastSnapDocList] = useState([]);

    // API calls
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();

    const {
        data: products,
        error,
        isLoading,
        lastSnapDoc,
    } = useProducts({
        pageLimit: itemsPerPage,
        lastSnapDoc: lastSnapDocList?.length === 0
            ? null
            : lastSnapDocList[lastSnapDocList?.length - 1],
        brandId: selectedBrand || null,
        searchQuery: searchQuery || null,
        sortBy: sortBy
    });

    // Reset pagination when filters change
    useEffect(() => {
        setLastSnapDocList([]);
        setCurrentPage(1);
    }, [selectedBrand, searchQuery, sortBy, itemsPerPage]);

    // Filtered and sorted products
    const filteredProducts = useMemo(() => {
        if (!products) return [];

        let filtered = [...products];

        // Filter by brand
        if (selectedBrand) {
            filtered = filtered.filter(product => product.brandId === selectedBrand);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.title?.toLowerCase().includes(query) ||
                product.shortDescription?.toLowerCase().includes(query)
            );
        }

        // Sort products
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'price_low':
                filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
                break;
            case 'price_high':
                filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
                break;
            case 'name_asc':
                filtered.sort((a, b) => a.title?.localeCompare(b.title));
                break;
            case 'name_desc':
                filtered.sort((a, b) => b.title?.localeCompare(a.title));
                break;
            default:
                break;
        }

        return filtered;
    }, [products, selectedBrand, searchQuery, sortBy]);

    // Pagination handlers
    const handleNextPage = () => {
        if (lastSnapDoc) {
            let newStack = [...lastSnapDocList];
            newStack.push(lastSnapDoc);
            setLastSnapDocList(newStack);
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (lastSnapDocList.length > 0) {
            let newStack = [...lastSnapDocList];
            newStack.pop();
            setLastSnapDocList(newStack);
            setCurrentPage(prev => prev - 1);
        }
    };

    const hasNextPage = products && products.length === itemsPerPage;
    const hasPrevPage = lastSnapDocList.length > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col gap-4">
                        {/* Title and Search */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Điện thoại di động
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Khám phá bộ sưu tập điện thoại mới nhất
                                </p>
                            </div>
                            <Search
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                placeholder="Tìm kiếm điện thoại..."
                            />
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
                        {isLoading ? (
                            <span>Đang tải...</span>
                        ) : (
                            <span>
                                Hiển thị {filteredProducts.length} sản phẩm
                                {selectedBrand && brands && (
                                    <span className="ml-1">
                                        · {brands.find(b => b.id === selectedBrand)?.name}
                                    </span>
                                )}
                                {searchQuery && (
                                    <span className="ml-1">
                                        · "{searchQuery}"
                                    </span>
                                )}
                            </span>
                        )}
                    </div>

                    <Sort
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>


                {/* Pagination */}
                {!isLoading && filteredProducts.length > 0 && (
                    <Panigation
                        currentPage={currentPage}
                        hasNextPage={hasNextPage}
                        hasPrevPage={hasPrevPage}
                        onNextPage={handleNextPage}
                        onPrevPage={handlePrevPage}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
}