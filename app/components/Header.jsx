"use client";

import Link from "next/link";
import { Search, UserCircle2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import LogoutButton from "./LogoutButton";
import HeaderClientButtons from "./HeaderClientButtons";
import AdminButton from "./AdminButton";

export default function Header() {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

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

  return (
    <nav className="sticky top-0 z-50 bg-white bg-opacity-65 backdrop-blur-2xl py-3 px-4 md:py-4 md:px-16 border-b flex items-center justify-between">
      <Link href={"/"}>
        <img className="h-4 md:h-5" src="/logo.png" alt="Logo" />
      </Link>

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

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={toggleUserDropdown}
            title="Tài khoản"
            className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
          >
            <UserCircle2 size={14} />
          </button>

          {/* Dropdown Menu */}
          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isUserDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
