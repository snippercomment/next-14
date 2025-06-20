"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/lib/firestore/reviews/read";
import { deleteReview } from "@/lib/firestore/reviews/write";
import { useUser } from "@/lib/firestore/user/read";
import { Rating } from "@mui/material";
import { Avatar, Button } from "@nextui-org/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Reviews({ productId }) {
  const { data } = useReviews({ productId: productId });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { data: userData } = useUser({ uid: user?.uid });

  const handleDelete = async () => {
    if (!confirm("Bạn chắc chứ?")) return;
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("Vui lòng đăng nhập trước");
      }
      await deleteReview({
        uid: user?.uid,
        productId: productId,
      });
      toast.success("Đã xoá thành công");
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-5 p-6 rounded-xl border w-full mt-8 ">
      <h1 className="text-xl font-semibold text-gray-800">Đánh giá khách hàng</h1>
      
      {data && data.length > 0 ? (
        <div className="flex flex-col gap-6">
          {data?.map((item, index) => {
            return (
              <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Avatar src={item?.photoURL} size="md" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-semibold text-gray-800">{item?.displayName}</h2>
                      <Rating value={item?.rating} readOnly size="small" />
                    </div>
                    {user?.uid === item?.uid && (
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="flat"
                        isDisabled={isLoading}
                        isLoading={isLoading}
                        onClick={handleDelete}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mt-2">
                    {item?.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có đánh giá nào cho sản phẩm này</p>
        </div>
      )}
    </div>
  );
}