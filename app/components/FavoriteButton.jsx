"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/lib/firestore/user/read";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import toast from "react-hot-toast";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useRouter } from "next/navigation";
import { updateFavorites } from "@/lib/firestore/user/write";

export default function FavoriteButton({ productId }) {
    const { user } = useAuth();
    const { data } = useUser({ uid: user?.uid });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handlClick = async () => {
        setIsLoading(true);
        try {
            if (!user?.uid) {
                router.push("/login");
                throw new Error("Vui lòng đăng nhập trước!");
            }
            if (data?.favorites?.includes(productId)) {
                const newList = data?.favorites?.filter((item) => item != productId);
                await updateFavorites({ list: newList, uid: user?.uid });
            } else {
                await updateFavorites({
                    list: [...(data?.favorites ?? []), productId],
                    uid: user?.uid,
                });
            }
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    };
    // Kiểm tra xem sản phẩm đã được thêm vào danh sách yêu thích hay chưa
    const isLiked = data?.favorites?.includes(productId);

    return (
        <Button
            isLoading={isLoading}
            isDisabled={isLoading}
            onClick={handlClick}
            variant="light"
            color="danger"
            className="rounded-full"
            isIconOnly
            size="sm"
        >
            {!isLiked && <FavoriteBorderOutlinedIcon fontSize="small" />}
            {isLiked && <FavoriteIcon fontSize="small" />}
        </Button>
    );
}