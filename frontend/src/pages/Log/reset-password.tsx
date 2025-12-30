import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

/**
 * Reset password page
 * User enters new password with token from email link
 */
const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<{
    password: string;
    confirmPassword: string;
  }>();

  const password = watch("password");

  const onSubmit: SubmitHandler<any> = async (data) => {
    setErrorMessage("");

    if (data.password !== data.confirmPassword) {
      setErrorMessage("Mật khẩu không khớp");
      return;
    }

    if (!token) {
      setErrorMessage("Token không hợp lệ");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Không thể đặt lại mật khẩu");
      }
      
      alert("Mật khẩu đã được đặt lại thành công!");
      navigate("/log-in");
    } catch (error: any) {
      console.error("Password reset failed:", error);
      setErrorMessage(error.message || "Đã xảy ra lỗi. Token có thể đã hết hạn.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md shadow-xl p-6">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Link không hợp lệ
            </CardTitle>
            <CardDescription className="text-base">
              Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Yêu cầu link mới
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl p-6">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription className="text-base">
            Nhập mật khẩu mới của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mật khẩu mới
              </label>
              <Input
                {...register("password", {
                  required: "Vui lòng nhập mật khẩu",
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                    message:
                      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số",
                  },
                })}
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                className="h-11"
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Xác nhận mật khẩu
              </label>
              <Input
                {...register("confirmPassword", {
                  required: "Vui lòng xác nhận mật khẩu",
                  validate: (value) =>
                    value === password || "Mật khẩu không khớp",
                })}
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                className="h-11"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {errors.confirmPassword.message as string}
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
            </Button>
          </form>

          <div className="text-center">
            <a href="/log-in" className="text-sm text-primary hover:underline">
              Quay lại đăng nhập
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
