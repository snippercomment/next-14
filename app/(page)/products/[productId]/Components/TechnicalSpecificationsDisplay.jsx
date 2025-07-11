export default function TechnicalSpecificationsDisplay({ product }) {
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
                            {processedSpecs.map((spec, index) => (
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
            </div>
            
            {/* Hiển thị số lượng thông số */}
            <div className="mt-3 text-sm text-gray-600">
                Tổng cộng {processedSpecs.length} thông số kỹ thuật chi tiết
            </div>
        </div>
    );
}