"use client";

import { useState, useEffect } from 'react';
import ProductCard from '../form/ProductCard';
import { useProducts } from '@/lib/firestore/products/read';
import { useBrands } from '@/lib/firestore/brands/read';
import { useCategories } from '@/lib/firestore/categories/read';
import FilterBar from '../form/FilterBar';
import SortBar from "../form/Sort";
import PaginationBar from "../form/Panigation";
import { getProduct } from '@/lib/firestore/products/read_server';
import CommentsSection from '../form/CommentsSection';

export default function Page({ categoryFilter = null, params }) {
  const { productId } = params;
  const [product, setProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sort, setSort] = useState("popular");
  const [visibleCount, setVisibleCount] = useState(3);
  const [filters, setFilters] = useState({});
  const { data: allProducts, isLoading } = useProducts({ pageLimit: 100 });
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

  // Lấy product data bất đồng bộ
  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const productData = await getProduct({ id: productId });
          setProduct(productData);
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      };
      fetchProduct();
    }
  }, [productId]);

  // Hàm xử lý khi filter thay đổi
  const handleFilterChange = (newFilters) => {
    console.log("Filters applied:", newFilters); // Debug log
    setFilters(newFilters);
    setVisibleCount(3); // Reset về 3 sản phẩm đầu khi filter
  };

  // Hàm helper để tìm category (bao gồm cả subcategories)
  const findCategoryById = (categoryId) => {
    if (!categories) return null;
    
    for (const category of categories) {
      if (category.id === categoryId) {
        return category;
      }
      // Tìm trong subcategories
      if (category.children) {
        const subCategory = category.children.find(child => child.id === categoryId);
        if (subCategory) {
          return subCategory;
        }
      }
    }
    return null;
  };

  // Lấy tất cả categoryIds liên quan đến điện thoại
  const getPhoneCategoryIds = () => {
    if (!categories) return [];
    
    const phoneIds = [];
    
    categories.forEach(parent => {
      const parentName = parent.name?.toLowerCase() || '';
      const isPhoneParent = parentName.includes('điện thoại') || 
                           parentName.includes('phone') ||
                           parentName.includes('mobile') ||
                           parentName.includes('iphone');
      
      if (isPhoneParent) {
        phoneIds.push(parent.id);
        
        if (parent.children && parent.children.length > 0) {
          parent.children.forEach(child => {
            phoneIds.push(child.id);
          });
        }
      }
    });
    
    return phoneIds;
  };

  // Lấy tất cả sản phẩm điện thoại
  const products = allProducts?.filter(product => {
    if (!product) return false;
    
    const phoneCategoryIds = getPhoneCategoryIds();
    const isInPhoneCategory = phoneCategoryIds.includes(product.categoryId);
    
    const productName = product.title?.toLowerCase() || product.name?.toLowerCase() || '';
    const isPhoneByName = productName.includes('iphone') || 
                          productName.includes('samsung') ||
                          productName.includes('oppo') ||
                          productName.includes('vivo') ||
                          productName.includes('phone');
    
    return isInPhoneCategory || isPhoneByName;
  }) || [];

  // Hàm extract số từ chuỗi storage (ví dụ: "128GB" -> 128)
  const extractStorageValue = (storageStr) => {
    if (!storageStr) return 0;
    const str = String(storageStr).toLowerCase();
    
    // Tìm số và đơn vị
    const match = str.match(/(\d+)\s*(gb|tb)/i);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    // Chuyển TB sang GB để so sánh
    return unit === 'tb' ? value * 1024 : value;
  };

  const getProductsByCategory = () => {
    if (!products || !categories) return [];
    
    let filtered = products;
    
    // Lọc theo category nếu có
    if (categoryFilter) {
      filtered = filtered.filter(product => {
        const category = findCategoryById(product.categoryId);
        return category?.name === categoryFilter;
      });
    }
    
    // Áp dụng các filter
    if (Object.keys(filters).length > 0) {
      filtered = filtered.filter(product => {
        // Lọc theo giá
        if (filters.maxPrice && filters.maxPrice < 97190000) {
          if (product.price > filters.maxPrice) {
            console.log(`Product ${product.title} filtered out by price: ${product.price} > ${filters.maxPrice}`);
            return false;
          }
        }
        
        // Lọc theo bộ nhớ trong
        if (filters.memory) {
          // Lấy storage từ nhiều nguồn có thể
          const productStorage = product.storage || 
                                product.specifications?.storage || 
                                product.memory || 
                                product.capacity ||
                                '';
          
          const productStorageValue = extractStorageValue(productStorage);
          const filterStorageValue = extractStorageValue(filters.memory);
          
          console.log(`Checking storage for ${product.title}:`, {
            raw: productStorage,
            productValue: productStorageValue,
            filterValue: filterStorageValue
          });
          
          // So sánh số liệu
          if (productStorageValue !== filterStorageValue) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    return filtered;
  };

  // Sắp xếp theo chọn tiêu chí
  const filteredProducts = getProductsByCategory();
  
  // Sắp xếp theo sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "priceAsc") {
      return (a.price || 0) - (b.price || 0);
    }
    if (sort === "priceDesc") {
      return (b.price || 0) - (a.price || 0);
    }
    if (sort === "sale") {
      return (b.discount || 0) - (a.discount || 0);
    }
    return 0;
  });

  // Chọn tiêu chí
  const getCurrentCategoryName = () => {
    if (categoryFilter) {
      return categoryFilter;
    }
    return 'Tất cả điện thoại'; 
  };

  // Lấy sản phẩm hiển thị theo limit
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
        <p className="text-sm text-gray-600">
          Tìm thấy {sortedProducts.length} sản phẩm
          {Object.keys(filters).length > 0 && (
            <span className="ml-2 text-blue-600">
              (Đã lọc: {Object.entries(filters).filter(([k, v]) => k !== 'maxPrice' || v < 97190000).map(([k, v]) => 
                k === 'maxPrice' ? `< ${(v/1000000).toFixed(0)}tr` : v
              ).join(', ')})
            </span>
          )}
        </p>
      </div>

      {/* Gắn FilterBar */}
      <FilterBar category="phone" onFilterChange={handleFilterChange} />
      
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
                allowedProductTypes={['phone']}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy điện thoại phù hợp
            </h3>
            <p className="text-gray-500 mb-4">
              {Object.keys(filters).length > 0 
                ? "Không có sản phẩm nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc."
                : `Không có điện thoại nào trong danh mục "${getCurrentCategoryName()}"`
              }
            </p>
          </div>
        </div>
      )}
      
      {/* Pagination Bar */}
      <PaginationBar
        total={sortedProducts.length}
        currentCount={visibleProducts.length}
        onLoadMore={() => setVisibleCount((prev) => prev + 12)}
      />

      {/* Hiển thị số lượng đã chọn */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <span className="font-medium">
            Đã chọn: {selectedProducts.length} sản phẩm
          </span>
        </div>
      )}
      
      {/* Comments Section */}
      <CommentsSection productId="general-phones" productTitle={getCurrentCategoryName()} />
    </div>
  );
}