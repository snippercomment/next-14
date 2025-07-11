import { useState } from "react";

export default function ProductDescription({ product }) {
    const [showFullDescription, setShowFullDescription] = useState(false);

    return (
        <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Mô tả sản phẩm</h3>
            
            {product?.description ? (
                <div className="bg-gray-50 rounded-lg p-6">
                    <div
                        className={`text-gray-700 leading-relaxed prose prose-sm max-w-none ${
                            !showFullDescription ? 'line-clamp-6' : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                    
                    {/* Nút xem thêm/thu gọn */}
                    <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                        {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                </div>
            ) : (
                /* Nếu không có mô tả chi tiết, hiển thị mô tả ngắn */
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="text-gray-700 leading-relaxed">
                        <p className="mb-4 text-base">{product?.shortDescription}</p>
                    </div>
                </div>
            )}
        </div>
    );
}