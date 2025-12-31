import { Button } from "@/components/ui/button";
import { InputOTP } from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";

/**
 * Email verification page with OTP
 * Users receive a 6-digit code via email after signup
 * Supports URL parameter: ?otp=123456 for direct verification
 */
const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, resendOTP, refreshAccessToken } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auto-fill OTP from URL parameter and verify if complete
  useEffect(() => {
    const otpParam = searchParams.get("otp");
    if (otpParam && /^[0-9]{6}$/.test(otpParam)) {
      setOtp(otpParam);
      // Auto-submit if OTP is in URL
      handleVerify(otpParam);
    }
  }, [searchParams]);

  // Redirect if already verified
  useEffect(() => {
    if (user?.isVerified) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleVerify = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp;
    
    if (codeToVerify.length !== 6) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ 6 chữ số" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${BACKEND_URL}/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ otp: codeToVerify }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Mã xác thực không hợp lệ");
      }

      setMessage({ type: "success", text: "Xác thực thành công!" });
      
      // Refresh user data
      await refreshAccessToken();
      
      // Redirect after 1 second
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error: any) {
      console.error("Verification failed:", error);
      setMessage({ 
        type: "error", 
        text: error.message || "Mã xác thực không hợp lệ. Vui lòng thử lại." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setMessage(null);
    
    try {
      const result = await resendOTP();
      
      setMessage({ 
        type: result.success ? "success" : "error", 
        text: result.message 
      });
    } catch (error) {
      console.error("Resend failed:", error);
      setMessage({ 
        type: "error", 
        text: "Không thể gửi lại mã. Vui lòng thử lại sau." 
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPComplete = (value: string) => {
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl py-4">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Xác thực email
          </CardTitle>
          <CardDescription className="text-base">
            Nhập mã 6 chữ số đã được gửi đến email của bạn
          </CardDescription>
          {user?.email && (
            <p className="text-sm text-muted-foreground font-medium">
              {user.email}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <InputOTP
              length={6}
              value={otp}
              onChange={setOtp}
              onComplete={handleOTPComplete}
              disabled={isSubmitting}
              className="w-full"
            />

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
              onClick={() => handleVerify()}
              className="w-full h-11 text-base font-semibold"
              disabled={isSubmitting || otp.length !== 6}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                "Xác thực"
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Không nhận được mã?
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi lại mã"
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
