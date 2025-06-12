"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";

import { Button } from "@nextui-org/react";
import {
  sendPasswordResetEmail,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {  useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({});

  const handleData = (key, value) => {
    setData({
      ...data,
      [key]: value,
    });
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, data?.email);
      toast.success("Liên kết đặt lại đã được gửi đến email của bạn!");
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  return (
    <main className="w-full flex justify-center items-center bg-gray-300 md:p-24 p-10 min-h-screen">
      <section className="flex flex-col gap-3">
      
        <div className="flex flex-col gap-3 bg-white md:p-10 p-5 rounded-xl md:min-w-[440px] w-full">
          <h1 className="font-bold text-xl">Quên mật khẩu</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendEmail();
            }}
            className="flex flex-col gap-3"
          >
            <input
              placeholder="Nhập Email của bạn"
              type="email"
              name="user-email"
              id="user-email"
              value={data?.email}
              onChange={(e) => {
                handleData("email", e.target.value);
              }}
              className="px-3 py-2 rounded-xl border focus:outline-none w-full"
            />

            <Button
              isLoading={isLoading}
              isDisabled={isLoading}
              type="submit"
              color="primary"
            >
              Gửi liên kết đặt lại
            </Button>
          </form>
          <div className="flex justify-between">
            <Link href={`/login`}>
              <button className="font-semibold text-sm text-blue-700">
                Đăng nhập
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}