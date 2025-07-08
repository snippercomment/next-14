import { Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { createNewCategory, updateCategory } from "@/lib/firestore/categories/write";
import { toast } from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { getCategory } from "@/lib/firestore/categories/read_server";
import { Upload, X } from "lucide-react";

export default function Form() {
    const [data, setData] = useState(null);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    
    // lấy id từ url
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    
    // nếu có id thì lấy dữ liệu danh mục
    const fetchData = async () => {
        try {
            const res = await getCategory({ id: id });
            if (!res) {
                toast.error("Danh mục không tồn tại");
            }
            else {
                setData(res);
            }
        } catch (error) {
            toast.error(error?.message);
        }
    };
    
    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);
    
    // xử lý dữ liệu
    const handleData = (key, value) => {
        setData((preData) => {
            return {
                ...(preData ?? {}),
                [key]: value,
            }
        })
    }
    
    // tạo danh mục
    const handleCreate = async () => {
        setIsLoading(true);
        try {
            await createNewCategory({ data: data, image: image });
            toast.success("Tạo danh mục thành công");
            setData(null);
            setImage(null);
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    }
    
    // cập nhật danh mục
    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            // Chỉ truyền image nếu có ảnh mới được chọn
            const updateData = {
                id: id,
                data: data,
                ...(image && { image: image }) // Chỉ thêm image nếu có ảnh mới
            };
            await updateCategory(updateData);
            toast.success("Cập nhật danh mục thành công");
            setData(null);
            setImage(null);
            router.push("/admin/categories");
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
            <h1 className="font-semibold">{id ? "Cập Nhật" : "Tạo Mới"} Danh Mục</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (id) {
                        handleUpdate();
                    } else {
                        handleCreate();
                    }
                }}
                className="flex flex-col gap-3"
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor="category-image" className="text-gray-500 text-sm">
                        Hình Ảnh <span className="text-red-500">*</span>{" "}
                    </label>
                    <div className="flex justify-center items-center p-3">
                        {/* Hiển thị ảnh mới nếu có, nếu không thì hiển thị ảnh cũ */}
                        {image ? (
                            <img className="h-20" src={URL.createObjectURL(image)} alt="Ảnh mới" />
                        ) : (
                            data?.imageURL && (
                                <img className="h-20" src={data.imageURL} alt="Ảnh hiện tại" />
                            )
                        )}
                    </div>
                    <input
                        onChange={(e) => {
                            if (e.target.files.length > 0) {
                                setImage(e.target.files[0]);
                            }
                        }}
                        id="category-image"
                        name="category-image"
                        type="file"
                        className="border px-4 py-2 rounded-lg w-full"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="category-name" className="text-gray-500 text-sm">
                        Tên Danh Mục <span className="text-red-500">*</span>{" "}
                    </label>
                    <input
                        id="category-name"
                        name="category-name"
                        type="text"
                        placeholder="Nhập tên danh mục"
                        value={data?.name ?? ""}
                        onChange={(e) => handleData("name", e.target.value)}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="category-slug" className="text-gray-500 text-sm">
                        Slug <span className="text-red-500">*</span>{" "}
                    </label>
                    <input
                        id="category-slug"
                        name="category-slug"
                        type="text"
                        placeholder="Nhập slug (VD: dien-thoai)"
                        value={data?.slug ?? ""}
                        onChange={(e) => handleData("slug", e.target.value)}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                    />
                </div>
                <Button isLoading={isLoading} isDisabled={isLoading} type="submit">
                    {id ? "Cập Nhật" : "Tạo Mới"}
                </Button>
            </form>
        </div>
    )
}