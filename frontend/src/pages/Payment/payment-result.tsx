import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  
  const apptransid = searchParams.get("apptransid");
  const amount = searchParams.get("amount");
  const type = searchParams.get("type"); // 'seller' or 'auction'

  useEffect(() => {
    // Check payment status
    // In production, you would verify with backend
    // For now, assume success if apptransid exists
    const timer = setTimeout(() => {
      if (apptransid) {
        setStatus("success");
        
        // Update user role in cookie if seller upgrade
        if (type === "seller") {
          const userCookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("user="));
          
          if (userCookie) {
            const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
            const updatedUser = { ...user, role: "SELLER" };
            document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/`;
          }
        }
      } else {
        setStatus("failed");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [apptransid, type]);

  const handleContinue = () => {
    if (type === "seller") {
      navigate("/profile");
    } else if (type === "auction") {
      navigate("/my-bids");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Kết quả thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "loading" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <p className="text-muted-foreground">Đang xử lý thanh toán...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h3 className="text-xl font-semibold text-green-600">
                  Thanh toán thành công!
                </h3>
                {type === "seller" && (
                  <p className="text-center text-muted-foreground">
                    Bạn đã được nâng cấp lên tài khoản Seller thành công.
                    <br />
                    Thời gian hiệu lực: 7 ngày
                  </p>
                )}
                {type === "auction" && (
                  <p className="text-center text-muted-foreground">
                    Thanh toán đấu giá thành công.
                    <br />
                    Người bán sẽ liên hệ với bạn sớm.
                  </p>
                )}
                {amount && (
                  <p className="text-sm text-muted-foreground">
                    Số tiền: {parseInt(amount).toLocaleString("vi-VN")} VND
                  </p>
                )}
                {apptransid && (
                  <p className="text-xs text-muted-foreground">
                    Mã giao dịch: {apptransid}
                  </p>
                )}
                <Button onClick={handleContinue} className="mt-4">
                  Tiếp tục
                </Button>
              </div>
            )}

            {status === "failed" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <XCircle className="w-16 h-16 text-red-500" />
                <h3 className="text-xl font-semibold text-red-600">
                  Thanh toán thất bại
                </h3>
                <p className="text-center text-muted-foreground">
                  Giao dịch không thành công. Vui lòng thử lại.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Quay lại
                  </Button>
                  <Button onClick={() => navigate("/")}>
                    Về trang chủ
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentResultPage;
