import Link from "next/link";

export default function Header() {
  const menuList = [
    {
      name: "Trang chủ",
      link: "/",
    },
    {
      name: "Điện thoại",
      link: "/phone",
    },
    {
      name: "LapTop",
      link: "/laptop",
    },
    {
      name: "Phụ kiện",
      link: "/accessory",
    },
    {
      name: "Quần áo",
      link: "/cloes",
    },
  ];
  return (
    <nav className="sticky top-0 z-50 bg-white bg-opacity-65 backdrop-blur-2xl py-3 px-4 md:py-4 md:px-16 border-b flex items-center justify-between">
      <Link href={"/"}>
        <img className="h-4 md:h-5" src="/logo.png" alt="Logo" />
      </Link>
      <div className="hidden md:flex gap-2 items-center font-semiboldr">
        {menuList?.map((item) => {
          return (
            <Link href={item?.link}>
              <button className="text-sm px-4 py-2 rounded-lg hover:bg-gray-50">{item?.name}</button>
            </Link>
          )
        })}
      </div>
      <Link href={"/login"}> <button className="bg-blue-600 px-5 py-2 font-bold rounded text-white">Đăng nhập</button></Link>
    </nav>
  )

}