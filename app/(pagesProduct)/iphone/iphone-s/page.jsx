"use client";

import { useState } from 'react';
import ProductCard from '../../form/ProductCard';
import { useProducts } from '@/lib/firestore/products/read';
import { useBrands } from '@/lib/firestore/brands/read';
import { useCategories } from '@/lib/firestore/categories/read';
import FilterBar from '../../form/FilterBar';
import SortBar from "../../form/Sort";
import PaginationBar from "../../form/Panigation";

export default function iPhone15Page({ params }) {
  const [sort, setSort] = useState("popular");
  const [visibleCount, setVisibleCount] = useState(12);
  const { data: allProducts, isLoading } = useProducts({ pageLimit: 100 });
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

  // Lọc sản phẩm iPhone 15 cụ thể - SỬA LẠI LOGIC
  const iPhone15Products = allProducts?.filter(product => {
    const brand = brands?.find(b => b.id === product.brandId);
    
    // Kiểm tra brand có phải Apple không
    const isApple = brand?.name?.toLowerCase().includes('apple') || 
                   brand?.name?.toLowerCase().includes('iphone');
    
    // Kiểm tra tên sản phẩm có chứa iPhone 15 không
    const isIPhone15 = product.title?.toLowerCase().includes('iphone 15') ||
                      product.title?.toLowerCase().includes('iphone15') ||
                      product.model?.toLowerCase().includes('15') ||
                      product.name?.toLowerCase().includes('iphone 15');
    
    return isApple && isIPhone15;
  }) || [];

  // Debug: In ra để kiểm tra
  console.log('All products:', allProducts?.length);
  console.log('Brands:', brands?.map(b => ({ id: b.id, name: b.name })));
  console.log('Filtered iPhone 15:', iPhone15Products?.length);
  console.log('iPhone 15 Products:', iPhone15Products);

  // Sắp xếp sản phẩm
  const sortedProducts = [...iPhone15Products].sort((a, b) => {
    switch(sort) {
      case "priceAsc":
        return a.price - b.price;
      case "priceDesc":
        return b.price - a.price;
      case "sale":
        return (b.discount || 0) - (a.discount || 0);
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const visibleProducts = sortedProducts.slice(0, visibleCount);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Đang tải iPhone 15...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <nav className="text-sm breadcrumbs mb-4">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <a href="/" className="text-blue-600 hover:text-blue-800">Trang chủ</a>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li className="flex items-center">
              <a href="/products" className="text-blue-600 hover:text-blue-800">Điện thoại</a>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li className="flex items-center">
              <a href="/products/iphone" className="text-blue-600 hover:text-blue-800">iPhone</a>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li className="text-gray-500">iPhone 15</li>
          </ol>
        </nav>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">15</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              iPhone 15 Series
            </h1>
            <p className="text-gray-600">
              Khám phá iPhone 15 mới nhất với chip A17 Pro và camera tiên tiến
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{iPhone15Products.length}</div>
            <div className="text-sm text-gray-600">Sản phẩm</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {iPhone15Products.filter(p => p.discount > 0).length}
            </div>
            <div className="text-sm text-gray-600">Đang giảm giá</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {iPhone15Products.length > 0 ? 
                Math.min(...iPhone15Products.map(p => p.price)).toLocaleString() + 'đ' 
                : '0đ'
              }
            </div>
            <div className="text-sm text-gray-600">Giá từ</div>
          </div>
        </div>
      </div>

      {/* Filter và Sort */}
      <FilterBar category="iphone-15" />
      <SortBar sort={sort} setSort={setSort} />

      {/* Products Grid */}
      {iPhone15Products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {visibleProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              brands={brands}
              categories={categories}
              allowedProductTypes={['phone', 'iPhone']}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có iPhone 15
            </h3>
            <p className="text-gray-500 mb-4">
              Hiện tại chưa có iPhone 15 nào trong kho hàng
            </p>
            <a 
              href="/products/iphone" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xem tất cả iPhone
            </a>
          </div>
        </div>
      )}

      {/* Pagination */}
      {iPhone15Products.length > 0 && (
        <PaginationBar
          total={sortedProducts.length}
          currentCount={visibleProducts.length}
          onLoadMore={() => setVisibleCount((prev) => prev + 12)}
        />
      )}
    </div>
  );
}