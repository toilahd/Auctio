import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Lock, AlertCircle, CheckCircle2, Loader2, KeyRound } from "lucide-react";

/**
 * Reset password page
 * User enters new password with token from email link
 */
const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    setMessage(null);

    if (data.password !== data.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu không khớp" });
      return;
    }

    if (!token) {
      setMessage({ type: "error", text: "Token không hợp lệ" });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token: token,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Không thể đặt lại mật khẩu");
      }
      
      setMessage({ type: "success", text: "Mật khẩu đã được đặt lại thành công!" });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/log-in");
      }, 2000);
    } catch (error: any) {
      console.error("Password reset failed:", error);
      setMessage({ type: "error", text: error.message || "Đã xảy ra lỗi. Token có thể đã hết hạn." });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Link không hợp lệ
            </CardTitle>
            <CardDescription className="text-base">
              Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <Button
                onClick={() => window.location.href = "/forgot-password"}
                className="w-full h-11"
              >
                Yêu cầu link mới
              </Button>
              <Button
                onClick={() => window.location.href = "/log-in"}
                variant="ghost"
                className="w-full h-11"
              >
                Quay lại đăng nhập
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription className="text-base">
            Nhập mật khẩu mới của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    },
                  })}
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  className="h-11 pl-10"
                />
              </div>
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
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                  className="h-11 pl-10"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {errors.confirmPassword.message as string}
                </p>
              )}
            </div>

            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                {message.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đặt lại...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Đặt lại mật khẩu
                </>
              )}
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
