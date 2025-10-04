"use client";

import Link from "next/link";
import { useBrands } from "@/lib/firestore/brands/read";
import { usePathname, useRouter } from "next/navigation";

export default function BrandProduct({ selectedBrand, onBrandChange }) {
    const { data: brands } = useBrands();
    // Lấy pathname và router để navigation
    const pathname = usePathname();
    const router = useRouter();

    // Xác định category dựa trên pathname
    const getCurrentCategory = () => {
        if (pathname.includes('/iphone')) return 'iphone';
        if (pathname.includes('/laptop')) return 'laptop';
        if (pathname.includes('/mouse')) return 'mouse';
        if (pathname.includes('/headphone')) return 'headphone';
        return null;
    };

    const currentCategory = getCurrentCategory();

    // Lọc brands theo category hiện tại
    const filteredBrands = brands?.filter(brand => {
        
        // Chỉ lọc theo category, bỏ qua status vì status undefined
        return brand.category === currentCategory;
    }) || [];

    // Handle "Tất cả" click
    const handleAllBrandsClick = () => {
        // Remove brand query param
        const basePath = pathname.split('?')[0];
        router.push(basePath);

        // Reset filter
        if (onBrandChange) {
            onBrandChange('');
        }
    };


    // Nếu không có category phù hợp, không hiển thị gì
    if (!currentCategory) {
        return null;
    }

    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            {/* Nút Tất cả */}
            <button
                onClick={handleAllBrandsClick}
                className={`px-6 py-3 rounded-full whitespace-nowrap font-medium border-2 transition-colors ${
                    selectedBrand === ''
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                }`}
            >
                Tất cả
            </button>

            {/* Danh sách brands được lọc theo category */}
            {filteredBrands.map((brand) => (
                <Link
                    key={brand.id}
                    href={`/brands/${brand.id}`}
                    className={`px-6 py-3 rounded-full whitespace-nowrap font-medium border-2 transition-colors flex items-center gap-2 ${
                        selectedBrand === brand.id
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => {
                        // Update state if needed
                        if (onBrandChange) {
                            onBrandChange(brand.id);
                        }
                    }}
                >
                    {/* Logo thương hiệu - ưu tiên ảnh từ database */}
                    {brand.imageURL ? (
                        <img
                            src={brand.imageURL}
                            alt={brand.name}
                            className="w-8 h-8 object-contain rounded"
                        />
                    ) : (
                        <span className="text-lg">
                            {fallbackLogos[brand.name] || ''}
                        </span>
                    )}

                    {/* Tên thương hiệu */}
                    <span>{brand.name}</span>
                </Link>
            ))}
        </div>
    );
}


