"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/lib/firestore/reviews/read";
import { deleteReview, addReviewReply } from "@/lib/firestore/reviews/write";
import { useUser } from "@/lib/firestore/user/read";
import { useAdmins } from "@/lib/firestore/admins/read";
import { Rating } from "@mui/material";
import { Avatar, Button, Textarea } from "@nextui-org/react";
import { Trash2, Shield, Reply, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Reviews({ productId }) {
  const { data } = useReviews({ productId: productId });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { data: userData } = useUser({ uid: user?.uid });
  const { data: admins } = useAdmins();

  // Kiểm tra xem user hiện tại có phải admin không
  const isCurrentUserAdmin = admins?.some(admin => admin.email === user?.email);

  const handleDelete = async (reviewUid) => {
    if (!confirm("Bạn chắc chứ?")) return;
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("Vui lòng đăng nhập trước");
      }
      await deleteReview({
        uid: reviewUid,
        productId: productId,
      });
      toast.success("Đã xoá thành công");
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  // Hàm format thời gian
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-5 p-6 rounded-xl border w-full mt-8">
      <h1 className="text-xl font-semibold text-gray-800">Đánh giá khách hàng</h1>

      {data && data.length > 0 ? (
        <div className="flex flex-col gap-6">
          {data?.map((item, index) => {
            return (
              <ReviewItem
                key={index}
                item={item}
                user={user}
                isCurrentUserAdmin={isCurrentUserAdmin}
                isLoading={isLoading}
                onDelete={handleDelete}
                formatDate={formatDate}
                productId={productId}
              />
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

function ReviewItem({ item, user, isCurrentUserAdmin, isLoading, onDelete, formatDate, productId }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời");
      return;
    }
    
    setIsReplying(true);
    try {
      await addReviewReply({
        uid: item?.uid,
        productId: productId,
        replyMessage: replyText,
        adminName: user?.displayName || "Admin",
        adminPhotoURL: user?.photoURL || "",
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
    <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
      {/* Review gốc */}
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Avatar src={item?.photoURL} size="md" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-800">{item?.displayName}</h2>
                <span className="text-xs text-gray-500">
                  {formatDate(item?.timestamp)}
                </span>
              </div>
              <Rating value={item?.rating} readOnly size="small" />
            </div>
            <div className="flex gap-2">
              {/* Nút trả lời cho admin (chỉ hiển thị nếu là admin và chưa có reply) */}
              {isCurrentUserAdmin && !item?.reply && (
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  variant="flat"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <Reply size={14} />
                </Button>
              )}
              {/* User có thể xóa review của chính họ, admin có thể xóa bất kỳ review nào */}
              {(user?.uid === item?.uid || isCurrentUserAdmin) && (
                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  variant="flat"
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onClick={() => onDelete(item?.uid)}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mt-2">
            {item?.message}
          </p>
        </div>
      </div>

      {/* Form trả lời admin */}
      {showReplyForm && (
        <div className="ml-12 mt-2 p-4 bg-white rounded-lg border">
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium text-gray-800">Trả lời với tư cách Admin</h4>
            <Textarea
              placeholder="Nhập nội dung trả lời..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              minRows={2}
              maxRows={4}
              size="sm"
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
        </div>
      )}

      {/* Phần trả lời từ admin */}
      {item?.reply && (
        <div className="ml-12 mt-2 p-4 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Avatar 
                src={item?.reply?.adminPhotoURL} 
                size="sm"
                fallback={
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Shield size={16} className="text-white" />
                  </div>
                }
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-blue-600 text-sm">
                  {item?.reply?.adminName || "Admin"}
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Quản trị viên
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(item?.reply?.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {item?.reply?.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}