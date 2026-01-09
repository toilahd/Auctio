import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * Edit profile page
 * User can update their profile information
 */
const EditProfile = () => {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const { refreshAccessToken } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<{
    fullName: string;
    email: string;
    address: string;
    dateOfBirth: Date | undefined;
  }>({
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      dateOfBirth: undefined,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
  } = useForm<{
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();

  useEffect(() => {
    // Fetch current user data
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const result = await response.json();
        const data = result.data;

        // Pre-fill form with current data
        setValue("fullName", data?.fullName || "");
        setValue("email", data?.email || "");
        setValue("address", data?.address || "");

        // Set date of birth as Date object
        if (data?.dateOfBirth) {
          setValue("dateOfBirth", new Date(data.dateOfBirth));
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Không thể tải thông tin người dùng");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [BACKEND_URL, setValue]);

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      // Format date to ISO string for backend
      const formData = {
        ...data,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : null,
      };

      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update profile");
      }

      setSuccessMessage("Cập nhật thông tin thành công!");

      // Refresh user data in context
      await refreshAccessToken();

      setTimeout(() => {
        navigate(0);
      }, 1500);
    } catch (error: any) {
      console.error("Update failed:", error);
      setErrorMessage(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  const onPasswordSubmit: SubmitHandler<any> = async (data) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (data.newPassword !== data.confirmPassword) {
        setErrorMessage("Mật khẩu mới không khớp!");
        return;
      }

      if (data.newPassword.length < 6) {
        setErrorMessage("Mật khẩu mới phải có ít nhất 6 ký tự");
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to change password");
      }

      setSuccessMessage("Đổi mật khẩu thành công!");
      resetPassword();

      setTimeout(() => {
        setSuccessMessage("");
        setShowPasswordSection(false);
      }, 3000);
    } catch (error: any) {
      console.error("Password change failed:", error);
      setErrorMessage(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
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
      <div className="w-full max-w-2xl space-y-6">
        {/* Profile Information Card */}
        <Card className="shadow-xl pt-4">
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

              <div className="space-y-2">
                <label
                  htmlFor="dateOfBirth"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ngày sinh
                </label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value) return true; // Optional field
                      const today = new Date();
                      const birthDate = new Date(value);
                      const age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      const dayDiff = today.getDate() - birthDate.getDate();

                      // Calculate exact age
                      const exactAge =
                        monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)
                          ? age - 1
                          : age;

                      if (exactAge < 18) {
                        return "Bạn phải đủ 18 tuổi";
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Chọn ngày sinh</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          defaultMonth={field.value || new Date(2000, 0, 1)}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600">
                    {errors.dateOfBirth.message as string}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Bạn phải đủ 18 tuổi để sử dụng dịch vụ
                </p>
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

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Password Change Card */}
        <Card className="shadow-xl pt-4">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle className="text-2xl font-bold tracking-tight">
                Đổi mật khẩu
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              Cập nhật mật khẩu để bảo mật tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showPasswordSection ? (
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 text-base font-semibold"
                onClick={() => setShowPasswordSection(true)}
              >
                Thay đổi mật khẩu
              </Button>
            ) : (
              <form
                onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="oldPassword"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mật khẩu hiện tại
                  </label>
                  <Input
                    {...registerPassword("oldPassword", {
                      required: "Vui lòng nhập mật khẩu hiện tại",
                    })}
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    id="oldPassword"
                    name="oldPassword"
                    className="h-11"
                  />
                  {passwordErrors.oldPassword && (
                    <p className="text-sm text-red-600">
                      {passwordErrors.oldPassword.message as string}
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
                    {...registerPassword("newPassword", {
                      required: "Vui lòng nhập mật khẩu mới",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự",
                      },
                    })}
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    id="newPassword"
                    name="newPassword"
                    className="h-11"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-600">
                      {passwordErrors.newPassword.message as string}
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
                    {...registerPassword("confirmPassword", {
                      required: "Vui lòng xác nhận mật khẩu mới",
                    })}
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="h-11"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {passwordErrors.confirmPassword.message as string}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 h-11 text-base font-semibold"
                    disabled={isPasswordSubmitting}
                  >
                    {isPasswordSubmitting ? "Đang đổi..." : "Đổi mật khẩu"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 text-base font-semibold"
                    onClick={() => {
                      setShowPasswordSection(false);
                      resetPassword();
                      setErrorMessage("");
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
