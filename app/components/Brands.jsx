"use client";

import Link from "next/link";
import Slider from "react-slick";

export default function Brands({ brands }) {
    var settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 5,
        initialSlide: 0,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    initialSlide: 3,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
        ],
    };

    if (brands.length === 0) {
        return <></>;
    }

    return (
        <div className="flex flex-col gap-8 justify-center overflow-hidden md:p-10 p-5">
            <div className="flex justify-center w-full">
                <h1 className="text-lg font-semibold">Mua sắm theo thương hiệu</h1>
            </div>
            <Slider {...settings}>
                {(brands?.length <= 2
                    ? [...brands, ...brands, ...brands]
                    : brands
                )?.map((brand) => {
                    return (
                        <Link href={`/brands/${brand?.id}`} key={brand?.id}>
                            <div className="px-2">
                                <div className="flex flex-col gap-2 items-center justify-center">
                                    <div className="h-20 rounded-lg md:p-5 p-2 border overflow-hidden hover:shadow-lg transition-shadow">
                                        <img
                                            className="h-full w-full object-contain"
                                            src={brand?.imageURL}
                                            alt={brand?.name}
                                        />
                                    </div>
                                   
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </Slider>
        </div>
    );
}