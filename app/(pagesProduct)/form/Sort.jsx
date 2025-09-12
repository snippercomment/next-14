"use client";

import { useState } from "react";
import {  ArrowUpAZ, ArrowDownAZ } from "lucide-react";

const sortOptions = [

  { key: "priceAsc", label: "Giá Thấp - Cao", icon: ArrowUpAZ },
  { key: "priceDesc", label: "Giá Cao - Thấp", icon: ArrowDownAZ },
];

export default function SortBar({ sort, setSort }) {
  const [selected, setSelected] = useState(sort || "popular");

  const handleSelect = (key) => {
    setSelected(key);
    setSort(key);
  };

  return (
    <div className="my-4 flex items-center justify-between">
      {/* chữ bên trái */}
      <h2 className="font-semibold">Sắp xếp theo</h2>

      {/* nút bên phải */}
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.key}
              onClick={() => handleSelect(option.key)}
              className={`flex items-center gap-1 px-4 py-2 rounded-full border transition ${
                selected === option.key
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
              }`}
            >
              <Icon size={16} />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
