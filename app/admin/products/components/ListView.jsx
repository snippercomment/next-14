"use client";

import { useProducts } from "@/lib/firestore/products/read";
import { deleteProduct } from "@/lib/firestore/products/write";
import { Button, CircularProgress } from "@nextui-org/react";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getColorById, getProductCategoryInfo, detectProductType } from "../form/components/Colors";
import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";

export default function ListView() {
    const [pageLimit, setPageLimit] = useState(10);
    const [lastSnapDocList, setLastSnapDocList] = useState([]);

    // lấy danh sách brand và category
    const { data: brands } = useBrands();
    const { data: categories } = useCategories();

    useEffect(() => {
        setLastSnapDocList([]);
    }, [pageLimit]);

    const {
        data: products,
        error,
        isLoading,
        lastSnapDoc,
    } = useProducts({
        pageLimit: pageLimit,
        lastSnapDoc:
            lastSnapDocList?.length === 0
                ? null
                : lastSnapDocList[lastSnapDocList?.length - 1],
    });

    // trang tiếp
    const handleNextPage = () => {
        let newStack = [...lastSnapDocList];
        newStack.push(lastSnapDoc);
        setLastSnapDocList(newStack);
    };
    // trang trước
    const handlePrePage = () => {
        let newStack = [...lastSnapDocList];
        newStack.pop();
        setLastSnapDocList(newStack);
    };

    if (isLoading) {
        return (
            <div>
                <CircularProgress />
            </div>
        );
    }
    if (error) {
        return <div>{error}</div>;
    }
    return (
        <div className="flex-1 flex flex-col gap-3 md:pr-5 md:px-0 px-5 rounded-xl w-full overflow-x-auto">
            <table className="border-separate border-spacing-y-3">
                <thead>
                    <tr>
                        <th className="font-semibold border-y bg-white px-3 py-2 border-l rounded-l-lg">
                            STT
                        </th>
                        <th className="font-semibold border-y bg-white px-3 py-2">Ảnh</th>
                        <th className="font-semibold border-y bg-white px-3 py-2 text-left">
                            Tên sản phẩm
                        </th>
                        <th className="font-semibold border-y bg-white px-3 py-2 text-left">
                            Giá
                        </th>
                        <th className="font-semibold border-y bg-white px-3 py-2 text-left">
                            Dung lượng
                        </th>
                        <th className="font-semibold border-y bg-white px-3 py-2 text-left">
                            Màu sắc
                        </th>
                        <th className="font-semibold border-y bg-white px-3 py-2 text-left">
                            Số lượng
                        </th>
                        <th className="font-semibold border-y bg-white px-3 py-2 text-left">
                            Đơn hàng
                        </th>
                        <th className="font-semibold border-y bg-white px-3 py-2 text-left">
                            Trạng thái
                        </th>
                        <th className="font-semibold border-y bg-white px-3 py-2 border-r rounded-r-lg text-center">
                            Hành động
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {products?.map((item, index) => {
                        return (
                            <Row
                                index={index + lastSnapDocList?.length * pageLimit}
                                item={item}
                                key={item?.id}
                                brands={brands}
                                categories={categories}
                            />
                        );
                    })}
                </tbody>
            </table>
            <div className="flex justify-between text-sm py-3">
                <Button
                    isDisabled={isLoading || lastSnapDocList?.length === 0}
                    onClick={handlePrePage}
                    size="sm"
                    variant="bordered"
                >
                    Trang trước
                </Button>
                <select
                    value={pageLimit}
                    onChange={(e) => setPageLimit(e.target.value)}
                    className="px-5 rounded-xl"
                    name="perpage"
                    id="perpage"
                >
                    <option value={3}>3 sản phẩm</option>
                    <option value={5}>5 sản phẩm</option>
                    <option value={10}>10 sản phẩm</option>
                    <option value={20}>20 sản phẩm</option>
                    <option value={100}>100 sản phẩm</option>
                </select>
                <Button
                    isDisabled={isLoading || products?.length === 0}
                    onClick={handleNextPage}
                    size="sm"
                    variant="bordered"
                >
                    Trang tiếp
                </Button>
            </div>
        </div>
    );
}

