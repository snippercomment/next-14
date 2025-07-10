"use client";

import { Button, CircularProgress, Select, SelectItem } from "@nextui-org/react";
import { useBrands } from "@/lib/firestore/brands/read";
import { Edit2, Trash, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useState, useMemo } from "react";
import { deleteBrand } from "@/lib/firestore/brands/write";
import { useRouter } from "next/navigation";

// Định nghĩa các danh mục thương hiệu (giống với Form)
const BRAND_CATEGORIES = {
    iphone: {
        value: "iphone",
        label: "iPhone",
        description: "Thương hiệu điện thoại iPhone"
    },
    laptop: {
        value: "laptop",
        label: "Laptop",
        description: "Thương hiệu máy tính xách tay"
    },
    mouse: {
        value: "mouse",
        label: "Chuột",
        description: "Thương hiệu chuột máy tính"
    },
    headphone: {
        value: "headphone",
        label: "Tai nghe",
        description: "Thương hiệu tai nghe và âm thanh"
    }
};

const ITEMS_PER_PAGE = 10;

export default function ListView() {
    const { data: brands, error, isLoading } = useBrands();
    const [filterCategory, setFilterCategory] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    // Lọc dữ liệu thương hiệu
    const filteredBrands = useMemo(() => {
        return brands?.filter(brand => {
            const matchCategory = !filterCategory || brand.category === filterCategory;
            const matchStatus = !filterStatus || brand.status === filterStatus;
            return matchCategory && matchStatus;
        }) || [];
    }, [brands, filterCategory, filterStatus]);

    // Tính toán pagination
    const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentBrands = filteredBrands.slice(startIndex, endIndex);

    // Reset về trang 1 khi filter thay đổi
    const handleFilterChange = (type, value) => {
        setCurrentPage(1);
        if (type === 'category') {
            setFilterCategory(value);
        } else if (type === 'status') {
            setFilterStatus(value);
        }
    };

    // Xử lý chuyển trang
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full">
                <div className="flex items-center justify-center py-20">
                    <CircularProgress size="lg" aria-label="Đang tải dữ liệu" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full">
                <div className="text-red-500 text-center py-10">
                    Lỗi: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-semibold text-xl">Quản lý thương hiệu</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tổng cộng: {filteredBrands.length} thương hiệu
                    </p>
                </div>
                
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex flex-col gap-2 flex-1">
                    <label className="text-gray-700 text-sm font-medium">
                        Lọc theo danh mục
                    </label>
                    <Select
                        placeholder="Tất cả danh mục"
                        selectedKeys={filterCategory ? [filterCategory] : []}
                        onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0];
                            handleFilterChange('category', selected === "all" ? "" : selected || "");
                        }}
                        className="w-full"
                        aria-label="Lọc theo danh mục thương hiệu"
                    >
                        <SelectItem key="all" value="all">
                            Tất cả danh mục
                        </SelectItem>
                        {Object.values(BRAND_CATEGORIES).map((category) => (
                            <SelectItem
                                key={category.value}
                                value={category.value}
                            >
                                {category.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    <label className="text-gray-700 text-sm font-medium">
                        Lọc theo trạng thái
                    </label>
                    <Select
                        placeholder="Tất cả trạng thái"
                        selectedKeys={filterStatus ? [filterStatus] : []}
                        onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0];
                            handleFilterChange('status', selected === "all" ? "" : selected || "");
                        }}
                        className="w-full"
                        aria-label="Lọc theo trạng thái thương hiệu"
                    >
                        <SelectItem key="all" value="all">
                            Tất cả trạng thái
                        </SelectItem>
                        <SelectItem key="active" value="active">
                            Hoạt động
                        </SelectItem>
                        <SelectItem key="inactive" value="inactive">
                            Tạm dừng
                        </SelectItem>
                    </Select>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse" role="table" aria-label="Danh sách thương hiệu">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                STT
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Ảnh
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Tên thương hiệu
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Danh mục
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Trạng thái
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentBrands.length > 0 ? (
                            currentBrands.map((item, index) => (
                                <Row
                                    key={item.id}
                                    item={item}
                                    index={startIndex + index}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-500">
                                    {filteredBrands.length === 0 ?
                                        "Không có dữ liệu thương hiệu" :
                                        "Không có dữ liệu cho trang này"
                                    }
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredBrands.length)} của {filteredBrands.length} kết quả
                    </div>

                    <div className="flex items-center gap-2" role="navigation" aria-label="Phân trang">
                        {/* Previous Button */}
                        <Button
                            isIconOnly
                            variant="flat"
                            size="sm"
                            onPress={() => handlePageChange(currentPage - 1)}
                            isDisabled={currentPage === 1}
                            className="min-w-8 h-8"
                            aria-label="Trang trước"
                        >
                            <ChevronLeft size={16} />
                        </Button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {(() => {
                                const pageNumbers = [];
                                const maxVisiblePages = 5;
                                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                                // Điều chỉnh startPage nếu endPage đã tới maximum
                                if (endPage === totalPages) {
                                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                }

                                // Hiển thị trang đầu và dấu ...
                                if (startPage > 1) {
                                    pageNumbers.push(
                                        <Button
                                            key={1}
                                            variant={currentPage === 1 ? "solid" : "flat"}
                                            size="sm"
                                            onPress={() => handlePageChange(1)}
                                            className={`min-w-8 h-8 ${currentPage === 1
                                                    ? "bg-blue-600 text-white"
                                                    : "hover:bg-gray-100"
                                                }`}
                                            aria-label="Trang 1"
                                        >
                                            1
                                        </Button>
                                    );

                                    if (startPage > 2) {
                                        pageNumbers.push(
                                            <span key="start-ellipsis" className="px-2 text-gray-400">
                                                ...
                                            </span>
                                        );
                                    }
                                }

                                // Hiển thị các trang ở giữa
                                for (let i = startPage; i <= endPage; i++) {
                                    if (i !== 1 && i !== totalPages) {
                                        pageNumbers.push(
                                            <Button
                                                key={i}
                                                variant={currentPage === i ? "solid" : "flat"}
                                                size="sm"
                                                onPress={() => handlePageChange(i)}
                                                className={`min-w-8 h-8 ${currentPage === i
                                                        ? "bg-blue-600 text-white"
                                                        : "hover:bg-gray-100"
                                                    }`}
                                                aria-label={`Trang ${i}`}
                                            >
                                                {i}
                                            </Button>
                                        );
                                    }
                                }

                                // Hiển thị dấu ... và trang cuối
                                if (endPage < totalPages) {
                                    if (endPage < totalPages - 1) {
                                        pageNumbers.push(
                                            <span key="end-ellipsis" className="px-2 text-gray-400">
                                                ...
                                            </span>
                                        );
                                    }

                                    pageNumbers.push(
                                        <Button
                                            key={totalPages}
                                            variant={currentPage === totalPages ? "solid" : "flat"}
                                            size="sm"
                                            onPress={() => handlePageChange(totalPages)}
                                            className={`min-w-8 h-8 ${currentPage === totalPages
                                                    ? "bg-blue-600 text-white"
                                                    : "hover:bg-gray-100"
                                                }`}
                                            aria-label={`Trang ${totalPages}`}
                                        >
                                            {totalPages}
                                        </Button>
                                    );
                                }

                                return pageNumbers;
                            })()}
                        </div>

                        {/* Next Button */}
                        <Button
                            isIconOnly
                            variant="flat"
                            size="sm"
                            onPress={() => handlePageChange(currentPage + 1)}
                            isDisabled={currentPage === totalPages}
                            className="min-w-8 h-8"
                            aria-label="Trang tiếp theo"
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Row({ item, index }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    // Xóa thương hiệu
    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa thương hiệu này không? Các sản phẩm thuộc thương hiệu này sẽ bị ẩn tạm thời.")) return;

        setIsDeleting(true);
        try {
            await deleteBrand({ id: item?.id });
            toast.success("Xóa thương hiệu thành công. Các sản phẩm thuộc thương hiệu này đã được ẩn tạm thời.");
        } catch (error) {
            toast.error(error?.message || "Có lỗi xảy ra khi xóa thương hiệu");
        }
        setIsDeleting(false);
    };

    // Cập nhật thương hiệu
    const handleUpdate = () => {
        router.push(`/admin/brands?id=${item?.id}`);
    };

    // Lấy thông tin danh mục
    const categoryInfo = BRAND_CATEGORIES[item?.category];

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4 text-gray-700">
                {index + 1}
            </td>
            <td className="py-3 px-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    {item?.imageURL ? (
                        <img
                            src={item.imageURL}
                            alt={`Logo thương hiệu ${item?.name}`}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-gray-400 text-xs">No Image</div>
                    )}
                </div>
            </td>
            <td className="py-3 px-4">
                <div className="font-medium text-gray-900">
                    {item?.name}
                </div>
            </td>
            <td className="py-3 px-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {categoryInfo?.label || item?.category}
                </span>
            </td>
            <td className="py-3 px-4">
                <span className={`px-2 py-1 text-xs rounded-full ${item?.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {item?.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                </span>
            </td>
            <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={handleUpdate}
                        className="hover:bg-blue-100"
                        aria-label={`Chỉnh sửa thương hiệu ${item?.name}`}
                    >
                        <Edit2 size={14} />
                    </Button>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="danger"
                        isLoading={isDeleting}
                        isDisabled={isDeleting}
                        onPress={handleDelete}
                        className="hover:bg-red-100"
                        aria-label={`Xóa thương hiệu ${item?.name}`}
                    >
                        <Trash size={14} />
                    </Button>
                </div>
            </td>
        </tr>
    );
}