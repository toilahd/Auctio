import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2, CheckCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const SellerUpgradePaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const [isProcessing, setIsProcessing] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const PAYMENT_AMOUNT = 500000; // 500,000 VND for 7 days

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Create ZaloPay payment order
      const response = await fetch(`${BACKEND_URL}/api/payment/seller-upgrade/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to ZaloPay payment gateway
        window.location.href = data.data.order_url;
      } else {
        alert(data.message || "Không thể tạo đơn thanh toán");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Đã xảy ra lỗi khi xử lý thanh toán");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      navigate("/profile");
    }
  }, [userId, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <CreditCard className="w-6 h-6" />
              Thanh toán nâng cấp Seller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gói dịch vụ:</span>
                <span className="font-semibold">Seller - 7 ngày</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Phương thức:</span>
                <span className="font-semibold">ZaloPay</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tổng thanh toán:</span>
                <span className="text-2xl font-bold text-primary">
                  {PAYMENT_AMOUNT.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-foreground">Quyền lợi:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Đăng sản phẩm đấu giá không giới hạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Quản lý sản phẩm và đơn hàng</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Trả lời câu hỏi từ người mua</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Dashboard thống kê chi tiết</span>
                </li>
              </ul>
            </div>

            {/* Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Lưu ý:</strong> Đây là trang thanh toán demo. Trong môi trường thực tế, 
                bạn sẽ được chuyển đến cổng thanh toán ZaloPay.
              </p>
            </div>

            {/* Payment Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Thanh toán ngay
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/account")}
              disabled={isProcessing}
            >
              Hủy
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SellerUpgradePaymentPage;
