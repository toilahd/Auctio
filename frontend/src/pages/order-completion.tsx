import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  MessageSquare,
  Send,
  Clock,
  DollarSign,
  AlertCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  Wallet,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

type PaymentMethod = "ZALOPAY" | "STRIPE";

interface Product {
  id: string;
  title: string;
  images: string[];
  currentPrice: string;
  status:
    | "ENDED"
    | "PAYED"
    | "SHIPPING"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED";
  endTime: string;
  seller: {
    id: string;
    fullName: string;
    positiveRatings: number;
    negativeRatings: number;
  };
  currentWinner: {
    id: string;
    fullName: string;
    positiveRatings: number;
    negativeRatings: number;
  };
  order?: {
    id: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
}

interface Bidder {
  id: string;
  fullName: string;
  amount: string;
  createdAt: string;
  positiveRatings: number;
  negativeRatings: number;
  isCurrentWinner: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

const StripePaymentForm = ({
  productId,
  onCancel,
}: {
  productId: string;
  onCancel: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
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
          return_url: `${window.location.origin}/payment-result?type=auction&orderId=${productId}`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Đã xảy ra lỗi khi thanh toán");
        setIsProcessing(false);
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

const OrderCompletionPage = () => {
  const { user } = useAuth();
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [showBidderList, setShowBidderList] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Rating state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingType, setRatingType] = useState<1 | -1 | null>(null);
  const [ratingComment, setRatingComment] = useState("");
  const [ratings, setRatings] = useState<Rating[]>([]);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Reject winner modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatIntervalRef = useRef<number | undefined>(undefined);
  const prevMessagesLengthRef = useRef<number>(0);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const isSeller = user?.id === product?.seller.id;
  const isBuyer = user?.id === product?.currentWinner.id;

  useEffect(() => {
    fetchProduct();
    fetchBidders();
    fetchMessages();
    fetchRatings();

    // Poll messages every 3 seconds
    chatIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      if (chatIntervalRef.current) {
        clearInterval(chatIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    // Only auto-scroll if new messages were added
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);

        // Check access control
        if (
          user &&
          data.data.seller.id !== user.id &&
          data.data.currentWinner?.id !== user.id
        ) {
          alert("Bạn không có quyền truy cập trang này");
          navigate(`/product/${productId}`);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/products/${productId}/chat`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchBidders = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/products/${productId}/bidders`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setBidders(data.data);
      }
    } catch (error) {
      console.error("Error fetching bidders:", error);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/products/${productId}/ratings`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setRatings(data.data);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/products/${productId}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: newMessage.trim() }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setNewMessage("");
        fetchMessages();
      } else {
        alert(data.message || "Không thể gửi tin nhắn");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Đã xảy ra lỗi khi gửi tin nhắn");
    }
  };

  const handleZaloPayment = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/payment/auction/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId: product?.id,
            amount: product?.currentPrice,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.data.order_url) {
        navigate(data.data.order_url);
        // window.location.href = data.data.order_url;
      } else {
        alert(data.message || "Không thể tạo đơn thanh toán");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Đã xảy ra lỗi");
      setIsSubmitting(false);
    }
  };

  const handleStripePayment = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/payment/stripe/auction/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId: product?.id,
            amount: parseFloat(product?.currentPrice || "0"),
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.data.clientSecret) {
        setClientSecret(data.data.clientSecret);
        setPaymentMethod("STRIPE");
      } else {
        alert(data.message || "Không thể tạo thanh toán Stripe");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Stripe payment error:", error);
      alert("Đã xảy ra lỗi khi tạo thanh toán Stripe");
      setIsSubmitting(false);
    }
  };

  const handleConfirmShipment = async () => {
    if (!confirm("Xác nhận bạn đã gửi hàng?")) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/products/${productId}/ship`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Đã xác nhận gửi hàng thành công!");
        fetchProduct();
      } else {
        alert(data.message || "Không thể xác nhận gửi hàng");
      }
    } catch (error) {
      console.error("Error confirming shipment:", error);
      alert("Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!confirm("Xác nhận bạn đã nhận hàng và hài lòng với sản phẩm?")) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/products/${productId}/deliver`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Đã xác nhận nhận hàng thành công!");
        fetchProduct();
      } else {
        alert(data.message || "Không thể xác nhận nhận hàng");
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      alert("Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!ratingType) {
      alert("Vui lòng chọn loại đánh giá");
      return;
    }

    if (ratingComment.trim().length < 10) {
      alert("Nhận xét phải có ít nhất 10 ký tự");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/products/${productId}/rate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            rating: ratingType,
            comment: ratingComment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Đã gửi đánh giá thành công!");
        setShowRatingModal(false);
        setRatingType(null);
        setRatingComment("");
        fetchProduct();
        fetchRatings();
      } else {
        alert(data.message || "Không thể gửi đánh giá");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (cancelReason.trim().length < 10) {
      alert("Lý do hủy phải có ít nhất 10 ký tự");
      return;
    }

    if (
      !confirm(
        "Xác nhận hủy đơn hàng? Người mua sẽ nhận đánh giá -1 và hành động này không thể hoàn tác."
      )
    )
      return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/products/${productId}/cancel`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            reason: cancelReason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Đã hủy đơn hàng thành công!");
        setShowCancelModal(false);
        navigate("/seller");
      } else {
        alert(data.message || "Không thể hủy đơn hàng");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectWinner = async () => {
    if (rejectReason.trim().length < 10) {
      alert("Lý do từ chối phải có ít nhất 10 ký tự");
      return;
    }

    if (
      !confirm(
        "Xác nhận từ chối người thắng hiện tại? Họ sẽ nhận đánh giá -1 và người đấu giá cao thứ 2 sẽ trở thành người thắng mới."
      )
    )
      return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/products/${productId}/reject-winner`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            reason: rejectReason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Đã từ chối người thắng và chuyển sang người đấu giá cao thứ 2!");
        setShowRejectModal(false);
        setRejectReason("");
        // Refresh data
        fetchProduct();
        fetchBidders();
        fetchMessages();
      } else {
        alert(data.message || "Không thể từ chối người thắng");
      }
    } catch (error) {
      console.error("Error rejecting winner:", error);
      alert("Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(price));
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000
    );
    if (seconds < 60) return "vừa xong";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    return `${Math.floor(seconds / 86400)} ngày trước`;
  };

  const getStepStatus = (step: number): "completed" | "active" | "pending" => {
    if (!product) return "pending";

    const statusMap: Record<string, number> = {
      ENDED: 1,
      PAYED: 2,
      SHIPPING: 3,
      DELIVERED: 4,
      COMPLETED: 5,
    };

    const currentStep = statusMap[product.status] || 1;
    if (step < currentStep) return "completed";
    if (step === currentStep) return "active";
    return "pending";
  };

  const getMyRating = () => {
    return ratings.find((r) => r.fromUserId === user?.id);
  };

  const getCounterpartyRating = () => {
    return ratings.find((r) => r.fromUserId !== user?.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">
            Không tìm thấy đơn hàng
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const myRating = getMyRating();
  const counterpartyRating = getCounterpartyRating();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Hoàn tất đơn hàng
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sản phẩm: {product.title}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${
                      ((getStepStatus(1) === "completed" ? 1 : 0) +
                        (getStepStatus(2) === "completed" ? 1 : 0) +
                        (getStepStatus(3) === "completed" ? 1 : 0) +
                        (getStepStatus(4) === "completed" ? 1 : 0)) *
                      25
                    }%`,
                  }}
                />
              </div>
              <div className="relative flex justify-between">
                {[
                  { step: 1, label: "Thanh toán", icon: CreditCard },
                  { step: 2, label: "Gửi hàng", icon: Package },
                  { step: 3, label: "Nhận hàng", icon: Truck },
                  { step: 4, label: "Đánh giá", icon: Star },
                ].map(({ step, label, icon: Icon }) => {
                  const status = getStepStatus(step);
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          status === "completed"
                            ? "bg-primary text-white"
                            : status === "active"
                            ? "bg-primary text-white ring-4 ring-primary/20"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          status === "pending"
                            ? "text-gray-500"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Thông tin sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img
                      src={
                        product.images[0] || "https://via.placeholder.com/150"
                      }
                      alt={product.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <a
                        href={`/product/${product.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-primary mb-2 block"
                      >
                        {product.title}
                      </a>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-primary">
                            {formatPrice(product.currentPrice)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            Kết thúc {formatDateTime(product.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bidder List (Seller Only) */}
              {isSeller && bidders.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Danh sách người đấu giá ({bidders.length})
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBidderList(!showBidderList)}
                      >
                        {showBidderList ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {showBidderList && (
                    <CardContent>
                      <div className="space-y-3">
                        {bidders.map((bidder, index) => (
                          <div
                            key={bidder.id}
                            className={`p-4 rounded-lg border ${
                              bidder.isCurrentWinner
                                ? "bg-primary/10 border-primary"
                                : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium text-gray-500">
                                    #{index + 1}
                                  </span>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {bidder.fullName}
                                  </span>
                                  {bidder.isCurrentWinner && (
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-white">
                                      Người thắng
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="text-primary font-semibold">
                                    {formatPrice(bidder.amount)}
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <ThumbsUp className="w-3.5 h-3.5 text-green-600" />
                                    <span>{bidder.positiveRatings}</span>
                                    <ThumbsDown className="w-3.5 h-3.5 text-red-600" />
                                    <span>{bidder.negativeRatings}</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {getTimeAgo(bidder.createdAt)}
                                </div>
                              </div>
                              {bidder.isCurrentWinner &&
                                product.status === "ENDED" &&
                                bidders.length > 1 && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowRejectModal(true)}
                                  >
                                    Từ chối
                                  </Button>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {bidders.length > 1 && product.status === "ENDED" && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            💡 Bạn có thể từ chối người thắng hiện tại và chuyển
                            sang người đấu giá cao thứ 2.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Status-based Content */}
              {product.status === "ENDED" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      {isBuyer ? "Thanh toán đơn hàng" : "Chờ thanh toán"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isBuyer ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                              <p className="font-semibold mb-1">
                                Vui lòng thanh toán trong vòng 24 giờ
                              </p>
                              <p>
                                Nếu không thanh toán đúng hạn, đơn hàng sẽ bị
                                hủy và bạn sẽ nhận đánh giá tiêu cực.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Amount Display */}
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Tổng thanh toán:
                            </span>
                            <span className="text-2xl font-bold text-primary">
                              {parseFloat(product.currentPrice).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              ₫
                            </span>
                          </div>
                        </div>

                        {/* Payment Method Selection or Stripe Form */}
                        {!paymentMethod ? (
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
                              disabled={isSubmitting}
                            >
                              <CreditCard className="w-5 h-5 mr-3" />
                              <div className="flex-1 text-left">
                                <div className="font-semibold">
                                  Thẻ tín dụng/ghi nợ
                                </div>
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
                              disabled={isSubmitting}
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
                              productId={product.id}
                              onCancel={() => {
                                setPaymentMethod(null);
                                setClientSecret(null);
                                setIsSubmitting(false);
                              }}
                            />
                          </Elements>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                          Đang chờ người mua thanh toán. Bạn có thể hủy đơn hàng
                          nếu người mua không thanh toán đúng hạn.
                        </p>
                        <Button
                          variant="destructive"
                          onClick={() => setShowCancelModal(true)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Hủy đơn hàng
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {product.status === "PAYED" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      {isSeller ? "Gửi hàng" : "Chờ gửi hàng"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isSeller ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <div className="text-sm text-green-800 dark:text-green-200">
                              <p className="font-semibold mb-1">
                                Đã nhận thanh toán
                              </p>
                              <p>
                                Vui lòng gửi hàng và xác nhận sau khi đã giao
                                cho đơn vị vận chuyển.
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={handleConfirmShipment}
                          disabled={isSubmitting}
                          className="w-full"
                          size="lg"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <Truck className="w-4 h-4 mr-2" />
                              Xác nhận đã gửi hàng
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setShowCancelModal(true)}
                          className="w-full"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Hủy đơn hàng
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-semibold mb-1">
                              Đã thanh toán thành công
                            </p>
                            <p>
                              Đang chờ người bán xác nhận và gửi hàng. Vui lòng
                              kiên nhẫn.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {product.status === "SHIPPING" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      {isBuyer ? "Xác nhận nhận hàng" : "Đang giao hàng"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isBuyer ? (
                      <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                          Người bán đã xác nhận gửi hàng. Vui lòng kiểm tra kỹ
                          sản phẩm trước khi xác nhận đã nhận hàng.
                        </p>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            ⚠️ Sau khi xác nhận nhận hàng, bạn sẽ không thể
                            khiếu nại về sản phẩm.
                          </p>
                        </div>
                        <Button
                          onClick={handleConfirmDelivery}
                          disabled={isSubmitting}
                          className="w-full"
                          size="lg"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Xác nhận đã nhận hàng
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Truck className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <div className="text-sm text-green-800 dark:text-green-200">
                              <p className="font-semibold mb-1">
                                Đang giao hàng
                              </p>
                              <p>Đang chờ người mua xác nhận đã nhận hàng.</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => setShowCancelModal(true)}
                          className="w-full"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Hủy đơn hàng
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {product.status === "DELIVERED" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Đánh giá giao dịch
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!myRating ? (
                      <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                          Vui lòng đánh giá chất lượng giao dịch với{" "}
                          {isSeller ? "người mua" : "người bán"}.
                        </p>
                        <Button
                          onClick={() => setShowRatingModal(true)}
                          className="w-full"
                          size="lg"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Gửi đánh giá
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-200 font-semibold mb-2">
                            ✓ Bạn đã gửi đánh giá
                          </p>
                          <div className="flex items-center gap-2">
                            {myRating.rating === 1 ? (
                              <ThumbsUp className="w-5 h-5 text-green-600" />
                            ) : (
                              <ThumbsDown className="w-5 h-5 text-red-600" />
                            )}
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {myRating.comment}
                            </span>
                          </div>
                        </div>
                        {!counterpartyRating && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Đang chờ {isSeller ? "người mua" : "người bán"} đánh
                            giá...
                          </p>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRatingType(myRating.rating as 1 | -1);
                            setRatingComment(myRating.comment);
                            setShowRatingModal(true);
                          }}
                        >
                          Chỉnh sửa đánh giá
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {product.status === "COMPLETED" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Giao dịch hoàn tất
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
                          ✓ Giao dịch đã hoàn tất thành công!
                        </p>
                      </div>

                      {/* My Rating */}
                      {myRating && (
                        <div className="p-4 border rounded-lg dark:border-gray-700">
                          <p className="text-sm font-medium mb-2">
                            Đánh giá của bạn:
                          </p>
                          <div className="flex items-start gap-3">
                            {myRating.rating === 1 ? (
                              <ThumbsUp className="w-5 h-5 text-green-600 mt-0.5" />
                            ) : (
                              <ThumbsDown className="w-5 h-5 text-red-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {myRating.comment}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDateTime(myRating.updatedAt)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setRatingType(myRating.rating as 1 | -1);
                              setRatingComment(myRating.comment);
                              setShowRatingModal(true);
                            }}
                          >
                            Chỉnh sửa
                          </Button>
                        </div>
                      )}

                      {/* Counterparty Rating */}
                      {counterpartyRating && (
                        <div className="p-4 border rounded-lg dark:border-gray-700">
                          <p className="text-sm font-medium mb-2">
                            Đánh giá từ {isSeller ? "người mua" : "người bán"}:
                          </p>
                          <div className="flex items-start gap-3">
                            {counterpartyRating.rating === 1 ? (
                              <ThumbsUp className="w-5 h-5 text-green-600 mt-0.5" />
                            ) : (
                              <ThumbsDown className="w-5 h-5 text-red-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {counterpartyRating.comment}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDateTime(counterpartyRating.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Chat & Details */}
            <div className="space-y-6">
              {/* Transaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Chi tiết giao dịch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {isSeller ? "Người mua" : "Người bán"}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {isSeller
                        ? product.currentWinner.fullName
                        : product.seller.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Giá thành:
                    </span>
                    <span className="font-semibold text-primary">
                      {formatPrice(product.currentPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Kết thúc:
                    </span>
                    <span className="text-gray-900 dark:text-white text-xs">
                      {formatDateTime(product.endTime)}
                    </span>
                  </div>
                  <div className="pt-3 border-t dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Trạng thái:
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === "COMPLETED"
                            ? "bg-green-100 dark:bg-green-950/20 text-green-600"
                            : product.status === "DELIVERED"
                            ? "bg-blue-100 dark:bg-blue-950/20 text-blue-600"
                            : "bg-yellow-100 dark:bg-yellow-950/20 text-yellow-600"
                        }`}
                      >
                        {product.status === "ENDED"
                          ? "Chờ thanh toán"
                          : product.status === "PAYED"
                          ? "Đã thanh toán"
                          : product.status === "SHIPPING"
                          ? "Đang giao hàng"
                          : product.status === "DELIVERED"
                          ? "Đã giao hàng"
                          : "Hoàn tất"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chat Box */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Nhắn tin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto space-y-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      {messages.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm py-8">
                          Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                        </p>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.senderId === user?.id
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                msg.senderId === user?.id
                                  ? "bg-primary text-white"
                                  : "bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              }`}
                            >
                              <p className="text-xs font-medium mb-1 opacity-75">
                                {msg.senderName}
                              </p>
                              <p className="text-sm mb-1">{msg.content}</p>
                              <span className="text-xs opacity-75">
                                {getTimeAgo(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage} size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {myRating ? "Chỉnh sửa đánh giá" : "Đánh giá giao dịch"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Đánh giá của bạn
                </label>
                <div className="flex gap-4">
                  <Button
                    variant={ratingType === 1 ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setRatingType(1)}
                  >
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    Tích cực (+1)
                  </Button>
                  <Button
                    variant={ratingType === -1 ? "destructive" : "outline"}
                    className="flex-1"
                    onClick={() => setRatingType(-1)}
                  >
                    <ThumbsDown className="w-5 h-5 mr-2" />
                    Tiêu cực (-1)
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Nhận xét (tối thiểu 10 ký tự)
                </label>
                <Textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {ratingComment.length} ký tự
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRatingModal(false);
                  if (!myRating) {
                    setRatingType(null);
                    setRatingComment("");
                  }
                }}
                disabled={isSubmitting}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitRating}
                disabled={isSubmitting || !ratingType}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi đánh giá"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Winner Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Xác nhận từ chối người thắng
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Lưu ý:</strong> Khi từ chối người thắng:
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 ml-4 list-disc space-y-1">
                  <li>Người thắng hiện tại sẽ nhận đánh giá tiêu cực (-1)</li>
                  <li>Người đấu giá cao thứ 2 sẽ trở thành người thắng mới</li>
                  <li>Bạn có thể chat với người thắng mới</li>
                  <li>Hành động này không thể hoàn tác</li>
                </ul>
              </div>
              {bidders.length > 1 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Người thắng mới sẽ là:{" "}
                    <strong>{bidders[1]?.fullName}</strong> với giá{" "}
                    <strong>{formatPrice(bidders[1]?.amount)}</strong>
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Lý do từ chối (tối thiểu 10 ký tự)
                </label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ví dụ: Người thắng không phản hồi sau 24 giờ"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {rejectReason.length} ký tự
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                disabled={isSubmitting}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectWinner}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận từ chối"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Xác nhận hủy đơn hàng
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Lưu ý:</strong> Khi hủy đơn hàng:
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 ml-4 list-disc space-y-1">
                  <li>Người mua sẽ tự động nhận đánh giá tiêu cực (-1)</li>
                  <li>Hành động này không thể hoàn tác</li>
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Lý do hủy (tối thiểu 10 ký tự)
                </label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Người mua không thanh toán đúng hạn"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {cancelReason.length} ký tự
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                disabled={isSubmitting}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận hủy"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrderCompletionPage;
