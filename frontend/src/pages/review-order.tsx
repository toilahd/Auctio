import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  Package,
  User,
  Star,
} from "lucide-react";

interface OrderInfo {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  finalPrice: number;
  counterpartyId: string;
  counterpartyName: string;
  isSellerView: boolean; // true if current user is seller, false if buyer
  orderStatus: string;
  deliveredAt: string;
  alreadyReviewed: boolean;
}

export default function ReviewOrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

  const [reviewType, setReviewType] = useState<"positive" | "negative" | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Calculate dates once at component mount
  const [deliveredDate] = useState(() => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());

  // Mock order data
  // TODO: Replace with API call to fetch order details
  const orderInfo: OrderInfo = useMemo(
    () => ({
      id: orderId || "order1",
      productId: "1",
      productTitle: "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
      productImage: "https://via.placeholder.com/400x300",
      finalPrice: 25000000,
      counterpartyId: "user2",
      counterpartyName: "TechStore VN",
      isSellerView: false, // Current user is buyer
      orderStatus: "delivered",
      deliveredAt: deliveredDate,
      alreadyReviewed: false,
    }),
    [orderId, deliveredDate]
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewType) {
      alert("Vui lòng chọn loại đánh giá");
      return;
    }

    if (comment.trim().length < 10) {
      alert("Nhận xét phải có ít nhất 10 ký tự");
      return;
    }

    setIsSubmitting(true);

    // TODO: Replace with API call to submit review
    console.log("Submitting review:", {
      orderId: orderInfo.id,
      counterpartyId: orderInfo.counterpartyId,
      reviewType,
      comment: comment.trim(),
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitted(true);

    // Redirect after 2 seconds
    setTimeout(() => {
      navigate(orderInfo.isSellerView ? "/seller" : "/won-auctions");
    }, 2000);
  };

  if (orderInfo.alreadyReviewed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto p-12">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Đã đánh giá
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn đã đánh giá đơn hàng này rồi.
              </p>
              <Button onClick={() => navigate("/won-auctions")}>
                Quay lại danh sách đơn hàng
              </Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto p-12">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Gửi đánh giá thành công!
              </h2>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã đánh giá. Đang chuyển hướng...
              </p>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đánh giá đơn hàng
            </h1>
            <p className="text-gray-600">
              Chia sẻ trải nghiệm của bạn về giao dịch này
            </p>
          </div>

          {/* Order Info Card */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Thông tin đơn hàng
            </h3>
            <div className="flex gap-4">
              <img
                src={orderInfo.productImage}
                alt={orderInfo.productTitle}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">
                  {orderInfo.productTitle}
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>
                      {orderInfo.isSellerView ? "Người mua" : "Người bán"}:{" "}
                      {orderInfo.counterpartyName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>Giá: {formatPrice(orderInfo.finalPrice)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      Đã giao: {formatDateTime(orderInfo.deliveredAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Review Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Rating Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Đánh giá của bạn về{" "}
                  {orderInfo.isSellerView ? "người mua" : "người bán"} này
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  {/* Positive */}
                  <button
                    type="button"
                    onClick={() => setReviewType("positive")}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      reviewType === "positive"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <ThumbsUp
                      className={`w-12 h-12 mx-auto mb-3 ${
                        reviewType === "positive"
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                    <div
                      className={`text-lg font-semibold ${
                        reviewType === "positive"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      Tích cực
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Giao dịch tốt, đáng tin cậy
                    </p>
                  </button>

                  {/* Negative */}
                  <button
                    type="button"
                    onClick={() => setReviewType("negative")}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      reviewType === "negative"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <ThumbsDown
                      className={`w-12 h-12 mx-auto mb-3 ${
                        reviewType === "negative"
                          ? "text-red-600"
                          : "text-gray-400"
                      }`}
                    />
                    <div
                      className={`text-lg font-semibold ${
                        reviewType === "negative"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      Tiêu cực
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Giao dịch có vấn đề
                    </p>
                  </button>
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Nhận xét chi tiết
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về giao dịch này (tối thiểu 10 ký tự)..."
                  rows={6}
                  className="resize-none"
                  required
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    {comment.length} / 500 ký tự
                  </p>
                  {comment.length > 0 && comment.length < 10 && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Cần ít nhất 10 ký tự
                    </p>
                  )}
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">
                      Hướng dẫn đánh giá
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        • Đánh giá dựa trên trải nghiệm thực tế của bạn
                      </li>
                      <li>• Tôn trọng và lịch sự trong lời lẽ</li>
                      <li>
                        • Đánh giá sẽ được hiển thị công khai trên trang cá nhân
                      </li>
                      <li>• Không thể chỉnh sửa sau khi gửi</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={
                    !reviewType || comment.trim().length < 10 || isSubmitting
                  }
                  className="flex-1"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
