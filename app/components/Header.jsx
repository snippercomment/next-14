"use client";

import Link from "next/link";
import { Search, UserCircle2, ShoppingBag, Menu, X,LogIn,
  UserPlus } from "lucide-react";
import { useState } from "react";
import LogoutButton from "./LogoutButton";
import HeaderClientButtons from "./HeaderClientButtons";
import AdminButton from "./AdminButton";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();

  const menuList = [
    { name: "Trang chủ", link: "/" },
    { name: "Iphone", link: "/iphone" },
    { name: "Laptop", link: "/laptop" },
    { name: "Mouse", link: "/mouse" },
    { name: "Headphone", link: "/headphone" },
  ];

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white bg-opacity-65 backdrop-blur-2xl py-3 px-4 md:py-4 md:px-16 border-b flex items-center justify-between">
      <Link href={"/"}>
        <img className="h-4 md:h-5" src="/logo.png" alt="Logo" />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-2 items-center font-semibold">
        {menuList.map((item) => (
          <Link href={item.link} key={item.name}>
            <button className="text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
              {item.name}
            </button>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <AdminButton />

        <Link href={`/search`}>
          <button
            title="Tìm kiếm sản phẩm"
            className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
          >
            <Search size={14} />
          </button>
        </Link>

        <HeaderClientButtons />

        {/* Icon user dropdown dùng chung cho cả đã và chưa đăng nhập */}
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
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg">
          <div className="py-2">
            {menuList.map((item) => (
              <Link href={item.link} key={item.name} onClick={closeMobileMenu}>
                <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                  {item.name}
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Overlay để đóng dropdown/menu khi click ra ngoài */}
      {(isUserDropdownOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
}
