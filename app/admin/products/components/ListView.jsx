"use client";

import { useProducts } from "@/lib/firestore/products/read";
import { deleteProduct } from "@/lib/firestore/products/write";
import { Button, CircularProgress } from "@nextui-org/react";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ListView() {
    const [pageLimit, setPageLimit] = useState(10);
    const [lastSnapDocList, setLastSnapDocList] = useState([]);

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

    const handleNextPage = () => {
        let newStack = [...lastSnapDocList];
        newStack.push(lastSnapDoc);
        setLastSnapDocList(newStack);
    };

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

function Row({ item, index }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

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

    return (
        <tr>
            <td className="border-y bg-white px-3 py-2 border-l rounded-l-lg text-center">
                {index + 1}
            </td>
            <td className="border-y bg-white px-3 py-2 text-center">
                <div className="flex justify-center">
                    <img
                        className="h-10 w-10 object-cover"
                        src={item?.featureImageURL}
                        alt=""
                    />
                </div>
            </td>
            <td className="border-y bg-white px-3 py-2 whitespace-nowrap">
                {item?.title}{" "}
                {item?.isFeatured === true && (
                    <span className="ml-2 bg-gradient-to-tr from-blue-500 to-indigo-400 text-white text-[10px] rounded-full px-3 py-1">
                        Nổi bật
                    </span>
                )}
            </td>
            <td className="border-y bg-white px-3 py-2  whitespace-nowrap">
                {item?.salePrice < item?.price && (
                    <span className="text-xs text-gray-500 line-through">
                        {/* Gọi hàm formatCurrencyVND để định dạng giá gốc */}
                        {formatCurrencyVND(item?.price)}
                    </span>
                )}{" "}
                {/* Gọi hàm formatCurrencyVND để định dạng giá giảm */}
                {formatCurrencyVND(item?.salePrice)}
            </td>
            <td className="border-y bg-white px-3 py-2">{item?.stock}</td>
            <td className="border-y bg-white px-3 py-2">{item?.orders ?? 0}</td>
            <td className="border-y bg-white px-3 py-2">
                <div className="flex">
                    {item?.stock - (item?.orders ?? 0) > 0 && (
                        <div className="px-2 py-1 text-xs text-green-500 bg-green-100 font-bold rounded-md">
                            Còn hàng
                        </div>
                    )}
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