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
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";

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
    <main className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Back button */}
      <Link href="/" className="absolute top-6 left-6 z-10">
        <button className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 text-gray-700 hover:bg-white hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Quay lại</span>
        </button>
      </Link>

      <div className="w-full max-w-md">
        {/* Header với logo/branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h1>
      
        </div>

        {/* Form container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transition-all duration-300 hover:shadow-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-6"
          >
            {/* Email input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  placeholder="Nhập email của bạn"
                  type="email"
                  name="user-email"
                  id="user-email"
                  value={data?.email || ""}
                  onChange={(e) => {
                    handleData("email", e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  placeholder="Nhập mật khẩu của bạn"
                  type={showPassword ? "text" : "password"}
                  name="user-password"
                  id="user-password"
                  value={data?.password || ""}
                  onChange={(e) => {
                    handleData("password", e.target.value);
                  }}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="remember-me" className="text-sm text-gray-600">
                  Ghi nhớ tài khoản
                </label>
              </div>
              <Link href="/forget-password">
                <span className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Quên mật khẩu?
                </span>
              </Link>
            </div>

            {/* Login button */}
            <Button
              isLoading={isLoading}
              isDisabled={isLoading}
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500 bg-white">hoặc</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Google sign in */}
          <SignInWithGoogleComponent />

          {/* Sign up link */}
          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/sign-up">
                <span className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Đăng ký ngay
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
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
    <Button
      isLoading={isLoading}
      isDisabled={isLoading}
      onClick={handleLogin}
      className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl border border-gray-200 transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
    >
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>{isLoading ? "Đang đăng nhập..." : "Đăng nhập bằng Google"}</span>
      </div>
    </Button>
  );
}