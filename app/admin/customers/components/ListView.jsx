"use client";

import { useUsers } from "@/lib/firestore/user/read";
import { Avatar, CircularProgress, Chip } from "@nextui-org/react";

export default function ListView() {
  const { data: users, error, isLoading } = useUsers();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <CircularProgress />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        Lỗi: {error}
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col gap-3 md:pr-5 md:px-0 px-5 rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3 min-w-[1000px]">
          <thead>
            <tr>
              <th className="font-semibold border-y bg-white px-3 py-2 border-l rounded-l-lg text-center">
                STT
              </th>
              <th className="font-semibold border-y bg-white px-3 py-2 text-center">
                Ảnh
              </th>
              <th className="font-semibold border-y bg-white px-3 py-2 text-left">
                Tên
              </th>
              <th className="font-semibold border-y bg-white px-3 py-2 text-left">
                Email
              </th>
              <th className="font-semibold border-y bg-white px-3 py-2 text-center">
                Ngày sinh
              </th>
              <th className="font-semibold border-y bg-white px-3 py-2 text-center">
                Số điện thoại
              </th>
              <th className="font-semibold border-y bg-white px-3 py-2 text-center border-r rounded-r-lg">
                Giới tính
              </th>
            </tr>
          </thead>
          <tbody>
            {users?.map((item, index) => {
              return <Row index={index} item={item} key={item?.id} />;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ item, index }) {
  // Helper function để hiển thị ngày sinh
  const formatDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) return "Chưa cập nhật";
    
    // Nếu là định dạng YYYY-MM-DD, chuyển thành DD/MM/YYYY
    try {
      const date = new Date(dateOfBirth);
      if (isNaN(date.getTime())) return dateOfBirth; // Nếu không parse được thì trả về giá trị gốc
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateOfBirth; // Trả về giá trị gốc nếu có lỗi
    }
  };

  // Helper function để hiển thị giới tính
  const formatGender = (gender) => {
    if (!gender) return "Chưa cập nhật";
    
    const genderMap = {
      male: "Nam",
      female: "Nữ",
      other: "Khác"
    };
    
    return genderMap[gender] || gender;
  };

  // Helper function để chọn màu chip theo giới tính
  const getGenderChipColor = (gender) => {
    switch (gender) {
      case "male":
        return "primary";
      case "female":
        return "secondary";
      case "other":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="border-y bg-white px-3 py-2 border-l rounded-l-lg text-center">
        {index + 1}
      </td>
      <td className="border-y bg-white px-3 py-2 text-center">
        <div className="flex justify-center">
          <Avatar 
            src={item?.photoURL} 
            name={item?.displayName?.charAt(0)}
            size="md"
          />
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2">
        <div className="font-medium text-gray-900">
          {item?.displayName || "Chưa cập nhật"}
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2">
        <div className="text-gray-700">
          {item?.email || "Chưa cập nhật"}
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2 text-center">
        <div className="text-gray-700">
          {formatDateOfBirth(item?.dateOfBirth)}
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2 text-center">
        <div className="text-gray-700">
          {item?.phoneNumber || "Chưa cập nhật"}
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2 text-center border-r rounded-r-lg">
        {item?.gender ? (
          <Chip 
            color={getGenderChipColor(item?.gender)}
            size="sm"
            variant="flat"
          >
            {formatGender(item?.gender)}
          </Chip>
        ) : (
          <span className="text-gray-500 text-sm">Chưa cập nhật</span>
        )}
      </td>
    </tr>
  );
}