"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { createUser } from "@/lib/firestore/user/write";
import { Button } from "@nextui-org/react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [data, setData] = useState({});

  const handleData = (key, value) => {
    setData({
      ...data,
      [key]: value,
    });
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        data?.email,
        data?.password
      );
      await updateProfile(credential.user, {
        displayName: data?.name,
      });
      const user = credential.user;
      await createUser({
        uid: user?.uid,
        displayName: data?.name,
        photoURL: user?.photoURL,
        email: user?.email,
      });
      
      // Save credentials to localStorage for login page
      localStorage.setItem("rememberedEmail", data?.email);
      localStorage.setItem("rememberedPassword", data?.password);
      localStorage.setItem("rememberMe", "true");
      
      toast.success("Đăng ký thành công");
      router.push("/account");
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  return (
    <main className="w-full flex justify-center items-center bg-gray-300 md:p-24 p-10 min-h-screen">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 bg-white md:p-10 p-5 rounded-xl md:min-w-[440px] w-full">
          <h1 className="font-bold text-xl text-center">Đăng ký bằng Email</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
            className="flex flex-col gap-3"
          >
            <input
              placeholder="Nhập tên của bạn"
              type="text"
              name="user-name"
              id="user-name"
              value={data?.name || ""}
              onChange={(e) => {
                handleData("name", e.target.value);
              }}
              className="px-3 py-2 rounded-xl border focus:outline-none w-full"
            />
            <input
              placeholder="Nhập Email của bạn"
              type="email"
              name="user-email"
              id="user-email"
              value={data?.email || ""}
              onChange={(e) => {
                handleData("email", e.target.value);
              }}
              className="px-3 py-2 rounded-xl border focus:outline-none w-full"
            />
            <div className="relative">
              <input
                placeholder="Nhập mật khẩu của bạn"
                type={showPassword ? "text" : "password"}
                name="user-password"
                id="user-password"
                value={data?.password || ""}
                onChange={(e) => {
                  handleData("password", e.target.value);
                }}
                className="px-3 py-2 rounded-xl border focus:outline-none w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button
              isLoading={isLoading}
              isDisabled={isLoading}
              type="submit"
              color="primary"
            >
              Đăng ký
            </Button>
          </form>
          <div className="flex justify-between">
            <Link href={`/login`}>
              <button className="font-semibold text-sm text-blue-700">
                Đã là người dùng? Đăng nhập
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}