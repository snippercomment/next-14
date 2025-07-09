import { Button, Select, SelectItem } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { createNewBrand, updateBrand } from "@/lib/firestore/brands/write";
import { toast } from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { getBrand } from "@/lib/firestore/brands/read_server";

// Định nghĩa các danh mục thương hiệu
const BRAND_CATEGORIES = {
    iphone: {
        value: "iphone",
        label: "iPhone",
        description: "Thương hiệu điện thoại iPhone"
    },
    laptop: {
        value: "laptop",
        label: "Laptop",
        description: "Thương hiệu máy tính xách tay"
    },
    mouse: {
        value: "mouse",
        label: "Chuột",
        description: "Thương hiệu chuột máy tính"
    },
    headphone: {
        value: "headphone",
        label: "Tai nghe",
        description: "Thương hiệu tai nghe và âm thanh"
    }
};

export default function Form() {
    const [data, setData] = useState(null);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Lấy id từ url
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // Nếu có id thì lấy dữ liệu thương hiệu
    const fetchData = async () => {
        try {
            const res = await getBrand({ id: id });
            if (!res) {
                toast.error("Thương hiệu không tồn tại");
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

    // Xử lý dữ liệu
    const handleData = (key, value) => {
        setData((preData) => {
            return {
                ...(preData ?? {}),
                [key]: value,
            }
        })
    }

    // Validate dữ liệu trước khi submit
    const validateData = () => {
        if (!data?.name?.trim()) {
            toast.error("Vui lòng nhập tên thương hiệu");
            return false;
        }
        if (!data?.category) {
            toast.error("Vui lòng chọn danh mục thương hiệu");
            return false;
        }
        if (!id && !image) {
            toast.error("Vui lòng chọn ảnh thương hiệu");
            return false;
        }
        return true;
    };

    // Tạo thương hiệu
    const handleCreate = async () => {
        if (!validateData()) return;

        setIsLoading(true);
        try {
            await createNewBrand({
                data: {
                    ...data,
                    status: data?.status || "active", // Đảm bảo có status
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                image: image
            });
            toast.success("Tạo thương hiệu thành công");
            setData(null);
            setImage(null);
            router.push("/admin/brands");
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    }
    // Cập nhật thương hiệu
    const handleUpdate = async () => {
        if (!validateData()) return;

        setIsLoading(true);
        try {
            await updateBrand({
                id: id,
                data: {
                    ...data,
                    updatedAt: new Date()
                },
                image: image
            });
            toast.success("Cập nhật thương hiệu thành công");
            router.push("/admin/brands");
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
            <h1 className="font-semibold text-xl">
                {id ? "Cập nhật" : "Tạo"} thương hiệu
            </h1>

            <form onSubmit={(e) => {
                e.preventDefault();
                if (id) {
                    handleUpdate();
                } else {
                    handleCreate();
                }
            }} className='flex flex-col gap-4'>

                {/* Danh mục thương hiệu */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium">
                        Danh mục <span className="text-red-500">*</span>
                    </label>
                    <Select
                        placeholder="Chọn danh mục thương hiệu"
                        selectedKeys={data?.category ? [data.category] : []}
                        onSelectionChange={(keys) => {
                            const selectedCategory = Array.from(keys)[0];
                            handleData("category", selectedCategory);
                        }}
                        className="w-full"
                        aria-label="Chọn danh mục thương hiệu"
                        isRequired
                    >
                        {Object.values(BRAND_CATEGORIES).map((category) => (
                            <SelectItem
                                key={category.value}
                                value={category.value}
                                description={category.description}
                            >
                                {category.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                {/* Tên thương hiệu */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="brand-name" className="text-gray-700 text-sm font-medium">
                        Tên thương hiệu <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="brand-name"
                        name="brand-name"
                        type="text"
                        placeholder="Nhập tên thương hiệu"
                        value={data?.name ?? ""}
                        onChange={(e) => {
                            handleData("name", e.target.value)
                        }}
                        className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        aria-describedby="brand-name-help"
                    />
                    <p id="brand-name-help" className="text-xs text-gray-500 sr-only">
                        Nhập tên thương hiệu để hiển thị
                    </p>
                </div>

                {/* Ảnh thương hiệu */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="brand-image" className="text-gray-700 text-sm font-medium">
                        Ảnh thương hiệu <span className="text-red-500">*</span>
                    </label>

                    {/* Preview ảnh */}
                    {(image || data?.imageURL) && (
                        <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                            <img
                                className="h-32 w-32 object-contain rounded-lg"
                                src={image ? URL.createObjectURL(image) : data?.imageURL}
                                alt="Preview ảnh thương hiệu"
                            />
                        </div>
                    )}

                    <input
                        id="brand-image"
                        name="brand-image"
                        type="file"
                        accept="image/*"
                        className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={(e) => {
                            if (e.target.files.length > 0) {
                                setImage(e.target.files[0])
                            }
                        }}
                        aria-describedby="brand-image-help"
                    />
                    <p id="brand-image-help" className="text-xs text-gray-500">
                        Chấp nhận: JPG, PNG, GIF. Kích thước tối đa: 5MB
                    </p>
                </div>

                {/* Trạng thái */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm font-medium">
                        Trạng thái
                    </label>
                    <Select
                        placeholder="Chọn trạng thái"
                        selectedKeys={[data?.status || "active"]} // Đảm bảo luôn có giá trị
                        onSelectionChange={(keys) => {
                            const selectedStatus = Array.from(keys)[0];
                            handleData("status", selectedStatus);
                        }}
                        className="w-full"
                        aria-label="Chọn trạng thái hoạt động của thương hiệu"
                    >
                        <SelectItem key="active" value="active">
                            Hoạt động
                        </SelectItem>
                        <SelectItem key="inactive" value="inactive">
                            Tạm dừng
                        </SelectItem>
                    </Select>
                </div>

                <Button
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    type="submit"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    size="lg"
                    aria-describedby="submit-button-help"
                >
                    {isLoading ? "Đang xử lý..." : (id ? "Cập nhật" : "Tạo") + " thương hiệu"}
                </Button>
                <p id="submit-button-help" className="text-xs text-gray-500 sr-only">
                    {id ? "Cập nhật thông tin thương hiệu" : "Tạo thương hiệu mới"}
                </p>
            </form>
        </div>
    )
}