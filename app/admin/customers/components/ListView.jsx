"use client";

import { useUsers } from "@/lib/firestore/user/read";
import { Avatar, CircularProgress, Chip, Button } from "@nextui-org/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

const ITEMS_PER_PAGE = 4;

export default function ListView() {
  const { data: users, error, isLoading } = useUsers();
  const [currentPage, setCurrentPage] = useState(1);

  // Tính toán pagination
  const totalPages = Math.ceil((users?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = users?.slice(startIndex, endIndex) || [];

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      {/* Header với tổng số khách hàng */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 mt-1">
            Tổng cộng: {users?.length || 0} khách hàng
          </p>
        </div>
      </div>

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
            {currentUsers.length > 0 ? (
              currentUsers.map((item, index) => {
                return <Row index={startIndex + index} item={item} key={item?.id} />;
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500 bg-white border rounded-lg">
                  Không có dữ liệu người dùng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, users?.length || 0)} của {users?.length || 0} kết quả
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              className="min-w-8 h-8"
            >
              <ChevronLeft size={16} />
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {(() => {
                const pageNumbers = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                // Điều chỉnh startPage nếu endPage đã tới maximum
                if (endPage === totalPages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                // Hiển thị trang đầu và dấu ...
                if (startPage > 1) {
                  pageNumbers.push(
                    <Button
                      key={1}
                      variant={currentPage === 1 ? "solid" : "flat"}
                      size="sm"
                      onPress={() => handlePageChange(1)}
                      className={`min-w-8 h-8 ${currentPage === 1
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                        }`}
                    >
                      1
                    </Button>
                  );

                  if (startPage > 2) {
                    pageNumbers.push(
                      <span key="start-ellipsis" className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                }

                // Hiển thị các trang ở giữa
                for (let i = startPage; i <= endPage; i++) {
                  if (i !== 1 && i !== totalPages) {
                    pageNumbers.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "solid" : "flat"}
                        size="sm"
                        onPress={() => handlePageChange(i)}
                        className={`min-w-8 h-8 ${currentPage === i
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100"
                          }`}
                      >
                        {i}
                      </Button>
                    );
                  }
                }

                // Hiển thị dấu ... và trang cuối
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pageNumbers.push(
                      <span key="end-ellipsis" className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }

                  pageNumbers.push(
                    <Button
                      key={totalPages}
                      variant={currentPage === totalPages ? "solid" : "flat"}
                      size="sm"
                      onPress={() => handlePageChange(totalPages)}
                      className={`min-w-8 h-8 ${currentPage === totalPages
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                        }`}
                    >
                      {totalPages}
                    </Button>
                  );
                }

                return pageNumbers;
              })()}
            </div>

            {/* Next Button */}
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              className="min-w-8 h-8"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
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