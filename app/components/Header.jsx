"use client";

import Link from "next/link";
import { UserCircle2, ShoppingBag, Menu, X, LogIn, UserPlus, ChevronDown, Smartphone, Laptop, Headphones, Home, Shield, Tv, Camera, Wrench, Newspaper, Gift } from "lucide-react";
import { useState } from "react";
import LogoutButton from "./LogoutButton";
import HeaderClientButtons from "./HeaderClientButtons";
import AdminButton from "./AdminButton";
import SearchBox from "./SearchBox"; // Import component SearchBox mới
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [expandedDesktopCategory, setExpandedDesktopCategory] = useState(null);
  const { user, isLoading } = useAuth();

  // Danh sách các danh mục chính với icon
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
        { name: "vivo", link: "/vivo" },
        { name: "Infinix", link: "/infinix" },
        { name: "Nokia", link: "/nokia" },
        { name: "Nubia", link: "/nubia" },
        { name: "Nothing Phone", link: "/nothing" },
        { name: "Masstel", link: "/masstel" },
        { name: "Sony", link: "/sony" }
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
      icon: <Headphones size={16} />,
      
    },
    { 
      name: "Phụ kiện", 
      link: "/accessories", 
      icon: <Wrench size={16} />,
      subcategories: [
        { name: "Chuột", link: "/mouse" },
        { name: "Bàn phím", link: "/keyboard" },
        
      ]
    },  
  ];

  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDesktopCategory = (categoryName) => {
    setExpandedDesktopCategory(
      expandedDesktopCategory === categoryName ? null : categoryName
    );
  };

  const toggleMobileCategory = (categoryName) => {
    setExpandedMobileCategory(
      expandedMobileCategory === categoryName ? null : categoryName
    );
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
    setExpandedDesktopCategory(null);
  };

  return (
    <div className="sticky top-0 z-50 bg-primary bg-opacity-65 backdrop-blur-2xl border-b">
      {/* Header chính - Layout nằm ngang */}
      <nav className="py-3 px-4 md:py-4 md:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={"/"}>
          <img className="h-4 md:h-5" src="/logo.png" alt="Logo" />
        </Link>

        {/* Desktop Menu - di chuyển sang trái */}
        <div className="hidden md:flex gap-1 items-center font-semibold">
          <Link href="/">
            <button className="text-sm px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Home size={16} />
              Trang chủ
            </button>
          </Link>

          {/* Dropdown Danh mục */}
          <div className="relative">
            <button
              onClick={toggleCategoryDropdown}
              className="text-sm px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Menu size={16} />
              Danh mục
              <ChevronDown size={14} className={`transform transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

           {isCategoryDropdownOpen && (
  <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto scrollbar-hide">
    <div className="py-2">
      {categoryList.map((category) => (
        <div key={category.name} className="relative">
          {/* Nếu có subcategories thì click để mở dropdown */}
          {category.subcategories ? (
            <>
              <button
                onClick={() => toggleDesktopCategory(category.name)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-b-0 justify-between"
              >
                <div className="flex items-center gap-3">
                  {category.icon}
                  <span className="font-medium">{category.name}</span>
                </div>
                <ChevronDown 
                  size={12} 
                  className={`transform transition-transform ${
                    expandedDesktopCategory === category.name ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {/* Subcategories - hiển thị khi được mở */}
              {expandedDesktopCategory === category.name && (
                <div className="bg-gray-50 border-t border-gray-100">
                  {/* Link đến trang chính của category */}
                  <Link href={category.link}>
                    <button
                      className="w-full text-left px-8 py-2 text-xs text-gray-800 hover:bg-gray-100 font-medium border-b border-gray-200"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    >
                      Tất cả {category.name}
                    </button>
                  </Link>
                  {category.subcategories.map((sub) => (
                    <Link href={sub.link} key={sub.name}>
                      <button
                        className="w-full text-left px-8 py-2 text-xs text-gray-600 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                        onClick={() => setIsCategoryDropdownOpen(false)}
                      >
                        {sub.name}
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Link href={category.link}>
              <button
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                onClick={() => setIsCategoryDropdownOpen(false)}
              >
                {category.icon}
                <span className="font-medium">{category.name}</span>
              </button>
            </Link>
          )}
        </div>
      ))}
    </div>
  </div>
)}
          </div>
        </div>

        {/* Search Box Component - thay thế search cũ */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <SearchBox />
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-1">
          <AdminButton />
          <HeaderClientButtons />

          {/* Icon user dropdown */}
          {!isLoading && (
            <div className="relative">
              <button
                onClick={toggleUserDropdown}
                title="Tài khoản"
                className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
              >
                <UserCircle2 size={14} />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {user ? (
                      <>
                        <Link href="/account">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <UserCircle2 size={16} />
                            Tài khoản của tôi
                          </button>
                        </Link>
                        <Link href="/orders">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <ShoppingBag size={16} />
                            Đơn hàng của tôi
                          </button>
                        </Link>
                        <div className="border-t border-gray-100">
                          <div
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            <LogoutButton />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link href="/login">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <LogIn size={16} />
                            Đăng nhập
                          </button>
                        </Link>
                        <Link href="/sign-up">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <UserPlus size={16} />
                            Đăng ký
                          </button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
            title="Menu"
          >
            {isMobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg max-h-96 overflow-y-auto">
            {/* Mobile Search */}
            <div className="px-4 py-3 border-b border-gray-100">
              <SearchBox placeholder="Nhập tên sản phẩm cần tìm..." />
            </div>

            <div className="py-2">
              <Link href="/" onClick={closeMobileMenu}>
                <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                  <Home size={16} />
                  Trang chủ
                </button>
              </Link>
              
              {categoryList.map((category) => (
                <div key={category.name}>
                  {/* Nếu có subcategories thì hiển thị expand/collapse */}
                  {category.subcategories ? (
                    <>
                      <button
                        onClick={() => toggleMobileCategory(category.name)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 justify-between"
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
                      
                      {/* Mobile subcategories - hiển thị khi expanded */}
                      {expandedMobileCategory === category.name && (
                        <div className="bg-gray-50">
                          {/* Link đến trang chính của category */}
                          <Link href={category.link} onClick={closeMobileMenu}>
                            <button className="w-full text-left px-8 py-2 text-xs text-gray-800 hover:bg-gray-100 border-b border-gray-200 font-medium">
                              Tất cả {category.name}
                            </button>
                          </Link>
                          {category.subcategories.map((sub) => (
                            <Link href={sub.link} key={sub.name} onClick={closeMobileMenu}>
                              <button className="w-full text-left px-8 py-2 text-xs text-gray-600 hover:bg-gray-100 border-b border-gray-200 last:border-b-0">
                                {sub.name}
                              </button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link href={category.link} onClick={closeMobileMenu}>
                      <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                        {category.icon}
                        {category.name}
                      </button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overlay để đóng dropdown/menu khi click ra ngoài */}
        {(isUserDropdownOpen || isMobileMenuOpen || isCategoryDropdownOpen) && (
          <div
            className="fixed inset-0 z-40"
            onClick={closeAllDropdowns}
          />
        )}
      </nav>
    </div>
  );
}