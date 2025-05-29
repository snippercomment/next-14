"use client";


import { deleteCollection } from "@/lib/firestore/collections/write";
import { useCollections } from "@/lib/firestore/collections/read";
import { Button, CircularProgress } from "@nextui-org/react";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ListView() {
    const { data: collections, error, isLoading } = useCollections();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress />
            </div>
        );
    }
    if (error) {
        return <div>{error}</div>;
    }
    return (
        <div className="flex-1 flex flex-col gap-3 md:pr-5 md:px-0 px-5 rounded-xl">
            <h1 className="text-xl">Bộ Sưu Tập</h1>
            <table className="border-separate border-spacing-y-3">
                <thead>
                    <tr>
                        <th className="font-semibold border-y bg-white px-3 py-2 border-l rounded-l-lg">
                            STT
                        </th>
                        <th className="font-semibold border-y bg-white px-3 py-2">Hình Ảnh</th>
                        <th className="font-semibold border-y bg-white px-3 py-2 text-left">
                            Tên Bộ Sưu Tập
                        </th>
                        <th className="font-semibold border-y bg-white px-3 py-2 text-left">
                            Sản Phẩm
                        </th>
                        <th className="font-semibold border-y bg-white px-3 py-2 border-r rounded-r-lg text-center">
                            Hành Động
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {collections?.map((item, index) => {
                        return <Row index={index} item={item} key={item?.id} />;
                    })}
                </tbody>
            </table>
        </div>
    );
}

function Row({ item, index }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xoá bộ sưu tập này không?")) return;

        setIsDeleting(true);
        try {
            await deleteCollection({ id: item?.id });
            toast.success("Đã xoá bộ sưu tập thành công");
        } catch (error) {
            toast.error(error?.message);
        }
        setIsDeleting(false);
    };

    const handleUpdate = () => {
        router.push(`/admin/collections?id=${item?.id}`);
    };

    return (
        <tr>
            <td className="border-y bg-white px-3 py-2 border-l rounded-l-lg text-center">
                {index + 1}
            </td>
            <td className="border-y bg-white px-3 py-2 text-center">
                <div className="flex justify-center">
                    <img className="h-10 w-10 object-cover" src={item?.imageURL} alt="" />
                </div>
            </td>
            <td className="border-y bg-white px-3 py-2">{item?.title}</td>
            <td className="border-y bg-white px-3 py-2">{item?.products?.length}</td>
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