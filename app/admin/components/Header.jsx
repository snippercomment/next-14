"use client";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/lib/firestore/admins/read";
import { Avatar } from "@nextui-org/react";
import { useEffect } from "react";

export default function Header({ toggleSidebar, isCollapsed }) {
    const { user } = useAuth();
    const { data: admin } = useAdmin({ email: user?.email });

    // Ngăn overscroll (trên mobile)
    useEffect(() => {
        const preventDefault = (e) => {
            if (e.touches.length > 1) return;
            if (window.scrollY === 0) e.preventDefault();
        };

        document.addEventListener("touchstart", preventDefault, { passive: false });
        document.addEventListener("touchmove", preventDefault, { passive: false });

        document.documentElement.style.overscrollBehavior = "contain";
        document.body.style.overscrollBehaviorY = "contain";

        return () => {
            document.removeEventListener("touchstart", preventDefault);
            document.removeEventListener("touchmove", preventDefault);
            document.documentElement.style.overscrollBehavior = "auto";
            document.body.style.overscrollBehaviorY = "auto";
        };
    }, []);

    return (
        <section
            className={`fixed w-full top-0 z-50 flex items-center gap-3 bg-white border-b px-4 py-3 transition-all duration-300 ease-in-out
                ${isCollapsed ? "pr-[90px]" : "pr-[240px]"}`}
        >
            {/* Nút toggle menu (chỉ hiện ở mobile) */}
            <div className="flex justify-center items-center md:hidden">
                <button
                    onClick={toggleSidebar}
                    data-menu-toggle="true"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Nội dung header */}
            <div className="w-full flex justify-between items-center">
                {/* Tên trang */}
                <h1 className="text-xl font-semibold text-gray-800">Trang chủ</h1>

                {/* Thông tin admin và icon thông báo */}
                <div className="flex gap-3 items-center">
                    {/* Icon thông báo */}
                    <div className="relative">
                        <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative"
                            onClick={() => {
                                // Xử lý click thông báo ở đây
                                console.log("Notification clicked");
                            }}
                        >
                            <Bell className="h-5 w-5 text-gray-600" />
                            {/* Badge thông báo - hiện khi có thông báo mới */}
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                3
                            </span>
                        </button>
                    </div>

                    {/* Thông tin admin */}
                    <div className="flex gap-2 items-center">
                        {/* Ẩn info khi mobile, chỉ hiện trên md trở lên */}
                        <div className="md:flex flex-col items-end hidden">
                            <h1 className="text-sm font-semibold text-gray-800">
                                {admin?.name || "Admin"}
                            </h1>
                            <h1 className="text-xs text-gray-600">
                                {admin?.email || "admin@example.com"}
                            </h1>
                        </div>

                        {/* Avatar admin */}
                        <Avatar
                            size="sm"
                            src={admin?.imageURL}
                            name={admin?.name || "Admin"}
                            className="cursor-pointer hover:scale-105 transition-transform duration-200"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}