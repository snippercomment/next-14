"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { createUser } from "@/lib/firestore/user/write";
import { Button } from "@nextui-org/react";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
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
  const [rememberMe, setRememberMe] = useState(false);

  const [data, setData] = useState({});

  const handleData = (key, value) => {
    setData({
      ...data,
      [key]: value,
    });
  };

  // Load remembered credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const wasRemembered = localStorage.getItem("rememberMe") === "true";

    if (wasRemembered && savedEmail) {
      setData({
        email: savedEmail,
        password: savedPassword || "",
      });
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data?.email, data?.password);
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", data?.email);
        localStorage.setItem("rememberedPassword", data?.password);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
        localStorage.removeItem("rememberMe");
      }
      
      toast.success("Đăng nhập thành công");
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      router.push("/account");
    }
  }, [user]);

  return (
    <main className="w-full flex justify-center items-center bg-gray-300 md:p-24 p-10 min-h-screen">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 bg-white md:p-10 p-5 rounded-xl md:min-w-[440px] w-full">
          <h1 className="font-bold text-xl text-center">Đăng nhập bằng Email</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="flex flex-col gap-3"
          >
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
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="text-sm text-gray-600">
                Ghi nhớ tài khoản
              </label>
            </div>

            <Button
              isLoading={isLoading}
              isDisabled={isLoading}
              type="submit"
              color="primary"
            >
              Đăng nhập
            </Button>
          </form>
          <div className="flex justify-between">
            <Link href={`/sign-up`}>
              <button className="font-semibold text-sm text-blue-700">
                Tạo tài khoản
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
  );
}

function SignInWithGoogleComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = credential.user;
       
      await createUser({
        uid: user?.uid,
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        email: user?.email, 
      });
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