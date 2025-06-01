"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/lib/firestore/user/read";
import { updateCarts } from "@/lib/firestore/user/write";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import toast from "react-hot-toast";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ productId, type }) {
    const { user } = useAuth();
    const { data } = useUser({ uid: user?.uid });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const isAdded = data?.carts?.find((item) => item?.id === productId);

    const handleAddToCart = async () => {
        setIsLoading(true);
        try {
            if (!user?.uid) {
                router.push("/login");
                throw new Error("Vui lòng đăng nhập trước!");
            }

            if (isAdded) {
                // Nếu đã có trong giỏ hàng, tăng số lượng lên 1
                const newList = data?.carts?.map((item) => {
                    if (item?.id === productId) {
                        return { ...item, quantity: item.quantity + 1 };
                    }
                    return item;
                });
                await updateCarts({ list: newList, uid: user?.uid });

            } else {
                // Nếu chưa có trong giỏ hàng, thêm mới
                await updateCarts({
                    list: [...(data?.carts ?? []), { id: productId, quantity: 1 }],
                    uid: user?.uid,
                });

            }
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    if (type === "cute") {
        return (
            <Button
                isLoading={isLoading}
                isDisabled={isLoading}
                onClick={handleAddToCart}
                variant="bordered"
                className=""
            >

            </Button>
        );
    }

    if (type === "large") {
        return (
            <Button
                isLoading={isLoading}
                isDisabled={isLoading}
                onClick={handleAddToCart}
                variant="bordered"
                className=""
                color="primary"
                size="sm"
            >
                <AddShoppingCartIcon className="text-xs" />

            </Button>
        );
    }

    return (
        <Button
            isLoading={isLoading}
            isDisabled={isLoading}
            onClick={handleAddToCart}
            variant="flat"
            isIconOnly
            size="sm"
            title="Thêm vào giỏ hàng"
        >
            <AddShoppingCartIcon className="text-xs" />
        </Button>
    );
}