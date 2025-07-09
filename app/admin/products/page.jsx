import Link from "next/link";
import ListView from "./components/ListView";
export default function Page() {
    return (
        <main className="flex flex-col gap-4 p-6">
            <div className="flex justify-end items-center">
               
                <Link href={`/admin/products/form`}>
                    <button className="bg-blue-500 text-sm text-white px-4 py-2 rounded-lg hover:bg-blue-600" > Thêm sản phẩm</button>
                </Link>
            </div>
            <ListView />
        </main>
    )
}
