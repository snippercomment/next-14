"use client";

import { useState, useEffect } from 'react';
import { useProducts } from "@/lib/firestore/products/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";
import ProductCard from '../form/ProductCard';
import Sort from '../form/Sort';
import Paginate from '../form/Panigation';

export default function Page({ categoryFilter = null }) {
    const [selectedBrand, setSelectedBrand] = useState('');
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageLimit, setPageLimit] = useState(15);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

    // Lấy data từ Firestore
    const { data: allProducts, isLoading } = useProducts({ pageLimit: 100 });
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();

    // Lọc chỉ lấy sản phẩm tai nghe
    const products = allProducts?.filter(product => {
        // Kiểm tra xem sản phẩm có phải là tai nghe không
        const category = categories?.find(c => c.id === product.categoryId);
        return category?.name?.toLowerCase().includes('tai nghe') || 
               category?.name?.toLowerCase().includes('headphone') ||
               product.type === 'headphone' ||
               product.productType === 'headphone';
    }) || [];

    // Hàm lấy giá từ sản phẩm
    const getProductPrice = (product) => {
        return parseFloat(product.salePrice || product.price || 0);
    };

    // Các mức giá định sẵn
    const priceRanges = [
        { value: 'all', label: 'Tất cả', min: 0, max: Infinity },
        { value: 'under_2m', label: 'Dưới 2 triệu', min: 0, max: 2000000 },
        { value: '2m_4m', label: 'Từ 2 - 4 triệu', min: 2000000, max: 4000000 },
        
    ];

    // Lọc sản phẩm theo danh mục trước (chỉ trong phạm vi tai nghe)
    const getProductsByCategory = () => {
        if (!products || !categories) return [];
        
        if (categoryFilter) {
            return products.filter(product => {
                const category = categories.find(c => c.id === product.categoryId);
                return category?.name === categoryFilter;
            });
        }
        return products; // Đã được lọc chỉ lấy tai nghe ở trên
    };

    // Lọc brands chỉ có sản phẩm tai nghe trong danh mục hiện tại
    const getAvailableBrands = () => {
        const categoryProducts = getProductsByCategory();
        
        if (!brands || !categoryProducts.length) return [];
        
        // Lấy danh sách brandId của các sản phẩm tai nghe trong danh mục
        const brandIdsInCategory = [...new Set(categoryProducts.map(product => product.brandId))];
        
        // Lọc brands chỉ có sản phẩm tai nghe trong danh mục
        return brands.filter(brand => brandIdsInCategory.includes(brand.id));
    };

    // Lọc và sắp xếp sản phẩm
    const getFilteredAndSortedProducts = () => {
        let filtered = getProductsByCategory();

        // Bước 1: Lọc theo brand
        if (selectedBrand) {
            filtered = filtered.filter(product => {
                const brand = brands?.find(b => b.id === product.brandId);
                return brand?.name === selectedBrand;
            });
        }

        // Bước 2: Lọc theo giá
        if (selectedPriceRanges.length > 0 && !selectedPriceRanges.includes('all')) {
            filtered = filtered.filter(product => {
                const productPrice = getProductPrice(product);
                return selectedPriceRanges.some(rangeValue => {
                    const range = priceRanges.find(r => r.value === rangeValue);
                    return range && productPrice >= range.min && productPrice <= range.max;
                });
            });
        }

        // Bước 3: Sắp xếp
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price_low':
                    return getProductPrice(a) - getProductPrice(b);
                case 'price_high':
                    return getProductPrice(b) - getProductPrice(a);
                case 'name_asc':
                    return (a.name || '').localeCompare(b.name || '', 'vi');
                case 'name_desc':
                    return (b.name || '').localeCompare(a.name || '', 'vi');
                case 'newest':
                default:
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
        });

        return filtered;
    };

    const filteredProducts = getFilteredAndSortedProducts();
    const availableBrands = getAvailableBrands();

    // Reset trang khi filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedBrand, selectedPriceRanges, sortBy]);

    // Reset brand khi thay đổi category
    useEffect(() => {
        setSelectedBrand('');
        setSelectedPriceRanges([]);
    }, [categoryFilter]);

    // Sản phẩm hiển thị trên trang hiện tại
    const currentProducts = filteredProducts.slice(
        (currentPage - 1) * pageLimit,
        currentPage * pageLimit
    );

    // Xử lý chọn khoảng giá
    const handlePriceRangeSelect = (rangeValue) => {
        if (rangeValue === 'all') {
            setSelectedPriceRanges([]);
        } else {
            setSelectedPriceRanges(prev => {
                if (prev.includes(rangeValue)) {
                    return prev.filter(r => r !== rangeValue);
                } else {
                    return [...prev.filter(r => r !== 'all'), rangeValue];
                }
            });
        }
    };

    // Lấy tên category hiện tại
    const getCurrentCategoryName = () => {
        if (categoryFilter) {
            return categoryFilter;
        }
        return 'Tai Nghe'; 
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
                    Khám phá các dòng {getCurrentCategoryName()} mới
                </p>
            </div>

            <div className="flex gap-6">
                {/* Left Sidebar - Filters */}
                <div className="w-80 shrink-0">
                    <div className="sticky top-4 space-y-6">
                        {/* Brand Filter */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Thương hiệu
                                {categoryFilter && (
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        ({getCurrentCategoryName()})
                                    </span>
                                )}
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedBrand('')}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                                        !selectedBrand 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <span className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center text-xs font-medium">
                                        All
                                    </span>
                                    Tất cả
                                    <span className="ml-auto text-xs">
                                        ({getProductsByCategory().length})
                                    </span>
                                </button>
                                {availableBrands.map((brand) => {
                                    const brandProductCount = getProductsByCategory().filter(
                                        product => product.brandId === brand.id
                                    ).length;
                                    
                                    return (
                                        <button
                                            key={brand.id}
                                            onClick={() => setSelectedBrand(brand.name)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                                                selectedBrand === brand.name 
                                                    ? 'bg-blue-500 text-white' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {brand.imageURL ? (
                                                <img 
                                                    src={brand.imageURL} 
                                                    alt={brand.name}
                                                    className="w-6 h-6 object-contain"
                                                />
                                            ) : (
                                                <span className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center text-xs font-medium">
                                                    {brand.name.charAt(0)}
                                                </span>
                                            )}
                                            <span className="flex-1 text-left">{brand.name}</span>
                                            <span className="text-xs">
                                                ({brandProductCount})
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {availableBrands.length === 0 && (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                    Không có thương hiệu tai nghe nào trong danh mục này
                                </div>
                            )}
                        </div>

                        {/* Price Filter */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mức giá</h3>
                            
                            <div className="space-y-2 mb-4">
                                {priceRanges.map((range) => {
                                    const productsInRange = getProductsByCategory().filter(product => {
                                        const price = getProductPrice(product);
                                        return price >= range.min && price <= range.max;
                                    }).length;
                                    
                                    return (
                                        <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={range.value === 'all' ? selectedPriceRanges.length === 0 : selectedPriceRanges.includes(range.value)}
                                                onChange={() => handlePriceRangeSelect(range.value)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 flex-1">{range.label}</span>
                                            <span className="text-xs text-gray-500">
                                                ({range.value === 'all' ? getProductsByCategory().length : productsInRange})
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>

                            {/* Active Filters */}
                            {selectedPriceRanges.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPriceRanges.map(rangeValue => {
                                            const range = priceRanges.find(r => r.value === rangeValue);
                                            return (
                                                <span
                                                    key={rangeValue}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    {range?.label}
                                                    <button
                                                        onClick={() => handlePriceRangeSelect(rangeValue)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setSelectedPriceRanges([])}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Xóa tất cả
                                    </button>
                                </div>
                            )}

                            <div className="text-sm text-gray-600 border-t pt-3">
                                Tìm thấy <span className="font-medium text-blue-600">{filteredProducts.length}</span> tai nghe
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content - Products */}
                <div className="flex-1">
                    {/* Sort and Results Info */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                        <div className="text-sm text-gray-600">
                            Hiển thị {currentProducts.length} / {filteredProducts.length}   
                            {categoryFilter && <span className="font-medium"> · {categoryFilter}</span>}
                            {selectedBrand && <span className="font-medium"> · {selectedBrand}</span>}
                        </div>

                        <Sort
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            data={filteredProducts}
                            onDataSorted={() => {}}
                        />
                    </div>

                    {/* Products Grid */}
                    {currentProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    brands={brands}
                                    categories={categories}
                                    allowedProductTypes={['headphone']}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="max-w-md mx-auto">
                                <div className="text-gray-400 text-6xl mb-4">📦</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Không tìm thấy sản phẩm
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {selectedBrand || selectedPriceRanges.length > 0
                                        ? `Không có tai nghe nào phù hợp với bộ lọc đã chọn trong danh mục "${getCurrentCategoryName()}"`
                                        : `Không có tai nghe nào trong danh mục "${getCurrentCategoryName()}"`
                                    }
                                </p>
                                {(selectedBrand || selectedPriceRanges.length > 0) && (
                                    <button
                                        onClick={() => {
                                            setSelectedBrand('');
                                            setSelectedPriceRanges([]);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredProducts.length > pageLimit && (
                        <div className="mt-8">
                            <Paginate
                                currentPage={currentPage}
                                totalPages={Math.ceil(filteredProducts.length / pageLimit)}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}