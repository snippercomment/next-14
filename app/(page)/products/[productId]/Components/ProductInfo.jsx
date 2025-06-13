import MyRating from "@/app/components/MyRating";
import { getBrand } from "@/lib/firestore/brands/read_server";
import { getCategory } from "@/lib/firestore/categories/read_server";
import { getProductReviewCounts } from "@/lib/firestore/products/count/read";


// Server Components - có thể sử dụng async/await
async function Category({ categoryId }) {
  if (!categoryId) return null;
  
  const category = await getCategory({ id: categoryId });
  
  if (!category) return null;
  
  return (
     <div className="flex items-center gap-1 border px-3 py-1 rounded-full hover:bg-gray-50 transition-colors">
        <img className="h-4" src={category?.imageURL} alt={category?.name} />
        <h4 className="text-xs font-semibold">{category?.name}</h4>
      </div>
  );
}

async function Brand({ brandId }) {
  if (!brandId) return null;
  
  const brand = await getBrand({ id: brandId });
  
  if (!brand) return null;
  
  return (
    <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
      <img className="h-4" src={brand?.imageURL} alt={brand?.name} />
     
    </div>
  );
}

async function RatingReview({ productId }) {
  if (!productId) return null;
  
  const counts = await getProductReviewCounts({ productId });
  
  if (!counts || counts.totalReviews === 0) {
    return (
      <div className="flex gap-3 items-center">
        <MyRating value={0} />
        <h1 className="text-sm text-gray-400">Chưa có đánh giá</h1>
      </div>
    );
  }
  
  return (
    <div className="flex gap-3 items-center">
      <MyRating value={counts?.averageRating ?? 0} />
      <h1 className="text-sm text-gray-400">
        <span>{counts?.averageRating?.toFixed(1)}</span> ({counts?.totalReviews} đánh giá)
      </h1>
    </div>
  );
}

export { Category, Brand, RatingReview };