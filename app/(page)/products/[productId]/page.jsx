import { getProduct } from "@/lib/firestore/products/read_server";
import Photo from "./Components/Photo";
import Detail from "./Components/Detail";
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
            <section>

            </section>
            {/* mô tả sản phẩm */}
            <section>

            </section>
        </main>


    );
}