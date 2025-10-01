"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { filterData } from "./filterData";

export default function FilterBar({ category, onFilterChange }) {
  const filters = filterData[category] || [];
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selected, setSelected] = useState({});
  const [maxPrice, setMaxPrice] = useState(97190000);

  const toggleDropdown = (key) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const handleSelect = (filterKey, option) => {
    setSelected({ ...selected, [filterKey]: option });
  };

  const applyFilters = () => {
    // Gửi tất cả filter đã chọn về component cha
    const filterValues = {
      ...selected,
      maxPrice: maxPrice
    };
    
    if (onFilterChange) {
      onFilterChange(filterValues);
    }
    
    setOpenDropdown(null);
  };

  const resetFilters = () => {
    setSelected({});
    setMaxPrice(97190000);
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  return (
    <div className="w-full border-b pb-3 mb-6 relative z-30">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">Chọn theo tiêu chí</h2>
        {Object.keys(selected).length > 0 && (
          <button
            onClick={resetFilters}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((f) =>
          f.type === "button" ? (
            <button
              key={f.key}
              className="flex items-center gap-1 px-4 py-2 border rounded-md hover:bg-gray-100 text-gray-700 border-gray-300"
            >
              <f.icon className="w-4 h-4" />
              {f.label}
            </button>
          ) : f.type === "price" ? (
            <div key={f.key} className="relative">
              <button
                onClick={() => toggleDropdown(f.key)}
                className={`flex items-center gap-1 px-4 py-2 border rounded-md hover:bg-gray-100 ${
                  openDropdown === f.key
                    ? "border-red-500 text-red-600"
                    : maxPrice < 97190000
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "text-gray-700 border-gray-300"
                }`}
              >
                <f.icon className="w-4 h-4" />
                {maxPrice < 97190000 
                  ? `< ${(maxPrice/1000000).toFixed(0)} triệu`
                  : f.label}
                {openDropdown === f.key ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>

              {openDropdown === f.key && (
                <div className="fixed left-1/2 top-1/4 transform -translate-x-1/2 w-[420px] bg-white border rounded-xl shadow-lg p-6 z-50">
                  <h3 className="text-sm font-medium mb-3">
                    Hãy chọn mức giá phù hợp với bạn
                  </h3>

                  <div className="flex justify-between mb-4">
                    <input
                      type="text"
                      value={`0đ`}
                      readOnly
                      className="w-1/3 px-2 py-1 border rounded text-sm"
                    />
                    <span>-</span>
                    <input
                      type="text"
                      value={`${maxPrice.toLocaleString("vi-VN")}đ`}
                      readOnly
                      className="w-1/3 px-2 py-1 border rounded text-sm"
                    />
                  </div>

                  <div className="relative w-full h-2 mb-6">
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-1 bg-red-500 rounded"
                      style={{
                        left: "0%",
                        right: `${100 - (maxPrice / 97190000) * 100}%`,
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="97190000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(+e.target.value)}
                      className="absolute w-full h-2 bg-transparent pointer-events-auto accent-red-500"
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setOpenDropdown(null)}
                      className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                    >
                      Xem kết quả
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div key={f.key} className="relative">
              <button
                onClick={() => toggleDropdown(f.key)}
                className={`flex items-center gap-1 px-4 py-2 border rounded-md hover:bg-gray-100 ${
                  selected[f.key]
                    ? "border-red-500 text-red-600 bg-red-50"
                    : openDropdown === f.key
                    ? "border-red-500 text-red-600"
                    : "text-gray-700 border-gray-300"
                }`}
              >
                <f.icon className="w-4 h-4" />
                {selected[f.key] || f.label}
                {openDropdown === f.key ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>

              {openDropdown === f.key && (
                <div className="absolute left-0 mt-2 w-64 bg-white border rounded-xl shadow-lg p-4 z-50">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
                    {f.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSelect(f.key, opt)}
                        className={`px-3 py-1.5 text-sm rounded-md border transition whitespace-nowrap ${
                          selected[f.key] === opt
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setOpenDropdown(null)}
                      className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                    >
                      Xem kết quả
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}