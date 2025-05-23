"use client";
import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
export default function AdminLayout({ children }) {
    // chạy logic trỏ xuống thanh menu
    const [isOpen, setIsOpen] = useState(false);
    // này là chỉ đường dẫn hợp lý
    const pathname = usePathname()
    const sidebarRef = useRef(null);
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    }
    useEffect(() => {
        toggleSidebar();
    }, [pathname])

    useEffect(() => {
        function handleClickOutsideEvent(event) {
            if (sidebarRef.current && !sidebarRef?.current?.contains(event.target)) {
                setIsOpen(false)
            }
        }
        // lắng nghe khi nhấn vào nút menu
        document.addEventListener("mousedown", handleClickOutsideEvent);
        return () => {
            // xoá lắng nghe khi nhấn vào không phải nút menu
            document.removeEventListener("mousedown", handleClickOutsideEvent);
        }
    }, [])
    return <main className="relative flex">

        <div className="hidden md:block">
            <Sidebar />
        </div>
        <div ref={sidebarRef} className={`fixed md:hidden ease-in-out transition-all duration-400 z-50 ${isOpen ? "translate-x-0" : "-translate-x-[260px]"}`}>
            <Sidebar />
        </div>

        <section className="flex-1 flex flex-col min-h-screen">
            <Header toggleSidebar={toggleSidebar} />
            <section className="flex-1 bg-[#eff3f4]">
                {children}
            </section>
        </section>
    </main>
}

