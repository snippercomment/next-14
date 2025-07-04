import Link from "next/link";
import ListView from "./components/ListView";
export default function Page() {
    return (
        <main className="flex flex-col gap-4 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl">Sản phẩm</h1>
                <Link href={`/admin/products/form`}>
                    <button className="bg-[#313131] text-sm text-white px-4 py-2 rounded-lg">Tạo sản phẩm</button>
                </Link>
            </div>
            <ListView />
        </main>
    )
}
