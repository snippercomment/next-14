"use client";

import Link from "next/link";
import FavoriteButton from "./FavoriteButton";
import AuthContextProvider from "@/contexts/AuthContext";
import { useState } from "react";

export default function ProductsCategoryView({ products }) {
    const categories = [
        {
            key: 'iphone',
            name: 'Điện thoại',
            keywords: ['iphone', 'samsung', 'oppo', 'xiaomi', 'vivo'],
           
        },
        {
            key: 'laptop', 
            name: 'Laptop',
            keywords: ['macbook', 'dell', 'hp', 'asus', 'lenovo', 'acer', 'msi'],
           
        },
        {
            key: 'headphone',
            name: 'Tai nghe', 
            keywords: ['tai nghe', 'headphone', 'sony'],
           
        },
        {
            key: 'mouse',
            name: 'Chuột',
            keywords: ['chuột', 'mouse', 'gaming mouse', 'wireless mouse'],
           
        }
    ];
 
    const categorizeProduct = (product) => {
        const title = product?.title?.toLowerCase() || '';
        return categories.find(category => 
            category.keywords.some(keyword => title.includes(keyword.toLowerCase()))
        )?.key || null;
    };

    return (
        <section className="w-full flex justify-center bg-gray-50 min-h-screen">
            <div className="flex flex-col gap-8 max-w-[1200px] p-5 w-full">
                <div className="text-center bg-white rounded-xl p-6 shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm của chúng tôi</h1>
                </div>

                {categories.map((category) => {
                    // Lọc và sắp xếp sản phẩm theo ngày tạo (mới nhất trước)
                    const categoryProducts = products
                        ?.filter(product => categorizeProduct(product) === category.key)
                        ?.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) || [];

                    if (categoryProducts.length === 0) return null;
                    
                    return <CategoryCarousel key={category.key} category={category} products={categoryProducts} />;
                })}
            </div>
        </section>
    );
}

function CategoryCarousel({ category, products }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const maxProducts = 10;
    const productsPerView = 5;
    const displayProducts = products.slice(0, maxProducts);
    const totalSlides = Math.ceil(displayProducts.length / productsPerView);

    const navigate = (direction) => {
        setCurrentIndex(prev => {
            if (direction === 'next' && prev < totalSlides - 1) return prev + 1;
            if (direction === 'prev' && prev > 0) return prev - 1;
            return prev;
        });
    };

    const NavigationButton = ({ direction, disabled, onClick }) => (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`p-2 rounded-full transition-all ${
                disabled 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={direction === 'prev' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
        </button>
    );

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-blue-700">{category.name}</h2>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        <NavigationButton 
                            direction="prev" 
                            disabled={currentIndex === 0}
                            onClick={() => navigate('prev')} 
                        />
                        <NavigationButton 
                            direction="next" 
                            disabled={currentIndex >= totalSlides - 1}
                            onClick={() => navigate('next')} 
                        />
                    </div>
                    
                    <Link 
                        href={`/${category.key}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-all hover:shadow-lg flex items-center gap-2 text-sm"
                    >
                        Xem tất cả
                    </Link>
                </div>
            </div>

            {/* Products Carousel */}
            <div className="relative overflow-hidden">
                <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {Array.from({ length: totalSlides }, (_, slideIndex) => (
                        <div 
                            key={slideIndex}
                            className="w-full flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        >
                            {displayProducts
                                .slice(slideIndex * productsPerView, (slideIndex + 1) * productsPerView)
                                .map((product) => <ProductCard product={product} key={product?.id} />)
                            }
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots Indicator */}
            {totalSlides > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                    {Array.from({ length: totalSlides }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function ProductCard({ product }) {
    const formatPrice = (price) => {
        if (!price) return "";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0, 
        }).format(price);
    };

    const discountPercent = product?.price && product?.salePrice && product?.price > product?.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : null;

    const isOutOfStock = product?.stock <= (product?.orders ?? 0);

    return (
        <div className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            {/* Badges */}
            {discountPercent && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold z-10">
                    -{discountPercent}%
                </div>
            )}
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <AuthContextProvider>
                    <FavoriteButton productId={product?.id} />
                </AuthContextProvider>
            </div>

            {/* Product Image */}
            <Link href={`/products/${product?.id}`}>
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-3">
                    <img
                        src={product?.featureImageURL}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={product?.title}
                    />
                </div>
            </Link>

            {/* Product Info */}
            <div className="flex flex-col gap-2">
                <Link href={`/products/${product?.id}`}>
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product?.title}
                    </h3>
                </Link>

                {/* Price */}
                <div className="flex flex-col">
                    <span className="text-red-500 font-bold text-lg">
                        {formatPrice(product?.salePrice)}
                    </span>
                    {product?.price && product?.price > product?.salePrice && (
                        <span className="text-gray-400 line-through text-sm">
                            {formatPrice(product?.price)}
                        </span>
                    )}
                </div>

                {/* Short Description */}
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {product?.shortDescription}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <div className="text-xs text-gray-500">
                        <span className="font-medium">4.0</span>
                        <span className="ml-1">(128)</span>
                    </div>
                </div>

                {/* Stock Status */}
                {isOutOfStock && (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-semibold mt-2">
                        Hết hàng
                    </span>
                )}
            </div>
        </div>
    );
}