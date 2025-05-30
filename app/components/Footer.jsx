import { Facebook, Youtube, MessageCircle } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white px-6 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    <div>
                        <h3 className="font-semibold text-lg mb-4">KẾT NỐI VỚI MT SHOP</h3>
                        <div className="flex gap-3 mb-6">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <Facebook size={16} className="text-white" />
                            </div>
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <MessageCircle size={16} className="text-white" />
                            </div>
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                                <Youtube size={16} className="text-white" />
                            </div>
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-xs">
                                TT
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium text-base">TỔNG ĐÀI MIỄN PHÍ</h4>
                            <div>
                                <p className="text-sm text-gray-300">Tư vấn mua hàng (Miễn phí)</p>
                                <p className="font-semibold">1800.6601 <span className="text-gray-400">(Nhánh 1)</span></p>
                            </div>

                        </div>
                    </div>

                    {/* Về chúng tôi */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">VỀ CHÚNG TÔI</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-white">Giới thiệu về công ty</a></li>
                            <li><a href="#" className="hover:text-white">Quy chế hoạt động</a></li>
                            <li><a href="#" className="hover:text-white">Tin tức khuyến mại</a></li>
                            <li><a href="#" className="hover:text-white">Hướng dẫn mua hàng & thanh toán online</a></li>
                        </ul>
                    </div>

                    {/* Chính sách */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">CHÍNH SÁCH</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-white">Chính sách bảo hành</a></li>
                            <li><a href="#" className="hover:text-white">Chính sách đổi trả</a></li>
                            <li><a href="#" className="hover:text-white">Chính sách bảo mật</a></li>
                            <li><a href="#" className="hover:text-white">Chính sách mua hàng</a></li>
                        </ul>
                    </div>

                    {/* sản phẩm */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">SẢN PHẨM</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-white">Điện thoại</a></li>
                            <li><a href="#" className="hover:text-white">Laptop</a></li>
                            <li><a href="#" className="hover:text-white">Tai nghe</a></li>
                            <li><a href="#" className="hover:text-white">Chuột</a></li>
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