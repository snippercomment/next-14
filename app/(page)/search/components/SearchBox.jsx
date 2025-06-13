"use client";

import { Button } from "@nextui-org/react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const router = useRouter();

  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  const handleSubmit = async () => {
    if (!query.trim()) return;
       
    setIsLoading(true);
    
    // Fix: Sử dụng window.location để force refresh nếu cần
    const newUrl = `/search?q=${encodeURIComponent(query.trim())}`;
    router.push(newUrl);
       
    // Reset loading sau khi navigate
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Tăng thời gian để đảm bảo page load xong
  };

  const handleClear = () => {
    setQuery("");
    router.push("/search");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setIsLoading(true);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex w-full justify-center gap-3 items-center"
      >
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tên sản phẩm cần tìm..."
            type="text"
            className="w-full border px-5 py-3 pr-12 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            disabled={isLoading}
          />
                   
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
               
        <Button 
          type="submit"
          disabled={!query.trim() || isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tìm...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Search size={16} />
              <span>Tìm kiếm</span>
            </div>
          )}
        </Button>
      </form>
             
      {/* Gợi ý tìm kiếm */}
      {!q && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Gợi ý tìm kiếm:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["iPhone", "Samsung", "MacBook", "Dell", "AirPods"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}