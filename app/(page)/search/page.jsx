// page.js - Fixed version
import { ProductCard } from "@/app/components/Products";
import SearchBox from "./components/SearchBox";

const getProducts = async (text) => {
  if (!text) {
    return [];
  }
     
  // Thay thế bằng API tìm kiếm thông thường của bạn
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/search?q=${encodeURIComponent(text)}`, {
      cache: 'no-store' // Tắt cache để luôn lấy data mới
    });
    
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Fix: await searchParams in Next.js 13+
export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const { q } = resolvedSearchParams;
  const products = await getProducts(q);
     
  return (
    <main className="flex flex-col gap-1 min-h-screen p-5">
      <SearchBox />
             
      {q && products?.length === 0 && (
        <div className="w-full flex justify-center mt-8">
          <div className="text-center">
            <p className="text-gray-500">Không tìm thấy sản phẩm cho "{q}"</p>
          </div>
        </div>
      )}
      
      {products?.length > 0 && (
        <div className="w-full flex justify-center">
          <div className="flex flex-col gap-5 max-w-[900px] p-5">
            <h1 className="text-center font-semibold text-lg">
              Sản phẩm cho "{q}" ({products.length} kết quả)
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {products?.map((item) => {
                return <ProductCard product={item} key={item?.id} />;
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}