"use client";

import Form from "./compoments/Form";
import ListView from "./compoments/ListView";

export default function Page() {
    return <main className="p-5 flex flex-col md:flex-row gap-5">
        <Form />
        <ListView />
    </main>
}