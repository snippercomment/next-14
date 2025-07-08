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
import { Save, X, Edit3, User, Camera, Sparkles, MapPin, Plus, Home, Building, Trash2, Star, Edit, CheckCircle, AlertCircle } from "lucide-react"; 
import toast, { Toaster } from 'react-hot-toast';

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

  // Address Modal state
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);

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

  // Toast notification functions
  const showSuccessToast = (message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: <CheckCircle className="w-5 h-5" />,
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: <AlertCircle className="w-5 h-5" />,
    });
  };

  const showWarningToast = (message) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#F59E0B',
        color: '#fff',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: <AlertCircle className="w-5 h-5" />,
    });
  };

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

  // Format phone number display
  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    // Remove all non-digit characters
    const numbers = phone.replace(/\D/g, '');
    // Format as Vietnamese phone number
    if (numbers.length === 10) {
      return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`;
    } else if (numbers.length === 11) {
      return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`;
    }
    return phone;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showErrorToast("Vui lòng chọn file ảnh!");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("Kích thước ảnh không được vượt quá 5MB!");
        return;
      }

      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (!uid) {
        showErrorToast("Lỗi: Không tìm thấy ID người dùng để cập nhật.");
        setIsSaving(false);
        return;
      }

      if (!form.displayName.trim()) {
        showErrorToast("Tên hiển thị không được để trống!");
        setIsSaving(false);
        return;
      }

      let photoURL = currentUser?.photoURL || "";

      if (selectedImage) {
        setIsUploadingImage(true);
        try {
          photoURL = await uploadImageToCloudinary(selectedImage, 'user-avatars');
        } catch (uploadError) {
          showErrorToast("Lỗi khi tải ảnh lên! Vui lòng thử lại.");
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
      showSuccessToast("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      showErrorToast("Lỗi khi cập nhật! Vui lòng thử lại.");
      console.error("Lỗi cập nhật profile:", error);
    } finally {
      setIsSaving(false);
      setIsUploadingImage(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
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
      
      showSuccessToast("Thêm địa chỉ thành công!");
    } catch (error) {
      showErrorToast("Lỗi khi thêm địa chỉ! Vui lòng thử lại.");
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
      
      showSuccessToast("Xóa địa chỉ thành công!");
    } catch (error) {
      showErrorToast("Lỗi khi xóa địa chỉ! Vui lòng thử lại.");
      console.error("Lỗi xóa địa chỉ:", error);
    }
  };

  const handleAddressUpdated = async (updatedAddress) => {
    try {
      // If this is set as default, unset all other defaults
      let updatedAddresses = addresses.map(addr => 
        addr.id === updatedAddress.id ? updatedAddress : addr
      );

      // If the updated address is set as default, remove default from others
      if (updatedAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => 
          addr.id === updatedAddress.id ? addr : { ...addr, isDefault: false }
        );
      }

      setAddresses(updatedAddresses);
      
      await updateUser(uid, {
        addresses: updatedAddresses
      });
      
      showSuccessToast("Cập nhật địa chỉ thành công!");
    } catch (error) {
      showErrorToast("Lỗi khi cập nhật địa chỉ! Vui lòng thử lại.");
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
      
      showSuccessToast("Đặt địa chỉ mặc định thành công!");
    } catch (error) {
      showErrorToast("Lỗi khi đặt địa chỉ mặc định! Vui lòng thử lại.");
      console.error("Lỗi đặt địa chỉ mặc định:", error);
    }
  };

  // Mở modal để sửa địa chỉ
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    onOpen();
  };

  // Mở modal để thêm địa chỉ mới
  const handleAddNewAddress = () => {
    setEditingAddress(null);
    onOpen();
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

  // Tách địa chỉ để hiển thị chỉ số nhà/đường
  const formatAddressDisplay = (address) => {
    if (!address) return "";
    
    // Tách số nhà và đường ra khỏi địa chỉ đầy đủ
    const parts = address.fullAddress.split(", ");
    if (parts.length > 0) {
      return parts[0]; // Chỉ lấy số nhà và tên đường
    }
    return address.address || "";
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
      {/* Toast Container */}
      <Toaster />
      
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
                  className="text-blue-500"
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
                        aria-label="Chọn giới tính"
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
                        {formatPhoneNumber(currentUser.phoneNumber) || "-"}
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
                      {formatAddressDisplay(addresses.find(addr => addr.isDefault)) || "-"}
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
                  <MapPin className="w-5 h-5" />
                  Địa chỉ
                </h2>
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onClick={handleAddNewAddress}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Thêm địa chỉ
                </Button>
              </div>
            </div>

            {/* Address List */}
            <div className="p-6">
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có địa chỉ nào. Hãy thêm địa chỉ đầu tiên của bạn!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        address.isDefault 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getAddressTypeIcon(address.type)}
                            <span className="font-medium text-gray-900">
                              {address.label || getAddressTypeLabel(address.type)}
                            </span>
                            {address.isDefault && (
                              <Chip 
                                size="sm" 
                                color="primary" 
                                variant="flat"
                                startContent={<Star className="w-3 h-3" />}
                              >
                                Mặc định
                              </Chip>
                            )}
                          </div>
                          <p className="text-gray-600 mb-1">
                            <strong>{address.recipientName}</strong> | {formatPhoneNumber(address.phoneNumber)}
                          </p>
                          <p className="text-gray-900 font-medium mb-1">
                            {formatAddressDisplay(address)}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {address.ward}, {address.district}, {address.cityName}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color="primary"
                              variant="light"
                              startContent={<Edit className="w-3 h-3" />}
                              onClick={() => handleEditAddress(address)}
                            >
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              startContent={<Trash2 className="w-3 h-3" />}
                              onClick={() => handleAddressDeleted(address.id)}
                            >
                              Xóa
                            </Button>
                          </div>
                          {!address.isDefault && (
                            <Button
                              size="sm"
                              color="primary"
                              variant="bordered"
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="text-xs"
                            >
                              Đặt mặc định
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
       
        {/* Add/Edit Address Modal */}
        <AddressModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onAddressAdded={handleAddressAdded}
          onAddressUpdated={handleAddressUpdated}
          editingAddress={editingAddress}
          uid={uid}
        />
      </div>
    </div>
  );
}