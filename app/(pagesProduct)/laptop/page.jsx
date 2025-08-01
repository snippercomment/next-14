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
    const [selectedStorageOptions, setSelectedStorageOptions] = useState([]);

    // Lấy data từ Firestore
    const { data: allProducts, isLoading } = useProducts({ pageLimit: 100 });
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();

    // Lọc chỉ lấy sản phẩm laptop
    const products = allProducts?.filter(product => {
        // Kiểm tra xem sản phẩm có phải là laptop không
        const category = categories?.find(c => c.id === product.categoryId);
        return category?.name?.toLowerCase().includes('máy tính') || 
               category?.name?.toLowerCase().includes('laptop') ||
               product.type === 'laptop' ||
               product.productType === 'laptop';
    }) || [];

    // Hàm lấy giá từ sản phẩm
    const getProductPrice = (product) => {
        return parseFloat(product.salePrice || product.price || 0);
    };

    // Hàm trích xuất thông tin lưu trữ từ specs
    const extractStorageFromProduct = (product) => {
        const specs = product.specifications || product.specs || product.description || '';
        const specString = typeof specs === 'string' ? specs : JSON.stringify(specs);
        
        // Tìm SSD capacity
        const ssdMatch = specString.match(/(\d+)(GB|TB)\s*SSD/i);
        if (ssdMatch) {
            const value = parseInt(ssdMatch[1]);
            const unit = ssdMatch[2].toLowerCase();
            return unit === 'tb' ? value * 1024 : value; // Convert TB to GB
        }
        
        // Fallback: tìm trong tên sản phẩm
        const nameMatch = product.name?.match(/(\d+)(GB|TB)/i);
        if (nameMatch) {
            const value = parseInt(nameMatch[1]);
            const unit = nameMatch[2].toLowerCase();
            return unit === 'tb' ? value * 1024 : value;
        }
        
        return 0; // Default if no storage found
    };

    // Các mức giá định sẵn
    const priceRanges = [
        { value: 'all', label: 'Tất cả', min: 0, max: Infinity },
        { value: 'under_2m', label: 'Dưới 2 triệu', min: 0, max: 2000000 },
        { value: '2m_4m', label: 'Từ 2 - 4 triệu', min: 2000000, max: 4000000 },
        { value: '4m_7m', label: 'Từ 4 - 7 triệu', min: 4000000, max: 7000000 },
        { value: '7m_13m', label: 'Từ 7 - 13 triệu', min: 7000000, max: 13000000 },
        { value: '13m_20m', label: 'Từ 13 - 20 triệu', min: 13000000, max: 20000000 },
        { value: 'over_20m', label: 'Trên 20 triệu', min: 20000000, max: Infinity },
    ];

    // Các tùy chọn dung lượng lưu trữ
    const storageOptions = [
        { value: 'all', label: 'Tất cả dung lượng', min: 0, max: Infinity },
        { value: '128gb', label: '128GB SSD', min: 100, max: 150 },
        { value: '256gb', label: '256GB SSD', min: 200, max: 300 },
        { value: '512gb', label: '512GB SSD', min: 450, max: 600 },
        { value: '1tb', label: '1TB SSD', min: 900, max: 1200 },
        { value: '2tb', label: '2TB SSD', min: 1800, max: Infinity },
    ];

    // Lọc sản phẩm theo danh mục trước (chỉ trong phạm vi laptop)
    const getProductsByCategory = () => {
        if (!products || !categories) return [];
        
        if (categoryFilter) {
            return products.filter(product => {
                const category = categories.find(c => c.id === product.categoryId);
                return category?.name === categoryFilter;
            });
        }
        return products; // Đã được lọc chỉ lấy laptop ở trên
    };

    // Lọc brands chỉ có sản phẩm laptop trong danh mục hiện tại
    const getAvailableBrands = () => {
        const categoryProducts = getProductsByCategory();
        
        if (!brands || !categoryProducts.length) return [];
        
        // Lấy danh sách brandId của các sản phẩm laptop trong danh mục
        const brandIdsInCategory = [...new Set(categoryProducts.map(product => product.brandId))];
        
        // Lọc brands chỉ có sản phẩm laptop trong danh mục
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

        // Bước 3: Lọc theo dung lượng lưu trữ
        if (selectedStorageOptions.length > 0 && !selectedStorageOptions.includes('all')) {
            filtered = filtered.filter(product => {
                const productStorage = extractStorageFromProduct(product);
                return selectedStorageOptions.some(storageValue => {
                    const storage = storageOptions.find(s => s.value === storageValue);
                    return storage && productStorage >= storage.min && productStorage <= storage.max;
                });
            });
        }

        // Bước 4: Sắp xếp
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
                case 'storage_low':
                    return extractStorageFromProduct(a) - extractStorageFromProduct(b);
                case 'storage_high':
                    return extractStorageFromProduct(b) - extractStorageFromProduct(a);
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
    }, [selectedBrand, selectedPriceRanges, selectedStorageOptions, sortBy]);

    // Reset brand khi thay đổi category
    useEffect(() => {
        setSelectedBrand('');
        setSelectedPriceRanges([]);
        setSelectedStorageOptions([]);
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

    // Xử lý chọn dung lượng lưu trữ
    const handleStorageSelect = (storageValue) => {
        if (storageValue === 'all') {
            setSelectedStorageOptions([]);
        } else {
            setSelectedStorageOptions(prev => {
                if (prev.includes(storageValue)) {
                    return prev.filter(s => s !== storageValue);
                } else {
                    return [...prev.filter(s => s !== 'all'), storageValue];
                }
            });
        }
    };

    // Lấy tên category hiện tại
    const getCurrentCategoryName = () => {
        if (categoryFilter) {
            return categoryFilter;
        }
        return 'Máy tính'; 
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
                    Khám phá các dòng {getCurrentCategoryName()} mới nhất với đa dạng cấu hình và dung lượng
                </p>
            </div>

            <div className="flex gap-6">
                {/* Left Sidebar - Filters */}
                <div className="w-80 shrink-0">
                    <div className="sticky top-4 space-y-6">
                        {/* Brand Filter */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                               
                                Thương hiệu
                                {categoryFilter && (
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        ({getCurrentCategoryName()})
                                    </span>
                                )}
                            </h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                <button
                                    onClick={() => setSelectedBrand('')}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                                        !selectedBrand 
                                            ? 'bg-blue-500 text-white shadow-sm' 
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center text-xs font-medium">
                                        All
                                    </span>
                                    Tất cả
                                    <span className="ml-auto text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                                        {getProductsByCategory().length}
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
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                                                selectedBrand === brand.name 
                                                    ? 'bg-blue-500 text-white shadow-sm' 
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
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
                                            <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                                                {brandProductCount}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {availableBrands.length === 0 && (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                    Không có thương hiệu laptop nào trong danh mục này
                                </div>
                            )}
                        </div>

                        {/* Storage Filter */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                               
                                Dung lượng lưu trữ
                            </h3>
                            
                            <div className="space-y-2 mb-4">
                                {storageOptions.map((storage) => {
                                    const productsInStorage = getProductsByCategory().filter(product => {
                                        const productStorage = extractStorageFromProduct(product);
                                        return storage.value === 'all' ? true : 
                                               productStorage >= storage.min && productStorage <= storage.max;
                                    }).length;
                                    
                                    return (
                                        <label key={storage.value} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={storage.value === 'all' ? selectedStorageOptions.length === 0 : selectedStorageOptions.includes(storage.value)}
                                                onChange={() => handleStorageSelect(storage.value)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                                            />
                                            <span className="text-sm text-gray-700 flex-1 group-hover:text-gray-900 transition-colors">
                                                {storage.label}
                                            </span>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                {storage.value === 'all' ? getProductsByCategory().length : productsInStorage}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>

                           
                        </div>

                        {/* Price Filter */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                
                                Mức giá
                            </h3>
                            
                            <div className="space-y-2 mb-4">
                                {priceRanges.map((range) => {
                                    const productsInRange = getProductsByCategory().filter(product => {
                                        const price = getProductPrice(product);
                                        return price >= range.min && price <= range.max;
                                    }).length;
                                    
                                    return (
                                        <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={range.value === 'all' ? selectedPriceRanges.length === 0 : selectedPriceRanges.includes(range.value)}
                                                onChange={() => handlePriceRangeSelect(range.value)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                                            />
                                            <span className="text-sm text-gray-700 flex-1 group-hover:text-gray-900 transition-colors">
                                                {range.label}
                                            </span>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                {range.value === 'all' ? getProductsByCategory().length : productsInRange}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>


                            <div className="text-sm text-gray-600 border-t pt-3 bg-gray-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                                <div className="flex items-center justify-between">
                                    <span>Tìm thấy</span>
                                    <span className="font-semibold  text-base">
                                        {filteredProducts.length} laptop
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content - Products */}
                <div className="flex-1">
                    {/* Sort and Results Info */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                        <div className="text-sm text-gray-600">
                            Hiển thị <span className="font-medium">{currentProducts.length}</span> / <span className="font-medium">{filteredProducts.length}</span> sản phẩm
                            {categoryFilter && <span className="font-medium text-blue-600"> · {categoryFilter}</span>}
                            {selectedBrand && <span className="font-medium text-green-600"> · {selectedBrand}</span>}
                            {selectedStorageOptions.length > 0 && (
                                <span className="font-medium text-purple-600"> · {selectedStorageOptions.length} dung lượng</span>
                            )}
                        </div>

                        <Sort
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            data={filteredProducts}
                            onDataSorted={() => {}}
                        />
                    </div>

                    {/* Active Filters Summary */}
                    {(selectedBrand || selectedPriceRanges.length > 0 || selectedStorageOptions.length > 0) && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">Bộ lọc đang áp dụng:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedBrand && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-blue-800 rounded-full text-sm border border-blue-200">
                                                Thương hiệu: {selectedBrand}
                                                <button onClick={() => setSelectedBrand('')} className="text-blue-600 hover:text-blue-800 ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedStorageOptions.map(storage => (
                                            <span key={storage} className="inline-flex items-center gap-1 px-3 py-1 bg-white text-blue-800 rounded-full text-sm border border-blue-200">
                                                {storageOptions.find(s => s.value === storage)?.label}
                                                <button onClick={() => handleStorageSelect(storage)} className="text-blue-600 hover:text-blue-800 ml-1">×</button>
                                            </span>
                                        ))}
                                        {selectedPriceRanges.map(price => (
                                            <span key={price} className="inline-flex items-center gap-1 px-3 py-1 bg-white text-blue-800 rounded-full text-sm border border-blue-200">
                                                {priceRanges.find(p => p.value === price)?.label}
                                                <button onClick={() => handlePriceRangeSelect(price)} className="text-blue-600 hover:text-blue-800 ml-1">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedBrand('');
                                        setSelectedPriceRanges([]);
                                        setSelectedStorageOptions([]);
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Products Grid */}
                    {currentProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    brands={brands}
                                    categories={categories}
                                    allowedProductTypes={['laptop']}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="max-w-md mx-auto">
                               
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Không tìm thấy laptop phù hợp
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {selectedBrand || selectedPriceRanges.length > 0 || selectedStorageOptions.length > 0
                                        ? `Không có laptop nào phù hợp với bộ lọc đã chọn trong danh mục "${getCurrentCategoryName()}"`
                                        : `Không có laptop nào trong danh mục "${getCurrentCategoryName()}"`
                                    }
                                </p>
                               
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