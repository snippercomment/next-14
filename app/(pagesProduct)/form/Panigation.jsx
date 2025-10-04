"use client";

import { ChevronDown } from "lucide-react";

export default function PaginationBar({ total, onLoadMore, currentCount }) {
  const remaining = total - currentCount;

  // Chỉ hiện nút khi còn ít nhất 3 sản phẩm
  if (remaining < 3) return null;

  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={onLoadMore}
        className="px-6 py-3 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 flex items-center gap-2 transition-colors"
      >
        Xem thêm {remaining} sản phẩm
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}