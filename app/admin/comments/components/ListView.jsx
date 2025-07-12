"use client";
import { useProduct } from "@/lib/firestore/products/read";
import { useAllComments } from "@/lib/firestore/comments/read";
import { useAdmins } from "@/lib/firestore/admins/read";
import { useAuth } from "@/contexts/AuthContext";
import { deleteComment, addCommentReply} from "@/lib/firestore/comments/write";
import { 
  Avatar, 
  Button, 
  Textarea, 
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Chip,
  Pagination
} from "@nextui-org/react";
import { 
  Trash2, 
  Reply, 
  Send, 
  Search, 
  MessageSquare,
  Calendar,
  Heart,
  Edit,
  MoreVertical
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";

export default function CommentsListView() {
  const { data: comments } = useAllComments();
  const { data: admins } = useAdmins();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and search comments
  const filteredComments = useMemo(() => {
    if (!comments) return [];
    
    let filtered = [...comments];

    // Search by name or content
    if (searchTerm) {
      filtered = filtered.filter(comment => 
        comment.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by reply status
    if (filterStatus === "replied") {
      filtered = filtered.filter(comment => comment.reply);
    } else if (filterStatus === "not_replied") {
      filtered = filtered.filter(comment => !comment.reply);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.timestamp?.seconds - a.timestamp?.seconds;
        case "oldest":
          return a.timestamp?.seconds - b.timestamp?.seconds;
        case "most_liked":
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [comments, searchTerm, filterStatus, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);
  const paginatedComments = filteredComments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    if (!comments) return { total: 0, replied: 0, notReplied: 0, totalLikes: 0 };
    
    const total = comments.length;
    const replied = comments.filter(c => c.reply).length;
    const notReplied = total - replied;
    const totalLikes = comments.reduce((sum, c) => sum + (c.likes || 0), 0);
    
    return { total, replied, notReplied, totalLikes };
  }, [comments]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quản lý Bình luận</h1>
        <p className="text-gray-600">Quản lý và trả lời các bình luận từ khách hàng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng bình luận</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Reply className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã trả lời</p>
              <p className="text-2xl font-bold">{stats.replied}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chưa trả lời</p>
              <p className="text-2xl font-bold">{stats.notReplied}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng lượt thích</p>
              <p className="text-2xl font-bold">{stats.totalLikes}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Tìm kiếm theo tên hoặc nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Search className="w-4 h-4" />}
                isClearable
                onClear={() => setSearchTerm("")}
              />
            </div>

            <Select
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-40"
            >
              <SelectItem key="all" value="all">Tất cả</SelectItem>
              <SelectItem key="replied" value="replied">Đã trả lời</SelectItem>
              <SelectItem key="not_replied" value="not_replied">Chưa trả lời</SelectItem>
            </Select>

            <Select
              placeholder="Sắp xếp"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            >
              <SelectItem key="newest" value="newest">Mới nhất</SelectItem>
              <SelectItem key="oldest" value="oldest">Cũ nhất</SelectItem>
              <SelectItem key="most_liked" value="most_liked">Nhiều like nhất</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Comments List */}
      <div className="flex flex-col gap-4 mb-6">
        {paginatedComments.map((item) => (
          <CommentCard key={item.id} item={item} admins={admins} currentUser={user} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
            showShadow
            color="primary"
          />
        </div>
      )}

      {/* Empty State */}
      {filteredComments.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Không tìm thấy bình luận nào
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function CommentCard({ item, admins, currentUser }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { data: product } = useProduct({ productId: item?.productId });

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    setIsLoading(true);
    try {
      await deleteComment({
        commentId: item?.id,
        productId: item?.productId,
      });
      toast.success("Đã xóa bình luận thành công");
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
      // Lấy thông tin admin từ database
      const currentAdmin = admins?.find(admin => admin.uid === currentUser?.uid || admin.email === currentUser?.email);
      
      await addCommentReply({
        commentId: item?.id,
        productId: item?.productId,
        replyMessage: replyText,
        adminId: currentAdmin?.id || currentUser?.uid,
        adminName: currentAdmin?.name || currentUser?.displayName || "Admin",
        adminPhotoURL: currentAdmin?.imageURL || currentUser?.photoURL || "",
      });
      toast.success("Đã trả lời thành công");
      setReplyText("");
      setShowReplyForm(false);
    } catch (error) {
      toast.error(error?.message);
    }
    setIsReplying(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Tìm admin info từ admins array
  const getAdminInfo = (adminId) => {
    if (!admins || !adminId) return null;
    return admins.find(admin => admin.id === adminId || admin.uid === adminId);
  };

  const adminInfo = item?.reply?.adminId ? getAdminInfo(item.reply.adminId) : null;

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex gap-4">
          <Avatar 
            src={item?.photoURL} 
            size="lg" 
            name={item?.displayName}
            showFallback
          />
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{item?.displayName}</h3>
                  {item?.reply ? (
                    <Chip color="success" size="sm" variant="flat">
                      Đã trả lời
                    </Chip>
                  ) : (
                    <Chip color="warning" size="sm" variant="flat">
                      Chưa trả lời
                    </Chip>
                  )}
                  {item?.isEdited && (
                    <Chip color="default" size="sm" variant="flat">
                      Đã chỉnh sửa
                    </Chip>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-gray-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {formatDate(item?.timestamp)}
                  </span>
                  <span className="text-sm text-gray-500">
                    <Heart className="w-4 h-4 inline mr-1" />
                    {item?.likes || 0} lượt thích
                  </span>
                </div>
                
                <Link href={`/products/${item?.productId}`}>
                  <p className="text-sm text-blue-600 hover:underline mb-2">
                   {product?.title || "Đang tải..."}
                  </p>
                </Link>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  startContent={<Reply size={16} />}
                >
                  {item?.reply ? "Chỉnh sửa" : "Trả lời"}
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onClick={handleDelete}
                  startContent={<Trash2 size={16} />}
                >
                  Xóa
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 leading-relaxed">{item?.message}</p>
            </div>
            
            {/* Display reply if exists */}
            {item?.reply && (
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar 
                    src={adminInfo?.imageURL || item?.reply?.adminPhotoURL} 
                    size="sm" 
                    name={adminInfo?.name || item?.reply?.adminName || "Admin"}
                    showFallback
                  />
                  <span className="font-medium text-blue-700">
                    {adminInfo?.name || item?.reply?.adminName || "Admin"}
                  </span>
                  <Chip size="sm" color="primary" variant="flat">
                    QTV Discount
                  </Chip>
                  <span className="text-xs text-gray-500">
                    {formatDate(item?.reply?.timestamp)}
                  </span>
                </div>
                <p className="text-gray-700">{item?.reply?.message}</p>
              </div>
            )}
            
            {/* Reply form */}
            {showReplyForm && (
              <div className="bg-white border rounded-lg p-4">
                <Textarea
                  placeholder="Nhập nội dung trả lời..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  minRows={3}
                  maxRows={6}
                  className="mb-3"
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
                    {item?.reply ? "Cập nhật" : "Gửi trả lời"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}