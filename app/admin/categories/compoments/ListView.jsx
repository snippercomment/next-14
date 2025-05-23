"use client";

import { CircularProgress } from "@nextui-org/react";
import { useCategories } from "@/lib/firestore/categories/read";


export default function ListView() {
    const { data: categories, error, isLoading } = useCategories();
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress />
            </div>
        )
    }
    if (error) {
        return <div>{error}</div>
    }
    return (
        <div className="bg-white p-5 rounded-xl">
            <h1>Danh mục</h1>
        </div>
    )
}