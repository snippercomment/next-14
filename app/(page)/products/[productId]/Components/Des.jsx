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

            {/* Modal popup hiển thị dạng bảng khi nhấn xem thêm */}
            {showFullDescription && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">THÔNG SỐ KỸ THUẬT</h2>
                                <button
                                    onClick={() => setShowFullDescription(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <div
                                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}