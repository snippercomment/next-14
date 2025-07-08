"use client";
import { useProduct } from "@/lib/firestore/products/read";
import { useAllReview } from "@/lib/firestore/reviews/read";
import { deleteReview, addReviewReply } from "@/lib/firestore/reviews/write";
import { Rating } from "@mui/material";
import { Avatar, Button, CircularProgress, Textarea } from "@nextui-org/react";
import { Trash2, Reply, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ListView() {
  const { data: reviews } = useAllReview();

  return (
    <div className="flex-1 flex flex-col gap-3 md:pr-5 md:px-0 px-5 rounded-xl">
      <div className="flex flex-col gap-4">
        {reviews?.map((item) => {
          return <ReviewCard item={item} key={item?.id} />;
        })}
      </div>
    </div>
  );
}

function ReviewCard({ item }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { data: product } = useProduct({ productId: item?.productId });

  const handleDelete = async () => {
    if (!confirm("Bạn chắc chứ?")) return;
    setIsLoading(true);
    try {
      await deleteReview({
        uid: item?.uid,
        productId: item?.productId,
      });
      toast.success("Đã xoá thành công");
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời");
      return;
    }
    
    setIsReplying(true);
    try {
      await addReviewReply({
        uid: item?.uid,
        productId: item?.productId,
        replyMessage: replyText,
        adminName: "DisCount", // Có thể lấy từ context hoặc auth
        adminPhotoURL: "", // Có thể lấy từ context hoặc auth
      });
      toast.success("Đã trả lời thành công");
      setReplyText("");
      setShowReplyForm(false);
    } catch (error) {
      toast.error(error?.message);
    }
    setIsReplying(false);
  };

  return (
    <div className="flex gap-3 bg-white border p-5 rounded-xl">
      <div className="">
        <Avatar src={item?.photoURL} />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between">
          <div>
            <h1 className="font-semibold">{item?.displayName}</h1>
            <Rating value={item?.rating} readOnly size="small" />
            <Link href={`/products/${item?.productId}`}>
              <h1 className="text-xs text-blue-600 hover:underline">{product?.title}</h1>
            </Link>
          </div>
          <div className="flex gap-2">
            <Button
              isIconOnly
              size="sm"
              color="primary"
              variant="flat"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Reply size={12} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="flat"
              isDisabled={isLoading}
              isLoading={isLoading}
              onClick={handleDelete}
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-700 pt-1">{item?.message}</p>
        
        {/* Hiển thị reply nếu có */}
        {item?.reply && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-1">
              <Avatar src={item?.reply?.adminPhotoURL} size="sm" />
              <span className="text-sm font-medium text-blue-600">{item?.reply?.adminName}</span>
              <span className="text-xs text-gray-500">
                {item?.reply?.timestamp?.toDate?.()?.toLocaleDateString('vi-VN')}
              </span>
            </div>
            <p className="text-sm text-gray-700">{item?.reply?.message}</p>
          </div>
        )}
        
        {/* Form trả lời */}
        {showReplyForm && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <Textarea
              placeholder="Nhập nội dung trả lời..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              minRows={2}
              maxRows={4}
              className="mb-2"
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="flat"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText("");
                }}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                color="primary"
                onClick={handleReply}
                isLoading={isReplying}
                startContent={<Send size={14} />}
              >
                Gửi
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}