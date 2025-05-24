import { Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { createNewBrand, updateBrand } from "@/lib/firestore/brands/write";
import { toast } from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { getBrand } from "@/lib/firestore/brands/read_server";

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
            const res = await getBrand({ id: id });
            if (!res) {
                toast.error("Thương hiệu không tồn tại");

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
            await createNewBrand({ data: data, image: image });
            toast.success("Tạo thương hiệu thành công");
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
            await updateBrand({ id: id, data: data, image: image });
            toast.success("Cập nhật thương hiệu thành công");
            setData(null);
            setImage(null);
            router.push("/admin/brands");
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    }
    return (
        <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
            <h1 className="font-semibold">{id ? "Cập nhật" : "Tạo"} thương hiệu</h1>
            {/* tạo  */}
            <form onSubmit={(e) => {
                e.preventDefault();
                if (id) {
                    handleUpdate();
                }
                else {
                    handleCreate();
                }
            }} className='flex flex-col gap-2'>

                {/* ảnh */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="brand-image" className="text-gray-500 text-sm">
                        Ảnh <span className="text-red-500">*</span>{" "}
                    </label>
                    <div className="flex items-center justify-center p-3">
                        {image && <img className="h-32" src={URL.createObjectURL(image)} alt="Ảnh" />}
                    </div>
                </div>
                <div>
                    <input id="brand-image"
                        name="brand-image"
                        type="file"
                        placeholder="Ảnh"
                        className="border px-4 py-2 rounded-lg w-full focus:outline"
                        onChange={(e) => {
                            if (e.target.files.length > 0) {
                                setImage(e.target.files[0])
                            }
                        }}
                    />

                </div>
                {/*  tên thương hiệu */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="brand-name" className="text-gray-500 text-sm">
                        Tên <span className="text-red-500">*</span>{" "}
                    </label>
                </div>
                <div>
                    <input id="brand-name"
                        name="brand-name"
                        type="text"
                        placeholder="Tên thương hiệu"
                        value={data?.name ?? ""}
                        onChange={(e) => {
                            handleData("name", e.target.value)
                        }}
                        className="border px-4 py-2 rounded-lg w-full focus:outline"
                    />

                </div>

                <Button isLoading={isLoading} isDisabled={isLoading} type="submit">{id ? "Cập nhật" : "Tạo"} thương hiệu</Button>
            </form>
        </div>

    )
}