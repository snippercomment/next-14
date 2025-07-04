import { getProduct } from "@/lib/firestore/products/read_server";
import Photo from "./Components/Photo";
import Detail from "./Components/Detail";
import Review from "./Components/Review";
import RelatedProducts from "./Components/RalatedProduct";
import AddReview from "./Components/AddReview";
import AuthContextProvider from "@/contexts/AuthContext";



export async function generateMetadata({ params }) {
  const { productId } = params;
  const product = await getProduct({ id: productId });

  return {
    title: `${product?.title} | Product`,
    description: product?.shortDescription ?? "",
    openGraph: {
      images: [product?.featureImageURL],
    },
  };
}
export default async function Page({ params }) {
    const { productId } = params;
    const product = await getProduct({ id: productId });
    return (
        <main className="p-5 md:p-10">
            {/* ảnh */}
            <section className="flex gap-3 flex-col md:flex-row">
                <Photo imageList={[product?.featureImageURL, ...(product?.imageList ?? [])]} />
                <Detail product={product} />
            </section>
            {/* thông tin sản phẩm */}
            <AuthContextProvider>
            <div className="flex flex-col md:flex-row gap-4 md:max-w-[900px] w-full">
            <AddReview productId={productId} />
            <Review productId={productId} />
            </div>
             </AuthContextProvider>
            <RelatedProducts categoryId={product?.categoryId} />

        </main>


    );
}