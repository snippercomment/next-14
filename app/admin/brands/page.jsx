"use client";


import ListView from "./components/ListView";
import Form from "./components/Form";
export default function Page() {
    return (
        <main className="p-5 flex flex-col md:flex-row gap-5">
            <Form />
            <ListView />
        </main>
    );
}