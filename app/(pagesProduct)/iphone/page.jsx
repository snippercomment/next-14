"use client";

import { useState } from 'react';
import { useProducts } from "@/lib/firestore/products/read";
import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";


import Sort from '../form/Sort';
import Paginate from '../form/Panigation';
import ProductCard from '../form/ProductCard';
import BrandProduct from '../form/BrandProduct';


export default function Page() {
    const [selectedBrand, setSelectedBrand] = useState('');
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageLimit, setPageLimit] = useState(15);

    // Lấy data từ Firestore
    const { data: products, isLoading } = useProducts({ pageLimit });
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();

    // Tạo danh sách brand names
    const brandNames = brands?.map(brand => brand.name) || [];

    return (
        <div className="container mx-auto px-4 py-8">
            <BrandProduct
                brands={brandNames}
                selectedBrand={selectedBrand}
                onBrandSelect={setSelectedBrand}

            />

            <div className="flex justify-between items-center mb-6">
                <Sort
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    itemsPerPage={pageLimit}
                    onItemsPerPageChange={setPageLimit}
                />

            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products?.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        brands={brands}
                        categories={categories}
                        allowedProductTypes={['phone']} // Chỉ hiển thị điện thoại
                    />
                ))}
            </div>
            <Paginate
                currentPage={currentPage}
                totalPages={5}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}