"use client";
import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/lib/firestore/admins/read";
import { Button, CircularProgress } from "@nextui-org/react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLayout({ children }) {
    // chạy logic trỏ xuống thanh menu
    const [isOpen, setIsOpen] = useState(false);
    // này là chỉ đường dẫn hợp lý
    const pathname = usePathname()
    const sidebarRef = useRef(null);
    // lấy user hiện tại
    const { user } = useAuth()
    // lấy admin hiện tại
    const { data: admin, error, isLoading } = useAdmin({ email: user?.email });

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    }

    // Đóng sidebar khi pathname thay đổi (thay vì toggle)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname])

    // Chỉ lắng nghe click outside khi sidebar đang mở
    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutsideEvent(event) {
            // Kiểm tra nếu click vào nút menu thì không đóng
            const menuButton = event.target.closest('button[data-menu-toggle]');
            if (menuButton) return;
            
            if (sidebarRef.current && !sidebarRef?.current?.contains(event.target)) {
                setIsOpen(false)
            }
        }
        
        // Thêm delay nhỏ để tránh conflict với click toggle
        const timeoutId = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutsideEvent);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener("mousedown", handleClickOutsideEvent);
        }
    }, [isOpen])

    // nếu đang loading
    if (isLoading) {
        return (
            <div className="h-screen w-screen flex justify-center items-center">
                <CircularProgress />
            </div>
        );
    }

    // nếu có lỗi
    if (error) {
        return (
            <div className="h-screen w-screen flex justify-center items-center">
                <h1 className="text-red-500">{error}</h1>
            </div>
        );
    }

    // nếu không phải admin
    if (!admin) {
        return (
            <div className="h-screen w-screen flex flex-col gap-2 justify-center items-center">
                <h1 className="font-bold">Bạn không phải là admin!</h1>
                <h1 className="text-gray-600 text-sm">{user?.email}</h1>
                <Button
                    onClick={async () => {
                        await signOut(auth);
                    }}
                >
                    Đăng xuất
                </Button>
            </div>
        );
    }

    return <main className="relative flex">
        <div className="hidden md:block">
            <Sidebar />
        </div>
        <div ref={sidebarRef} className={`fixed md:hidden ease-in-out transition-all duration-400 z-50 ${isOpen ? "translate-x-0" : "-translate-x-[260px]"}`}>
            <Sidebar />
        </div>

        <section className="flex-1 flex flex-col min-h-screen overflow-hidden">
            <Header toggleSidebar={toggleSidebar} />
            <section className="pt-14 flex-1 bg-[#eff3f4]">
                {children}
            </section>
        </section>
    </main>
}