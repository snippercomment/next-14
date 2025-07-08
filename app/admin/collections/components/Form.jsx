"use client";

import { getCollection } from "@/lib/firestore/collections/read_server";
import {
    createNewCollection,
    updateCollection,
} from "@/lib/firestore/collections/write";
import { useProduct, useProducts } from "@/lib/firestore/products/read";
import { Button } from "@nextui-org/react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Form() {
    const [data, setData] = useState(null);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { data: products } = useProducts({ pageLimit: 2000 });

    const router = useRouter();

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const fetchData = async () => {
        try {
            const res = await getCollection({ id: id });
            if (!res) {
                toast.error("Không tìm thấy bộ sưu tập!");
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
        }
    }, [id]);

    const handleData = (key, value) => {
        setData((preData) => {
            return {
                ...(preData ?? {}),
                [key]: value,
            };
        });
    };

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            await createNewCollection({ data: data, image: image });
            toast.success("Đã tạo bộ sưu tập thành công");
            setData(null);
            setImage(null);
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            // Chỉ truyền image nếu có ảnh mới được chọn
            const updateData = {
                id: id,
                data: data,
                ...(image && { image: image }) // Chỉ thêm image nếu có ảnh mới
            };
            await updateCollection(updateData);
            toast.success("Đã cập nhật bộ sưu tập thành công");
            setData(null);
            setImage(null);
            router.push(`/admin/collections`);
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
            <h1 className="font-semibold">{id ? "Cập Nhật" : "Tạo Mới"} Bộ Sưu Tập</h1>
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
                    <label htmlFor="collection-image" className="text-gray-500 text-sm">
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
                        id="collection-image"
                        name="collection-image"
                        type="file"
                        className="border px-4 py-2 rounded-lg w-full"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="collection-title" className="text-gray-500 text-sm">
                        Tên Bộ Sưu Tập <span className="text-red-500">*</span>{" "}
                    </label>
                    <input
                        id="collection-title"
                        name="collection-title"
                        type="text"
                        placeholder="Nhập Tên Bộ Sưu Tập"
                        value={data?.title ?? ""}
                        onChange={(e) => {
                            handleData("title", e.target.value);
                        }}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="collection-sub-title"
                        className="text-gray-500 text-sm"
                    >
                        Mô Tả <span className="text-red-500">*</span>{" "}
                    </label>
                    <input
                        id="collection-sub-title"
                        name="collection-sub-title"
                        type="text"
                        value={data?.subTitle ?? ""}
                        onChange={(e) => {
                            handleData("subTitle", e.target.value);
                        }}
                        placeholder="Nhập Mô Tả"
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                    />
                </div>
                <div className="flex flex-wrap gap-3">
                    {data?.products?.map((productId) => {
                        return (
                            <ProductCard
                                productId={productId}
                                key={productId}
                                setData={setData}
                            />
                        );
                    })}
                </div>
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="collection-sub-title"
                        className="text-gray-500 text-sm"
                    >
                        Sản Phẩm <span className="text-red-500">*</span>{" "}
                    </label>
                    <select
                        id="collection-products"
                        name="collection-products"
                        type="text"
                        onChange={(e) => {
                            setData((prevData) => {
                                let list = [...(prevData?.products ?? [])];
                                list.push(e.target.value);
                                return {
                                    ...prevData,
                                    products: list,
                                };
                            });
                        }}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                    >
                        <option value="">Chọn Sản Phẩm</option>
                        {products?.map((item) => {
                            return (
                                <option
                                    key={item?.id}
                                    disabled={data?.products?.includes(item?.id)}
                                    value={item?.id}
                                >
                                    {item?.title}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <Button isLoading={isLoading} isDisabled={isLoading} type="submit">
                    {id ? "Cập Nhật" : "Tạo Mới"}
                </Button>
            </form>
        </div>
    );
}

function ProductCard({ productId, setData }) {
    const { data: product } = useProduct({ productId: productId });
    return (
        <div className="flex gap-3 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
            <h2>{product?.title}</h2>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setData((prevData) => {
                        let list = [...prevData?.products];
                        list = list?.filter((item) => item != productId);
                        return {
                            ...prevData,
                            products: list,
                        };
                    });
                }}
            >
                <X size={12} />
            </button>
        </div>
    );
}