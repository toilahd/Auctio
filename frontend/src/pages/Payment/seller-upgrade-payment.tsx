import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2, CheckCircle, Wallet } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

type PaymentMethod = "ZALOPAY" | "STRIPE";

const StripePaymentForm = ({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-result?type=seller`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Đã xảy ra lỗi khi thanh toán");
        setIsProcessing(false);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMessage("Đã xảy ra lỗi khi xử lý thanh toán");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Thanh toán
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
};

const SellerUpgradePaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const PAYMENT_AMOUNT = 100000; // 100,000 VND for 7 days

  const handleZaloPayment = async () => {
    setIsProcessing(true);

    try {
      // Create ZaloPay payment order
      const response = await fetch(
        `${BACKEND_URL}/api/payment/seller-upgrade/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );

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

  const handleStripePayment = async () => {
    setIsProcessing(true);

    try {
      // Create Stripe PaymentIntent
      const response = await fetch(
        `${BACKEND_URL}/api/payment/stripe/seller-upgrade/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && data.data.clientSecret) {
        setClientSecret(data.data.clientSecret);
        setPaymentMethod("STRIPE");
      } else {
        alert(data.message || "Không thể tạo thanh toán Stripe");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Stripe payment error:", error);
      alert("Đã xảy ra lỗi khi tạo thanh toán Stripe");
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
                <span className="text-sm text-muted-foreground">
                  Gói dịch vụ:
                </span>
                <span className="font-semibold">Seller - 7 ngày</span>
              </div>
              {paymentMethod && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Phương thức:
                  </span>
                  <span className="font-semibold">
                    {paymentMethod === "ZALOPAY" ? "ZaloPay" : "Stripe"}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Tổng thanh toán:
                </span>
                <span className="text-2xl font-bold text-primary">
                  {PAYMENT_AMOUNT.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-foreground">
                Quyền lợi:
              </h3>
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

            {/* Payment Method Selection or Stripe Form */}
            {!paymentMethod ? (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">
                    Chọn phương thức thanh toán:
                  </h3>

                  {/* Stripe Payment Button */}
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    size="lg"
                    onClick={handleStripePayment}
                    disabled={isProcessing}
                  >
                    <CreditCard className="w-5 h-5 mr-3" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Thẻ tín dụng/ghi nợ</div>
                      <div className="text-xs text-muted-foreground">
                        Visa, Mastercard, American Express
                      </div>
                    </div>
                  </Button>

                  {/* ZaloPay Button */}
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    size="lg"
                    onClick={handleZaloPayment}
                    disabled={isProcessing}
                  >
                    <Wallet className="w-5 h-5 mr-3" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">ZaloPay</div>
                      <div className="text-xs text-muted-foreground">
                        Thanh toán qua ví điện tử ZaloPay
                      </div>
                    </div>
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/account")}
                  disabled={isProcessing}
                >
                  Hủy
                </Button>
              </>
            ) : paymentMethod === "STRIPE" && clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                  },
                }}
              >
                <StripePaymentForm
                  onSuccess={() => {
                    navigate("/profile?upgradeSuccess=true");
                  }}
                  onCancel={() => {
                    setPaymentMethod(null);
                    setClientSecret(null);
                    setIsProcessing(false);
                  }}
                />
              </Elements>
            ) : null}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SellerUpgradePaymentPage;
