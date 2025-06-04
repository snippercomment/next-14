import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";


export default function Page({searchParams}){
    const checkoutId = searchParams;
    return <main>
        <Header/>
        <section className="min-h-screen flex flex-col gap-3 justify-center items-center">
           <div className="flex justify-center w-full">
               <img src="/svgs/Mobile payments-rafiki.svg" className="h-48" alt="" />
           </div>
            <h1 className="text-2xl font-semibold">Thanh toán của bạn không thành công</h1>
        </section>
        <Footer/>
    </main>
}