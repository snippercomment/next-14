import { Button } from "@nextui-org/react";
import { useState } from "react";
import { createNewCategory } from "@/lib/firestore/categories/write";
import { toast } from "react-hot-toast";


export default function Form() {
    const [data, setData] = useState(null);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleData = (key, value) => {
        setData((preData) => {
            return {
                ...(preData ?? {}),
                [key]: value,
            }
        })
    }
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
    return (
        <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
            <h1 className="font-semibold">Tạo danh mục</h1>
            {/* tạo  */}
            <form onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
            }} className='flex flex-col gap-2'>

                {/* ảnh */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="category-image" className="text-gray-500 text-sm">
                        Ảnh <span className="text-red-500">*</span>{" "}
                    </label>
                    <div className="flex items-center justify-center p-3">
                        {image && <img className="h-32" src={URL.createObjectURL(image)} alt="Ảnh" />}
                    </div>
                </div>
                <div>
                    <input id="category-image"
                        name="category-image"
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
                {/*  tên danh mục */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="category-name" className="text-gray-500 text-sm">
                        Tên <span className="text-red-500">*</span>{" "}
                    </label>
                </div>
                <div>
                    <input id="category-name"
                        name="category-name"
                        type="text"
                        placeholder="Tên danh mục"
                        value={data?.name ?? ""}
                        onChange={(e) => {
                            handleData("name", e.target.value)
                        }}
                        className="border px-4 py-2 rounded-lg w-full focus:outline"
                    />

                </div>
                {/* slug */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="category-slug" className="text-gray-500 text-sm">
                        Slug <span className="text-red-500">*</span>{" "}
                    </label>
                </div>
                <div>
                    <input id="category-slug"
                        name="category-slug"
                        type="text"
                        placeholder="Slug"
                        value={data?.slug ?? ""}
                        onChange={(e) => {
                            handleData("slug", e.target.value)
                        }}
                        className="border px-4 py-2 rounded-lg w-full focus:outline"
                    />

                </div>
                <Button isLoading={isLoading} isDisabled={isLoading} type="submit">Tạo danh mục</Button>
            </form>
        </div>

    )
}