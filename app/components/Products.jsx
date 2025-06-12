import Link from "next/link";
import FavoriteButton from "./FavoriteButton";
import AuthContextProvider from "@/contexts/AuthContext";

import { getProductReviewCounts } from "@/lib/firestore/products/count/read";
import { Suspense } from "react";
import MyRating from "./MyRating";

export default function ProductsGridView({ products }) {
    return (
        <section className="w-full flex justify-center">
            <div className="flex flex-col gap-5 max-w-[900px] p-5">
                <h1 className="text-center font-semibold text-lg">Sản phẩm</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {products?.map((item) => {
                        return <ProductCard product={item} key={item?.id} />;
                    })}
                </div>
            </div>
        </section>
    );
}

export function ProductCard({ product }) {
    // Helper function to format the price
    const formatPrice = (price) => {
        if (price === undefined || price === null) return "";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0, 
        }).format(price);
    };

    return (
        <div className="flex flex-col gap-3 border p-4 rounded-lg">
            <div className="relative w-full">
                <Link href={`/products/${product?.id}`}>
                    <img
                    src={product?.featureImageURL}
                    className="rounded-lg h-48 w-full object-cover"
                    alt={product?.title}
                />
                </Link>
                <div className="absolute top-1 right-1">
                    <AuthContextProvider>
                        <FavoriteButton productId={product?.id} />
                    </AuthContextProvider>
                </div>
            </div>
            <Link href={`/products/${product?.id}`}>
                <h1 className="font-semibold line-clamp-2 text-sm">{product?.title}</h1>
            </Link>
            <div className="">
                <h2 className="text-green-500 text-sm font-semibold">
                    {formatPrice(product?.salePrice)}{" "}
                    <span className="line-through text-xs text-gray-600">
                        {formatPrice(product?.price)}
                    </span>
                </h2>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">
                {product?.shortDescription}
            </p>
            <Suspense>
                <RatingReview product={product} />
            </Suspense>
            {product?.stock <= (product?.orders ?? 0) && (
                <div className="flex">
                    <h3 className="text-red-500 rounded-lg text-xs font-semibold">
                        Hết hàng
                    </h3>
                </div>
            )}
           
        </div>
    );
}

async function RatingReview({ product }) {
  const counts = await getProductReviewCounts({ productId: product?.id });
  return (
    <div className="flex gap-3 items-center ">
      <MyRating value={counts?.averageRating ?? 0} />
      <h1 className="text-xs text-gray-400">
        <span>{counts?.averageRating?.toFixed(1)}</span> ({counts?.totalReviews}
        )
      </h1>
    </div>
  );
}