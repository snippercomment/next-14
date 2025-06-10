"use client";

import { auth } from "@/lib/firebase";
import { Button } from "@nextui-org/react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";


export default function Page() {
    const { user } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (user) {
            router.push("/account");
        }
    }, [user]);
    return <main className="w-full flex justify-center items-center bg-gray-300 md:p-24 p-10 min-h-screen">
        <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 bg-white md:p-10 p-5 rounded-xl md:min-w-[440px] w-full">

                <h1 className="text-xl font-bold text-center">Đăng nhập</h1>
                <form className="flex flex-col gap-3">
                    <input
                        placeholder="Email"
                        type="email"
                        name="user-email"
                        id="user-email"
                        className="px-3 py-2 rounded-xl border focus:outline-none w-full"
                    />
                    <input
                        placeholder="Mật khẩu"
                        type="password"
                        name="user-password"
                        id="user-password"
                        className="px-3 py-2 rounded-xl border focus:outline-none w-full"
                    />
                    <Button color="primary">Đăng nhập</Button>
                </form>
                <div className="flex justify-between">
                    <Link href={`/sign-up`}>
                        <button className="font-semibold text-sm text-blue-700">
                            Bạn chưa có tài khoản? Đăng ký
                        </button>
                    </Link>
                    <Link href={`/forget-password`}>
                        <button className="font-semibold text-sm text-blue-700">
                            Quên mật khẩu?
                        </button>
                    </Link>
                </div>
                <hr />
                <SignInWithGoogleComponent />
            </div>
        </section>
    </main>
}

function SignInWithGoogleComponent() {
    const [isLoading, setIsLoading] = useState(false);
    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const credential = await signInWithPopup(auth, new GoogleAuthProvider());
            // const user = credential.user;
            // await createUser({
            //   uid: user?.uid,
            //   displayName: user?.displayName,
            //   photoURL: user?.photoURL,
            // });
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    };
    return (
        <Button isLoading={isLoading} isDisabled={isLoading} onClick={handleLogin}>
           Đăng nhập bằng Google
        </Button>
    );
}