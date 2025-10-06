"use client";

import { useState, useEffect } from 'react';
import ProductCard from '../../form/ProductCard';
import { useProducts } from '@/lib/firestore/products/read';
import { useBrands } from '@/lib/firestore/brands/read';
import { useCategories } from '@/lib/firestore/categories/read';
import FilterBar from '../../form/FilterBar';
import SortBar from "../../form/Sort";
import PaginationBar from "../../form/Panigation";
import { getProduct } from '@/lib/firestore/products/read_server';
import CommentsSection from '../../form/CommentsSection';

export default function Page({ categoryFilter = null, params }) {
  const { productId } = params;
  const [product, setProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sort, setSort] = useState("popular");
  const [visibleCount, setVisibleCount] = useState(3);
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
const getCategoryInfo = () => {
    if (!categories) return { 
      parentId: null, 
      parentName: null, 
      subCategoryId: null, 
      subCategoryName: null 
    };
    
    for (const parent of categories) {
      if (parent.children) {
        const xiaomiSubCat = parent.children.find(child => {
          const name = child.name?.toLowerCase() || '';
          return name.includes('xiaomi');
        });
        
        if (xiaomiSubCat) {
          return {
            parentId: parent.id,
            parentName: parent.name,
            subCategoryId: xiaomiSubCat.id,
            subCategoryName: xiaomiSubCat.name
          };
        }
      }
    }
    
    return { 
      parentId: null, 
      parentName: null, 
      subCategoryId: null, 
      subCategoryName: null 
    };
  };
  // Lọc sản phẩm điện thoại với logic cải thiện
  const products = allProducts?.filter(product => {
    const category = findCategoryById(product.categoryId);
    
    if (!category) return false;
    
    // Kiểm tra nhiều điều kiện
    const categoryName = category.name?.toLowerCase() || '';
    const isPhone = categoryName.includes('điện thoại') || 
                   categoryName.includes('xiaomi') ||
                   
                   product.type === 'xiaomi' ||
                   product.productType === 'xiaomi' ||
                   product.category === 'xiaomi';
    
    return isPhone;
  }) || [];

  

  const getProductsByCategory = () => {
    if (!products || !categories) return [];
    if (categoryFilter) {
      return products.filter(product => {
        const category = findCategoryById(product.categoryId);
        return category?.name === categoryFilter;
      });
    }
    return products; 
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
    return 'Xiaomi'; 
  };
const categoryInfo = getCategoryInfo();
  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
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
      </div>

      {/* Gắn FilterBar */}
      <FilterBar category="phone" />
      
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
              Không có điện thoại nào trong danh mục "{getCurrentCategoryName()}"
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
     <CommentsSection 
        productId="Xiaomi"
        productTitle={getCurrentCategoryName()}
        categoryName={categoryInfo.parentName || "Điện thoại"}
        categoryId={categoryInfo.parentId}
        subCategoryName={categoryInfo.subCategoryName || "Xiaomi"}
        subCategoryId={categoryInfo.subCategoryId}
       />
    </div>
  );
}