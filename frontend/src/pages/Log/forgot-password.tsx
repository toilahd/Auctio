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
import { useState } from "react";

/**
 * Forgot password page
 * User enters email to receive password reset link
 */
const ForgotPassword = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{
    email: string;
  }>();

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Không thể gửi email đặt lại mật khẩu");
      }

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Forgot password failed:", error);
      alert(error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md shadow-xl p-6">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Kiểm tra email của bạn
            </CardTitle>
            <CardDescription className="text-base">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Nếu bạn không nhận được email trong vài phút, vui lòng kiểm tra
                thư mục spam hoặc thử lại.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full h-11"
              >
                Gửi lại email
              </Button>
              <a
                href="/log-in"
                className="text-sm text-primary hover:underline block"
              >
                Quay lại đăng nhập
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
            Quên mật khẩu?
          </CardTitle>
          <CardDescription className="text-base">
            Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email
              </label>
              <Input
                {...register("email", {
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Địa chỉ email không hợp lệ",
                  },
                })}
                type="email"
                placeholder="nguyena@example.com"
                id="email"
                name="email"
                className="h-11"
              />
              {errors.email && (
                <p className="text-sm text-red-600">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi hướng dẫn"}
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

export default ForgotPassword;
