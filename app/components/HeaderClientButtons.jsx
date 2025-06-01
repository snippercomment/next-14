"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/lib/firestore/user/read";
import { Badge } from "@nextui-org/react";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function HeaderClientButtons() {
    const { user } = useAuth();
    const { data } = useUser({ uid: user?.uid });

    // Tính tổng số lượng tất cả sản phẩm trong giỏ hàng
    const totalCartQuantity = data?.carts?.reduce((total, item) => total + (item.quantity || 1), 0) ?? 0;

    return (
        <div className="flex items-center gap-1">
            <Link href={`/favorites`}>
                {(data?.favorites?.length ?? 0) != 0 && (
                    <Badge
                        variant="solid"
                        size="sm"
                        className="text-white bg-red-500 text-[8px]"
                        content={data?.favorites?.length ?? 0}
                    >
                        <button
                            title="Yêu thích"
                            className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
                        >
                            <Heart size={14} />
                        </button>
                    </Badge>
                )}
                {(data?.favorites?.length ?? 0) === 0 && (
                    <button
                        title="Yêu thích"
                        className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
                    >
                        <Heart size={14} />
                    </button>
                )}
            </Link>
            <Link href={`/cart`}>
                {totalCartQuantity > 0 && (
                    <Badge
                        variant="solid"
                        size="sm"
                        className="text-white bg-red-500 text-[8px]"
                        content={totalCartQuantity}
                    >
                        <button
                            title="Giỏ hàng"
                            className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
                        >
                            <ShoppingCart size={14} />
                        </button>
                    </Badge>
                )}
                {totalCartQuantity === 0 && (
                    <button
                        title="Giỏ hàng"
                        className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
                    >
                        <ShoppingCart size={14} />
                    </button>
                )}
            </Link>
        </div>
    );
}