function Row({ item, index, brands, categories }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    // Xác định loại sản phẩm - ĐÂY LÀ PHẦN QUAN TRỌNG ĐÃ SỬA
    const selectedBrand = brands?.find(brand => brand.id === item?.brandId);
    const selectedCategory = categories?.find(category => category.id === item?.categoryId);
    const productType = detectProductType(selectedBrand?.name, selectedCategory?.name);
    const categoryInfo = getProductCategoryInfo(productType);

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

    // Hàm để định dạng tiền Việt Nam
    const formatCurrencyVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0, // Không hiển thị số thập phân
        }).format(amount);
    };

    // Hàm hiển thị dung lượng - ĐÃ SỬA LẠI
    const renderStorages = () => {
        // Lấy field phù hợp theo loại sản phẩm
        const storageField = categoryInfo.storageField; // 'storages' hoặc 'specifications'
        const storageData = item?.[storageField];

        // Kiểm tra nếu có dữ liệu storage theo cấu trúc mới
        if (Array.isArray(storageData) && storageData.length > 0) {
            if (storageData.length === 1) {
                return storageData[0];
            } else if (storageData.length <= 3) {
                return (
                    <div className="flex flex-wrap gap-1">
                        {storageData.map((storage, idx) => (
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
                        {storageData.slice(0, 2).map((storage, idx) => (
                            <span
                                key={idx}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                                {storage}
                            </span>
                        ))}
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            +{storageData.length - 2}
                        </span>
                    </div>
                );
            }
        }
        // Fallback cho data cũ - kiểm tra cả storages và specifications
        else if (item?.storages && Array.isArray(item.storages) && item.storages.length > 0) {
            const storageData = item.storages;
            if (storageData.length === 1) {
                return storageData[0];
            } else if (storageData.length <= 3) {
                return (
                    <div className="flex flex-wrap gap-1">
                        {storageData.map((storage, idx) => (
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
                        {storageData.slice(0, 2).map((storage, idx) => (
                            <span
                                key={idx}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                                {storage}
                            </span>
                        ))}
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            +{storageData.length - 2}
                        </span>
                    </div>
                );
            }
        }
        // Kiểm tra specifications cho laptop
        else if (item?.specifications && Array.isArray(item.specifications) && item.specifications.length > 0) {
            const specData = item.specifications;
            if (specData.length === 1) {
                return specData[0];
            } else if (specData.length <= 3) {
                return (
                    <div className="flex flex-wrap gap-1">
                        {specData.map((spec, idx) => (
                            <span
                                key={idx}
                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                            >
                                {spec}
                            </span>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className="flex flex-wrap gap-1">
                        {specData.slice(0, 2).map((spec, idx) => (
                            <span
                                key={idx}
                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                            >
                                {spec}
                            </span>
                        ))}
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            +{specData.length - 2}
                        </span>
                    </div>
                );
            }
        }
        // Fallback cho single storage (data cũ)
        else if (item?.storage) {
            return item.storage;
        }
        // Không có dung lượng
        else {
            return <span className="text-gray-400 text-xs">Chưa có</span>;
        }
    };

    // Hàm hiển thị màu sắc 
    const renderColors = () => {
        // Kiểm tra nếu có colorIds 
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
        }
        // Kiểm tra nếu có colors array trực tiếp 
        else if (Array.isArray(item?.colors) && item.colors.length > 0) {
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
        }
        // Fallback cho single color (data cũ)
        else if (item?.color) {
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
        }
        // Không có màu sắc
        else {
            return <span className="text-gray-400 text-xs">Chưa có</span>;
        }
    };

    return (
        <tr>
            {/* stt */}
            <td className="border-y bg-white px-3 py-2 border-l rounded-l-lg text-center">
                {index + 1}
            </td>
            {/* ảnh sản phẩm */}
            <td className="border-y bg-white px-3 py-2 text-center">
                <div className="flex justify-center">
                    <img
                        className="h-10 w-10 object-cover"
                        src={item?.featureImageURL}
                        alt=""
                    />
                </div>
            </td>
            {/* tên sản phẩm */}
            <td className="border-y bg-white px-3 py-2 whitespace-nowrap">
                {item?.title}{" "}
                {/* sản phẩm nổi bật */}
                {item?.isFeatured === true && (
                    <span className="ml-2 bg-gradient-to-tr from-blue-500 to-indigo-400 text-white text-[10px] rounded-full px-3 py-1">
                        Nổi bật
                    </span>
                )}
            </td>
            {/* giá sản phẩm */}
            <td className="border-y bg-white px-3 py-2 whitespace-nowrap">
                {item?.salePrice < item?.price && (
                    <span className="text-xs text-gray-500 line-through">
                        {/* Gọi hàm formatCurrencyVND để định dạng giá gốc */}
                        {formatCurrencyVND(item?.price)}
                    </span>
                )}{" "}
                {/* Gọi hàm formatCurrencyVND để định dạng giá giảm */}
                {formatCurrencyVND(item?.salePrice)}
            </td>
            {/* dung lượng - hiển thị nhiều dung lượng */}
            <td className="border-y bg-white px-3 py-2">
                <div className="min-w-[120px]">
                    {renderStorages()}
                </div>
            </td>
            {/* màu sắc - hiển thị nhiều màu */}
            <td className="border-y bg-white px-3 py-2">
                <div className="min-w-[140px]">
                    {renderColors()}
                </div>
            </td>
            {/* số lượng sản phẩm */}
            <td className="border-y bg-white px-3 py-2">{item?.stock}</td>
            {/* số lượng đơn hàng */}
            <td className="border-y bg-white px-3 py-2">{item?.orders ?? 0}</td>
            {/* trạng thái sản phẩm */}
            <td className="border-y bg-white px-3 py-2">
                <div className="flex">
                    {/* sản phẩm còn hàng */}
                    {item?.stock - (item?.orders ?? 0) > 0 && (
                        <div className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded-md">
                            Còn hàng
                        </div>
                    )}
                    {/* sản phẩm hết hàng */}
                    {item?.stock - (item?.orders ?? 0) <= 0 && (
                        <div className="px-2 py-1 text-xs text-red-500 bg-red-100 rounded-md">
                            Hết hàng
                        </div>
                    )}
                </div>
            </td>

            <td className="border-y bg-white px-3 py-2 border-r rounded-r-lg">
                <div className="flex gap-2 items-center justify-center">
                    <Button
                        onClick={handleUpdate}
                        isDisabled={isDeleting}
                        isIconOnly
                        size="sm"
                    >
                        <Edit2 size={13} />
                    </Button>
                    <Button
                        onClick={handleDelete}
                        isLoading={isDeleting}
                        isDisabled={isDeleting}
                        isIconOnly
                        size="sm"
                        color="danger"
                    >
                        <Trash2 size={13} />
                    </Button>
                </div>
            </td>
        </tr>
    );
}