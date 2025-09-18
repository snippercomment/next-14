"use client";

import Link from "next/link";
import { UserCircle2, ShoppingBag, Menu, X, ChevronDown, Smartphone, Laptop, Headphones, Home, Wrench } from "lucide-react";
import { useState } from "react";
import LogoutButton from "./LogoutButton";
import HeaderClientButtons from "./HeaderClientButtons";
import AdminButton from "./AdminButton";
import SearchBox from "./SearchBox";
import { useAuth } from "@/contexts/AuthContext";


export default function Header() {
  // State management - tách riêng từng dropdown để tránh re-render không cần thiết
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const { user, isLoading } = useAuth();

  // Categories config - SEO friendly structure
  const categoryList = [
    { 
      name: "Điện thoại", 
      link: "/phone", 
      icon: <Smartphone size={16} />,
      subcategories: [
        { name: "iPhone", link: "/iphone" },
        { name: "Samsung", link: "/samsung" },
        { name: "Xiaomi", link: "/xiaomi" },
        { name: "OPPO", link: "/oppo" },
        { name: "realme", link: "/realme" },
        { name: "TECNO", link: "/tecno" },
        { name: "Honor", link: "/honor" },
        { name: "vivo", link: "/vivo" }
      ]
    },
    { 
      name: "Laptop", 
      link: "/laptop", 
      icon: <Laptop size={16} />,
      subcategories: [
        { name: "MacBook", link: "/macbook" },
        { name: "Dell", link: "/dell" },
        { name: "HP", link: "/hp" },
        { name: "Asus", link: "/asus" },
        { name: "Lenovo", link: "/lenovo" },
        { name: "Acer", link: "/acer" },
        { name: "MSI", link: "/msi" }
      ]
    },
    { 
      name: "Tai nghe", 
      link: "/headphone", 
      icon: <Headphones size={16} />
    },
    { 
      name: "Phụ kiện", 
      link: "/accessories", 
      icon: <Wrench size={16} />,
      subcategories: [
        { name: "Chuột", link: "/mouse" },
        { name: "Bàn phím", link: "/keyboard" }
      ]
    }
  ];

  // Event handlers - optimized với useCallback pattern
  const toggleCategoryDropdown = () => setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  const toggleMobileCategory = (categoryName) => {
    setExpandedMobileCategory(expandedMobileCategory === categoryName ? null : categoryName);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setExpandedMobileCategory(null);
  };

  const closeAllDropdowns = () => {
    setIsUserDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setExpandedMobileCategory(null);
    setHoveredCategory(null);
  };

  const closeCategoryDropdown = () => {
    setIsCategoryDropdownOpen(false);
    setHoveredCategory(null);
  };

  return (
    // SEO: Sticky header với proper semantic structure
    <header className="sticky top-0 z-50 bg-primary bg-opacity-95 backdrop-blur-sm border-b">
      {/* Main navigation - Centered & responsive layout */}
      <nav className="py-2 px-3 md:py-2.5 md:px-6 flex items-center justify-between" role="navigation" aria-label="Main navigation">
        
        {/* Left section - Logo & Categories */}
        <div className="flex items-center gap-3">
          {/* Logo - SEO optimized */}
          <Link href="/" className="flex-shrink-0" aria-label="Trang chủ">
            <img className="h-6 md:h-7" src="/logo.png" alt="Logo trang chủ" width="auto" height="28" />
          </Link>

          {/* Categories Dropdown - Desktop only */}
          <div className="relative hidden md:block">
            <button
              onClick={toggleCategoryDropdown}
              className="text-sm px-3 py-1.5 rounded-md hover:bg-white/10 flex items-center gap-2 text-white font-medium whitespace-nowrap"
              aria-expanded={isCategoryDropdownOpen}
              aria-haspopup="true"
              aria-label="Danh mục sản phẩm"
            >
              <Menu size={16} />
              Danh mục
              <ChevronDown size={14} className={`transform transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Category Dropdown Menu */}
            {isCategoryDropdownOpen && (
              <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-auto max-w-lg" role="menu">
                <div className="flex">
                  {/* Main Categories */}
                  <div className="w-48 border-r border-gray-200 flex-shrink-0">
                    <div className="py-2">
                      {categoryList.map((category) => (
                        <div key={category.name}>
                          <div
                            onMouseEnter={() => setHoveredCategory(category.subcategories ? category.name : null)}
                            className={`relative ${hoveredCategory === category.name ? 'bg-blue-50' : ''}`}
                          >
                            <Link 
                              href={category.link}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 items-center gap-3 border-b flex border-gray-50 last:border-b-0 justify-between"
                              onClick={closeCategoryDropdown}
                              role="menuitem"
                            >
                              <div className="flex items-center gap-3">
                                {category.icon}
                                <span className="font-medium">{category.name}</span>
                              </div>
                              {category.subcategories && (
                                <ChevronDown size={12} className="rotate-[-90deg]" />
                              )}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subcategories */}
                  {hoveredCategory && (
                    <div 
                      className="w-48 flex-shrink-0"
                      onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div className="py-2 max-h-80 overflow-y-auto">
                        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                          <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                            {hoveredCategory}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-0">
                          {categoryList
                            .find(cat => cat.name === hoveredCategory)
                            ?.subcategories?.map((sub) => (
                              <Link 
                                href={sub.link} 
                                key={sub.name} 
                                onClick={closeCategoryDropdown}
                                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100 last:border-b-0 truncate cursor-pointer block"
                                title={sub.name}
                                role="menuitem"
                              >
                                {sub.name}
                              </Link>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center section - Search Box */}
        <div className="hidden md:block flex-1 max-w-2xl mx-8">
          <SearchBox />
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Cart Button */}
          <HeaderClientButtons />
          
          {/* Admin Button */}
          <AdminButton />

          {/* User Account */}
          {!isLoading && (
            <div className="relative">
              {user ? (
                <button
                  onClick={toggleUserDropdown}
                  className="text-sm px-3 py-1.5 rounded-md hover:bg-white/10 flex items-center gap-2 text-white font-medium whitespace-nowrap"
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Tài khoản người dùng"
                >
                  <UserCircle2 size={16} />
                
                </button>
              ) : (
                <Link href="/login" aria-label="Đăng nhập">
                  <span className="text-sm px-3 py-1.5 rounded-md hover:bg-white/10 flex items-center gap-2 text-white font-medium whitespace-nowrap cursor-pointer">
                    <UserCircle2 size={16} />
                    <span className="hidden lg:inline">Đăng nhập</span>
                  </span>
                </Link>
              )}

              {/* User Dropdown Menu */}
            {isUserDropdownOpen && user && (
  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50" role="menu">
    <div className="py-1">
      <Link href="/account" onClick={() => setIsUserDropdownOpen(false)}>
        <div
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
          role="menuitem"
        >
          <UserCircle2 size={18} className="text-gray-600" />
          <span className="leading-none">Tài khoản của tôi</span>
        </div>
      </Link>

      <Link href="/orders" onClick={() => setIsUserDropdownOpen(false)}>
        <div
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
          role="menuitem"
        >
          <ShoppingBag size={18} className="text-gray-600" />
          <span className="leading-none">Đơn hàng của tôi</span>
        </div>
      </Link>

      <div className="border-t border-gray-100">
        <button
          onClick={() => {
            setIsUserDropdownOpen(false);
            // logic logout ở đây
          }}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
          role="menuitem"
        >
          <LogoutButton />
        
        </button>
      </div>
    </div>
  </div>
)}

            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden h-8 w-8 flex justify-center items-center rounded-md hover:bg-white/10 flex-shrink-0"
            aria-expanded={isMobileMenuOpen}
            aria-label="Menu di động"
          >
            {isMobileMenuOpen ? <X size={16} className="text-white" /> : <Menu size={16} className="text-white" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg max-h-96 overflow-y-auto" role="menu">
            {/* Mobile Search */}
            <div className="px-4 py-3 border-b border-gray-100">
              <SearchBox placeholder="Bạn muốn mua gì hôm nay?" />
            </div>

            {/* Mobile Navigation */}
            <div className="py-2">
              <Link href="/" onClick={closeMobileMenu}>
                <span className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 cursor-pointer " role="menuitem">
                  <Home size={16} />
                  Trang chủ
                </span>
              </Link>
              
              {categoryList.map((category) => (
                <div key={category.name}>
                  {category.subcategories ? (
                    <>
                      <button
                        onClick={() => toggleMobileCategory(category.name)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 justify-between"
                        aria-expanded={expandedMobileCategory === category.name}
                      >
                        <div className="flex items-center gap-3">
                          {category.icon}
                          {category.name}
                        </div>
                        <ChevronDown 
                          size={14} 
                          className={`transform transition-transform ${
                            expandedMobileCategory === category.name ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      
                      {expandedMobileCategory === category.name && (
                        <div className="bg-gray-50">
                          <Link href={category.link} onClick={closeMobileMenu}>
                            <span className="w-full text-left px-8 py-2 text-xs text-gray-800 hover:bg-gray-100 border-b border-gray-200 font-medium cursor-pointer block" role="menuitem">
                              Tất cả {category.name}
                            </span>
                          </Link>
                          {category.subcategories.map((sub) => (
                            <Link href={sub.link} key={sub.name} onClick={closeMobileMenu}>
                              <span className="w-full text-left px-8 py-2 text-xs text-gray-600 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 cursor-pointer block" role="menuitem">
                                {sub.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link href={category.link} onClick={closeMobileMenu}>
                      <span className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 cursor-pointer" role="menuitem">
                        {category.icon}
                        {category.name}
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overlay - đóng dropdown khi click outside */}
        {(isUserDropdownOpen || isMobileMenuOpen || isCategoryDropdownOpen) && (
          <div
            className="fixed inset-0 z-40"
            onClick={closeAllDropdowns}
            aria-hidden="true"
          />
        )}
      </nav>
    </header>
  );
}