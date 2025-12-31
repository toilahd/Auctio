import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Clock,
  User,
  Star,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Tag,
  Eye,
  Hammer,
  AlertCircle,
  Loader2,
  Heart,
  MessageSquare,
  Send,
} from "lucide-react";

interface Question {
  id: string;
  content: string;
  createdAt: string;
  asker: {
    id: string;
    fullName: string;
  };
  answer?: {
    id: string;
    content: string;
    createdAt: string;
    seller: {
      id: string;
      fullName: string;
    };
  };
}

interface Product {
  id: string;
  title: string;
  description: string;
  startPrice: string;
  currentPrice: string;
  stepPrice: string;
  buyNowPrice: string | null;
  endTime: string;
  images: string[];
  status: string;
  bidCount: number;
  viewCount: number;
  createdAt: string;
  category?: {
    id: string;
    name: string;
    parent?: { id: string; name: string };
  };
  seller?: {
    id: string;
    fullName: string;
    positiveRatings: number;
    negativeRatings: number;
  };
  currentWinner?: {
    id: string;
    fullName: string;
    positiveRatings: number;
    negativeRatings: number;
  };
  bids?: Array<{
    id: string;
    amount: string;
    createdAt: string;
    bidder: { fullName: string };
  }>;
  timeLeft?: {
    days: number;
    hours: number;
    minutes: number;
    isLessThan3Days: boolean;
  };
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isTogglingWatchlist, setIsTogglingWatchlist] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<string | null>(
    null
  );

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/products/${id}`);
        const data = await response.json();
        if (data.success) {
          setProduct(data.data);
        } else {
          setError("Không thể tải sản phẩm");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
      fetchQuestions();
    }
  }, [id]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/questions/product/${id}`
      );
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    if (id) checkWatchlistStatus();
  }, [id]);

  const checkWatchlistStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/watchlist/check/${id}`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setIsInWatchlist(data.data.inWatchlist);
      }
    } catch (error) {
      console.error("Error checking watchlist status:", error);
    }
  };

  const handleWatchlistToggle = async () => {
    setIsTogglingWatchlist(true);

    try {
      if (isInWatchlist) {
        // Remove from watchlist
        const response = await fetch(`${BACKEND_URL}/api/watchlist/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setIsInWatchlist(false);
        }
      } else {
        // Add to watchlist
        const response = await fetch(`${BACKEND_URL}/api/watchlist/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: id }),
        });
        const data = await response.json();
        if (data.success) {
          setIsInWatchlist(true);
        }
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    } finally {
      setIsTogglingWatchlist(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.trim() || newQuestion.length < 5) {
      alert("Câu hỏi phải có ít nhất 5 ký tự");
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: id, content: newQuestion }),
      });
      const data = await response.json();
      if (data.success) {
        setNewQuestion("");
        fetchQuestions();
        // alert("Câu hỏi đã được gửi thành công!");
      } else {
        alert(data.message || "Không thể gửi câu hỏi");
      }
    } catch (error) {
      console.error("Error asking question:", error);
      alert("Đã xảy ra lỗi khi gửi câu hỏi");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleAnswerQuestion = async (questionId: string) => {
    const answerContent = answerInputs[questionId];
    if (!answerContent?.trim() || answerContent.length < 5) {
      alert("Câu trả lời phải có ít nhất 5 ký tự");
      return;
    }

    setIsSubmittingAnswer(questionId);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/questions/${questionId}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: answerContent }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setAnswerInputs({ ...answerInputs, [questionId]: "" });
        fetchQuestions();
        // alert("Câu trả lời đã được gửi thành công!");
      } else {
        alert(data.message || "Không thể gửi câu trả lời");
      }
    } catch (error) {
      console.error("Error answering question:", error);
      alert("Đã xảy ra lỗi khi gửi câu trả lời");
    } finally {
      setIsSubmittingAnswer(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getRelativeTime = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return "Đã kết thúc";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days >= 3) {
      return `${days} ngày`;
    } else if (days > 0) {
      return `${days} ngày ${hours} giờ nữa`;
    } else if (hours > 0) {
      return `${hours} giờ ${minutes} phút nữa`;
    } else {
      return `${minutes} phút nữa`;
    }
  };

  const getRatingPercentage = (positive: number, negative: number) => {
    const total = positive + negative;
    if (total === 0) return 0;
    return Math.round((positive / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-12">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-center">{error}</h3>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary">
            Trang chủ
          </a>
          <span className="mx-2">/</span>
          {product.category?.parent && (
            <>
              <span>{product.category.parent.name}</span>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-foreground">{product.category?.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <Card className="overflow-hidden">
              <div className="aspect-4/3 bg-muted flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={
                      product.images[selectedImage] ||
                      "https://via.placeholder.com/800x600?text=No+Image"
                    }
                    alt={product.title}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground text-center">
                    <Tag className="w-16 h-16 mx-auto mb-2 opacity-20" />
                    <p>Không có hình ảnh</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Mô tả chi tiết
              </h2>
              {product.description ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-muted-foreground">Chưa có mô tả chi tiết.</p>
              )}
            </Card>

            {/* Bid History */}
            {product.bids && product.bids.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Hammer className="w-5 h-5" />
                  Lịch sử đấu giá
                </h2>
                <div className="space-y-3">
                  {product.bids.map((bid, index) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium text-foreground">
                            {bid.bidder.fullName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(bid.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(parseFloat(bid.amount))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right: Product Info & Actions */}
          <div className="space-y-4">
            <Card className="p-6 sticky top-4">
              {/* Seller Notice */}
              {user && product.seller?.id === user.id && (
                <div className="mb-4 p-4 bg-primary/10 rounded-lg border-2 border-primary">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-primary">
                      Đây là sản phẩm của bạn
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 ml-7">
                    Bạn không thể đấu giá sản phẩm của chính mình
                  </p>
                </div>
              )}

              <h1 className="text-2xl font-bold text-foreground mb-4 leading-tight">
                {product.title}
              </h1>

              {/* Current Price */}
              <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Giá hiện tại
                </div>
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(parseFloat(product.currentPrice))}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Hammer className="w-4 h-4" />
                    {product.bidCount || 0} lượt đấu giá
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {product.viewCount || 0} lượt xem
                  </div>
                </div>
              </div>

              {/* Buy Now Price */}
              {product.buyNowPrice && (
                <div className="mb-4 p-4 bg-accent/5 rounded-lg border border-accent/10">
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Giá mua ngay
                  </div>
                  <div className="text-2xl font-bold text-accent-foreground">
                    {formatPrice(parseFloat(product.buyNowPrice))}
                  </div>
                </div>
              )}

              {/* Time Remaining */}
              <div className="mb-6 p-4 bg-destructive/5 rounded-lg border border-destructive/10">
                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Thời gian còn lại
                </div>
                <div className="text-2xl font-bold text-destructive">
                  {getRelativeTime(product.endTime)}
                </div>
                {product.timeLeft?.isLessThan3Days && (
                  <Badge variant="destructive" className="mt-2">
                    Sắp kết thúc
                  </Badge>
                )}
              </div>

              {/* Seller Info */}
              {product.seller && (
                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Người bán
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Tên:
                      </span>
                      <span className="font-medium text-foreground">
                        {product.seller.fullName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Đánh giá:
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-medium">
                            {product.seller.positiveRatings}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <ThumbsDown className="w-3.5 h-3.5 text-destructive" />
                          <span className="font-medium">
                            {product.seller.negativeRatings}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Độ tin cậy:
                      </span>
                      <Badge variant="secondary">
                        {getRatingPercentage(
                          product.seller.positiveRatings,
                          product.seller.negativeRatings
                        )}
                        %
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Winner */}
              {product.currentWinner && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    Người đấu giá cao nhất
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Tên:
                      </span>
                      <span className="font-medium text-foreground">
                        {product.currentWinner.fullName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Đánh giá:
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-medium">
                            {product.currentWinner.positiveRatings}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <ThumbsDown className="w-3.5 h-3.5 text-destructive" />
                          <span className="font-medium">
                            {product.currentWinner.negativeRatings}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Đăng ngày: {formatDate(product.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Kết thúc: {formatDate(product.endTime)}</span>
                </div>
              </div>

              {/* Action Buttons - Hidden for sellers */}
              {user?.id !== product.seller?.id && (
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Hammer className="w-4 h-4 mr-2" />
                    Đấu giá ngay
                  </Button>
                  {product.buyNowPrice && (
                    <Button variant="secondary" className="w-full" size="lg">
                      <Tag className="w-4 h-4 mr-2" />
                      Mua ngay
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleWatchlistToggle}
                    disabled={isTogglingWatchlist}
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${
                        isInWatchlist ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    {isInWatchlist ? "Đã theo dõi" : "Theo dõi sản phẩm"}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Q&A Section */}
        <div className="mt-12">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Hỏi & Đáp
            </h2>

            {/* Ask Question Form (for non-sellers) */}
            {user && product.seller?.id !== user.id && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Đặt câu hỏi cho người bán
                </h3>
                <div className="space-y-3">
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Nhập câu hỏi của bạn về sản phẩm này..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {newQuestion.length} ký tự (tối thiểu 5)
                    </span>
                    <Button
                      onClick={handleAskQuestion}
                      disabled={isSubmittingQuestion || newQuestion.length < 5}
                      size="sm"
                    >
                      {isSubmittingQuestion ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Gửi câu hỏi
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {questions.length > 0 ? (
                questions.map((question) => (
                  <div
                    key={question.id}
                    className="border-b border-border pb-6 last:border-0 last:pb-0"
                  >
                    {/* Question */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {question.asker.fullName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            hỏi {formatDate(question.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-foreground bg-muted/30 p-3 rounded-lg">
                        {question.content}
                      </p>
                    </div>

                    {/* Answer or Answer Form */}
                    {question.answer ? (
                      <div className="pl-6 border-l-2 border-primary/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-primary">
                            {question.answer.seller.fullName}
                          </span>
                          <Badge variant="secondary">Người bán</Badge>
                          <span className="text-sm text-muted-foreground">
                            trả lời {formatDate(question.answer.createdAt)}
                          </span>
                        </div>
                        <p className="text-foreground">
                          {question.answer.content}
                        </p>
                      </div>
                    ) : user?.id === product.seller?.id ? (
                      <div className="pl-6 border-l-2 border-muted">
                        <div className="space-y-3">
                          <textarea
                            value={answerInputs[question.id] || ""}
                            onChange={(e) =>
                              setAnswerInputs({
                                ...answerInputs,
                                [question.id]: e.target.value,
                              })
                            }
                            placeholder="Nhập câu trả lời của bạn..."
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            rows={2}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {(answerInputs[question.id] || "").length} ký tự
                              (tối thiểu 5)
                            </span>
                            <Button
                              onClick={() => handleAnswerQuestion(question.id)}
                              disabled={
                                isSubmittingAnswer === question.id ||
                                (answerInputs[question.id] || "").length < 5
                              }
                              size="sm"
                            >
                              {isSubmittingAnswer === question.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4 mr-2" />
                              )}
                              Gửi câu trả lời
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pl-6 text-sm text-muted-foreground italic">
                        Chưa có câu trả lời
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground">
                    Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
