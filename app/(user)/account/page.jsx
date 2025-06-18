"use client";

import { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  Input,
  Card,
  CardBody,
  CircularProgress,
  Select,
  SelectItem,
  useDisclosure,
  Chip,
} from "@nextui-org/react";
import { Save, X, Edit3, User, Camera, Sparkles, MapPin, Plus, Home, Building, Trash2, Star } from "lucide-react"; 

import { useUser } from "@/lib/firestore/user/read";
import { updateUser } from "@/lib/firestore/user/write";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImageToCloudinary } from "@/lib/uploadToCloudinary";
import AddressModal from "@/app/components/AddressModal";

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

  // Address Modal state
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [addresses, setAddresses] = useState([]);

  const [form, setForm] = useState({
    displayName: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const genderOptions = [
    { key: "male", label: "Nam" },
    { key: "female", label: "Nữ" },
    { key: "other", label: "Khác" },
  ];

  useEffect(() => {
    if (currentUser) {
      setForm({
        displayName: currentUser.displayName || "",
        gender: currentUser.gender || "",
        dateOfBirth: currentUser.dateOfBirth || "",
        phoneNumber: currentUser.phoneNumber || "",
      });
      setImagePreview(currentUser.photoURL || "");
      
      // Load addresses if available
      if (currentUser.addresses) {
        setAddresses(currentUser.addresses);
      }
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
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        phoneNumber: form.phoneNumber.trim(),
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
        gender: currentUser.gender || "",
        dateOfBirth: currentUser.dateOfBirth || "",
        phoneNumber: currentUser.phoneNumber || "",
      });
      setImagePreview(currentUser.photoURL || "");
    }
  };

  // Handle address operations
  const handleAddressAdded = async (newAddress) => {
    try {
      // If this is set as default, unset all other defaults
      const updatedAddresses = newAddress.isDefault 
        ? addresses.map(addr => ({ ...addr, isDefault: false }))
        : addresses;
      
      // Add to local state
      const finalAddresses = [...updatedAddresses, newAddress];
      setAddresses(finalAddresses);
      
      // Update user with new addresses
      await updateUser(uid, {
        addresses: finalAddresses
      });
      
      setMessage("Thêm địa chỉ thành công!");
    } catch (error) {
      setMessage("Lỗi khi thêm địa chỉ! Vui lòng thử lại.");
      console.error("Lỗi thêm địa chỉ:", error);
      throw error;
    }
  };

  const handleAddressDeleted = async (addressId) => {
    try {
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      setAddresses(updatedAddresses);
      
      await updateUser(uid, {
        addresses: updatedAddresses
      });
      
      setMessage("Xóa địa chỉ thành công!");
    } catch (error) {
      setMessage("Lỗi khi xóa địa chỉ! Vui lòng thử lại.");
      console.error("Lỗi xóa địa chỉ:", error);
    }
  };

  const handleAddressUpdated = async (updatedAddress) => {
    try {
      const updatedAddresses = addresses.map(addr => 
        addr.id === updatedAddress.id ? updatedAddress : addr
      );
      setAddresses(updatedAddresses);
      
      await updateUser(uid, {
        addresses: updatedAddresses
      });
      
      setMessage("Cập nhật địa chỉ thành công!");
    } catch (error) {
      setMessage("Lỗi khi cập nhật địa chỉ! Vui lòng thử lại.");
      console.error("Lỗi cập nhật địa chỉ:", error);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));
      setAddresses(updatedAddresses);
      
      await updateUser(uid, {
        addresses: updatedAddresses
      });
      
      setMessage("Đặt địa chỉ mặc định thành công!");
    } catch (error) {
      setMessage("Lỗi khi đặt địa chỉ mặc định! Vui lòng thử lại.");
      console.error("Lỗi đặt địa chỉ mặc định:", error);
    }
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'office':
        return <Building className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getAddressTypeLabel = (type) => {
    switch (type) {
      case 'home':
        return 'Nhà riêng';
      case 'office':
        return 'Văn phòng';
      default:
        return 'Khác';
    }
  };

  if (isAuthLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <CircularProgress size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!uid || !user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Card className="max-w-md">
          <CardBody className="text-center p-8">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Chưa đăng nhập
            </h2>
            <p className="text-gray-600">
              Bạn cần đăng nhập để xem và chỉnh sửa hồ sơ của mình.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (userFetchError) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Card className="max-w-md">
          <CardBody className="text-center p-8">
            <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-4">
              Không thể tải thông tin hồ sơ của bạn.
            </p>
            <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded">
              {userFetchError.message}
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Card className="max-w-md">
          <CardBody className="text-center p-8">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Không tìm thấy hồ sơ
            </h2>
            <p className="text-gray-600">
              Hồ sơ của bạn chưa được tạo. Vui lòng thử lại hoặc liên hệ hỗ trợ.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Information Card */}
        <Card className="shadow-lg">
          <CardBody className="p-0">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h1>
                <Button
                  color="primary"
                  variant="light"
                  startContent={<Edit3 className="w-4 h-4" />}
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-red-500"
                >
                  Cập nhật
                </Button>
              </div>
            </div>

            <div className="p-6">
              {/* Avatar Section */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <Avatar
                    src={
                      imagePreview || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(form.displayName || "User")}&background=6366f1&color=fff&size=200&bold=true`
                    }
                    className="w-24 h-24 text-large"
                    fallback={<User className="w-12 h-12 text-gray-400" />}
                  />
                  {isEditing && (
                    <div className="absolute -bottom-1 -right-1">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
                          <Camera className="w-4 h-4" />
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

              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Họ và tên:</span>
                    {isEditing ? (
                      <Input
                        value={form.displayName}
                        onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                        placeholder="Nhập tên hiển thị"
                        variant="bordered"
                        size="sm"
                        className="max-w-xs"
                        classNames={{
                          inputWrapper: "border-gray-300"
                        }}
                      />
                    ) : (
                      <span className="text-gray-900 font-medium">
                        {currentUser.displayName || "-"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Giới tính:</span>
                    {isEditing ? (
                      <Select
                        selectedKeys={form.gender ? [form.gender] : []}
                        onSelectionChange={(keys) => setForm({ ...form, gender: Array.from(keys)[0] || "" })}
                        placeholder="Chọn giới tính"
                        variant="bordered"
                        size="sm"
                        className="max-w-xs"
                        classNames={{
                          trigger: "border-gray-300"
                        }}
                      >
                        {genderOptions.map((gender) => (
                          <SelectItem key={gender.key} value={gender.key}>
                            {gender.label}
                          </SelectItem>
                        ))}
                      </Select>
                    ) : (
                      <span className="text-gray-900 font-medium">
                        {currentUser.gender ? 
                          genderOptions.find(g => g.key === currentUser.gender)?.label || currentUser.gender 
                          : "-"
                        }
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Ngày sinh:</span>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                        variant="bordered"
                        size="sm"
                        className="max-w-xs"
                        classNames={{
                          inputWrapper: "border-gray-300"
                        }}
                      />
                    ) : (
                      <span className="text-gray-900 font-medium">
                        {currentUser.dateOfBirth || "-"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Số điện thoại:</span>
                    {isEditing ? (
                      <Input
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        placeholder="Nhập số điện thoại"
                        variant="bordered"
                        size="sm"
                        className="max-w-xs"
                        classNames={{
                          inputWrapper: "border-gray-300"
                        }}
                      />
                    ) : (
                      <span className="text-gray-900 font-medium">
                        {currentUser.phoneNumber || "-"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="text-gray-900 font-medium">
                      {user.email}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Địa chỉ mặc định:</span>
                    <span className="text-gray-900 font-medium">
                      {addresses.find(addr => addr.isDefault)?.label || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-4 justify-center mt-8 pt-6 border-t border-gray-200">
                  <Button
                    color="primary"
                    startContent={<Save className="w-4 h-4" />}
                    isLoading={isSaving}
                    onClick={handleSave}
                    className="px-6"
                  >
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                  <Button
                    color="default"
                    variant="bordered"
                    startContent={<X className="w-4 h-4" />}
                    onClick={handleCancel}
                    className="px-6"
                    isDisabled={isSaving}
                  >
                    Hủy
                  </Button>
                </div>
              )}

              {/* Message Display */}
              {message && (
                <div className="text-center mt-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    message.includes("thành công") 
                      ? "text-green-700 bg-green-100 border border-green-200" 
                      : "text-red-700 bg-red-100 border border-red-200"
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
          </CardBody>
        </Card>

        {/* Address Management Card */}
        <Card className="shadow-lg">
          <CardBody className="p-0">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                
                  Địa chỉ
                </h2>
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onClick={onOpen}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Thêm địa chỉ
                </Button>
              </div>
            </div>

            {/* Address List */}
            <div className="p-6">
              {addresses.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">
                    Chưa có địa chỉ nào
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Thêm địa chỉ để thuận tiện cho việc đặt hàng
                  </p>
                  <Button
                    color="primary"
                    startContent={<Plus className="w-4 h-4" />}
                    onClick={onOpen}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Thêm địa chỉ đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <Card key={address.id} className="border border-gray-200">
                      <CardBody className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1 text-gray-600">
                                {getAddressTypeIcon(address.type)}
                                <span className="font-medium">{address.label}</span>
                              </div>
                              {address.isDefault && (
                                <Chip
                                  startContent={<Star className="w-3 h-3" />}
                                  variant="flat"
                                  color="warning"
                                  size="sm"
                                >
                                  Mặc định
                                </Chip>
                              )}
                              <Chip
                                variant="flat"
                                color="default"
                                size="sm"
                              >
                                {getAddressTypeLabel(address.type)}
                              </Chip>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              <p className="font-medium text-gray-900">
                                {address.recipientName}
                              </p>
                              <p className="text-gray-600">
                                {address.phoneNumber}
                              </p>
                              <p className="text-gray-600">
                                {address.fullAddress}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!address.isDefault && (
                              <Button
                                size="sm"
                                variant="light"
                                color="warning"
                                startContent={<Star className="w-3 h-3" />}
                                onClick={() => handleSetDefaultAddress(address.id)}
                              >
                                Đặt mặc định
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="light"
                              color="danger"
                              isIconOnly
                              onClick={() => handleAddressDeleted(address.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
       
        {/* Add Address Modal */}
        <AddressModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onAddressAdded={handleAddressAdded}
          uid={uid}
        />
      </div>
    </div>
  );
}