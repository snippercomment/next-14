"use client";

import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/lib/firestore/admins/read";
import { Avatar } from "@nextui-org/react";
export default function Header({ toggleSidebar }) {
    const { user } = useAuth();
    const { data: admin } = useAdmin({ email: user?.email });
    return (
        <section className="fixed w-full top-0 flex items-center gap-3 bg-white border-b px-4 py-3">
            <div className="flex justify-center items-center md:hidden">
                {/* nút nhấn vào menu để hoạt động */}
                <button onClick={toggleSidebar}>
                    <Menu />
                </button>
            </div>
            {/* header */}
            <div className="w-full flex justify-between items-center pr-0 md:pr-[260px]">
                {/* tên trang */}
                <h1 className="text-xl font-semibold">Trang chủ</h1>
                {/* thông tin admin */}
                <div className="flex gap-2 items-center">
                    {/* thông tin chi tiết */}
                    <div className="md:flex flex-col items-end hidden">
                        {/* tên admin */}
                        <h1 className="text-sm font-semibold">{admin?.name}</h1>
                        {/* email admin */}
                        <h1 className="text-xs text-gray-600">{admin?.email}</h1>
                    </div>
                    {/* avatar admin */}
                    <Avatar size="sm" src={admin?.imageURL} />
                </div>
            </div>
        </section>
    )
}
