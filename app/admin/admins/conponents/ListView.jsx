    "use client";

    import { Button, CircularProgress } from "@nextui-org/react";
    import { useAdmins } from "@/lib/firestore/admins/read";
    import { Edit2, Trash2 } from "lucide-react";
    import toast from "react-hot-toast";
    import { useState } from "react";
    import { deleteAdmin } from "@/lib/firestore/admins/write";
    import { useRouter } from "next/navigation";

    export default function ListView() {
        const { data: admins, error, isLoading } = useAdmins();
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-screen">
                    <CircularProgress />
                </div>
            )
        }
        if (error) {
            return <div>{error}</div>
        }
        return (
            <div className="flex-1 flex flex-col gap-3 md:pr-5 md:px-0 px-5 rounded-xl">
                <h1 className="text-xl">Tài khoản</h1>
                <table className="border-separate border-spacing-y-3">
                    <thead>
                        <tr>
                            <th className="font-semibold border-y bg-white px-3 py-2 border-l rounded-l-lg">STT</th>
                            <th className="font-semibold border-y bg-white px-3 py-2">Ảnh</th>
                            <th className="font-semibold border-y bg-white px-3 py-2 text-left">Tên tài khoản</th>
                            <th className="font-semibold border-y bg-white px-3 py-2 border-r rounded-r-lg text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins?.map((item, index) => {
                            return <Row item={item} index={index} key={item?.id} />
                        })}
                    </tbody>
                </table>
            </div>
        )
    }


    function Row({ item, index }) {
        const [isDeleting, setIsDeleting] = useState(false);
        // router
        const router = useRouter();
        // xoá danh mục
        const handleDelete = async () => {
            if (!confirm("Bạn có chắc chắn muốn xoá tài khoản này không?")) return;
            setIsDeleting(true);
            try {
                await deleteAdmin({ id: item?.id });
                toast.success("Xoá tài khoản thành công");
            } catch (error) {
                toast.error(error?.message);
            }
            setIsDeleting(false);
        };
        // cập nhật danh mục
        const handleUpdate = () => {
            router.push(`/admin/admins?id=${item?.id}`);
        }

        return (
            <tr>
                <td className="border-y bg-white px-3 py-2 border-l rounded-l-xl text-center" style={{ verticalAlign: 'middle' }}>{index + 1}</td>
                <td className="border-y bg-white px-3 py-2 text-center" style={{ verticalAlign: 'middle' }}>
                    <div className="flex justify-center">
                        <img src={item?.imageURL} alt={item?.name} className="h-10 w-10 object-cover rounded-lg" />
                    </div>
                </td>
                <td className="border-y bg-white px-3 py-2" style={{ verticalAlign: 'middle' }}>
                    <h2>{item?.name}</h2>
                    <h3 className="text-xs text-gray-500">{item?.email}</h3>
                </td>
                <td className="border-y bg-white px-3 py-2 border-r rounded-r-xl" style={{ verticalAlign: 'middle' }}>
                    <div className="flex gap-2 items-center justify-center"> {/* Thêm justify-center để căn giữa ngang */}
                        <Button onClick={handleUpdate}
                            isLoading={isDeleting}
                            isDisabled={isDeleting}
                            isIconOnly size="sm">
                            <Edit2 size={13} />
                        </Button>
                        <Button onClick={handleDelete}
                            isLoading={isDeleting}
                            isDisabled={isDeleting}
                            isIconOnly size="sm" color="danger">
                            <Trash2 size={13} />
                        </Button>
                    </div>
                </td>
            </tr>
        )
    }
