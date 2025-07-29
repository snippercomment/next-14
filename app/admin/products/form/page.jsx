"use client"
import BasicDetail from "./components/BasicDetail"
import Des from "./components/Des"
import Image from "./components/Image"
import Link from "next/link";

import { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { createNewProduct, updateProduct } from "@/lib/firestore/products/write";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { getProduct } from "@/lib/firestore/products/read_server";
import TechnicalSpecifications from "./components/TechnicalSpecifications";

export default function Page() {
    const [data, setData] = useState(null);
    const [featureImage, setFeatureImage] = useState(null);
    const [imageList, setImageList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const router = useRouter();

    // lấy dữ liệu sản phẩm để cập nhật
    const fetchData = async () => {
        try {
            const res = await getProduct({ id });
            if (!res) {
                throw new Error("Sản phẩm không tồn tại");
            } else {
                setData(res);
            }
        } catch (error) {
            toast.error(error?.message);
        }
    }

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id])
    
    // handle data
    const handleData = (key, value) => {
        setData((prevData) => ({
            ...(prevData ?? {}),
            [key]: value
        }))
    }

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            await createNewProduct({
                data: data,
                featureImage: featureImage,
                imageList: imageList,
            });
            setData(null);
            setFeatureImage(null);
            setImageList([]);
            toast.success("Sản phẩm đã được tạo thành công!");
            router.push("/admin/products");
        } catch (error) {
            console.log(error?.message);
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            await updateProduct({
                id: id,
                data: data,
                featureImage: featureImage,
                imageList: imageList,
            });
            setData(null);
            setFeatureImage(null);
            setImageList([]);
            toast.success("Sản phẩm đã được cập nhật thành công!");
            router.push(`/admin/products`);
        } catch (error) {
            console.log(error?.message);
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            if (id) {
                handleUpdate();
            } else {
                handleCreate();
            }
        }} className="flex flex-col gap-4 p-5">
            
            {/* Nút quay lại */}
            <div className="flex items-center mb-4">
                <Link 
                    href="/admin/products"
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    aria-label="Quay lại danh sách sản phẩm"
                >
                    ← Quay lại
                </Link>
            </div>

            <div className="flex justify-between items-center w-full" >
                <h1 className="text-semibold">{id ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}</h1>
                <Button 
                    isLoading={isLoading} 
                    isDisabled={isLoading} 
                    type="submit"
                    color={id ? "warning" : "success"}
                    variant="solid"
                    className={id ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"}
                >
                    {id ? "Cập nhật" : "Tạo"}
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1 flex h-full">
                    <BasicDetail data={data} handleData={handleData} />
                </div>
                <div className="flex-1 flex flex-col gap-5 h-full">
                    <Image
                        data={data}
                        featureImage={featureImage}
                        setFeatureImage={setFeatureImage}
                        imageList={imageList}
                        setImageList={setImageList} 
                    />
                    <Des data={data} handleData={handleData} />
                    <TechnicalSpecifications data={data} handleData={handleData} />
                </div>
            </div>
        </form>
    )
}