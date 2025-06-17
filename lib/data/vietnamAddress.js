// lib/data/vietnamAddress.js
export const VIETNAM_PROVINCES = [
  {
    code: "HN",
    name: "Hà Nội",
    districts: [
      "Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy", "Đống Đa",
      "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân", "Sóc Sơn", "Đông Anh", 
      "Gia Lâm", "Nam Từ Liêm", "Bắc Từ Liêm", "Mê Linh", "Hà Đông",
      "Sơn Tây", "Ba Vì", "Phúc Thọ", "Đan Phượng", "Hoài Đức", 
      "Quốc Oai", "Thạch Thất", "Chương Mỹ", "Thanh Oai", "Thường Tín",
      "Phú Xuyên", "Ứng Hòa", "Mỹ Đức"
    ]
  },
  {
    code: "HCM",
    name: "TP. Hồ Chí Minh",
    districts: [
      "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", 
      "Quận 7", "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12",
      "Quận Bình Thạnh", "Quận Gò Vấp", "Quận Phú Nhuận", "Quận Tân Bình",
      "Quận Tân Phú", "Quận Bình Tân", "Thủ Đức", "Hóc Môn", "Củ Chi",
      "Bình Chánh", "Nhà Bè", "Cần Giờ"
    ]
  },
  {
    code: "DN",
    name: "Đà Nẵng",
    districts: [
      "Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", 
      "Cẩm Lệ", "Hòa Vang", "Hoàng Sa"
    ]
  },
  {
    code: "HP",
    name: "Hải Phòng",
    districts: [
      "Hồng Bàng", "Ngô Quyền", "Lê Chân", "Hải An", "Kiến An", 
      "Đồ Sơn", "Dương Kinh", "Thuỷ Nguyên", "An Dương", "An Lão",
      "Kiến Thuỵ", "Tiên Lãng", "Vĩnh Bảo", "Cát Hải", "Bạch Long Vĩ"
    ]
  },
  {
    code: "CT",
    name: "Cần Thơ",
    districts: [
      "Ninh Kiều", "Ô Môn", "Bình Thuỷ", "Cái Răng", "Thốt Nốt",
      "Vĩnh Thạnh", "Cờ Đỏ", "Phong Điền", "Thới Lai"
    ]
  },
  {
    code: "AG",
    name: "An Giang",
    districts: [
      "Long Xuyên", "Châu Đốc", "An Phú", "Tân Châu", "Phú Tân",
      "Châu Phú", "Tịnh Biên", "Tri Tôn", "Châu Thành", "Chợ Mới", "Thoại Sơn"
    ]
  },
  {
    code: "BT",
    name: "Bình Thuận",
    districts: [
      "Phan Thiết", "La Gi", "Tuy Phong", "Bắc Bình", "Hàm Thuận Bắc",
      "Hàm Thuận Nam", "Tánh Linh", "Đức Linh", "Hàm Tân", "Phú Quí"
    ]
  },
  {
    code: "VT",
    name: "Vũng Tàu",
    districts: [
      "Vũng Tàu", "Bà Rịa", "Châu Đức", "Xuyên Mộc", "Long Điền",
      "Đất Đỏ", "Tân Thành", "Côn Đảo"
    ]
  },
  {
    code: "BDG",
    name: "Bình Dương",
    districts: [
      "Thủ Dầu Một", "Dĩ An", "Thuận An", "Tân Uyên", "Bến Cát",
      "Phú Giáo", "Dầu Tiếng", "Bàu Bàng", "Bạch Đằng"
    ]
  },
  {
    code: "DNA",
    name: "Đồng Nai",
    districts: [
      "Biên Hòa", "Long Khánh", "Nhon Trạch", "Long Thành", "Định Quán",
      "Tân Phú", "Vĩnh Cửu", "Trảng Bom", "Thống Nhất", "Cẩm Mỹ", "Xuân Lộc"
    ]
  }
];

