"use client";

import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Sort({ sortBy, onSortChange, itemsPerPage, onItemsPerPageChange, data, onDataSorted }) {
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showItemsDropdown, setShowItemsDropdown] = useState(false);

    // Refs để xử lý click outside
    const sortRef = useRef(null);
    const itemsRef = useRef(null);

    const sortOptions = [
        { value: 'price_low', label: 'Giá thấp đến cao' },
        { value: 'price_high', label: 'Giá cao đến thấp' },
        { value: 'name_asc', label: 'Tên A-Z' },
        { value: 'name_desc', label: 'Tên Z-A' },
        { value: 'stock_high', label: 'Số lượng nhiều nhất' },
        { value: 'stock_low', label: 'Số lượng ít nhất' },
        { value: 'orders_high', label: 'Đơn hàng nhiều nhất' },
        { value: 'orders_low', label: 'Đơn hàng ít nhất' },
    ];

    const itemsOptions = [
        { value: 3, label: '3 Sản phẩm' },
        { value: 5, label: '5 Sản phẩm' },
        { value: 10, label: '10 Sản phẩm' },
        { value: 20, label: '20 Sản phẩm' },
        { value: 100, label: '100 Sản phẩm' },
    ];

    // Xử lý click outside để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setShowSortDropdown(false);
            }
            if (itemsRef.current && !itemsRef.current.contains(event.target)) {
                setShowItemsDropdown(false);
            }
        };

        if (showSortDropdown || showItemsDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSortDropdown, showItemsDropdown]);

    // Logic sắp xếp dữ liệu - CẬP NHẬT cho cấu trúc dữ liệu admin
    const sortData = (data, sortType) => {
        if (!data || !Array.isArray(data)) return [];

        const sortedData = [...data].sort((a, b) => {
            switch (sortType) {
                case 'price_low':
                    // Sắp xếp theo salePrice (giá bán thực tế) từ thấp đến cao
                    const salePriceA = parseFloat(a.salePrice) || 0;
                    const salePriceB = parseFloat(b.salePrice) || 0;
                    return salePriceA - salePriceB;

                case 'price_high':
                    // Sắp xếp theo salePrice (giá bán thực tế) từ cao đến thấp
                    const salePriceA2 = parseFloat(a.salePrice) || 0;
                    const salePriceB2 = parseFloat(b.salePrice) || 0;
                    return salePriceB2 - salePriceA2;

                case 'name_asc':
                    // Sắp xếp tên A-Z (sử dụng trường title)
                    const titleA = (a.title || '').toLowerCase();
                    const titleB = (b.title || '').toLowerCase();
                    return titleA.localeCompare(titleB, 'vi', {
                        sensitivity: 'base',
                        numeric: true,
                        ignorePunctuation: true
                    });

                case 'name_desc':
                    // Sắp xếp tên Z-A (sử dụng trường title)
                    const titleA2 = (a.title || '').toLowerCase();
                    const titleB2 = (b.title || '').toLowerCase();
                    return titleB2.localeCompare(titleA2, 'vi', {
                        sensitivity: 'base',
                        numeric: true,
                        ignorePunctuation: true
                    });

                case 'stock_high':
                    // Sắp xếp số lượng từ nhiều đến ít
                    const stockA = parseInt(a.stock) || 0;
                    const stockB = parseInt(b.stock) || 0;
                    return stockB - stockA;

                case 'stock_low':
                    // Sắp xếp số lượng từ ít đến nhiều
                    const stockA2 = parseInt(a.stock) || 0;
                    const stockB2 = parseInt(b.stock) || 0;
                    return stockA2 - stockB2;

                case 'orders_high':
                    // Sắp xếp đơn hàng từ nhiều đến ít
                    const ordersA = parseInt(a.orders) || 0;
                    const ordersB = parseInt(b.orders) || 0;
                    return ordersB - ordersA;

                case 'orders_low':
                    // Sắp xếp đơn hàng từ ít đến nhiều
                    const ordersA2 = parseInt(a.orders) || 0;
                    const ordersB2 = parseInt(b.orders) || 0;
                    return ordersA2 - ordersB2;

                default:
                    return 0;
            }
        });

        return sortedData;
    };

    // Xử lý chọn sort option
    const handleSortSelect = (value) => {
        console.log('Selected sort:', value); // Debug log
        onSortChange(value);

        // Thực hiện sắp xếp dữ liệu
        if (data && onDataSorted) {
            const sortedData = sortData(data, value);
            onDataSorted(sortedData);
        }

        setShowSortDropdown(false);
    };

    // Xử lý chọn items per page
    const handleItemsSelect = (value) => {
        console.log('Selected items per page:', value); // Debug log
        onItemsPerPageChange(value);
        setShowItemsDropdown(false);
    };

    // Tự động sắp xếp khi data thay đổi
    useEffect(() => {
        if (data && onDataSorted && sortBy) {
            const sortedData = sortData(data, sortBy);
            onDataSorted(sortedData);
        }
    }, [data]); // Chỉ chạy khi data thay đổi, không phụ thuộc vào sortBy để tránh loop

    // Tìm label hiện tại
    const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Giá thấp đến cao';
    const currentItemsLabel = itemsOptions.find(opt => opt.value === itemsPerPage)?.label || '10 Sản phẩm';

    return (
        <div className="flex gap-4 items-center flex-wrap">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
                <button
                    onClick={() => {
                        setShowSortDropdown(!showSortDropdown);
                        setShowItemsDropdown(false); // Đóng dropdown kia
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                >
                    <span className="text-sm font-medium text-gray-700 truncate">{currentSortLabel}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform text-gray-500 flex-shrink-0 ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSortDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 min-w-[200px]">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortSelect(option.value)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${sortBy === option.value
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-gray-700'
                                    }`}
                            >
                                {option.label}
                                {sortBy === option.value && (
                                    <span className="float-right text-blue-600">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Items per page Dropdown */}
            <div className="relative" ref={itemsRef}>
                <button
                    onClick={() => {
                        setShowItemsDropdown(!showItemsDropdown);
                        setShowSortDropdown(false); // Đóng dropdown kia
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
                >
                    <span className="text-sm font-medium text-gray-700">{currentItemsLabel}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform text-gray-500 flex-shrink-0 ${showItemsDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showItemsDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 min-w-[140px]">
                        {itemsOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleItemsSelect(option.value)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 text-sm whitespace-nowrap transition-colors first:rounded-t-lg last:rounded-b-lg ${itemsPerPage === option.value
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-gray-700'
                                    }`}
                            >
                                {option.label}
                                {itemsPerPage === option.value && (
                                    <span className="float-right text-blue-600">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}