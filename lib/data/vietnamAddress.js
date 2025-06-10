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