import { useState } from "react";

export default function TechnicalSpecificationsDisplay({ product }) {
    const [showSpecModal, setShowSpecModal] = useState(false);
    
    // Sửa từ product?.specifications thành product?.technicalSpecs
    const technicalSpecs = product?.technicalSpecs;
    
    // Xử lý dữ liệu tương tự như trong file admin
    const processedSpecs = (() => {
        if (!technicalSpecs) return [];

        // Xử lý chuỗi JSON
        if (typeof technicalSpecs === "string") {
            try {
                const parsed = JSON.parse(technicalSpecs);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }

        // Xử lý mảng
        if (Array.isArray(technicalSpecs)) {
            return technicalSpecs.filter(spec =>
                spec && typeof spec === "object" &&
                !Array.isArray(spec) &&
                spec.key?.trim() && spec.value?.trim()
            );
        }

        return [];
    })();

    // Kiểm tra xem có ít nhất một thông số hợp lệ không
    const hasValidSpecifications = processedSpecs.length > 0;

    // Nếu không có thông số hợp lệ, ẩn toàn bộ phần này
    if (!hasValidSpecifications) return null;

    return (
        <div className="border-t pt-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Thông số kỹ thuật chi tiết</h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <tbody>
                            {processedSpecs.slice(0, 5).map((spec, index) => (
                                <tr
                                    key={spec.id || index}
                                    className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                                >
                                    <td className="px-4 py-3 text-gray-700 font-medium border-r border-gray-200 w-1/3">
                                        {spec.key}
                                    </td>
                                    <td className="px-4 py-3 text-gray-800">
                                        {spec.value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Nút xem thêm */}
                {processedSpecs.length > 5 && (
                    <button
                        onClick={() => setShowSpecModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                        Xem thêm ({processedSpecs.length - 5} thông số)
                    </button>
                )}
            </div>
            
            {/* Hiển thị số lượng thông số */}
            <div className="mt-3 text-sm text-gray-600">
                Tổng cộng {processedSpecs.length} thông số kỹ thuật chi tiết
            </div>

            {/* Modal popup hiển thị tất cả thông số */}
            {showSpecModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">THÔNG SỐ KỸ THUẬT</h2>
                                <button
                                    onClick={() => setShowSpecModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <tbody>
                                        {processedSpecs.map((spec, index) => (
                                            <tr
                                                key={spec.id || index}
                                                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                            >
                                                <td className="px-4 py-3 text-gray-700 font-medium border border-gray-300 w-1/3">
                                                    {spec.key}
                                                </td>
                                                <td className="px-4 py-3 text-gray-800 border border-gray-300">
                                                    {spec.value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}