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
 * Login page for existing users
 * @returns
 */
const Login = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const googleLogin = async () => {
    window.location.href = `${BACKEND_URL}/login/federated/google`;
  };

  const { register, handleSubmit } = useForm<{
    email: string;
    password: string;
  }>();

  const onSubmit: SubmitHandler<any> = (data) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl p-6">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to your account to continue
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
                {...register("email", { required: true })}
                type="email"
                placeholder="name@example.com"
                id="email"
                name="email"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Password
                </label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                {...register("password", { required: true })}
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
            >
              Sign in
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            onClick={googleLogin}
            variant="outline"
            className="w-full h-11 text-base font-semibold"
          >
            <GoogleIcon />
            Sign in with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a
              href="/sign-up"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
