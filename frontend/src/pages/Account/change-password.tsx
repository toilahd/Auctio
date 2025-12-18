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
 * Change password page
 * User can change their password while logged in
 */
const ChangePassword = () => {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();

  const newPassword = watch("newPassword");

  const onSubmit: SubmitHandler<any> = async (data) => {
    setErrorMessage("");

    if (data.newPassword !== data.confirmPassword) {
      setErrorMessage("Mật khẩu mới không khớp");
      return;
    }

    try {
      // TODO: Replace with actual API endpoint when backend implements password change
      const response = await fetch(`${BACKEND_URL}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      const responseData = await response.json();
      console.log("Password changed:", responseData);
      
      alert("Đổi mật khẩu thành công!");
      navigate("/account");
    } catch (error: any) {
      console.error("Password change failed:", error);
      setErrorMessage(
        error.message === "Invalid current password"
          ? "Mật khẩu hiện tại không đúng"
          : "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl p-6">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Đổi mật khẩu
          </CardTitle>
          <CardDescription className="text-base">
            Nhập mật khẩu hiện tại và mật khẩu mới
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="currentPassword"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mật khẩu hiện tại
              </label>
              <Input
                {...register("currentPassword", {
                  required: "Vui lòng nhập mật khẩu hiện tại",
                })}
                type="password"
                id="currentPassword"
                name="currentPassword"
                placeholder="••••••••"
                className="h-11"
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-600">
                  {errors.currentPassword.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mật khẩu mới
              </label>
              <Input
                {...register("newPassword", {
                  required: "Vui lòng nhập mật khẩu mới",
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                    message:
                      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số",
                  },
                })}
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="••••••••"
                className="h-11"
              />
              {errors.newPassword && (
                <p className="text-sm text-red-600">
                  {errors.newPassword.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Xác nhận mật khẩu mới
              </label>
              <Input
                {...register("confirmPassword", {
                  required: "Vui lòng xác nhận mật khẩu",
                  validate: (value) =>
                    value === newPassword || "Mật khẩu không khớp",
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

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 h-11 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang đổi..." : "Đổi mật khẩu"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 text-base font-semibold"
                onClick={() => navigate("/account")}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
