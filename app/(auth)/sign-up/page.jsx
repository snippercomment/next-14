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
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Thêm state để quản lý trạng thái validation
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [data, setData] = useState({});

  const handleData = (key, value) => {
    setData({
      ...data,
      [key]: value,
    });
  };

  // Function kiểm tra mật khẩu
  const isPasswordValid = (password) => {
    return password && password.length >= 6;
  };

  // Function để lấy thông báo mật khẩu
  const getPasswordMessage = () => {
    if (!data?.password) {
      return { text: "Mật khẩu tối thiểu 6 ký tự", type: "hint" };
    }
    if (data.password.length < 6) {
      return { text: `Còn thiếu ${6 - data.password.length} ký tự`, type: "error" };
    }
    return { text: "Mật khẩu hợp lệ", type: "success" };
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

  useEffect(() => {
    if (user) {
      router.push("/account");
    }
  }, [user]);

  return (
    <main className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
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
         
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản mới</h1>
        </div>

        {/* Form container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transition-all duration-300 hover:shadow-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
            className="space-y-6"
          >
            {/* Name input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Tên đầy đủ
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  placeholder="Nhập tên của bạn"
                  type="text"
                  name="user-name"
                  id="user-name"
                  value={data?.name || ""}
                  onChange={(e) => {
                    handleData("name", e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
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
                    if (!passwordTouched) setPasswordTouched(true);
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${
                    passwordTouched && !isPasswordValid(data?.password)
                      ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                      : 'border-gray-200 focus:ring-green-500 focus:border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Thông báo mật khẩu thông minh */}
              {(passwordFocused || passwordTouched) && (
                <div className={`text-xs mt-1 transition-all duration-200 ${
                  getPasswordMessage().type === 'error' 
                    ? 'text-red-500' 
                    : getPasswordMessage().type === 'success'
                    ? 'text-green-500'
                    : 'text-gray-500'
                }`}>
                  {getPasswordMessage().text}
                </div>
              )}
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                Tôi đồng ý với{" "}
                <span className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                  Điều khoản sử dụng
                </span>{" "}
                và{" "}
                <span className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                  Chính sách bảo mật
                </span>
              </label>
            </div>

            {/* Sign up button */}
            <Button
              isLoading={isLoading}
              isDisabled={isLoading}
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </Button>
          </form>

          {/* Sign in link */}
          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-gray-600">
              Đã có tài khoản?{" "}
              <Link href="/login">
                <span className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Đăng nhập ngay
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}