"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function SearchBar({
    searchQuery,
    onSearchChange,
    data,
    onFilteredData,
    placeholder = "Tìm kiếm theo tên hoặc giá..."
}) {
    const [localSearch, setLocalSearch] = useState(searchQuery || '');

    // Logic tìm kiếm
    const filterData = (data, query) => {
        if (!data || !Array.isArray(data)) return [];
        if (!query.trim()) return data;

        const searchTerm = query.toLowerCase().trim();

        return data.filter(item => {
            // Tìm kiếm theo tên sản phẩm (title)
            const title = (item.title || '').toLowerCase();
            const titleMatch = title.includes(searchTerm);

            // Tìm kiếm theo giá gốc (price)
            const price = String(item.price || '');
            const priceMatch = price.includes(searchTerm);

            // Tìm kiếm theo giá sale (salePrice) 
            const salePrice = String(item.salePrice || '');
            const salePriceMatch = salePrice.includes(searchTerm);

            // Tìm kiếm theo giá đã format (loại bỏ dấu phẩy/chấm)
            const cleanSearchTerm = searchTerm.replace(/[,\.]/g, '');
            const cleanPrice = price.replace(/[,\.]/g, '');
            const cleanSalePrice = salePrice.replace(/[,\.]/g, '');
            const formattedPriceMatch = cleanPrice.includes(cleanSearchTerm);
            const formattedSalePriceMatch = cleanSalePrice.includes(cleanSearchTerm);

            // Tìm kiếm theo giá đã format VND (25,000,000 VND)
            const formatCurrencyVND = (amount) => {
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                }).format(amount);
            };

            const formattedPriceVND = formatCurrencyVND(item.price || 0).toLowerCase();
            const formattedSalePriceVND = formatCurrencyVND(item.salePrice || 0).toLowerCase();
            const vndPriceMatch = formattedPriceVND.includes(searchTerm);
            const vndSalePriceMatch = formattedSalePriceVND.includes(searchTerm);

            return titleMatch || priceMatch || salePriceMatch ||
                formattedPriceMatch || formattedSalePriceMatch ||
                vndPriceMatch || vndSalePriceMatch;
        });
    };

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearchChange(localSearch);

            // Thực hiện lọc dữ liệu nếu có callback
            if (data && onFilteredData) {
                const filteredData = filterData(data, localSearch);
                onFilteredData(filteredData);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [localSearch, onSearchChange, data, onFilteredData]);

    const handleClear = () => {
        setLocalSearch('');
        onSearchChange('');

        // Reset về dữ liệu gốc
        if (data && onFilteredData) {
            onFilteredData(data);
        }
    };

    return (
        <div className="relative max-w-md w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {localSearch && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Search hints - hiển thị gợi ý tìm kiếm */}
            {localSearch && (
                <div className="absolute top-full left-0 mt-1 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm border border-gray-100 z-10">
                    Tìm kiếm: "{localSearch}" trong tên sản phẩm, giá gốc và giá sale
                </div>
            )}
        </div>
    );
}