"use client";

import { useState} from 'react';
import ProductCard from '../form/ProductCard';
import { useProducts } from '@/lib/firestore/products/read';
import { useBrands } from '@/lib/firestore/brands/read';
import { useCategories } from '@/lib/firestore/categories/read';

export default function Page({ categoryFilter = null }) {
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Giả sử có data từ props hoặc context
    const { data: allProducts, isLoading } = useProducts({ pageLimit: 100 });
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();

    // Lọc chỉ lấy sản phẩm headphone
    const products = allProducts?.filter(product => {
        const category = categories?.find(c => c.id === product.categoryId);
        return category?.name?.toLowerCase().includes('điện thoại') || 
               category?.name?.toLowerCase().includes('phone') ||
               product.type === 'phone' ||
               product.productType === 'phone';
    }) || [];

    // Lọc sản phẩm theo danh mục trước (chỉ trong phạm vi tai nghe)
    const getProductsByCategory = () => {
        if (!products || !categories) return [];
        
        if (categoryFilter) {
            return products.filter(product => {
                const category = categories.find(c => c.id === product.categoryId);
                return category?.name === categoryFilter;
            });
        }
        return products; 
    };

    const filteredProducts = getProductsByCategory();

    // Lấy tên category hiện tại
    const getCurrentCategoryName = () => {
        if (categoryFilter) {
            return categoryFilter;
        }
        return 'Điện thoại'; 
    };

    // Xử lý chọn sản phẩm
    const handleProductSelect = (productId) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <span>Đang tải sản phẩm...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header với tên danh mục */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {getCurrentCategoryName()}
                </h1>
                <p className="text-gray-600">
                    Khám phá các dòng {getCurrentCategoryName()} mới nhất với đa dạng cấu hình 
                </p>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="relative">
                            <ProductCard
                                product={product}
                                brands={brands}
                                categories={categories}
                                allowedProductTypes={['phone']}
                            />
                            
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Không tìm thấy tai nghe phù hợp
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Không có tai nghe nào trong danh mục "{getCurrentCategoryName()}"
                        </p>
                    </div>
                </div>
            )}

            {/* Hiển thị số lượng đã chọn */}
            {selectedProducts.length > 0 && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg">
                    <span className="font-medium">
                        Đã chọn: {selectedProducts.length} sản phẩm
                    </span>
                </div>
            )}
        </div>
    );
}