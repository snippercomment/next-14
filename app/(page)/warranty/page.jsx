'use client';

import { useState } from 'react';
import Section1 from './components/Section1';
import Section2 from './components/Section2';
import Section3 from './components/Section3';

export default function WarrantyPolicy() {
  const [activeTab, setActiveTab] = useState(1);

  const tabs = [
    { id: 1, title: 'Đổi mới 30 ngày miễn phí' },
    { id: 2, title: 'Bảo hành tiêu chuẩn' },
    { id: 3, title: 'Bảo hành mở rộng' }
  ];

  // Chỉ sử dụng màu đỏ cho tất cả các tab
  const getTabStyles = (tabId) => {
    const isActive = activeTab === tabId;
    return `px-6 py-3 rounded-lg border-2 font-semibold transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-red-500 text-white border-red-500'
        : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
    }`;
  };

  const renderActiveSection = () => {
    switch(activeTab) {
      case 1:
        return <Section1 />;
      case 2:
        return <Section2 />;
      case 3:
        return <Section3 />;
      default:
        return <Section1 />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Chính sách bảo hành
      </h1>
      
      {/* Intro Text */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-700 leading-relaxed">
          Khi mua sản phẩm tại Discount, khách hàng có quyền hoàn toàn yên tâm với sản phẩm chính hãng, được bảo hành chính thức 
          tại hãng và ngoài ra có thêm chính sách đổi mới miễn phí lên tới 30 ngày tại Discount
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={getTabStyles(tab.id, tab.color)}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      {/* Active Section Content */}
      <div className="min-h-[400px]">
        {renderActiveSection()}
      </div>

      {/* Additional Information - Always visible */}
      <div className="mt-8 space-y-6">
        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 ">
          <p className="text-sm text-gray-700 mb-2">
            <strong>(*)</strong> Loại phần cứng từ phía nhà sản xuất
          </p>
          
          <h3 className="font-bold text-gray-800 mb-3">Điều kiện đổi trả:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
             
              <span><strong>Máy:</strong> Như mới, không xước xát, không dán decal, hình trang trí</span>
            </li>
            <li className="flex items-start">
    
              <span><strong>Máy cũ:</strong> có tình trạng sản phẩm như lúc mới mua</span>
            </li>
            <li className="flex items-start">
             
              <span><strong>Hộp:</strong> Như mới, không móp méo, rách, vỡ, bị viết, vẽ, quận băng dính, kẹo; có Serial/IMEI trên hộp trùng với thân máy.</span>
            </li>
           
            <li className="flex items-start">
          
              <span><strong>Tài khoản:</strong> Máy đã được xuất khỏi tất cả các tài khoản như: iCloud, Google Account, Mi Account...</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border-l-4">
          <p className="text-sm text-gray-700 mb-3">
            Các lỗi từ NSX cần được xác định bởi trung tâm bảo hành chính hãng hoặc trung tâm bảo hành ủy quyền
          </p>
          
          <p className="text-sm text-gray-700 mb-3">
            <strong>(*)</strong> Lỗi từ phía Nhà sản xuất là các lỗi bao gồm: Lỗi nguồn, lỗi trên mainboard, ổ cứng, màn hình và các linh kiện phần cứng bên trong
          </p>
          
          <p className="text-sm text-gray-700 mb-3">
            <strong>Lỗi điểm chết màn hình:</strong> màn hình có từ 3 điểm chết trở lên hoặc 1 điểm chết có kích thước lớn hơn 1mm đối với điện thoại và từ 5 điểm chết trở lên đối với laptop, màn hình rời
          </p>
          
          <p className="text-sm text-gray-700">
            <strong>Trường hợp đổi/ trả các sản phẩm xuất hoá đơn Công ty,</strong> khách hàng vui lòng cung cấp Biên bản trả hàng và thu hồi hoá đơn hoặc Biên bản điều chỉnh giảm hoá đơn GTGT đầy đủ mộc trọn công ty và chữ ký người đại diện Pháp luật công ty. Trường hợp Khách hàng không cung cấp đày đủ các chứng từ trên, Discount xin phép thu phí dịch vụ theo giá trị thuế suất VAT sản phẩm đổi trả.
          </p>
        </div>
      </div>
    </div>
  );
}