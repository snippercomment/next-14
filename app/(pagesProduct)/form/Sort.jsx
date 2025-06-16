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

    // Logic sắp xếp dữ liệu - CẬP NHẬT dựa trên cấu trúc dữ liệu thực tế
    const sortData = (data, sortType) => {
        if (!data || !Array.isArray(data)) return [];

        const sortedData = [...data].sort((a, b) => {
            switch (sortType) {
                case 'price_low':
                    // Ưu tiên salePrice nếu có, không thì dùng price
                    const priceA = parseFloat(a.salePrice) || parseFloat(a.price) || 0;
                    const priceB = parseFloat(b.salePrice) || parseFloat(b.price) || 0;
                    return priceA - priceB;

                case 'price_high':
                    // Ưu tiên salePrice nếu có, không thì dùng price
                    const priceA2 = parseFloat(a.salePrice) || parseFloat(a.price) || 0;
                    const priceB2 = parseFloat(b.salePrice) || parseFloat(b.price) || 0;
                    return priceB2 - priceA2;

                case 'name_asc':
                    // Sắp xếp tên A-Z (sử dụng trường title)
                    const titleA = (a.title || '').toString().toLowerCase().trim();
                    const titleB = (b.title || '').toString().toLowerCase().trim();
                    return titleA.localeCompare(titleB, 'vi', {
                        sensitivity: 'base',
                        numeric: true,
                        ignorePunctuation: true
                    });

                case 'name_desc':
                    // Sắp xếp tên Z-A (sử dụng trường title)
                    const titleA2 = (a.title || '').toString().toLowerCase().trim();
                    const titleB2 = (b.title || '').toString().toLowerCase().trim();
                    return titleB2.localeCompare(titleA2, 'vi', {
                        sensitivity: 'base',
                        numeric: true,
                        ignorePunctuation: true
                    });

                default:
                    return 0;
            }
        });

        return sortedData;
    };

    // Xử lý chọn sort option
    const handleSortSelect = (value) => {     
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
        onItemsPerPageChange(value);
        setShowItemsDropdown(false);
    };

    // Tự động sắp xếp khi data thay đổi
    useEffect(() => {
        if (data && onDataSorted && sortBy) {
            const sortedData = sortData(data, sortBy);
            onDataSorted(sortedData);
        }
    }, [data]); 

    // Tìm label hiện tại
    const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Giá thấp đến cao';


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