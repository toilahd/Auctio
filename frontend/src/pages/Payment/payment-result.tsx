import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [transactionId, setTransactionId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [upgradeStatus, setUpgradeStatus] = useState<
    "approved" | "pending" | "rejected" | null
  >(null);

  // ZaloPay parameters
  const apptransid = searchParams.get("apptransid");
  const amount = searchParams.get("amount");

  // Stripe parameters
  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  // Common parameters
  const type = searchParams.get("type"); // 'seller' or 'auction'
  const orderId = searchParams.get("orderId"); // For auction payments

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Determine payment provider
        const isStripe = !!paymentIntent;
        const isZaloPay = !!apptransid;

        if (isStripe) {
          // Stripe payment verification
          if (redirectStatus === "succeeded") {
            setTransactionId(paymentIntent);
            setStatus("success");

            // For seller upgrade, check approval status
            if (type === "seller") {
              try {
                const response = await fetch(
                  `${BACKEND_URL}/api/users/profile`,
                  {
                    credentials: "include",
                  }
                );
                const data = await response.json();

                if (data.success && data.data) {
                  // Check if user is already a SELLER (approved)
                  if (data.data.role === "SELLER") {
                    setUpgradeStatus("approved");
                  } else if (data.data.upgradeStatus === "PENDING") {
                    setUpgradeStatus("pending");
                  } else if (data.data.upgradeStatus === "REJECTED") {
                    setUpgradeStatus("rejected");
                  } else {
                    setUpgradeStatus("pending"); // Default to pending
                  }
                }
              } catch (error) {
                console.error("Error fetching upgrade status:", error);
                setUpgradeStatus("pending"); // Default to pending on error
              }
            }
          } else if (redirectStatus === "failed") {
            setStatus("failed");
          } else {
            // Processing or unknown status
            setStatus("loading");
          }
        } else if (isZaloPay) {
          // ZaloPay payment verification
          setTransactionId(apptransid);
          setStatus("success");

          if (amount) {
            setPaymentAmount(parseInt(amount));
          }
        } else {
          // No valid payment parameters
          setStatus("failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
      }
    };

    const timer = setTimeout(verifyPayment, 1500);
    return () => clearTimeout(timer);
  }, [apptransid, amount, type, paymentIntent, redirectStatus]);

  const handleContinue = () => {
    if (type === "seller") {
      navigate("/profile?upgradeSuccess=true");
    } else if (type === "auction") {
      if (orderId) {
        navigate(`/order/${orderId}`, { replace: true });
      } else {
        navigate("/my-bids");
      }
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
                <p className="text-muted-foreground">
                  Đang xử lý thanh toán...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h3 className="text-xl font-semibold text-green-600">
                  Thanh toán thành công!
                </h3>

                {/* Seller upgrade with approval states */}
                {type === "seller" && upgradeStatus === "approved" && (
                  <p className="text-center text-muted-foreground">
                    Bạn đã được nâng cấp lên tài khoản Seller thành công.
                    <br />
                    Thời gian hiệu lực: 7 ngày
                  </p>
                )}

                {type === "seller" && upgradeStatus === "pending" && (
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-amber-600">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Chờ phê duyệt</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Thanh toán của bạn đã được xác nhận thành công.
                      <br />
                      Yêu cầu nâng cấp đang chờ quản trị viên phê duyệt.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        Bạn sẽ nhận được thông báo khi yêu cầu được xử lý. Thời
                        gian xử lý thường trong vòng 24 giờ.
                      </p>
                    </div>
                  </div>
                )}

                {type === "seller" && upgradeStatus === "rejected" && (
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Yêu cầu bị từ chối</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Thanh toán đã thành công nhưng yêu cầu nâng cấp của bạn đã
                      bị từ chối.
                      <br />
                      Vui lòng liên hệ quản trị viên để biết thêm chi tiết.
                    </p>
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                      <p className="text-xs text-red-800 dark:text-red-200">
                        Số tiền thanh toán sẽ được hoàn lại trong vòng 3-5 ngày
                        làm việc.
                      </p>
                    </div>
                  </div>
                )}

                {type === "auction" && (
                  <p className="text-center text-muted-foreground">
                    Thanh toán đấu giá thành công.
                    <br />
                    Người bán sẽ liên hệ với bạn sớm.
                  </p>
                )}

                {paymentAmount && (
                  <p className="text-sm text-muted-foreground">
                    Số tiền: {paymentAmount.toLocaleString("vi-VN")} ₫
                  </p>
                )}
                {transactionId && (
                  <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded">
                    {transactionId}
                  </p>
                )}
                <Button onClick={handleContinue} className="mt-4">
                  {type === "seller" && upgradeStatus === "pending"
                    ? "Về trang cá nhân"
                    : "Tiếp tục"}
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
                  <Button onClick={() => navigate("/")}>Về trang chủ</Button>
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
