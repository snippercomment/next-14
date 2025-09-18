"use client";
import Link from "next/link";
import Slider from "react-slick";

export default function FeaturedProductSlider({ featuredProducts }) {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 10000,
        pauseOnHover: false,
        pauseOnFocus: false,
        arrows: false,
        cssEase: 'linear',
        dotsClass: 'slick-dots custom-dots'
    };

    return (
        <div className="overflow-hidden relative pb-12">
            <Slider {...settings}>
                {(featuredProducts?.length <= 2
                    ? [...featuredProducts, ...featuredProducts, ...featuredProducts]
                    : featuredProducts
                )?.map((product, index) => {
                    return (
                        <div key={`${product?.id}-${index}`}>
                            <div className="flex flex-col-reverse md:flex-row gap-4 p-5 md:px-24 md:py-20 w-full">
                                <div className="flex-1 flex flex-col md:gap-10 gap-4">
                                    <h2 className="text-gray-500 text-xs md:text-base">
                                        SẢN PHẨM NỔI BẬT
                                    </h2>
                                    <div className="flex flex-col gap-4">
                                        <Link href={`/products/${product?.id}`}>
                                            <h1 className="md:text-4xl text-xl font-semibold">
                                                {product?.title}
                                            </h1>
                                        </Link>
                                        <h1 className="text-gray-600 md:text-sm text-xs max-w-96 line-clamp-2">
                                            {product?.shortDescription}
                                        </h1>
                                    </div>
                                </div>
                                <div className="">
                                    <Link href={`/products/${product?.id}`}>
                                        <img
                                            className="h-[14rem] md:h-[23rem] object-contain rounded-2xl bg-white"
                                            src={product?.featureImageURL}
                                            alt={product?.title || "Product image"}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Slider>
            
            {/* Custom CSS cho dots */}
            <style jsx>{`
                .custom-dots {
                    bottom: 20px !important;
                    display: flex !important;
                    justify-content: center !important;
                    list-style: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }
                
                .custom-dots li {
                    margin: 0 5px !important;
                }
                
                .custom-dots li button {
                    width: 12px !important;
                    height: 12px !important;
                    border-radius: 50% !important;
                    background-color: rgba(0, 0, 0, 0.3) !important;
                    border: none !important;
                    cursor: pointer !important;
                    transition: background-color 0.3s ease !important;
                }
                
                .custom-dots li button:before {
                    display: none !important;
                }
                
                .custom-dots li.slick-active button {
                    background-color: #000 !important;
                }
                
                .custom-dots li button:hover {
                    background-color: rgba(0, 0, 0, 0.6) !important;
                }
            `}</style>
        </div>
    );
}