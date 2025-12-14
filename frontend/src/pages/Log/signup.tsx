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

/**
 * Sign up page for new users
 * @returns
 */
const SignUp = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const googleLogin = async () => {
    window.location.href = `${BACKEND_URL}/login/federated/google`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    username: string;
    email: string;
    password: string;
    address: string;
    confirmPassword: string;
  }>();

  const onSubmit: SubmitHandler<any> = (data) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl p-6">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Tạo tài khoản
          </CardTitle>
          <CardDescription className="text-base">
            Nhập thông tin của bạn để bắt đầu đấu giá và mua sắm các sản phẩm
            yêu thích.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Họ và tên
              </label>
              {/* User name must have at least two words and appropriate error message */}
              <Input
                {...register("username", {
                  required: true,
                  minLength: {
                    value: 3,
                    message: "Họ và tên phải có ít nhất 3 ký tự",
                  },
                  pattern: {
                    value: /^[a-zA-Z]+ [a-zA-Z]+/,
                    message: "Họ và tên phải có ít nhất hai từ",
                  },
                })}
                type="text"
                placeholder="Nguyễn A"
                id="username"
                name="username"
                required
                className="h-11"
              />
              {errors.username && (
                <p className="text-sm text-red-600">
                  {errors.username.message as string}
                </p>
              )}
            </div>

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
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mật khẩu
              </label>
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
            {/* <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Confirm Password
              </label>
              <Input
                {...register("confirmPassword", { required: true })}
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                required
                className="h-11"
              />
            </div> */}

            <div className="space-y-2">
              <label
                htmlFor="address"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Địa chỉ
              </label>
              <Input
                {...register("address", { required: true })}
                type="text"
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
                id="address"
                name="address"
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
            >
              Tạo tài khoản
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
            Đăng ký với Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Bạn đã có tài khoản?{" "}
            <a
              href="/log-in"
              className="font-semibold text-primary hover:underline"
            >
              Đăng nhập
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
