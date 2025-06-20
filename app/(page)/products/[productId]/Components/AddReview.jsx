"use client";

import { useAuth } from "@/contexts/AuthContext";
import { addReview } from "@/lib/firestore/reviews/write";
import { useUser } from "@/lib/firestore/user/read";
import { Rating } from "@mui/material";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AddReview({ productId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(4);
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { data: userData } = useUser({ uid: user?.uid });

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("Vui lòng đăng nhập trước");
      }
      await addReview({
        displayName: userData?.displayName,
        message: message,
        photoURL: userData?.photoURL,
        productId: productId,
        rating: rating,
        uid: user?.uid,
      });
      setMessage("");
      toast.success("Đã gửi thành công");
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-5 p-6 rounded-xl border w-full mt-8">
      <h1 className="text-xl font-semibold text-gray-800">Đánh giá sản phẩm này</h1>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Xếp hạng của bạn</label>
        <Rating
          value={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
          }}
          size="large"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Nhận xét</label>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          placeholder="Nhập suy nghĩ của bạn về sản phẩm này ..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          rows={4}
        />
      </div>

      <Button
        onClick={handleSubmit}
        isLoading={isLoading}
        isDisabled={isLoading || !message.trim()}
        color="primary"
        size="lg"
        className="w-full sm:w-auto sm:self-start"
      >
        {isLoading ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>
    </div>
  );
}