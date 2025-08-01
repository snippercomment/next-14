import { ProductCard } from "@/app/components/Products";
import { getProductsByBrand, getProductsByCategory } from "@/lib/firestore/products/read_server";

export default async function RelatedProducts({ categoryId, brandId, currentProductId }) {
    let products = [];
    
    try {
        // Bước 1: Ưu tiên lấy sản phẩm cùng thương hiệu
        if (brandId) {
            const brandProducts = await getProductsByBrand({ brandId });
            products = brandProducts.filter(product => product.id !== currentProductId);
        }
        
        // Bước 2: Nếu ít hơn 4 sản phẩm cùng brand, bổ sung từ cùng danh mục
        if (products.length < 4 && categoryId) {
            const categoryProducts = await getProductsByCategory({ categoryId });
            const additionalProducts = categoryProducts.filter(product => 
                product.id !== currentProductId && 
                !products.some(p => p.id === product.id)
            );
            products = [...products, ...additionalProducts];
        }
        
        // Giới hạn 8 sản phẩm
        products = products.slice(0, 8);
        
    } catch (error) {
        console.error("Error:", error);
        products = [];
    }

    if (products.length === 0) return null;

    return (
        <div className="w-full flex justify-center">
            <div className="flex flex-col gap-5 max-w-[900px] p-5">
                <h1 className="text-center font-semibold text-lg">Sản phẩm liên quan</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {products?.map((item) => (
                        <ProductCard product={item} key={item?.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}
