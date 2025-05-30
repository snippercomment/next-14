"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Panigation({
    currentPage,
    hasNextPage,
    hasPrevPage,
    onNextPage,
    onPrevPage,
    isLoading
}) {
    return (
        <div className="flex justify-center items-center gap-4 py-8">
            <button
                onClick={onPrevPage}
                disabled={!hasPrevPage || isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${!hasPrevPage || isLoading
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                    }`}
            >
                <ChevronLeft className="w-4 h-4" />
                <span className="font-medium">Trang trước</span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
                <span className="font-medium">Trang {currentPage}</span>
            </div>

            <button
                onClick={onNextPage}
                disabled={!hasNextPage || isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${!hasNextPage || isLoading
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                    }`}
            >
                <span className="font-medium">Trang tiếp</span>
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}