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
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/**
 * Email verification page with OTP
 * Users receive a 6-digit code via email after signup
 */
const VerifyEmail = () => {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{
    code: string;
  }>();

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      // TODO: Replace with actual API endpoint when backend implements OTP verification
      const response = await fetch(`${BACKEND_URL}/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ code: data.code }),
      });

      if (!response.ok) {
        throw new Error("Mã xác thực không hợp lệ");
      }

      const responseData = await response.json();
      console.log("Verification successful:", responseData);
      navigate("/");
    } catch (error) {
      console.error("Verification failed:", error);
      alert("Mã xác thực không hợp lệ. Vui lòng thử lại.");
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setResendMessage("");
    
    try {
      // TODO: Replace with actual API endpoint when backend implements resend OTP
      const response = await fetch(`${BACKEND_URL}/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Không thể gửi lại mã");
      }

      setResendMessage("Mã xác thực mới đã được gửi đến email của bạn!");
    } catch (error) {
      console.error("Resend failed:", error);
      setResendMessage("Không thể gửi lại mã. Vui lòng thử lại sau.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl p-6">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Xác thực email
          </CardTitle>
          <CardDescription className="text-base">
            Nhập mã 6 chữ số đã được gửi đến email của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mã xác thực
              </label>
              <Input
                {...register("code", {
                  required: "Vui lòng nhập mã xác thực",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "Mã xác thực phải gồm 6 chữ số",
                  },
                })}
                type="text"
                placeholder="123456"
                id="code"
                name="code"
                maxLength={6}
                className="h-11 text-center text-2xl tracking-widest font-mono"
              />
              {errors.code && (
                <p className="text-sm text-red-600">
                  {errors.code.message as string}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xác thực..." : "Xác thực"}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Không nhận được mã?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="font-semibold text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? "Đang gửi..." : "Gửi lại"}
              </button>
            </p>
            {resendMessage && (
              <p className={`text-sm ${resendMessage.includes("đã được gửi") ? "text-green-600" : "text-red-600"}`}>
                {resendMessage}
              </p>
            )}
          </div>

          <div className="text-center">
            <a
              href="/log-in"
              className="text-sm text-primary hover:underline"
            >
              Quay lại đăng nhập
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
