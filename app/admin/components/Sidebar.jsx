"use client";

import React, { useState, useEffect } from "react";
import {
  Cat,
  Layers2,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  PackageOpen,
  ShieldCheck,
  ShoppingCart,
  Star,
  User,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

export default function CollapsibleSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.sessionStorage.getItem("sidebarCollapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("sidebarCollapsed", isCollapsed.toString());
    }
  }, [isCollapsed]);

  const menuList = [
    { name: "Trang chủ", link: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Sản phẩm", link: "/admin/products", icon: <PackageOpen className="h-5 w-5" /> },
    { name: "Thể loại", link: "/admin/categories", icon: <Layers2 className="h-5 w-5" /> },
    { name: "Thương hiệu", link: "/admin/brands", icon: <Cat className="h-5 w-5" /> },
    { name: "Đơn hàng", link: "/admin/orders", icon: <ShoppingCart className="h-5 w-5" /> },
    { name: "Khách hàng", link: "/admin/customers", icon: <User className="h-5 w-5" /> },
    { name: "Đánh giá", link: "/admin/reviews", icon: <Star className="h-5 w-5" /> },
    { name: "Bình luận", link: "/admin/comments", icon: <MessageCircle className="h-5 w-5" /> },
    { name: "Bộ sưu tập", link: "/admin/collections", icon: <LibraryBig className="h-5 w-5" /> },
    { name: "Quản trị viên", link: "/admin/admins", icon: <ShieldCheck className="h-5 w-5" /> },
  ];

  const handleSignOut = () => {
    alert("Đã đăng xuất thành công");
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleLogoClick = () => {
    window.location.href = "/admin";
  };

  const Tab = ({ item }) => (
    <li
      onClick={() => (window.location.href = item.link)}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium cursor-pointer transition-all group relative ${
        isCollapsed ? "justify-center" : "justify-start"
      } text-gray-700 hover:bg-gray-50`}
      title={isCollapsed ? item.name : ""}
    >
      <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
        {item.icon}
      </div>
      {!isCollapsed && <span>{item.name}</span>}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          {item.name}
        </div>
      )}
    </li>
  );

  return (
    <section
      className={`sticky top-0 flex flex-col gap-6 bg-white border-r px-3 py-4 h-screen overflow-hidden z-50 transition-all duration-300 ${
        isCollapsed ? "w-[70px]" : "w-[240px]"
      }`}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between min-h-[32px]">
        <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "justify-center flex-1"}`}>
          <button onClick={handleLogoClick} className="hover:opacity-80 focus:outline-none rounded">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              {!isCollapsed && <span className="text-xl font-bold text-gray-800">Discount</span>}
            </div>
          </button>
        </div>

        {/* Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-gray-100 border border-gray-300 ml-2 flex-shrink-0"
          title={isCollapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Menu */}
      <ul className="flex-1 overflow-y-auto flex flex-col gap-2">
        {menuList.map((item, index) => (
          <Tab key={index} item={item} />
        ))}
      </ul>

      {/* Đăng xuất */}
      <div className="border-t pt-4">
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 px-3 py-3 hover:bg-red-50 hover:text-red-600 rounded-xl w-full text-gray-700 transition-all ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
          title={isCollapsed ? "Đăng xuất" : ""}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">Đăng xuất</span>}
        </button>
      </div>
    </section>
  );
}
