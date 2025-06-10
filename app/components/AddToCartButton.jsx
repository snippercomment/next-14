"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/lib/firestore/user/read";
import { updateCarts } from "@/lib/firestore/user/write";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import toast from "react-hot-toast";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ 
    productId, 
    type, 
    selectedOptions = {}, 
    disabled = false 
}) {
    const { user } = useAuth();
    const { data } = useUser({ uid: user?.uid });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Kiểm tra sản phẩm đã có trong giỏ hàng với các tùy chọn tương tự
    const isAdded = data?.carts?.find((item) => 
        item?.id === productId && 
        item?.storage === selectedOptions?.storage &&
        item?.color === selectedOptions?.color
    );

    const handleAddToCart = async () => {
        // Kiểm tra nếu button bị disabled
        if (disabled) {
            const missingSelections = [];
            if (!selectedOptions?.storage && selectedOptions?.storage !== undefined) {
                missingSelections.push('dung lượng');
            }
            if (!selectedOptions?.color && selectedOptions?.color !== undefined) {
                missingSelections.push('màu sắc');
            }
            toast.error(`Vui lòng chọn ${missingSelections.join(' và ')} trước khi thêm vào giỏ hàng!`);
            return;
        }

        setIsLoading(true);
        try {
            if (!user?.uid) {
                router.push("/login");
                throw new Error("Vui lòng đăng nhập trước!");
            }

            if (isAdded) {
                // Nếu đã có trong giỏ hàng với cùng tùy chọn, tăng số lượng lên 1
                const newList = data?.carts?.map((item) => {
                    if (item?.id === productId && 
                        item?.storage === selectedOptions?.storage &&
                        item?.color === selectedOptions?.color) {
                        return { ...item, quantity: item.quantity + 1 };
                    }
                    return item;
                });
                await updateCarts({ list: newList, uid: user?.uid });
                toast.success("Đã tăng số lượng sản phẩm trong giỏ hàng!");
            } else {
                // Nếu chưa có trong giỏ hàng, thêm mới với các tùy chọn
                const newCartItem = {
                    id: productId,
                    quantity: 1,
                    ...(selectedOptions?.storage && { storage: selectedOptions.storage }),
                    ...(selectedOptions?.color && { color: selectedOptions.color })
                };

                await updateCarts({
                    list: [...(data?.carts ?? []), newCartItem],
                    uid: user?.uid,
                });
                toast.success("Đã thêm sản phẩm vào giỏ hàng!");
            }
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    // Xác định trạng thái button
    const isButtonDisabled = disabled || isLoading;
    const buttonTitle = disabled 
        ? "Vui lòng chọn đầy đủ tùy chọn trước khi thêm vào giỏ hàng"
        : "Thêm vào giỏ hàng";

    if (type === "cute") {
        return (
            <Button
                isLoading={isLoading}
                isDisabled={isButtonDisabled}
                onClick={handleAddToCart}
                variant="bordered"
                className={disabled ? "opacity-50 cursor-not-allowed" : ""}
                title={buttonTitle}
            >
                {/* Thêm icon hoặc text tùy ý */}
            </Button>
        );
    }

    if (type === "lagre" || type === "large") {
        return (
            <Button
                isLoading={isLoading}
                isDisabled={isButtonDisabled}
                onClick={handleAddToCart}
                variant="bordered"
                className={disabled ? "opacity-50 cursor-not-allowed" : ""}
                color={disabled ? "default" : "primary"}
                size="sm"
                title={buttonTitle}
            >
                <AddShoppingCartIcon className="text-xs" />
                {disabled ? "Chọn tùy chọn" : "Thêm vào giỏ"}
            </Button>
        );
    }

    return (
        <Button
            isLoading={isLoading}
            isDisabled={isButtonDisabled}
            onClick={handleAddToCart}
            variant="flat"
            isIconOnly
            size="sm"
            title={buttonTitle}
            className={disabled ? "opacity-50 cursor-not-allowed" : ""}
        >
            <AddShoppingCartIcon className="text-xs" />
        </Button>
    );
}