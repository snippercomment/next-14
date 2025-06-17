"use client";

import { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  Input,
  Card,
  CardBody,
  CircularProgress,
  Divider,
} from "@nextui-org/react";
import { Save, X, Edit3, User, Mail, Camera, Sparkles } from "lucide-react"; 

import { useUser } from "@/lib/firestore/user/read";
import { updateUser } from "@/lib/firestore/user/write";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImageToCloudinary } from "@/lib/uploadToCloudinary";

export default function UserProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const uid = user?.uid || null;

  const {
    data: currentUser,
    error: userFetchError,
    isLoading: isUserLoading,
  } = useUser({ uid });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    displayName: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setForm({
        displayName: currentUser.displayName || "",
      });
      setImagePreview(currentUser.photoURL || "");
    }
  }, [currentUser]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage("Vui lòng chọn file ảnh!");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage("Kích thước ảnh không được vượt quá 5MB!");
        return;
      }

      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setMessage("");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      if (!uid) {
        setMessage("Lỗi: Không tìm thấy ID người dùng để cập nhật.");
        setIsSaving(false);
        return;
      }

      if (!form.displayName.trim()) {
        setMessage("Tên hiển thị không được để trống!");
        setIsSaving(false);
        return;
      }

      let photoURL = currentUser?.photoURL || "";

      if (selectedImage) {
        setIsUploadingImage(true);
        try {
          photoURL = await uploadImageToCloudinary(selectedImage, 'user-avatars');
        } catch (uploadError) {
          setMessage("Lỗi khi tải ảnh lên! Vui lòng thử lại.");
          console.error("Lỗi upload ảnh:", uploadError);
          setIsSaving(false);
          setIsUploadingImage(false);
          return;
        }
        setIsUploadingImage(false);
      }

      await updateUser(uid, {
        displayName: form.displayName.trim(),
        photoURL: photoURL,
      });

      setSelectedImage(null);
      setMessage("Cập nhật thành công!");
      setIsEditing(false);
    } catch (error) {
      setMessage("Lỗi khi cập nhật! Vui lòng thử lại.");
      console.error("Lỗi cập nhật profile:", error);
    } finally {
      setIsSaving(false);
      setIsUploadingImage(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage("");
    setSelectedImage(null);
    if (currentUser) {
      setForm({
        displayName: currentUser.displayName || "",
      });
      setImagePreview(currentUser.photoURL || "");
    }
  };

  if (isAuthLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <CircularProgress 
              size="lg" 
              color="primary"
              classNames={{
                svg: "w-20 h-20",
                track: "stroke-white/20",
                indicator: "stroke-gradient-to-r from-blue-500 to-purple-600"
              }}
            />
            <div className="absolute inset-0 animate-pulse">
              <Sparkles className="w-6 h-6 text-blue-500 absolute top-2 right-2 animate-bounce" />
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!uid || !user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="max-w-md backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl">
          <CardBody className="text-center p-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Chưa đăng nhập
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Bạn cần đăng nhập để xem và chỉnh sửa hồ sơ của mình.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (userFetchError) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <Card className="max-w-md backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl">
          <CardBody className="text-center p-10">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Không thể tải thông tin hồ sơ của bạn.
            </p>
            <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
              {userFetchError.message}
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Card className="max-w-md backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl">
          <CardBody className="text-center p-10">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Không tìm thấy hồ sơ
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Hồ sơ của bạn chưa được tạo. Vui lòng thử lại hoặc liên hệ hỗ trợ.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
          <CardBody className="p-0">
            {/* Header Gradient */}
            <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-4 right-4">
                <Sparkles className="w-8 h-8 text-white/60 animate-pulse" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/20 to-transparent"></div>
            </div>

            <div className="px-8 pb-8 -mt-16 relative">
              {/* Avatar Section */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500">
                    <Avatar
                      isBordered={false}
                      radius="full"
                      size="xl"
                      src={
                        imagePreview || 
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(form.displayName || "User")}&background=6366f1&color=fff&size=200&bold=true`
                      }
                      className="w-full h-full text-large shadow-lg bg-white"
                      fallback={<User className="w-16 h-16 text-gray-400" />}
                    />
                  </div>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200">
                          <Camera className="w-5 h-5" />
                        </div>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <CircularProgress size="sm" color="white" />
                    </div>
                  )}
                </div>
              </div>

              {/* User Info Section */}
              <div className="text-center space-y-4 mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {currentUser.displayName || "Chưa có tên hiển thị"}
                </h1>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <p className="text-lg">{user.email}</p>
                </div>
              </div>

              {/* Edit Form or Edit Button */}
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Input
                      label="Tên hiển thị"
                      value={form.displayName}
                      onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                      placeholder="Nhập tên hiển thị của bạn"
                      variant="bordered"
                      fullWidth
                      size="lg"
                      isRequired
                      startContent={<User className="w-5 h-5 text-gray-400" />}
                      classNames={{
                        input: "text-lg",
                        inputWrapper: "border-2 hover:border-blue-400 focus-within:!border-blue-500 bg-white/50 backdrop-blur-sm"
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center pt-4">
                    <Button
                      className="px-8 py-3 font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      startContent={<Save className="w-5 h-5" />}
                      isLoading={isSaving}
                      onClick={handleSave}
                      radius="full"
                      size="lg"
                    >
                      {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                    <Button
                      color="danger"
                      variant="bordered"
                      startContent={<X className="w-5 h-5" />}
                      onClick={handleCancel}
                      className="px-8 py-3 font-semibold border-2 hover:bg-red-50 transform hover:scale-105 transition-all duration-200"
                      radius="full"
                      size="lg"
                      isDisabled={isSaving}
                    >
                      Hủy
                    </Button>
                  </div>

                  {/* Message Display */}
                  {message && (
                    <div className="text-center pt-4">
                      <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-lg backdrop-blur-sm ${
                        message.includes("thành công") 
                          ? "text-green-700 bg-green-100/80 border-2 border-green-200" 
                          : "text-red-700 bg-red-100/80 border-2 border-red-200"
                      }`}>
                        {message.includes("thành công") ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        {message}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Button
                    startContent={<Edit3 className="w-5 h-5" />}
                    onClick={() => setIsEditing(true)}
                    className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    radius="full"
                    size="lg"
                  >
                    Chỉnh sửa hồ sơ
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}