"use client";
import { useBrands } from "@/lib/firestore/brands/read";
import { usePathname } from "next/navigation";

export default function BrandProduct({ selectedBrand, onBrandChange }) {
    // Lấy dữ liệu brands từ Firestore như trong admin
    const { data: brands } = useBrands();

    // Lấy pathname để xác định trang hiện tại
    const pathname = usePathname();

    // DEBUG: Log để kiểm tra
    console.log('Current pathname:', pathname);
    console.log('All brands:', brands);

    // Xác định category dựa trên pathname
    const getCurrentCategory = () => {
        if (pathname.includes('/iphone')) return 'iphone';
        if (pathname.includes('/laptop')) return 'laptop';
        if (pathname.includes('/mouse')) return 'mouse';
        if (pathname.includes('/headphone')) return 'headphone';
        return null;
    };

    const currentCategory = getCurrentCategory();
    console.log('Current category:', currentCategory);

    // Lọc brands theo category hiện tại
    const filteredBrands = brands?.filter(brand => {
        console.log(`Brand: ${brand.name}, Category: ${brand.category}, Status: ${brand.status}`);
        // Chỉ lọc theo category, bỏ qua status vì status undefined
        return brand.category === currentCategory;
    }) || [];

    console.log('Filtered brands:', filteredBrands);

    // Fallback emoji cho trường hợp không có ảnh
    const fallbackLogos = {
        // iPhone brands
        'Apple': '🍎',
        'iPhone': '🍎',

        // Laptop brands
        'Dell': '💻',
        'HP': '🖥️',
        'Lenovo': '⚡',
        'Asus': '🎮',
        'Acer': '💻',
        'MSI': '🎮',
        'MacBook': '🍎',
        'Thinkpad': '🖤',

        // Accessory brands
        'Anker': '🔌',
        'Belkin': '🔌',
        'Logitech': '🖱️',
        'SanDisk': '💾',
        'Samsung': '📱',
        'Xiaomi': '🔥',
        'Ugreen': '🔌',
        'Baseus': '⚡'
    };

    // Nếu không có category phù hợp, không hiển thị gì
    if (!currentCategory) {
        return null;
    }

    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            {/* Nút Tất cả */}
            <button
                onClick={() => onBrandChange('')}
                className={`px-6 py-3 rounded-full whitespace-nowrap font-medium border-2 transition-colors ${selectedBrand === ''
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                    }`}
            >
                Tất cả
            </button>

            {/* Danh sách brands được lọc theo category */}
            {filteredBrands.map((brand) => (
                <button
                    key={brand.id}
                    onClick={() => onBrandChange(brand.id)}
                    className={`px-6 py-3 rounded-full whitespace-nowrap font-medium border-2 transition-colors flex items-center gap-2 ${selectedBrand === brand.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                        }`}
                >
                    {/* Logo thương hiệu - ưu tiên ảnh từ database */}
                    {brand.imageURL ? (
                        <img
                            src={brand.imageURL}
                            alt={brand.name}
                            className="w-6 h-6 object-contain rounded"
                        />
                    ) : (
                        <span className="text-lg">
                            {fallbackLogos[brand.name] || '🏷️'}
                        </span>
                    )}

                    {/* Tên thương hiệu */}
                    <span>{brand.name}</span>
                </button>
            ))}
        </div>
    );
}