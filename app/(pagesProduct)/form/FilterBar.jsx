"use client";

import { useState } from "react";
import {
  Funnel,
  Truck,
  ShoppingCart,
  DollarSign,
  HardDrive,
  Cpu,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const filters = [
  { key: "filter", label: "Bộ lọc", icon: Funnel, type: "button", highlight: true },
  { key: "stock", label: "Sẵn hàng", icon: Truck, type: "button" },
  { key: "new", label: "Hàng mới về", icon: ShoppingCart, type: "button" },
  { key: "price", label: "Xem theo giá", icon: DollarSign, type: "button" },
  {
    key: "ocung",
    label: "Ổ cứng",
    icon: HardDrive,
    type: "dropdown",
    options: ["256GB", "512GB", "1TB", "2TB"],
    tooltip:
      "Ổ cứng là thiết bị dùng để lưu trữ dữ liệu trong máy tính. Loại ổ cứng phổ biến hiện nay là SSD với tốc độ đọc ghi, khởi động ứng dụng nhanh hơn so với HDD.",
  },
  {
    key: "cpu",
    label: "CPU",
    icon: Cpu,
    type: "dropdown",
    options: ["Intel", "AMD", "Apple M1/M2"],
    tooltip:
      "CPU là bộ vi xử lý trung tâm, đóng vai trò xử lý mọi tác vụ chính trên máy tính. CPU càng mạnh thì khả năng xử lý càng nhanh.",
  },
];

export default function FilterBar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selected, setSelected] = useState({});

  const toggleDropdown = (key) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const handleSelect = (filterKey, option) => {
    setSelected({ ...selected, [filterKey]: option });
  };

  return (
    <div className="w-full border-b pb-3 mb-6">
      <h2 className="font-semibold text-lg mb-3">Chọn theo tiêu chí</h2>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) =>
          f.type === "button" ? (
            <button
              key={f.key}
              className={`flex items-center gap-1 px-4 py-2 border rounded-md hover:bg-gray-100 ${
                f.highlight
                  ? "text-red-600 border-red-500 hover:bg-red-50"
                  : "text-gray-700 border-gray-300"
              }`}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
            </button>
          ) : (
            <div key={f.key} className="relative">
              <button
                onClick={() => toggleDropdown(f.key)}
                className={`flex items-center gap-1 px-4 py-2 border rounded-md hover:bg-gray-100 ${
                  openDropdown === f.key ? "border-red-500 text-red-600" : "text-gray-700 border-gray-300"
                }`}
              >
                <f.icon className="w-4 h-4" />
                {f.label}

                {/* Tooltip icon */}
                {f.tooltip && (
                  <div className="relative group">
                    <Info className="w-4 h-4 ml-1 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-64 bg-black text-white text-sm rounded-md p-3 shadow-lg z-20">
                      {f.tooltip}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full border-8 border-transparent border-b-black"></div>
                    </div>
                  </div>
                )}

                {/* Chevron để biết có dropdown */}
                {openDropdown === f.key ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>

              {/* Dropdown menu */}
              {openDropdown === f.key && (
                <div className="absolute left-0 mt-2 w-64 bg-white border rounded-xl shadow-lg p-4 z-10">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {f.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSelect(f.key, opt)}
                        className={`px-4 py-2 rounded-full border ${
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
                      onClick={() => setOpenDropdown(null)}
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
