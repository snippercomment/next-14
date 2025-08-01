"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Checkbox,
} from "@nextui-org/react";
import { VIETNAM_PROVINCES, getDistrictsByProvince } from "@/lib/data/vietnamAddress";

const addressTypes = [
  { key: "home", label: "Nhà riêng" },
  { key: "office", label: "Văn phòng" },
  { key: "other", label: "Khác" },
];

export default function AddressModal({ 
  isOpen, 
  onOpenChange, 
  onAddressAdded, 
  onAddressUpdated,
  editingAddress,
  uid 
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const [addressForm, setAddressForm] = useState({
    recipientName: "",
    phoneNumber: "",
    city: "", 
    district: "", 
    addressLine1: "", 
    label: "",
    type: "",
    isDefault: false,
  });

  // Lấy danh sách quận/huyện theo tỉnh được chọn
  const availableDistricts = getDistrictsByProvince(addressForm.city);

  // Effect để load dữ liệu khi editingAddress thay đổi
  useEffect(() => {
    if (editingAddress) {
      // Tìm mã tỉnh từ tên tỉnh
      const province = VIETNAM_PROVINCES.find(p => p.name === editingAddress.cityName);
      
      setAddressForm({
        recipientName: editingAddress.recipientName || "",
        phoneNumber: editingAddress.phoneNumber || "",
        city: province?.code || editingAddress.city || "",
        district: editingAddress.district || "",
        address: editingAddress.addressLine1 || editingAddress.address || "",
        label: editingAddress.label || "",
        type: editingAddress.type || "home",
        isDefault: editingAddress.isDefault || false,
      });
    } else {
      resetForm();
    }
  }, [editingAddress]);

  const handleInputChange = (field, value) => {
    setAddressForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Reset district khi đổi tỉnh
      if (field === "city") {
        newForm.district = "";
      }
      
      return newForm;
    });
  };

  const resetForm = () => {
    setAddressForm({
      recipientName: "",
      phoneNumber: "",
      city: "",
      district: "",
      address: "",
      label: "",
      type: "",
      isDefault: false,
    });
    setMessage("");
  };

  // Validate số điện thoại Việt Nam
  const validatePhoneNumber = (phone) => {
    // Loại bỏ khoảng trắng và dấu
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Regex cho số điện thoại Việt Nam
    const phoneRegex = /^(\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    
    return phoneRegex.test(cleanPhone);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setMessage("");
    
    try {
      // Validate required fields
      if (!addressForm.recipientName.trim()) {
        throw new Error("Vui lòng nhập tên người nhận!");
      }

      if (!addressForm.phoneNumber.trim()) {
        throw new Error("Vui lòng nhập số điện thoại!");
      }

      // Validate số điện thoại
      if (!validatePhoneNumber(addressForm.phoneNumber)) {
        throw new Error("Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam (ví dụ: 0901234567, 0987654321)");
      }

      if (!addressForm.city || !addressForm.district) {
        throw new Error("Vui lòng chọn đầy đủ Tỉnh/Thành phố và Quận/Huyện!");
      }

      if (!addressForm.address.trim()) {
        throw new Error("Vui lòng nhập địa chỉ cụ thể!");
      }

      // Tạo object địa chỉ hoàn chỉnh
      const addressData = {
        recipientName: addressForm.recipientName.trim(),
        phoneNumber: addressForm.phoneNumber.trim(),
        city: addressForm.city,
        cityName: VIETNAM_PROVINCES.find(p => p.code === addressForm.city)?.name || "",
        district: addressForm.district,
        addressLine1: addressForm.address.trim(),
        fullAddress: `${addressForm.address.trim()}, ${addressForm.district}, ${VIETNAM_PROVINCES.find(p => p.code === addressForm.city)?.name || ""}`,
        label: addressForm.label.trim() || (editingAddress ? editingAddress.label : "Địa chỉ mới"),
        type: addressForm.type || "home",
        isDefault: addressForm.isDefault,
      };

      if (editingAddress) {
        // Cập nhật địa chỉ
        const updatedAddress = {
          ...addressData,
          id: editingAddress.id,
          createdAt: editingAddress.createdAt,
          updatedAt: new Date().toISOString(),
        };
        await onAddressUpdated(updatedAddress);
      } else {
        // Thêm địa chỉ mới
        const newAddress = {
          ...addressData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        await onAddressAdded(newAddress);
      }
      
      // Reset form và đóng modal
      resetForm();
      onOpenChange(false);
      
    } catch (error) {
      setMessage(error.message || `Lỗi khi ${editingAddress ? 'cập nhật' : 'thêm'} địa chỉ! Vui lòng thử lại.`);
      console.error(`Lỗi ${editingAddress ? 'cập nhật' : 'thêm'} địa chỉ:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
      onClose={handleClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Tên người nhận */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Nhập tên người nhận"
                    value={addressForm.recipientName}
                    onChange={(e) => handleInputChange("recipientName", e.target.value)}
                    variant="bordered"
                    fullWidth
                    aria-label="Tên người nhận"
                  />
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="Nhập số điện thoại (ví dụ: 0901234567)"
                    value={addressForm.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    variant="bordered"
                    fullWidth
                    aria-label="Số điện thoại"
                    maxLength={15}
                  />
                </div>

                {/* Tỉnh/Thành phố */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <Select
                    placeholder="Chọn Tỉnh/Thành phố"
                    selectedKeys={addressForm.city ? [addressForm.city] : []}
                    onSelectionChange={(keys) => handleInputChange("city", Array.from(keys)[0] || "")}
                    variant="bordered"
                    fullWidth
                    aria-label="Tỉnh/Thành phố"
                  >
                    {VIETNAM_PROVINCES.map((province) => (
                      <SelectItem key={province.code} value={province.code}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Quận/Huyện */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <Select
                    placeholder={addressForm.city ? "Chọn Quận/Huyện" : "Vui lòng chọn Tỉnh/Thành phố trước"}
                    selectedKeys={addressForm.district ? [addressForm.district] : []}
                    onSelectionChange={(keys) => handleInputChange("district", Array.from(keys)[0] || "")}
                    variant="bordered"
                    fullWidth
                    isDisabled={!addressForm.city}
                    aria-label="Quận/Huyện"
                  >
                    {availableDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Địa chỉ cụ thể */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Nhập số nhà, tên đường..."
                    value={addressForm.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    variant="bordered"
                    fullWidth
                    minRows={3}
                    aria-label="Địa chỉ cụ thể"
                  />
                </div>

                {/* Nhãn địa chỉ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhãn địa chỉ (tùy chọn)
                  </label>
                  <Input
                    placeholder="Ví dụ: Nhà riêng, Văn phòng, Nhà bạn..."
                    value={addressForm.label}
                    onChange={(e) => handleInputChange("label", e.target.value)}
                    variant="bordered"
                    fullWidth
                    aria-label="Nhãn địa chỉ"
                  />
                </div>

              

                {/* Đặt làm địa chỉ mặc định */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    isSelected={addressForm.isDefault}
                    onValueChange={(checked) => handleInputChange("isDefault", checked)}
                  >
                    Đặt làm địa chỉ mặc định
                  </Checkbox>
                </div>

                {/* Hiển thị thông báo lỗi */}
                {message && (
                  <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                    {message}
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                color="danger" 
                variant="light" 
                onPress={handleClose}
                isDisabled={isProcessing}
              >
                Hủy
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
                isLoading={isProcessing}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isProcessing ? 
                  (editingAddress ? "Đang cập nhật..." : "Đang thêm...") : 
                  (editingAddress ? "Cập nhật" : "Thêm địa chỉ")
                }
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}