"use client";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const { user } = useAuth();
    const router = useRouter();
    
    if (!user) {
        return <></>;
    }
    
    return (
        <button
            onClick={async () => {
                if (!confirm("Bạn có chắc chắn muốn đăng xuất?")) return;
                try {
                    await toast.promise(signOut(auth), {
                        error: (e) => e?.message,
                        loading: "Đăng xuất...",
                        success: "Đăng xuất thành công",
                    });
                    // Chuyển hướng về trang chủ sau khi đăng xuất thành công
                    router.push('/');
                } catch (error) {
                    toast.error(error?.message);
                }
            }}
            className="flex items-center gap-2 px-1 py-1 w-full text-sm"
        >
            <LogOut size={16} />
            <span>Đăng xuất</span>
        </button>
    );
}