/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Màu thương hiệu
        primary: "#B80015",      // đỏ chính
       
        // Trạng thái
        success: "#28A745",      // xanh thành công
        warning: "#FFC107",      // vàng cảnh báo
        danger: "#FF4D4F",       // đỏ cảnh báo / nút xoá

        // Text
        main: "#000000",         // chữ chính (đen)
        sub: "#333333",          // chữ phụ (xám đậm)
        muted: "#666666",        // chữ mờ
        faded: "#999999",        // giá gốc

        // Border & nền
        border: "#E5E5E5",
        surface: "#F5F5F5",      // nền phụ (section)
        background: "#FFFFFF",   // nền chính (trắng)
      },
    },
  },
  plugins: [nextui()],
};
