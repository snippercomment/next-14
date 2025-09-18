import { getProduct } from "@/lib/firestore/products/read_server";
import Photo from "./Components/Photo";
import Detail from "./Components/Detail";
import Review from "./Components/Review";
import RelatedProducts from "./Components/RalatedProduct";
import AddReview from "./Components/AddReview";
import AuthContextProvider from "@/contexts/AuthContext";
import ScrollToTop from "./Components/ScrollToTop";
import ContactButton from "./Components/ContactButton";

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
           <section className="flex gap-6 flex-col md:flex-row">
  <div className="md:w-1/3 w-full">
    <Photo imageList={[product?.featureImageURL, ...(product?.imageList ?? [])]} />
  </div>
  <div className="md:w-2/3 w-full">
    <Detail product={product} />
  </div>
</section>
             
            {/* thông tin sản phẩm */}
            <AuthContextProvider>
            <div className="flex flex-col md:flex-row gap-4 md:max-w-[900px] w-full">
            <AddReview productId={productId} />
            <Review productId={productId} />
            </div>
             
            </AuthContextProvider>
             
            <RelatedProducts
                 categoryId={product?.categoryId}
                brandId={product?.brandId}
                currentProductId={product?.id}
            />
        
            {/* Floating Navigation Buttons */}
            <ScrollToTop />
            <ContactButton />
        </main>
      );
}