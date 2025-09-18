import {
  Funnel,
  Truck,
  DollarSign,
  HardDrive,
  Cpu,
  Bluetooth,
  Lightbulb,
  Settings,
  Mic,
  Headphones,
  Usb,
  Gamepad2,
  Music,
  Phone,
  Smartphone,
} from "lucide-react";

export const filterData = {
  laptop: [
    { key: "stock", label: "Sẵn sàng", icon: Truck, type: "button" },
    { key: "price", label: "Xem theo giá", icon: DollarSign, type: "price" },
    {
      key: "ocung",
      label: "Ổ cứng",
      icon: HardDrive,
      type: "dropdown",
      options: ["256GB", "512GB", "1TB", "2TB"],
    },
    {
      key: "ram",
      label: "Dung lượng RAM",
      icon: Funnel,
      type: "dropdown",
      options: ["8GB", "16GB", "24GB", "32GB", "64GB"],
    },
    {
      key: "cpu",
      label: "CPU",
      icon: Cpu,
      type: "dropdown",
      options: ["Intel Core i3", "Intel Core i5", "Intel Core i7"],
    },
  ],

  mouse: [
    { key: "stock", label: "Sẵn sàng", icon: Truck, type: "button" },
    { key: "price", label: "Xem theo giá", icon: DollarSign, type: "price" },
    {
      key: "ketnoi",
      label: "Kết nối",
      icon: Bluetooth,
      type: "dropdown",
      options: ["Bluetooth", "Có dây"],
    },
    {
      key: "denled",
      label: "Đèn LED",
      icon: Lightbulb,
      type: "dropdown",
      options: ["LED RGB", "Không LED"],
    },
    {
      key: "tienich",
      label: "Tiện ích",
      icon: Settings,
      type: "dropdown",
      options: ["Có sạc", "Không tiếng ồn"],
    },
  ],

  headphone: [
    { key: "stock", label: "Sẵn sàng", icon: Truck, type: "button" },
    { key: "price", label: "Xem theo giá", icon: DollarSign, type: "price" },
    {
      key: "tinhnang",
      label: "Tính năng",
      icon: Headphones,
      type: "dropdown",
      options: ["Có mic", "Chống ồn", "Sạc không dây"],
    },
    {
      key: "congketnoi",
      label: "Cổng kết nối",
      icon: Usb,
      type: "dropdown",
      options: ["3.5mm", "USB", "Type C"],
    },
    {
      key: "nhuacusudung",
      label: "Nhu cầu sử dụng",
      icon: Music,
      type: "dropdown",
      options: ["Chơi game", "Nghe nhạc", "Nghe gọi tốt"],
    },
  ],

  phone: [
    { key: "stock", label: "Sẵn sàng", icon: Truck, type: "button" },
    { key: "price", label: "Xem theo giá", icon: DollarSign, type: "price" },
    {
      key: "ram",
      label: "Dung lượng RAM",
      icon: Funnel,
      type: "dropdown",
      options: ["4GB", "6GB", "8GB", "12GB", "16GB"],
    },
    {
      key: "loaidienthoai",
      label: "Loại điện thoại",
      icon: Smartphone,
      type: "dropdown",
      options: ["iPhone", "Android"],
    },
  ],
};