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
import { useEffect, useState } from "react";

/**
 * Edit profile page
 * User can update their profile information
 */
const EditProfile = () => {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<{
    fullName: string;
    email: string;
    address: string;
  }>();

  useEffect(() => {
    // Fetch current user data
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/whoami`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        
        // Pre-fill form with current data
        setValue("fullName", data.user?.fullName || "");
        setValue("email", data.user?.email || "");
        setValue("address", data.user?.address || "");
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [BACKEND_URL, setValue]);

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      // TODO: Replace with actual API endpoint when backend implements profile update
      const response = await fetch(`${BACKEND_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const responseData = await response.json();
      console.log("Profile updated:", responseData);
      
      alert("Cập nhật thông tin thành công!");
      navigate("/account");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-2xl shadow-xl p-6">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Chỉnh sửa thông tin cá nhân
          </CardTitle>
          <CardDescription className="text-base">
            Cập nhật thông tin tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Họ và tên
              </label>
              <Input
                {...register("fullName", {
                  required: "Vui lòng nhập họ và tên",
                  minLength: {
                    value: 3,
                    message: "Họ và tên phải có ít nhất 3 ký tự",
                  },
                })}
                type="text"
                placeholder="Nguyễn Văn A"
                id="fullName"
                name="fullName"
                className="h-11"
              />
              {errors.fullName && (
                <p className="text-sm text-red-600">
                  {errors.fullName.message as string}
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
                {...register("email")}
                type="email"
                id="email"
                name="email"
                className="h-11"
                disabled
                title="Email không thể thay đổi"
              />
              <p className="text-xs text-muted-foreground">
                Email không thể thay đổi
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="address"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Địa chỉ
              </label>
              <Input
                {...register("address", {
                  required: "Vui lòng nhập địa chỉ",
                  minLength: {
                    value: 10,
                    message: "Địa chỉ phải có ít nhất 10 ký tự",
                  },
                })}
                type="text"
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
                id="address"
                name="address"
                className="h-11"
              />
              {errors.address && (
                <p className="text-sm text-red-600">
                  {errors.address.message as string}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 h-11 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
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

export default EditProfile;
