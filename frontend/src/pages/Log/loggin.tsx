import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GoogleIcon from "./google";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const RE_SITE_KEY = import.meta.env.VITE_RE_SITE_KEY;

  const googleLogin = async () => {
    window.location.href = `${BACKEND_URL}/login/federated/google`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    email: string;
    password: string;
  }>();

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      console.log("Login successful:", responseData);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl p-6">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-base">
            Đăng nhập vào tài khoản của bạn để đấu giá và mua sắm các sản phẩm
            yêu thích.
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
                  required: true,
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Địa chỉ email không hợp lệ",
                  },
                })}
                type="email"
                placeholder="nguyena@example.com"
                id="email"
                name="email"
                required
                className="h-11"
              />
              {errors.email && (
                <p className="text-sm text-red-600">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mật khẩu
                </label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
              <Input
                {...register("password", {
                  required: true,
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
                required
                className="h-11"
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2 flex justify-center">
              <ReCAPTCHA
                sitekey={RE_SITE_KEY}
                onChange={(value: any) => {
                  console.log(value);
                }}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
            >
              Đăng nhập
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <Button
            onClick={googleLogin}
            variant="outline"
            className="w-full h-11 text-base font-semibold"
          >
            <GoogleIcon />
            Đăng nhập với Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Bạn chưa có tài khoản?{" "}
            <a
              href="/sign-up"
              className="font-semibold text-primary hover:underline"
            >
              Đăng ký
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
