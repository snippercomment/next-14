import Link from "next/link";

export default function Header(){
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
  return(
    <nav className="py-4 px-14 border-b flex items-center justify-between">
        <img className="h-9" src="/logo.png" alt="logo"/>
        <div className="flex gap-4 items-center">
            {menuList?.map((item)=>{
                return (
                    <Link href={item?.link}>
                            <button>{item?.name}</button>
                    </Link>
                )
            })}
        </div>
       <Link href={"/login"}> <button className="bg-blue-600 px-5 py-2 font-bold rounded text-white">Đăng nhập</button></Link>
    </nav>
  )

}