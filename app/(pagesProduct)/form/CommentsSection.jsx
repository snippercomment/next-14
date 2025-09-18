"use client";
import { useComments } from "@/lib/firestore/comments/read";
import { addComment, toggleCommentLike } from "@/lib/firestore/comments/write";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmins } from "@/lib/firestore/admins/read";
import { 
  Avatar, 
  Button, 
  Textarea, 
  Card,
  CardBody,
  Chip,
  Input
} from "@nextui-org/react";
import { 
  Send, 
  MessageSquare,
  Calendar,
  Heart,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function HomepageComments() {
  const { user } = useAuth();
  const { data: comments, isLoading } = useComments({ productId: "homepage" }); 
  const { data: admins } = useAdmins();
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  // Giới hạn hiển thị 5 bình luận đầu tiên
  const COMMENTS_LIMIT = 5;
  const displayedComments = showAllComments 
    ? comments 
    : comments?.slice(0, COMMENTS_LIMIT) || [];
  const remainingComments = comments?.length > COMMENTS_LIMIT 
    ? comments.length - COMMENTS_LIMIT 
    : 0;

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    if (!user && (!guestName.trim() || !guestEmail.trim())) {
      toast.error("Vui lòng nhập họ tên và email");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addComment({
        uid: user ? user.uid : `guest_${Date.now()}`,
        productId: "homepage",
        message: newComment,
        displayName: user ? user.displayName : guestName,
        photoURL: user ? user.photoURL : "",
      });
      
      setNewComment("");
      if (!user) {
        setGuestName("");
        setGuestEmail("");
      }
      toast.success("Đã gửi bình luận thành công!");
    } catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra");
    }
    
    setIsSubmitting(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <section className="mt-12 max-w-4xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
         Hỏi và đáp
        </h2>
       
      </div>

      {/* Form thêm bình luận */}
      <Card className="mb-8">
        <CardBody className="p-6">
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar 
                src={user?.photoURL} 
                size="md"
                name={user?.displayName || "Guest"}
                showFallback
              />
              <div>
                <p className="font-medium">
                  {user ? user.displayName : "Khách"}
                </p>
                <p className="text-sm text-gray-500">
                  {user ? user.email : "Vui lòng nhập thông tin"}
                </p>
              </div>
            </div>

            {!user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Họ tên *"
                  placeholder="Nhập họ tên của bạn"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  label="Email *"
                  placeholder="Nhập email của bạn"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                />
              </div>
            )}

            <Textarea
              placeholder="Chia sẻ cảm nhận của bạn về website (tối thiểu 15 ký tự) *"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              minRows={4}
              maxRows={8}
              minLength={15}
              required
            />

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Tối thiểu 15 ký tự ({newComment.length}/15)
              </p>
              <Button
                type="submit"
                color="primary"
                isLoading={isSubmitting}
                startContent={<Send size={16} />}
                isDisabled={newComment.length < 15}
              >
                Gửi bình luận
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Danh sách bình luận */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang tải bình luận...</p>
          </div>
        ) : comments && comments.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Bình luận ({comments.length})
              </h3>
            </div>
            
            {displayedComments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                currentUser={user} 
                admins={admins} 
              />
            ))}

            {/* Nút "Xem thêm" */}
            {!showAllComments && remainingComments > 0 && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="light"
                  color="primary"
                  size="lg"
                  endContent={<ChevronRight className="w-4 h-4" />}
                  onClick={() => setShowAllComments(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-full"
                >
                  Xem thêm {remainingComments} bình luận
                </Button>
              </div>
            )}

            {/* Nút "Thu gọn" khi đã hiển thị tất cả */}
            {showAllComments && comments.length > COMMENTS_LIMIT && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="light"
                  color="default"
                  size="lg"
                  onClick={() => setShowAllComments(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-full"
                >
                  Thu gọn
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Chưa có bình luận nào
              </h3>
              <p className="text-gray-500">
                Hãy là người đầu tiên chia sẻ cảm nhận về website!
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </section>
  );
}

function CommentItem({ comment, currentUser, admins }) {
  const [isLiking, setIsLiking] = useState(false);
  
  const handleLike = async () => {
    if (!currentUser) {
      toast.error("Bạn cần đăng nhập để thích bình luận");
      return;
    }
    
    setIsLiking(true);
    try {
      await toggleCommentLike({
        productId: "homepage",
        commentId: comment.id,
        uid: currentUser.uid
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
    setIsLiking(false);
  };
  
  const isLiked = currentUser && comment.likedBy?.includes(currentUser.uid);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getAdminInfo = (adminId) => {
    if (!admins || !adminId) return null;
    return admins.find(admin => admin.id === adminId || admin.uid === adminId);
  };

  const adminInfo = comment?.reply?.adminId ? getAdminInfo(comment.reply.adminId) : null;

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex gap-4">
          <Avatar 
            src={comment?.photoURL} 
            size="lg"
            name={comment?.displayName}
            showFallback
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-lg">{comment?.displayName}</h4>
              <span className="text-sm text-gray-500">
                <Calendar className="w-4 h-4 inline mr-1" />
                {formatDate(comment?.timestamp)}
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {comment?.message}
              </p>
            </div>
            
            {comment?.reply && (
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar 
                    src={adminInfo?.imageURL || comment?.reply?.adminPhotoURL} 
                    size="sm"
                    name={adminInfo?.name || comment?.reply?.adminName || "Admin"}
                    showFallback
                  />
                  <span className="font-medium text-blue-700">
                    {adminInfo?.name || comment?.reply?.adminName || "Admin"}
                  </span>
                  <Chip size="sm" color="primary" variant="flat">
                    QTV
                  </Chip>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment?.reply?.timestamp)}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {comment?.reply?.message}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-4 mt-3">
              <Button
                size="sm"
                variant={isLiked ? "solid" : "light"}
                color={isLiked ? "danger" : "default"}
                startContent={<Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />}
                className="text-gray-600"
                onClick={handleLike}
                isLoading={isLiking}
                isDisabled={isLiking}
              >
                {comment?.likes || 0}
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}