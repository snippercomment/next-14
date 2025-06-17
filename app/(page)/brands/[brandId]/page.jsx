import { ProductCard } from "@/app/components/Products";
import { getBrand } from "@/lib/firestore/brands/read_server";
import { getProductsByBrand } from "@/lib/firestore/products/read_server";

export async function generateMetadata({ params }) {
    const { brandId } = params;
    const brand = await getBrand({ id: brandId });
    
    return {
        title: `${brand?.name} | Brand`,
        openGraph: {
            images: [brand?.imageURL],
        },
    };
}

export default async function Page({ params }) {
    const { brandId } = params;
    const brand = await getBrand({ id: brandId });
    const products = await getProductsByBrand({ brandId: brandId });
    
    return (
        <main className="flex justify-center p-5 md:px-10 md:py-5 w-full">
            <div className="flex flex-col gap-6 max-w-[900px] p-5">
                {/* Hiển thị thông tin thương hiệu */}
                <div className="text-center">
                    {brand?.imageURL && (
                        <div className="flex justify-center mb-4">
                            <img 
                                src={brand.imageURL} 
                                alt={brand.name}
                                className="h-16 w-16 object-contain"
                            />
                        </div>
                    )}
                    <h1 className="font-semibold text-4xl">{brand?.name}</h1>
                    {brand?.category && (
                        <p className="text-gray-600 mt-2">
                            Danh mục: {brand.category === 'iphone' ? 'iPhone' : 
                                     brand.category === 'laptop' ? 'Laptop' :
                                     brand.category === 'mouse' ? 'Chuột' :
                                     brand.category === 'headphone' ? 'Tai nghe' : 
                                     brand.category}
                        </p>
                    )}
                </div>
                
                {/* Hiển thị danh sách sản phẩm */}
                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 justify-self-center justify-center items-center gap-4 md:gap-5">
                        {products.map((item) => {
                            return <ProductCard product={item} key={item?.id} />;
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-lg">
                            Chưa có sản phẩm nào từ thương hiệu {brand?.name}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}