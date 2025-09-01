"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SearchBox({ placeholder = "Bạn muốn mua gì hôm nay?" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); 
  
  const router = useRouter();
  const searchRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);

  // Danh sách gợi ý tìm kiếm phổ biến
  const popularSuggestions = [
    "iPhone 16 Series",
    "Samsung Z Fold7", 
    "OPPO Reno14",
    "Redmi Pad 2 WiFi",
    "Laptop AI",
    "iPad Air 11 M3",
    "Samsung Galaxy Watch8",
    "Ecovacs Deebot T80 Omni",
    "JBL Charge 6",
    "Camera EZVIZ H6C G1"
  ];

  // Lấy gợi ý tìm kiếm
  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSearchSuggestions(popularSuggestions.slice(0, 6));
      return;
    }

    const filtered = popularSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    );
    setSearchSuggestions(filtered.slice(0, 6));
  };

  // Lấy kết quả tìm kiếm
  const fetchSearchResults = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setHasSearched(false);
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/search?q=${encodeURIComponent(query.trim())}`);
      
      if (response.ok) {
        const data = await response.json();
        const products = data.products?.slice(0, 8) || [];
        setSearchResults(products);
        setShowSearchResults(true);
        setShowSuggestions(false); // Ẩn gợi ý khi hiển thị kết quả
      } else {
        setSearchResults([]);
        setShowSearchResults(true); // Vẫn hiển thị menu thả xuống để hiển thị "không có kết quả"
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
      setShowSearchResults(true); // Vẫn hiển thị menu thả xuống để hiển thị trạng thái lỗi
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Xử lý thay đổi đầu vào bằng cách gỡ lỗi
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Xóa thời gian chờ cũ
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    // Nếu input trống, reset về suggestions
    if (!value.trim()) {
      setShowSearchResults(false);
      setShowSuggestions(true);
      setHasSearched(false);
      fetchSuggestions("");
      return;
    }

    // Đặt thời gian chờ mới cho tìm kiếm
    suggestionTimeoutRef.current = setTimeout(() => {
      fetchSearchResults(value);
    }, 300);
  };

  // Xử lý tiêu điểm
  const handleSearchFocus = () => {
    if (!searchQuery.trim()) {
      setShowSuggestions(true);
      setShowSearchResults(false);
      fetchSuggestions("");
    } else if (hasSearched) {
      // Nếu đã search rồi thì hiện results
      setShowSearchResults(true);
      setShowSuggestions(false);
    }
  };

  // Xử lý gợi ý nhấp chuột
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Kích hoạt kết quả tìm kiếm cho gợi ý
    fetchSearchResults(suggestion);
  };

  // Xử lý nhấp chuột vào sản phẩm
  const handleProductClick = (productId) => {
    setShowSuggestions(false);
    setShowSearchResults(false);
    setSearchQuery("");
    setHasSearched(false);
    router.push(`/products/${productId}`);
  };

  // Xử lý tìm kiếm gửi
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Tìm kiếm và hiển thị kết quả trong menu thả xuống
    fetchSearchResults(searchQuery.trim());
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setShowSuggestions(false);
    setHasSearched(false);
  };

  // Click outside để đóng suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, []);

  // Xác định những gì sẽ hiển thị trong menu thả xuống
  const shouldShowDropdown = showSuggestions || showSearchResults;
  const hasContent = (showSuggestions && searchSuggestions.length > 0) || 
                    (showSearchResults && (searchResults.length > 0 || isSearching || hasSearched));

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md mx-4">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleSearchFocus}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 text-sm bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
            disabled={isSearching}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Gợi ý tìm kiếm & Kết quả thả xuống */}
      {shouldShowDropdown && hasContent && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          
          {/* Phần Gợi ý - Chỉ hiển thị khi không hiển thị kết quả tìm kiếm */}
          {showSuggestions && searchSuggestions.length > 0 && !showSearchResults && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                Xu hướng tìm kiếm
              </div>
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors duration-150"
                >
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Phần kết quả tìm kiếm */}
          {showSearchResults && (
            <div className="max-h-64 overflow-y-auto">
              {isSearching ? (
                <div className="px-4 py-8 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Đang tìm kiếm...
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                    Sản phẩm ({searchResults.length} kết quả)
                  </div>
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors duration-150"
                    >
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <div className="w-10 h-10 flex-shrink-0">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate mb-1">
                            {product.name}
                          </div>
                          <div className="text-xs text-red-600 font-semibold">
                            {product.price?.toLocaleString('vi-VN')}₫
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              ) : hasSearched && searchQuery.trim() && (
                <div className="px-4 py-8 text-center">
                  <div className="text-sm text-gray-500 mb-2">
                    Không tìm thấy sản phẩm cho "<span className="font-medium">{searchQuery}</span>"
                  </div>
                  <div className="text-xs text-gray-400">
                    Hãy thử tìm kiếm với từ khóa khác
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}