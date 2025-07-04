"use client";

import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Sort({ sortBy, onSortChange, data, onDataSorted }) {
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Ref để xử lý click outside
    const sortRef = useRef(null);

    const sortOptions = [
        { value: 'price_low', label: 'Giá thấp đến cao' },
        { value: 'price_high', label: 'Giá cao đến thấp' },
        { value: 'name_asc', label: 'Tên A-Z' },
        { value: 'name_desc', label: 'Tên Z-A' },
        { value: 'newest', label: 'Mới nhất' },
    ];

    // Xử lý click outside để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setShowSortDropdown(false);
            }
        };

        if (showSortDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSortDropdown]);

    // Logic sắp xếp dữ liệu
    const sortData = (data, sortType) => {
        if (!data || !Array.isArray(data)) return [];

        const sortedData = [...data].sort((a, b) => {
            switch (sortType) {
                case 'price_low':
                    const priceA = getPrice(a);
                    const priceB = getPrice(b);
                    return priceA - priceB;

                case 'price_high':
                    const priceA2 = getPrice(a);
                    const priceB2 = getPrice(b);
                    return priceB2 - priceA2;

                case 'name_asc':
                    const nameA = getName(a);
                    const nameB = getName(b);
                    return nameA.localeCompare(nameB, 'vi', {
                        sensitivity: 'base',
                        numeric: true,
                        ignorePunctuation: true
                    });

                case 'name_desc':
                    const nameA2 = getName(a);
                    const nameB2 = getName(b);
                    return nameB2.localeCompare(nameA2, 'vi', {
                        sensitivity: 'base',
                        numeric: true,
                        ignorePunctuation: true
                    });

                case 'newest':
                    // Sắp xếp theo ngày tạo (mới nhất trước)
                    const dateA = new Date(a.createdAt || a.timestamp || 0);
                    const dateB = new Date(b.createdAt || b.timestamp || 0);
                    return dateB - dateA;

                default:
                    return 0;
            }
        });

        return sortedData;
    };

    // Hàm lấy giá từ object
    const getPrice = (item) => {
        const priceFields = ['salePrice', 'price', 'cost', 'amount'];
        
        for (const field of priceFields) {
            if (item[field] !== undefined && item[field] !== null) {
                const price = parseFloat(item[field]);
                if (!isNaN(price)) {
                    return price;
                }
            }
        }
        
        return 0;
    };

    // Hàm lấy tên từ object
    const getName = (item) => {
        const nameFields = ['title', 'name', 'productName', 'displayName'];
        
        for (const field of nameFields) {
            if (item[field] && typeof item[field] === 'string') {
                return item[field].toLowerCase().trim();
            }
        }
        
        return '';
    };

    // Xử lý chọn sort option
    const handleSortSelect = (value) => {
        onSortChange(value);
        
        // Thực hiện sắp xếp dữ liệu ngay lập tức
        if (data && onDataSorted) {
            const sortedData = sortData(data, value);
            onDataSorted(sortedData);
        }

        setShowSortDropdown(false);
    };

    // Tự động sắp xếp khi data thay đổi
    useEffect(() => {
        if (data && onDataSorted && sortBy) {
            const sortedData = sortData(data, sortBy);
            onDataSorted(sortedData);
        }
    }, [data, sortBy]);

    // Tìm label hiện tại
    const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Mới nhất';

    return (
        <div className="flex gap-4 items-center flex-wrap">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
                <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
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
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                    sortBy === option.value
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
        </div>
    );
}