import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import Link from "next/link";


export default function Page({searchParams}){
    const checkoutId = searchParams;
    return <main>
        <Header/>
        <section className="min-h-screen flex flex-col gap-3 justify-center items-center">
           <div className="flex justify-center w-full">
               <img src="/svgs/Mobile payments-rafiki.svg" className="h-48" alt="" />
           </div>
            <h1 className="text-2xl font-semibold">Đơn hàng của bạn đã được đặt thành công</h1>
            <div className="flex item-center gap-4 text-sm">
                <Link href={"/account"}>
                    <button className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg bg-white">Đi đến trang đơn hàng</button>
                </Link>
               
            </div>
        </section>
        <Footer/>
    </main>
}