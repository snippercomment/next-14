import Header from "./components/Header";
// import FeaturedProductSlider from "./components/Sliders";
import { getFeaturedProducts } from "@/lib/firestore/products/read_server";
import Collections from "./components/Collections";
import { getCollections } from "@/lib/firestore/collections/read_server";
export default async function Home() {
  // lấy danh sách sản phẩm nổi bật
  const featuredProducts = await getFeaturedProducts();
  // lấy danh sách danh mục
  const collections = await getCollections();
  return (
    <main className="w-screen h-screen overflow-x-hidden overflow-y-auto">
      {/* header   */}
      <Header />
      {/* slider sản phẩm nổi bật */}
      {/* <FeaturedProductSlider featuredProducts={featuredProducts} /> */}
      {/* slider danh mục */}
      <Collections collections={collections} />
    </main>
  );
}
