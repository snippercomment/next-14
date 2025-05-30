"use client";

import { Button, CircularProgress, Select, SelectItem } from "@nextui-org/react";
import { useBrands } from "@/lib/firestore/brands/read";
import { Edit2, Trash, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
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

export default function ListView() {
    const { data: brands, error, isLoading } = useBrands();
    const [filterCategory, setFilterCategory] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const router = useRouter();

    // Lọc dữ liệu thương hiệu
    const filteredBrands = brands?.filter(brand => {
        const matchCategory = !filterCategory || brand.category === filterCategory;
        const matchStatus = !filterStatus || brand.status === filterStatus;
        return matchCategory && matchStatus;
    });

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
                <h1 className="font-semibold text-xl">Quản lý thương hiệu</h1>
                <Button
                    startContent={<Plus size={16} />}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onPress={() => router.push("/admin/brands")}
                >
                    Thêm thương hiệu
                </Button>
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
                            setFilterCategory(selected === "all" ? "" : selected || "");
                        }}
                        className="w-full"
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
                            setFilterStatus(selected === "all" ? "" : selected || "");
                        }}
                        className="w-full"
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
                        {filteredBrands?.length > 0 ? (
                            filteredBrands.map((item, index) => (
                                <Row
                                    key={item.id}
                                    item={item}
                                    index={index}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-500">
                                    Không có dữ liệu thương hiệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Row({ item, index }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    // Xóa thương hiệu
    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa thương hiệu này không?")) return;

        setIsDeleting(true);
        try {
            await deleteBrand({ id: item?.id });
            toast.success("Xóa thương hiệu thành công");
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
                            alt={item?.name}
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
                    >
                        <Trash size={14} />
                    </Button>
                </div>
            </td>
        </tr>
    );
}