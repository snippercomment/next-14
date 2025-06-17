"use client";

import { useState } from "react";
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
import { VIETNAM_PROVINCES, getDistrictsByProvince, getWardsByDistrict } from "@/lib/data/vietnamAddress";

const addressTypes = [
  { key: "home", label: "Nhà riêng" },
  { key: "office", label: "Văn phòng" },
  { key: "other", label: "Khác" },
];

export default function AddressModal({ 
  isOpen, 
  onOpenChange, 
  onAddressAdded, 
  uid 
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");

  const [addressForm, setAddressForm] = useState({
    recipientName: "",
    phoneNumber: "",
    city: "", // Tỉnh/Thành phố
    district: "", // Quận/Huyện  
    ward: "", // Phường/Xã
    address: "", // Địa chỉ cụ thể
    label: "",
    type: "",
    isDefault: false,
  });

  // Lấy danh sách quận/huyện theo tỉnh được chọn
  const availableDistricts = getDistrictsByProvince(addressForm.city);
  
  // Lấy danh sách phường/xã theo quận được chọn
  const availableWards = getWardsByDistrict(addressForm.city, addressForm.district);

  const handleInputChange = (field, value) => {
    setAddressForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Reset district và ward khi đổi tỉnh
      if (field === "city") {
        newForm.district = "";
        newForm.ward = "";
      }
      
      // Reset ward khi đổi quận
      if (field === "district") {
        newForm.ward = "";
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
      ward: "",
      address: "",
      label: "",
      type: "",
      isDefault: false,
    });
    setMessage("");
  };

  const handleAddAddress = async () => {
    setIsAdding(true);
    setMessage("");
    
    try {
      // Validate required fields
      if (!addressForm.recipientName.trim()) {
        throw new Error("Vui lòng nhập tên người nhận!");
      }

      if (!addressForm.phoneNumber.trim()) {
        throw new Error("Vui lòng nhập số điện thoại!");
      }

      if (!addressForm.city || !addressForm.district || !addressForm.ward) {
        throw new Error("Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã!");
      }

      if (!addressForm.address.trim()) {
        throw new Error("Vui lòng nhập địa chỉ cụ thể!");
      }

      // Tạo object địa chỉ hoàn chỉnh
      const newAddress = {
        id: Date.now().toString(), // Temporary ID
        recipientName: addressForm.recipientName.trim(),
        phoneNumber: addressForm.phoneNumber.trim(),
        city: addressForm.city,
        cityName: VIETNAM_PROVINCES.find(p => p.code === addressForm.city)?.name || "",
        district: addressForm.district,
        ward: addressForm.ward,
        address: addressForm.address.trim(),
        fullAddress: `${addressForm.address.trim()}, ${addressForm.ward}, ${addressForm.district}, ${VIETNAM_PROVINCES.find(p => p.code === addressForm.city)?.name || ""}`,
        label: addressForm.label.trim() || "Địa chỉ mới",
        type: addressForm.type || "home",
        isDefault: addressForm.isDefault,
        createdAt: new Date().toISOString(),
      };

      // Gọi callback để thêm địa chỉ
      await onAddressAdded(newAddress);
      
      // Reset form và đóng modal
      resetForm();
      onOpenChange(false);
      
    } catch (error) {
      setMessage(error.message || "Lỗi khi thêm địa chỉ! Vui lòng thử lại.");
      console.error("Lỗi thêm địa chỉ:", error);
    } finally {
      setIsAdding(false);
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
              Thêm địa chỉ mới
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
                  />
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={addressForm.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    variant="bordered"
                    fullWidth
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
                  >
                    {availableDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Phường/Xã */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <Select
                    placeholder={addressForm.district ? "Chọn Phường/Xã" : "Vui lòng chọn Quận/Huyện trước"}
                    selectedKeys={addressForm.ward ? [addressForm.ward] : []}
                    onSelectionChange={(keys) => handleInputChange("ward", Array.from(keys)[0] || "")}
                    variant="bordered"
                    fullWidth
                    isDisabled={!addressForm.district}
                  >
                    {availableWards.map((ward) => (
                      <SelectItem key={ward} value={ward}>
                        {ward}
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
                  />
                </div>

                {/* Đặt tên cho địa chỉ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đặt tên cho địa chỉ
                  </label>
                  <Input
                    placeholder="VD: Nhà riêng, Văn phòng..."
                    value={addressForm.label}
                    onChange={(e) => handleInputChange("label", e.target.value)}
                    variant="bordered"
                    fullWidth
                  />
                </div>

                {/* Loại địa chỉ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại địa chỉ
                  </label>
                  <Select
                    placeholder="Chọn loại địa chỉ"
                    selectedKeys={addressForm.type ? [addressForm.type] : []}
                    onSelectionChange={(keys) => handleInputChange("type", Array.from(keys)[0] || "")}
                    variant="bordered"
                    fullWidth
                  >
                    {addressTypes.map((type) => (
                      <SelectItem key={type.key} value={type.key}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </Select>
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
                isDisabled={isAdding}
              >
                Hủy
              </Button>
              <Button 
                color="primary" 
                onPress={handleAddAddress}
                isLoading={isAdding}
                className="bg-red-500 hover:bg-red-600"
              >
                {isAdding ? "Đang thêm..." : "Thêm địa chỉ"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}