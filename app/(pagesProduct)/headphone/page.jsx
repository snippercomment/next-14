"use client";

import { useState } from 'react';
import ProductCard from '../form/ProductCard';
import { useProducts } from '@/lib/firestore/products/read';
import { useBrands } from '@/lib/firestore/brands/read';
import { useCategories } from '@/lib/firestore/categories/read';
import SortBar from "../form/Sort";
import PaginationBar from "../form/Panigation";
import { getProduct } from '@/lib/firestore/products/read_server';
import CommentsSection from '../form/CommentsSection';
import BrandProduct from '../form/BrandProduct';

export default function Page({ categoryFilter = null, params }) {
  const { productId } = params;
  const product = getProduct({ id: productId });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sort, setSort] = useState("popular");
  const [visibleCount, setVisibleCount] = useState(3);
  const [selectedBrand, setSelectedBrand] = useState('');
  const { data: allProducts, isLoading } = useProducts({ pageLimit: 100 });
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

  const handleBrandChange = (brandId) => {
    setSelectedBrand(brandId);
    setVisibleCount(3);
  };

  const getHeadPhoneCategoryIds = () => {
    if (!categories) return [];
    
    const headphoneIds = [];
    
    categories.forEach(parent => {
      const parentName = parent.name?.toLowerCase() || '';
      const isHeadPhoneParent = parentName.includes('headphone');
      
      if (isHeadPhoneParent) {
        headphoneIds.push(parent.id);
        if (parent.children && parent.children.length > 0) {
          parent.children.forEach(child => {
            headphoneIds.push(child.id);
          });
        }
      }
    });
    
    return headphoneIds;
  };

  const products = allProducts?.filter(product => {
    if (!product) return false;
    
    const headphoneCategoryIds = getHeadPhoneCategoryIds();
    const isInHeadPhoneCategory = headphoneCategoryIds.includes(product.categoryId);
    
    const productName = product.title?.toLowerCase() || product.name?.toLowerCase() || '';
    const isHeadPhoneByName =
      productName.includes('sony') || productName.includes('apple');
      
    return isInHeadPhoneCategory || isHeadPhoneByName;
  }) || [];

  const getProductsByCategory = () => {
    if (!products || !categories) return [];
    
    let filtered = products;
    
    if (categoryFilter) {
      filtered = filtered.filter(product => {
        const category = categories.find(c => c.id === product.categoryId);
        return category?.name === categoryFilter;
      });
    }
    
    if (selectedBrand) {
      filtered = filtered.filter(product => product.brandId === selectedBrand);
    }
    
    return filtered;
  };

  const filteredProducts = getProductsByCategory();

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "priceAsc") return (a.price || 0) - (b.price || 0);
    if (sort === "priceDesc") return (b.price || 0) - (a.price || 0);
    if (sort === "sale") return (b.discount || 0) - (a.discount || 0);
    return 0;
  });

  const getCurrentCategoryName = () => categoryFilter || 'Tai nghe';

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const visibleProducts = sortedProducts.slice(0, visibleCount);

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
      </div>

      {/* BrandProduct component */}
      <div className="mb-6 -mx-4 px-4 overflow-x-auto">
        <BrandProduct 
          selectedBrand={selectedBrand} 
          onBrandChange={handleBrandChange}
        />
      </div>

      {/* Sort */}
      <SortBar sort={sort} setSort={setSort} />
      
      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProducts.map(product => (
            <div key={product.id} className="relative">
              <ProductCard
                product={product}
                brands={brands}
                categories={categories}
                allowedProductTypes={['headphone']}
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
              {selectedBrand
                ? "Không có sản phẩm nào phù hợp với thương hiệu bạn chọn."
                : `Không có tai nghe nào trong danh mục "${getCurrentCategoryName()}"`}
            </p>
          </div>
        </div>
      )}
      
      {/* Pagination Bar */}
      <PaginationBar
        total={sortedProducts.length}
        currentCount={visibleProducts.length}
        onLoadMore={() => setVisibleCount(prev => prev + 12)}
      />

      {/* Hiển thị số lượng đã chọn */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <span className="font-medium">
            Đã chọn: {selectedProducts.length} sản phẩm
          </span>
        </div>
      )}
      
      <CommentsSection productId={productId} productTitle={product?.title} />
    </div>
  );
}
