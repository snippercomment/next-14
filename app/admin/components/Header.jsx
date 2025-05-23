"use client";

import { Menu } from "lucide-react";

export default function Header({toggleSidebar}) {
    return (
        <section className="flex items-center gap-3 bg-white border-b px-4 py-3">
            <div className="flex justify-center items-center md:hidden">
            {/* nút nhấn vào menu để hoạt động */}
                <button onClick={toggleSidebar}>
                    <Menu/>
                </button>
            </div>
            <h1 className="tex-xl font-semibold">Trang chủ</h1>
        </section>
    )
}
