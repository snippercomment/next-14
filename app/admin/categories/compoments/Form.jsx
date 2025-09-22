import { Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { createNewCategory, updateCategory } from "@/lib/firestore/categories/write";
import { toast } from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { getCategory } from "@/lib/firestore/categories/read_server";
import { useCategories } from "@/lib/firestore/categories/read";

export default function Form() {
    const [data, setData] = useState(null);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    
    // Lấy danh sách tất cả categories để làm parent options
    const { data: allCategories } = useCategories();
    
    // lấy id và parentId từ url
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const parentId = searchParams.get("parentId");
    
    // nếu có id thì lấy dữ liệu Thể loại
    const fetchData = async () => {
        try {
            const res = await getCategory({ 
                id: id, 
                parentId: parentId // Truyền parentId nếu đang edit subcategory
            });
            if (!res) {
                toast.error("Thể loại không tồn tại");
            } else {
                setData(res);
            }
        } catch (error) {
            toast.error(error?.message);
        }
    };
    
    useEffect(() => {
        if (id) {
            fetchData();
        } else if (parentId) {
            // Nếu có parentId từ URL, set làm parent mặc định
            setData({ parentId: parentId });
        }
    }, [id, parentId]);
    
    // xử lý dữ liệu
    const handleData = (key, value) => {
        setData((preData) => {
            return {
                ...(preData ?? {}),
                [key]: value,
            }
        })
    }
    
    // tạo thể loại
    const handleCreate = async () => {
        setIsLoading(true);
        try {
            await createNewCategory({ data: data, image: image });
            toast.success("Tạo Thể loại thành công");
            setData(null);
            setImage(null);
            router.push("/admin/categories");
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    }
    
    // cập nhật thể loại
    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const updateData = {
                id: id,
                data: data,
                ...(image && { image: image })
            };
            await updateCategory(updateData);
            toast.success("Cập nhật Thể loại thành công");
            setData(null);
            setImage(null);
            router.push("/admin/categories");
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    }

    // Lấy danh sách parent categories (chỉ những category không có parentId)
    const getParentOptions = () => {
        if (!allCategories) return [];
        
        return allCategories.filter(category => {
            // Không cho phép chọn chính nó làm parent
            if (category.id === id) return false;
            return true;
        });
    };

    return (
        <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
            <h1 className="font-semibold">
                {id ? "Cập Nhật" : parentId ? "Tạo Thể loại Con" : "Tạo Mới"} Thể loại
            </h1>
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
                    <label htmlFor="parent-category" className="text-gray-500 text-sm">
                        Thể loại Cha {parentId && <span className="text-green-500">(Đã được chọn sẵn)</span>}
                    </label>
                    <select
                        id="parent-category"
                        name="parent-category"
                        value={data?.parentId ?? ""}
                        onChange={(e) => handleData("parentId", e.target.value || null)}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                        disabled={!!parentId} // Vô hiệu hóa nếu parentId được set từ URL
                    >
                        <option value="">-- Chọn Thể loại (Để trống nếu là Thể loại gốc) --</option>
                        {getParentOptions()?.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {parentId && (
                        <p className="text-green-600 text-sm">
                            Thể loại con sẽ được tạo trong: {getParentOptions()?.find(cat => cat.id === parentId)?.name || 'Thể loại đã chọn'}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="category-name" className="text-gray-500 text-sm">
                        Tên Thể loại <span className="text-red-500">*</span>{" "}
                    </label>
                    <input
                        id="category-name"
                        name="category-name"
                        type="text"
                        placeholder="Nhập tên thể loại"
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
                        placeholder="Nhập slug "
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