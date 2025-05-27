"use client"
import BasicDetail from "./components/BasicDetail"
import Des from "./components/Des"
import Image from "./components/Image"
import { useState } from "react";
import { Button } from "@nextui-org/react";
import { createNewProduct } from "@/lib/firestore/products/write";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
export default function Page() {
    const [data, setData] = useState(null);
    const [featureImage, setFeatureImage] = useState(null);
    const [imageList, setImageList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
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

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
        }} className=" flex flex-col gap-4 p-5">
            <div className="flex justify-between items-center w-full" >
                <h1 className="text-semibold">Tạo sản phẩm mới</h1>
                <Button isLoading={isLoading} isDisabled={isLoading} type="submit">Tạo</Button>
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
                        setImageList={setImageList} />
                    <Des data={data} handleData={handleData} />
                </div>

            </div>
        </form>
    )
}