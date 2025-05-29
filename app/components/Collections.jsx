"use client";


import Link from "next/link";
import Slider from "react-slick";

export default function Collections({ collections }) {

    var settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 2,
        initialSlide: 0,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    initialSlide: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    if (collections.length === 0) {
        return <></>;
    }

    return (
        // slider danh mục
        <div className="overflow-hidden md:p-10 p-5">
            <Slider {...settings}>
                {(collections?.length <= 2
                    ? [...collections, ...collections, ...collections]
                    : collections
                )?.map((collection) => {
                    return (
                        // khung danh mục
                        <div className="px-2">
                            <div className="flex gap-4 bg-gradient-to-tr to-[#d9e2f1] from-[#cce7f5] p-7 w-full rounded-xl h-full">
                                <div className="w-full flex flex-col gap-2">
                                    <div className="flex flex-col gap-4">
                                        <h1 className="md:text-lg text-base font-semibold">
                                            {collection?.title}
                                        </h1>
                                        <h1 className="text-gray-600 text-xs md:text-sm max-w-96 line-clamp-2">
                                            {collection?.subTitle}
                                        </h1>
                                    </div>
                                    {/* button xem sản phẩm */}
                                    <div className="flex gap-4">
                                        <Link href={`/collections/${collection?.id}`}>
                                            <button className="bg-blue-500 text-white text-xs md:text-sm px-4 py-2 rounded-lg">
                                                Xem Sản Phẩm
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <img
                                        className="h-[4rem] md:h-[9rem]"
                                        src={collection?.imageURL}
                                        alt={collection?.title}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Slider>
        </div>
    );
}