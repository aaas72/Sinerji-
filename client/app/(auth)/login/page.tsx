"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const { user } = await authService.login(data);

      login(user);

      if (user.role === "student") {
        router.push("/student");
      } else {
        router.push("/company/dashboard");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#004d40] p-4">
      <div className="flex w-full max-w-5xl overflow-hidden ">
        {/* Left Side - Banner */}
        <div className="hidden lg:flex lg:w-1/2  flex-col justify-center items-center text-white p-12 relative">
          <div className="z-10 text-center max-w-lg">
            <h1 className="text-4xl font-bold mb-4">Welcome Back,</h1>
            <p className="text-xl mb-12 text-gray-200">
              Your next opportunity is waiting for you.
            </p>
            <div className="relative w-full h-[300px]">
              <Image
                src="/opportunity.png"
                alt="Opportunity Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-[500px] h-[500px] flex items-center justify-center p-0  bg-white rounded-2xl">
          <div className="w-full max-w-md">
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004d40] bg-gray-50"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004d40] bg-gray-50"
                  placeholder="********"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#004d40] hover:bg-[#003830] text-white py-3 text-lg rounded-md mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 flex flex-col items-center space-y-3 text-sm text-gray-600">
              <Link href="#" className="hover:text-[#004d40] underline">
                Forgot Password?
              </Link>
              <Link
                href="/register"
                className="hover:text-[#004d40] underline font-medium"
              >
                Register Here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
