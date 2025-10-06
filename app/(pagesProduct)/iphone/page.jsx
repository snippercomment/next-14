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
import BrandProduct from '../form/BrandProduct'; 

export default function Page({ categoryFilter = null, params }) {
  const { productId } = params;
  const [product, setProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sort, setSort] = useState("popular");
  const [visibleCount, setVisibleCount] = useState(3);
  const [filters, setFilters] = useState({});
  const [selectedBrand, setSelectedBrand] = useState(''); 
  const { data: allProducts, isLoading } = useProducts({ pageLimit: 100 });
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

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

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setVisibleCount(3);
  };

  const handleBrandChange = (brandId) => {
    setSelectedBrand(brandId);
    setVisibleCount(3);
  };

  const findCategoryById = (categoryId) => {
    if (!categories) return null;
    
    for (const category of categories) {
      if (category.id === categoryId) {
        return category;
      }
      if (category.children) {
        const subCategory = category.children.find(child => child.id === categoryId);
        if (subCategory) {
          return subCategory;
        }
      }
    }
    return null;
  };

  // Lấy parent category ID và tên cho điện thoại
  const getPhoneCategoryInfo = () => {
    if (!categories) return { id: null, name: null };
    
    const phoneParent = categories.find(cat => {
      const name = cat.name?.toLowerCase() || '';
      return name.includes('điện thoại') || name.includes('phone') || name.includes('mobile');
    });
    
    return {
      id: phoneParent?.id || null,
      name: phoneParent?.name || 'Điện thoại'
    };
  };

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

  const extractStorageValue = (storageStr) => {
    if (!storageStr) return 0;
    const str = String(storageStr).toLowerCase();
    
    const match = str.match(/(\d+)\s*(gb|tb)/i);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    return unit === 'tb' ? value * 1024 : value;
  };

  const getProductsByCategory = () => {
    if (!products || !categories) return [];
    
    let filtered = products;
    
    if (categoryFilter) {
      filtered = filtered.filter(product => {
        const category = findCategoryById(product.categoryId);
        return category?.name === categoryFilter;
      });
    }
    
    if (selectedBrand) {
      filtered = filtered.filter(product => {
        return product.brandId === selectedBrand;
      });
    }
    
    if (Object.keys(filters).length > 0) {
      filtered = filtered.filter(product => {
        if (filters.maxPrice && filters.maxPrice < 97190000) {
          if (product.price > filters.maxPrice) {
            return false;
          }
        }
        
        if (filters.memory) {
          const productStorage = product.storage || 
                                product.specifications?.storage || 
                                product.memory || 
                                product.capacity ||
                                '';
          
          const productStorageValue = extractStorageValue(productStorage);
          const filterStorageValue = extractStorageValue(filters.memory);
          
          if (productStorageValue !== filterStorageValue) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    return filtered;
  };

  const filteredProducts = getProductsByCategory();
  
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

  const getCurrentCategoryName = () => {
    if (categoryFilter) {
      return categoryFilter;
    }
    return 'Tất cả điện thoại'; 
  };

  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const phoneCategoryInfo = getPhoneCategoryInfo();

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {getCurrentCategoryName()}
        </h1>
      </div>

      <div className="mb-6 -mx-4 px-4 overflow-x-auto">
        <BrandProduct 
          selectedBrand={selectedBrand} 
          onBrandChange={handleBrandChange}
        />
      </div>

      <FilterBar category="phone" onFilterChange={handleFilterChange} />
      <SortBar sort={sort} setSort={setSort} />
      
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
              {Object.keys(filters).length > 0 || selectedBrand
                ? "Không có sản phẩm nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc."
                : `Không có điện thoại nào trong danh mục "${getCurrentCategoryName()}"`
              }
            </p>
          </div>
        </div>
      )}
      
      <PaginationBar
        total={sortedProducts.length}
        currentCount={visibleProducts.length}
        onLoadMore={() => setVisibleCount((prev) => prev + 12)}
      />

      {selectedProducts.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <span className="font-medium">
            Đã chọn: {selectedProducts.length} sản phẩm
          </span>
        </div>
      )}
      
     
      <CommentsSection 
        productId="dien-thoai"
        productTitle={getCurrentCategoryName()}
        categoryName={phoneCategoryInfo.name}
        categoryId={phoneCategoryInfo.id}
        isParentCategory={true}
      />
    </div>
  );
}