// Dữ liệu phường/xã theo từng quận/huyện
const VIETNAM_WARDS = {
  // Hà Nội
  "HN-Ba Đình": [
    "Phúc Xá", "Trúc Bạch", "Vĩnh Phúc", "Cống Vị", "Liễu Giai", "Nguyễn Trung Trực",
    "Quán Thánh", "Ngọc Hà", "Điện Biên", "Đội Cấn", "Ngọc Khánh", "Kim Mã",
    "Giảng Võ", "Thành Công"
  ],
  "HN-Hoàn Kiếm": [
    "Phúc Tấn", "Đồng Xuân", "Hàng Mã", "Hàng Buồm", "Hàng Đào", "Hàng Bồ",
    "Cửa Đông", "Lý Thái Tổ", "Hàng Bạc", "Hàng Gai", "Chương Dương Độ",
    "Hàng Trống", "Cửa Nam", "Hàng Bông", "Tràng Tiền", "Trần Hưng Đạo",
    "Phan Chu Trinh", "Hàng Bài"
  ],
  "HN-Tây Hồ": [
    "Phú Thượng", "Nhật Tân", "Tứ Liên", "Quảng An", "Xuân La", "Yên Phụ",
    "Bưởi", "Thụy Khuê"
  ],
  "HN-Long Biên": [
    "Thạch Bàn", "Phúc Lợi", "Bo De", "Sài Đồng", "Long Biên", "Gia Thụy",
    "Ngọc Thụy", "Phúc Đông", "Việt Hưng", "Gia Thụy", "Đức Giang",
    "Thượng Thanh", "Ngọc Lâm", "Phúc Lợi"
  ],
  "HN-Cầu Giấy": [
    "Nghĩa Đô", "Nghĩa Tân", "Mai Dịch", "Dịch Vọng", "Dịch Vọng Hậu",
    "Quan Hoa", "Yên Hoà", "Trung Hoà"
  ],
  "HN-Đống Đa": [
    "Cát Linh", "Văn Miếu", "Quốc Tử Giám", "Láng Thượng", "Ô Chợ Dừa",
    "Văn Chương", "Hàng Bột", "Nam Đồng", "Trung Liệt", "Phương Liên",
    "Thổ Quan", "Lang Hạ", "Khâm Thiên", "Phương Mai", "Ngã Tư Sở",
    "Khương Thượng", "Trung Phụng", "Quang Trung", "Trung Tự", "Kim Liên",
    "Phúc Tân"
  ],

  // TP.HCM
  "HCM-Quận 1": [
    "Tân Định", "Đa Kao", "Bến Nghé", "Bến Thành", "Nguyễn Thái Bình",
    "Phạm Ngũ Lão", "Cầu Ông Lãnh", "Cô Giang", "Nguyễn Cư Trinh", "Cầu Kho"
  ],
  "HCM-Quận 2": [
    "Thảo Điền", "An Phú", "Bình An", "Bình Trưng Đông", "Bình Trưng Tây",
    "Bình Khánh", "An Khánh", "Cát Lái", "Thạnh Mỹ Lợi", "An Lợi Đông", "Thủ Thiêm"
  ],
  "HCM-Quận 3": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6",
    "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12",
    "Phường 13", "Phường 14"
  ],
  "HCM-Quận 4": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 6", "Phường 8",
    "Phường 9", "Phường 10", "Phường 13", "Phường 14", "Phường 15", "Phường 16",
    "Phường 18"
  ],
  "HCM-Quận 5": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6",
    "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12",
    "Phường 13", "Phường 14", "Phường 15"
  ],
  "HCM-Quận 6": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6",
    "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12",
    "Phường 13", "Phường 14"
  ],
  "HCM-Quận 7": [
    "Tân Thuận Đông", "Tân Thuận Tây", "Tân Kiểng", "Tân Hưng", "Bình Thuận",
    "Tân Quy", "Phú Thuận", "Tân Phú", "Tân Phong", "Phú Mỹ"
  ],
  "HCM-Quận 8": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6",
    "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12",
    "Phường 13", "Phường 14", "Phường 15", "Phường 16"
  ],

  // Bình Thuận (tỉnh của bạn)
  "BT-Phan Thiết": [
    "Đức Nghia", "Đức Thắng", "Đức Long", "Phú Hài", "Phú Thủy", "Phú Trinh",
    "Phú Tài", "Hàm Tiến", "Mũi Né", "Tiến Lợi", "Tiến Thành", "Xuân An",
    "Thanh Hải", "Bình Hưng", "Đức Thọ", "Lạc Đạo", "Hòa Minh", "Thiện Nghiệp",
    "Phong Nẫm", "Hàm Hiệp"
  ],
  "BT-La Gi": [
    "La Gi", "Tân An", "Bình Tân", "Tân Hải", "Tân Tiến", "Tân Thành"
  ],
  "BT-Tuy Phong": [
    "Liên Hương", "Phan Hiệp", "Bắc Ruột", "Hòa Minh", "Chợ Lầu", "Phan Sơn",
    "Tân Hải", "Phan Thanh", "Hòa Thắng", "Phong Phú"
  ],
  "BT-Bắc Bình": [
    "Chợ Lầu", "Phan Sơn Tây", "Phan Hiệp", "Bắc Ruột", "Hòa Thắng",
    "Phan Thanh", "Hòa Minh", "Phan Hòa", "Hòa Phú", "Phan Rí Cửa"
  ],

  // Đà Nẵng
  "DN-Hải Châu": [
    "Thanh Bình", "Thuận Phước", "Thạch Thang", "Hải Châu I", "Hải Châu II",
    "Phước Ninh", "Hòa Thuận Tây", "Hòa Thuận Đông", "Nam Dương", "Bình Hiên",
    "Bình Thuận", "Hòa Cường Bắc", "Hòa Cường Nam"
  ],
  "DN-Thanh Khê": [
    "Tam Thuận", "Thanh Khê Tây", "Thanh Khê Đông", "Xuân Hà", "Tân Chính",
    "Chính Gián", "Vĩnh Trung", "Thạc Gián", "An Khê", "Hòa Khê"
  ],
  "DN-Sơn Trà": [
    "Thọ Quang", "Nại Hiên Đông", "Mân Thái", "An Hải Bắc", "Phước Mỹ",
    "An Hải Tây", "An Hải Đông"
  ],

  // Hải Phòng
  "HP-Hồng Bàng": [
    "Quán Toan", "Hùng Vương", "Sở Dầu", "Thượng Lý", "Hạ Lý", "Minh Khai",
    "Trại Cau", "Phạm Hồng Thái", "Hoàng Văn Thụ", "Phan Bội Châu"
  ],
  "HP-Ngô Quyền": [
    "Máy Chai", "Máy Tơ", "Vạn Mỹ", "Cầu Tre", "Lạc Viên", "Cầu Đất",
    "Gia Viên", "Đông Khê", "Ngọc Châu", "Haiphong"
  ],

  // Cần Thơ
  "CT-Ninh Kiều": [
    "Cái Khế", "An Hòa", "Thới Bình", "An Nghiệp", "An Cư", "Tân An",
    "An Phú", "Xuân Khánh", "Hưng Lợi", "An Khánh", "An Bình"
  ],
  "CT-Cái Răng": [
    "Lê Bình", "Hưng Phú", "Hưng Thạnh", "Ba Láng", "Thường Thạnh",
    "Phú Thứ", "Tân Phú", "Thạnh An"
  ]
};

// Hàm helper để tìm quận/huyện theo tỉnh
export const getDistrictsByProvince = (provinceCode) => {
  const province = VIETNAM_PROVINCES.find(p => p.code === provinceCode);
  return province ? province.districts : [];
};

// Hàm helper để tìm tên tỉnh theo code
export const getProvinceNameByCode = (provinceCode) => {
  const province = VIETNAM_PROVINCES.find(p => p.code === provinceCode);
  return province ? province.name : "";
};

// Hàm helper để tìm phường/xã theo tỉnh và quận
export const getWardsByDistrict = (provinceCode, districtName) => {
  if (!provinceCode || !districtName) return [];
  
  const key = `${provinceCode}-${districtName}`;
  return VIETNAM_WARDS[key] || [];
};

// Hàm helper để kiểm tra có dữ liệu phường/xã không
export const hasWardsData = (provinceCode, districtName) => {
  const key = `${provinceCode}-${districtName}`;
  return VIETNAM_WARDS.hasOwnProperty(key);
};