import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { BidForm } from "@/components/BidForm";
import { BidHistoryList } from "@/components/BidHistoryList";
import { CurrentWinnerDisplay } from "@/components/CurrentWinnerDisplay";

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
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showBuyNowDialog, setShowBuyNowDialog] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [isTogglingWatchlist, setIsTogglingWatchlist] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<string | null>(
    null
  );
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [imageTransition, setImageTransition] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [isPausedSlideshow, setIsPausedSlideshow] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/products/${id}`);
        const data = await response.json();
        if (data.success) {
          setProduct(data.data);
          // Fetch related products from same category
          if (data.data.category?.id) {
            fetchRelatedProducts(data.data.category.id);
          }
        } else {
          setError("Không thể tải sản phẩm");
        }
      } catch {
        setError("Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchRelatedProducts = async (parentCategoryId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/products/category/${parentCategoryId}?page=1&limit=5`
      );
      const data = await response.json();
      if (data.success && data.data.products) {
        // Filter out the current product
        const filtered = data.data.products.filter((p: any) => p.id !== id);
        setRelatedProducts(filtered.slice(0, 4)); // Take max 4 related products
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  useEffect(() => {
    if (id) checkWatchlistStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Update countdown every second when auction is ending soon
  useEffect(() => {
    if (!product?.endTime) return;

    // Check if auction is less than 3 days away
    const checkIsEndingSoon = () => {
      const end = new Date(product.endTime).getTime();
      const diff = end - Date.now();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return days < 3 && diff > 0;
    };

    if (checkIsEndingSoon()) {
      // Update every second
      const interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // Update every minute for auctions > 3 days
      const interval = setInterval(() => {
        setNow(Date.now());
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [product?.endTime]);

  // Auto slideshow for image gallery
  useEffect(() => {
    if (!product?.images || product.images.length <= 1 || isPausedSlideshow) {
      return;
    }

    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [product?.images, isPausedSlideshow]);

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

  const handleBuyNowClick = () => {
    setShowBuyNowDialog(true);
  };

  const handleBuyNowConfirm = async () => {
    if (!product?.buyNowPrice) return;

    setBuyNowLoading(true);
    setShowBuyNowDialog(false);

    try {
      const response = await fetch(`${BACKEND_URL}/api/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: id,
          maxAmount: parseFloat(product.buyNowPrice),
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.data.buyNowTriggered) {
          alert(
            `🎉 Chúc mừng! Bạn đã mua thành công sản phẩm với giá ${parseFloat(
              product.buyNowPrice
            ).toLocaleString()} VND. Phiên đấu giá đã kết thúc.`
          );
          // Refresh page to show ended status
          navigate(0);
        }
      } else {
        alert(data.message || "Không thể mua sản phẩm");
      }
    } catch (error) {
      console.error("Error buying now:", error);
      alert("Đã xảy ra lỗi khi mua sản phẩm");
    } finally {
      setBuyNowLoading(false);
    }
  };

  const handleBuyNowCancel = () => {
    setShowBuyNowDialog(false);
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

  const getTimeComponents = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const getRelativeTime = (endTime: string) => {
    const components = getTimeComponents(endTime);
    if (!components) return "Đã kết thúc";

    const { days, hours, minutes, seconds } = components;
    const parts = [];
    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0) parts.push(`${hours} giờ`);
    if (minutes > 0) parts.push(`${minutes} phút`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} giây`);

    // If less than 3 days, add "nữa" (remaining)
    if (days < 3) {
      return parts.join(" ") + " nữa";
    }

    return parts.join(" ");
  };

  const getRatingPercentage = (positive: number, negative: number) => {
    const total = positive + negative;
    if (total === 0) return 0;
    return Math.round((positive / total) * 100);
  };

  const maskName = (fullName: string) => {
    const nameParts = fullName.trim().split(" ");
    const lastName = nameParts[nameParts.length - 1];
    return `....${lastName}`;
  };

  const handleImageChange = (index: number) => {
    if (index === selectedImage) return;
    setIsPausedSlideshow(true); // Pause slideshow when user manually selects
    setImageTransition(true);
    setTimeout(() => {
      setSelectedImage(index);
      setImageTransition(false);
    }, 150);
    // Resume slideshow after 5 seconds of inactivity
    setTimeout(() => {
      setIsPausedSlideshow(false);
    }, 5000);
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
            <Card className="overflow-hidden py-0">
              <div
                className="h-[500px] bg-muted flex items-center justify-center relative"
                onMouseEnter={() => setIsPausedSlideshow(true)}
                onMouseLeave={() => setIsPausedSlideshow(false)}
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={
                      product.images[selectedImage] ||
                      "https://via.placeholder.com/800x600?text=No+Image"
                    }
                    alt={product.title}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${
                      imageTransition ? "opacity-0" : "opacity-100"
                    }`}
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
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-3 min-w-max">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleImageChange(index);
                      }}
                      className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
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
              </div>
            )}

            {/* Product Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Mô tả chi tiết
              </h2>
              {product.description ? (
                <div
                  className="des prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-muted-foreground">Chưa có mô tả chi tiết.</p>
              )}
            </Card>

            {/* Bid History */}
            <BidHistoryList
              productId={product.id}
              productStatus={product.status}
              currentWinnerId={product.currentWinner?.id || null}
            />
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
                {(() => {
                  const components = getTimeComponents(product.endTime);
                  if (!components) {
                    return (
                      <div className="text-2xl font-bold text-muted-foreground">
                        Đã kết thúc
                      </div>
                    );
                  }

                  const { days, hours, minutes, seconds } = components;
                  const isLessThan3Days = days < 3;

                  if (isLessThan3Days) {
                    // Digital timer display for < 3 days
                    const totalHours = days * 24 + hours;
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 font-mono">
                          <div className="flex flex-col items-center">
                            <div className="text-4xl font-bold text-destructive tabular-nums">
                              {String(totalHours).padStart(2, "0")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              giờ
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-destructive pb-5">
                            :
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-4xl font-bold text-destructive tabular-nums">
                              {String(minutes).padStart(2, "0")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              phút
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-destructive pb-5">
                            :
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-4xl font-bold text-destructive tabular-nums">
                              {String(seconds).padStart(2, "0")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              giây
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Kết thúc: {formatDate(product.endTime)}
                        </div>
                        {product.status === "ACTIVE" && (
                          <Badge
                            variant="destructive"
                            className="w-full justify-center"
                          >
                            Sắp kết thúc
                          </Badge>
                        )}
                      </div>
                    );
                  } else {
                    // Show relative time + end date for >= 3 days
                    return (
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-destructive">
                          {getRelativeTime(product.endTime)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Kết thúc: {formatDate(product.endTime)}
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Current Winner - Real-time */}
              <CurrentWinnerDisplay
                productId={product.id}
                productStatus={product.status}
              />

              {/* Seller Info */}
              {product.seller && (
                <div
                  className="mb-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 cursor-pointer transition-colors"
                  onClick={() => navigate(`/profile/${product.seller?.id}`)}
                  title="Xem trang người bán"
                >
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
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {user?.id === product.currentWinner.id
                            ? product.currentWinner.fullName
                            : maskName(product.currentWinner.fullName)}
                        </span>
                        {user?.id === product.currentWinner.id && (
                          <Badge variant="default" className="text-xs">
                            Bạn
                          </Badge>
                        )}
                      </div>
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

              {/* Action Buttons & Bidding - Only show for ACTIVE auctions */}
              {product.status === "ACTIVE" &&
                !(user && product.seller?.id === user.id) && (
                  <div className="space-y-4">
                    <BidForm
                      productId={product.id}
                      currentPrice={parseFloat(product.currentPrice)}
                      stepPrice={parseFloat(product.stepPrice)}
                      onBidPlaced={() => {
                        // Refresh product data after successful bid
                        // navigate(0);
                      }}
                    />

                    {product.buyNowPrice && user && (
                      <Button
                        variant="secondary"
                        className="w-full"
                        size="lg"
                        onClick={handleBuyNowClick}
                        disabled={buyNowLoading}
                      >
                        {buyNowLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <Tag className="w-4 h-4 mr-2" />
                            Mua ngay -{" "}
                            {formatPrice(parseFloat(product.buyNowPrice))}
                          </>
                        )}
                      </Button>
                    )}

                    {user && (
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
                    )}
                  </div>
                )}

              {/* Order Completion Button - For seller and winner on ended auctions */}
              {(product.status === "ENDED" ||
                product.status === "PAYED" ||
                product.status === "SHIPPING" ||
                product.status === "DELIVERED" ||
                product.status === "COMPLETED") &&
                (user?.id === product.seller?.id ||
                  user?.id === product.currentWinner?.id) && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => navigate(`/order/${product.id}`)}
                  >
                    {user?.id === product.seller?.id
                      ? "Quản lý đơn hàng"
                      : "Xem chi tiết đơn hàng"}
                  </Button>
                )}

              {/* Auction Ended Message - For others */}
              {(product.status === "ENDED" ||
                product.status === "PAYED" ||
                product.status === "SHIPPING" ||
                product.status === "DELIVERED" ||
                product.status === "COMPLETED" ||
                product.status === "CANCELLED") &&
                user?.id !== product.seller?.id &&
                user?.id !== product.currentWinner?.id && (
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Sản phẩm đã kết thúc
                    </p>
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="overflow-hidden py-0 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={
                        relatedProduct.images?.[0] ||
                        "https://via.placeholder.com/300"
                      }
                      alt={relatedProduct.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2 min-h-[3rem]">
                      {relatedProduct.title}
                    </h3>
                    <div className="text-lg font-bold text-primary mb-2">
                      {formatPrice(parseFloat(relatedProduct.currentPrice))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Hammer className="w-3.5 h-3.5" />
                        <span>{relatedProduct._count?.bids || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {(() => {
                          const timeLeft = getRelativeTime(
                            relatedProduct.endTime
                          );
                          if (timeLeft === "Đã kết thúc") return "Đã kết thúc";
                          return timeLeft.replace(" nữa", "");
                        })()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Buy Now Confirmation Dialog */}
      <AlertDialog open={showBuyNowDialog} onOpenChange={setShowBuyNowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Mua Ngay</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3 mt-2">
                <p className="text-foreground">
                  Bạn có chắc chắn muốn mua sản phẩm này với giá mua ngay?
                </p>
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Sản phẩm:
                    </span>
                    <span className="font-medium text-foreground">
                      {product?.title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Giá mua ngay:
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {product?.buyNowPrice &&
                        formatPrice(parseFloat(product.buyNowPrice))}
                    </span>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>⚠️ Lưu ý:</strong>
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1 ml-4 list-disc">
                    <li>Phiên đấu giá sẽ kết thúc ngay lập tức</li>
                    <li>Bạn không thể hủy sau khi xác nhận</li>
                    <li>Bạn cần thanh toán trong thời gian quy định</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleBuyNowCancel}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleBuyNowConfirm}>
              Xác Nhận Mua Ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductDetailPage;
