"use client";

import { useProducts } from "@/lib/firestore/products/read";
import { deleteProduct } from "@/lib/firestore/products/write";
import { Button, CircularProgress, Select, SelectItem } from "@nextui-org/react";
import { Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { getColorById, getProductCategoryInfo, detectProductType } from "../form/components/Colors";
import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";

const ITEMS_PER_PAGE = 5;

export default function ListView() {
    const [filterBrand, setFilterBrand] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    // Lấy danh sách brand và category
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();

    // Hàm kiểm tra product có thuộc category (bao gồm cả children)
    const productMatchesCategory = (product, categoryId) => {
        if (!categoryId) return true;
        
        // Tìm category được chọn
        const selectedCategory = categories?.find(cat => cat.id === categoryId);
        if (!selectedCategory) return false;
        
        // Check xem product có categoryId trùng với parent
        if (product.categoryId === categoryId) return true;
        
        // Check xem product có categoryId trùng với bất kỳ child nào
        if (selectedCategory.children && selectedCategory.children.length > 0) {
            return selectedCategory.children.some(child => child.id === product.categoryId);
        }
        
        return false;
    };

    // Load tất cả sản phẩm
    const {
        data: products,
        error,
        isLoading,
    } = useProducts({
        pageLimit: 1000,
        lastSnapDoc: null,
    });

    // Lọc dữ liệu sản phẩm
    const filteredProducts = useMemo(() => {
        return products?.filter(product => {
            const matchBrand = !filterBrand || product.brandId === filterBrand;
            
            // Sử dụng hàm kiểm tra category mới
            const matchCategory = productMatchesCategory(product, filterCategory);
            
            // Tính toán số lượng còn lại
            const soldQuantity = product.soldQuantity || product.orders || 0;
            const remainingStock = product.stock - soldQuantity;
            
            const matchStatus = !filterStatus || 
                (filterStatus === "in-stock" && remainingStock > 0) ||
                (filterStatus === "out-of-stock" && remainingStock <= 0);
                
            return matchBrand && matchCategory && matchStatus;
        }) || [];
    }, [products, filterBrand, filterCategory, filterStatus, categories]);

    // Tính toán pagination
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    // Reset về trang 1 khi filter thay đổi
    const handleFilterChange = (type, value) => {
        setCurrentPage(1);
        if (type === 'brand') {
            setFilterBrand(value);
        } else if (type === 'category') {
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
                    <CircularProgress size="lg" />
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
                    <h1 className="font-semibold text-xl">Quản lý sản phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tổng cộng: {filteredProducts.length} sản phẩm
                    </p>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex flex-col gap-2 flex-1">
                    <label className="text-gray-700 text-sm font-medium">
                        Lọc theo thương hiệu
                    </label>
                    <Select
                        placeholder="Tất cả thương hiệu"
                        selectedKeys={filterBrand ? [filterBrand] : []}
                        onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0];
                            handleFilterChange('brand', selected || "");
                        }}
                        className="w-full"
                        aria-label="Lọc theo thương hiệu"
                    >
                        <SelectItem key="" value="">
                            Tất cả thương hiệu
                        </SelectItem>
                        {brands?.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    <label className="text-gray-700 text-sm font-medium">
                        Lọc theo thể loại
                    </label>
                    <Select
                        placeholder="Tất cả thể loại"
                        selectedKeys={filterCategory ? [filterCategory] : []}
                        onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0];
                            handleFilterChange('category', selected || "");
                        }}
                        className="w-full"
                        aria-label="Lọc theo thể loại"
                    >
                        <SelectItem key="" value="">
                            Tất cả thể loại
                        </SelectItem>
                        {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
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
                            handleFilterChange('status', selected || "");
                        }}
                        className="w-full"
                        aria-label="Lọc theo trạng thái"
                    >
                        <SelectItem key="" value="">
                            Tất cả trạng thái
                        </SelectItem>
                        <SelectItem key="in-stock" value="in-stock">
                            Còn hàng
                        </SelectItem>
                        <SelectItem key="out-of-stock" value="out-of-stock">
                            Hết hàng
                        </SelectItem>
                    </Select>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                STT
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Ảnh
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Tên sản phẩm
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Giá
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Dung lượng
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Màu sắc
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Số lượng ban đầu
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Còn lại
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
                        {currentProducts.length > 0 ? (
                            currentProducts.map((item, index) => (
                                <Row
                                    key={item.id}
                                    index={startIndex + index}
                                    item={item}
                                    brands={brands}
                                    categories={categories}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="text-center py-10 text-gray-500">
                                    {filteredProducts.length === 0 ?
                                        "Không có dữ liệu sản phẩm" :
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
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} của {filteredProducts.length} kết quả
                    </div>

                    <div className="flex items-center gap-2">
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

                        <div className="flex items-center gap-1">
                            {(() => {
                                const pageNumbers = [];
                                const maxVisiblePages = 5;
                                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                                if (endPage === totalPages) {
                                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                }

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

                                for (let i = startPage; i <= endPage; i++) {
                                    if ((i === 1 && startPage > 1) || (i === totalPages && endPage < totalPages)) {
                                        continue;
                                    }

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
                                        >
                                            {i}
                                        </Button>
                                    );
                                }

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
                                        >
                                            {totalPages}
                                        </Button>
                                    );
                                }

                                return pageNumbers;
                            })()}
                        </div>

                        <Button
                            isIconOnly
                            variant="flat"
                            size="sm"
                            onPress={() => handlePageChange(currentPage + 1)}
                            isDisabled={currentPage === totalPages}
                            className="min-w-8 h-8"
                            aria-label="Trang sau"
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Row({ item, index, brands, categories }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const selectedBrand = brands?.find(brand => brand.id === item?.brandId);
    const selectedCategory = categories?.find(category => category.id === item?.categoryId);
    const productType = detectProductType(selectedBrand?.name, selectedCategory?.name);
    const categoryInfo = getProductCategoryInfo(productType);

    const soldQuantity = item?.soldQuantity || item?.orders || 0;
    const remainingStock = item?.stock - soldQuantity;

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

        setIsDeleting(true);
        try {
            await deleteProduct({ id: item?.id });
            toast.success("Đã xóa sản phẩm thành công");
        } catch (error) {
            toast.error(error?.message);
        }
        setIsDeleting(false);
    };

    const handleUpdate = () => {
        router.push(`/admin/products/form?id=${item?.id}`);
    };

    const formatCurrencyVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const renderStorages = () => {
        const storageField = categoryInfo.storageField;
        const storageData = item?.[storageField];
        const displayLimit = 3;

        let dataToDisplay = [];

        if (Array.isArray(storageData) && storageData.length > 0) {
            dataToDisplay = storageData;
        } else if (Array.isArray(item?.storages) && item.storages.length > 0) {
            dataToDisplay = item.storages;
        } else if (Array.isArray(item?.specifications) && item.specifications.length > 0) {
            dataToDisplay = item.specifications;
        } else if (item?.storage) {
            dataToDisplay = [item.storage];
        }

        if (dataToDisplay.length === 0) {
            return <span className="text-gray-400 text-xs">Chưa có</span>;
        }

        if (dataToDisplay.length <= displayLimit) {
            return (
                <div className="flex flex-wrap gap-1">
                    {dataToDisplay.map((storage, idx) => (
                        <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                            {storage}
                        </span>
                    ))}
                </div>
            );
        } else {
            return (
                <div className="flex flex-wrap gap-1">
                    {dataToDisplay.slice(0, displayLimit - 1).map((storage, idx) => (
                        <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                            {storage}
                        </span>
                    ))}
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        +{dataToDisplay.length - (displayLimit - 1)}
                    </span>
                </div>
            );
        }
    };

    const renderColors = () => {
        if (Array.isArray(item?.colorIds) && item.colorIds.length > 0) {
            const colors = item.colorIds.map(colorId => getColorById(colorId)).filter(Boolean);

            if (colors.length === 0) {
                return <span className="text-gray-400 text-xs">Chưa có</span>;
            }

            if (colors.length === 1) {
                const color = colors[0];
                return (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.hexColor }}
                            title={color.title}
                        ></div>
                        <span className="text-xs">{color.title}</span>
                    </div>
                );
            } else if (colors.length <= 4) {
                return (
                    <div className="flex flex-wrap gap-1">
                        {colors.map((color, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs"
                            >
                                <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color.hexColor }}
                                    title={color.title}
                                ></div>
                                <span>{color.title}</span>
                            </div>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className="flex flex-wrap gap-1">
                        {colors.slice(0, 3).map((color, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs"
                            >
                                <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color.hexColor }}
                                    title={color.title}
                                ></div>
                                <span>{color.title}</span>
                            </div>
                        ))}
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                            +{colors.length - 3}
                        </span>
                    </div>
                );
            }
        } else if (Array.isArray(item?.colors) && item.colors.length > 0) {
            const colors = item.colors;
            if (colors.length === 1) {
                return (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: colors[0] }}
                            title={colors[0]}
                        ></div>
                        <span className="text-xs">{colors[0]}</span>
                    </div>
                );
            } else if (colors.length <= 4) {
                return (
                    <div className="flex flex-wrap gap-1">
                        {colors.map((color, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs"
                            >
                                <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                ></div>
                                <span>{color}</span>
                            </div>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className="flex flex-wrap gap-1">
                        {colors.slice(0, 3).map((color, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs"
                            >
                                <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                ></div>
                                <span>{color}</span>
                            </div>
                        ))}
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                            +{colors.length - 3}
                        </span>
                    </div>
                );
            }
        } else if (item?.color) {
            return (
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.color }}
                        title={item.color}
                    ></div>
                    <span className="text-xs">{item.color}</span>
                </div>
            );
        } else {
            return <span className="text-gray-400 text-xs">Chưa có</span>;
        }
    };

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4 text-gray-700">
                {index + 1}
            </td>
            <td className="py-3 px-4">
                <div className="flex justify-center">
                    <img
                        className="h-10 w-10 object-cover rounded"
                        src={item?.featureImageURL}
                        alt={`Ảnh sản phẩm ${item?.title}`}
                    />
                </div>
            </td>
            <td className="py-3 px-4 max-w-64">
                <div className="truncate font-medium text-gray-900" title={item?.title}>
                    {item?.title}
                </div>
                {item?.isFeatured === true && (
                    <span className="mt-1 inline-block bg-gradient-to-tr from-blue-500 to-indigo-400 text-white text-[10px] rounded-full px-3 py-1">
                        Nổi bật
                    </span>
                )}
            </td>
            <td className="py-3 px-4">
                <div className="whitespace-nowrap">
                    {item?.salePrice < item?.price && (
                        <div className="text-xs text-gray-500 line-through">
                            {formatCurrencyVND(item?.price)}
                        </div>
                    )}
                    <div className="font-medium">
                        {formatCurrencyVND(item?.salePrice)}
                    </div>
                </div>
            </td>
            <td className="py-3 px-4">
                <div className="min-w-[120px]">
                    {renderStorages()}
                </div>
            </td>
            <td className="py-3 px-4">
                <div className="min-w-[140px]">
                    {renderColors()}
                </div>
            </td>
            <td className="py-3 px-4 text-center">
                <span className="font-medium">{item?.stock}</span>
            </td>
            <td className="py-3 px-4 text-center">
                <span className={`font-medium ${remainingStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {remainingStock}
                </span>
            </td>
            <td className="py-3 px-4">
                <div className="flex justify-center">
                    {remainingStock > 0 ? (
                        <div className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded-md whitespace-nowrap">
                            Còn hàng
                        </div>
                    ) : (
                        <div className="px-2 py-1 text-xs text-red-500 bg-red-100 rounded-md whitespace-nowrap">
                            Hết hàng
                        </div>
                    )}
                </div>
            </td>
            <td className="py-3 px-4">
                <div className="flex gap-2 items-center justify-center">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={handleUpdate}
                        className="hover:bg-blue-100"
                        aria-label={`Chỉnh sửa sản phẩm ${item?.title}`}
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
                        aria-label={`Xóa sản phẩm ${item?.title}`}
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            </td>
        </tr>
    );
}