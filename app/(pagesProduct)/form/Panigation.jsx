"use client";

import { ChevronDown } from "lucide-react";

export default function Panigation({
    onLoadMore,
    isLoading,
    hasMore,
    totalProducts
}) {
    // Chỉ hiển thị nút "Xem thêm" nếu có từ 10 sản phẩm trở lên và còn sản phẩm để load
    if (totalProducts < 10 || !hasMore) {
        return null;
    }

    return (
        <div className="flex justify-center items-center py-8">
            <button
                onClick={onLoadMore}
                disabled={isLoading || !hasMore}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-200 ${
                    isLoading || !hasMore
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 hover:shadow-md'
                }`}
            >
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="font-medium">Đang tải...</span>
                    </>
                ) : (
                    <>
                        <span className="font-medium">Xem thêm</span>
                        <ChevronDown className="w-4 h-4" />
                    </>
                )}
            </button>
        </div>
    );
}