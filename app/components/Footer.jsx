
import Link from "next/link";
export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white px-6 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    <div className="flex flex-col gap-4 justify-center items-center">
                        <Link href="/">
                            <img src="/logo.png" alt="logo" className="h-8 " />
                        </Link>
                    </div>

                    {/* Về chúng tôi */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">VỀ CHÚNG TÔI</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-white">Giới thiệu về công ty</a></li>
                            <li><a href="#" className="hover:text-white">Quy chế hoạt động</a></li>
                            <li><a href="/payonline" className="hover:text-white">Hướng dẫn mua hàng & thanh toán online</a></li>
                        </ul>
                    </div>

                    {/* Chính sách */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">CHÍNH SÁCH</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="/warranty" className="hover:text-white">Chính sách bảo hành</a></li>
                            <li><a href="/return" className="hover:text-white">Chính sách đổi trả</a></li>
                            <li><a href="#" className="hover:text-white">Chính sách bảo mật</a></li>
                          
                        </ul>
                    </div>

                    {/* sản phẩm */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">SẢN PHẨM</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="/iphone" className="hover:text-white">Điện thoại</a></li>
                            <li><a href="/laptop" className="hover:text-white">Laptop</a></li>
                            <li><a href="/mouse" className="hover:text-white">Phụ kiện</a></li>
                            <li><a href="/headphone" className="hover:text-white">Âm thanh</a></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-700 mt-8 pt-6 text-center">
                    <p className="text-sm text-gray-400">
                        © 2025 MT. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}