import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Hammer, Tag, Calendar, User, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Products created within this many minutes are considered "new"
const NEW_PRODUCT_THRESHOLD_MINUTES = 10;

interface Product {
  id: string;
  title: string;
  titleNoAccent: string;
  description: string;
  startPrice: string;
  currentPrice: string;
  stepPrice: string;
  buyNowPrice: string | null;
  endTime: string;
  images: string[];
  categoryId: string;
  sellerId: string;
  status: string;
  bidCount: number;
  viewCount: number;
  autoExtend: boolean;
  currentWinnerId: string | null;
  createdAt: string;
  updatedAt: string;
  isNew?: boolean;
  category?: {
    id: string;
    name: string;
  };
  seller?: {
    id: string;
    fullName: string;
    email: string;
  };
  currentWinner?: {
    id: string;
    fullName: string;
  };
  _count?: {
    bids: number;
  };
  timeLeft?: {
    hours: number;
    minutes: number;
    total: number;
  };
}

interface ProductCardProps {
  product: Product;
  onClick: (productId: string) => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [now, setNow] = useState(() => Date.now());
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isTogglingWatchlist, setIsTogglingWatchlist] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  // Check if product is new based on creation time
  const isProductNew = () => {
    const createdAt = new Date(product.createdAt).getTime();
    const threshold = NEW_PRODUCT_THRESHOLD_MINUTES * 60 * 1000;
    return now - createdAt < threshold;
  };

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkWatchlistStatus();
  }, [product.id]);

  const checkWatchlistStatus = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/watchlist/check/${product.id}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setIsInWatchlist(data.data.inWatchlist);
      }
    } catch (error) {
      console.error("Error checking watchlist status:", error);
    }
  };

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTogglingWatchlist(true);

    try {
      if (isInWatchlist) {
        // Remove from watchlist
        const response = await fetch(
          `${BACKEND_URL}/api/watchlist/${product.id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
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
          body: JSON.stringify({ productId: product.id }),
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

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.seller?.id) {
      navigate(`/profile/${product.seller.id}`);
    }
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.category?.id) {
      navigate(`/search?categoryId=${product.category.id}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return "Đã kết thúc";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} ngày`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} phút`;
  };

  const getTimeRemainingColor = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) {
      // Ended - gray
      return "bg-gray-500 text-white";
    }

    const minutesRemaining = Math.floor(diff / (1000 * 60));

    if (minutesRemaining < 30) {
      // Less than 30 minutes - red
      return "bg-destructive text-destructive-foreground";
    }

    // MisProductNew()inutes - blue
    return "bg-blue-500 text-white";
  };

  return (
    <Card
      className={`group overflow-hidden cursor-pointer gap-1 pt-0 pb-1 transition-all duration-300 hover:shadow-xl ${
        product.isNew ? "ring-2 ring-primary/50" : ""
      }`}
      onClick={() => onClick(product.id)}
    >
      {/* Image Section */}
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img
          src={
            product.images && product.images.length > 0
              ? product.images[0]
              : "https://via.placeholder.com/400x300"
          }
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Watchlist Button - Only show when logged in */}
        {user && (
          <button
            onClick={handleWatchlistToggle}
            disabled={isTogglingWatchlist}
            className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-background transition-colors disabled:opacity-50"
            title={
              isInWatchlist
                ? "Xóa khỏi danh sách theo dõi"
                : "Thêm vào danh sách theo dõi"
            }
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isInWatchlist
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        )}

        {/* Time Remaining Badge */}
        <div
          className={`absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${getTimeRemainingColor(
            product.endTime
          )}`}
        >
          <Clock className="w-3 h-3" />
          {getTimeRemaining(product.endTime)}
        </div>

        {/* New Badge */}
        {isProductNew() && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground shadow-lg">
            MỚI
          </Badge>
        )}

        {/* Category Badge */}
        {product.category && (
          <Badge
            variant="secondary"
            className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm cursor-pointer hover:bg-background/90 transition-colors"
            onClick={handleCategoryClick}
            title={`Xem tất cả sản phẩm trong danh mục ${product.category.name}`}
          >
            {product.category.name}
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3
          title={product.title}
          className="text-base font-semibold text-foreground line-clamp-2 min-h-[2.5rem] leading-tight"
        >
          {product.title}
        </h3>

        {/* Current Price - Highlight */}
        <div className="flex items-baseline justify-between py-2 px-3 bg-primary/5 rounded-lg border border-primary/10">
          <span className="text-sm font-medium text-muted-foreground">
            Giá hiện tại
          </span>
          <span className="font-bold text-primary">
            {formatPrice(parseFloat(product.currentPrice))}
          </span>
        </div>

        {/* Buy Now Price */}
        {product.buyNowPrice && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Tag className="w-3.5 h-3.5" />
              <span>Mua ngay</span>
            </div>
            <span className="text-sm font-semibold text-accent-foreground">
              {formatPrice(parseFloat(product.buyNowPrice))}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Current Winner */}
        {(product.currentWinner || product.currentWinnerId) && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Đấu giá cao nhất</span>
            {product.currentWinner ? (
              <span className="font-medium text-foreground">
                {product.currentWinner.fullName}
              </span>
            ) : (
              <code className="px-2 py-0.5 bg-muted rounded text-muted-foreground font-mono">
                {product.currentWinnerId!.substring(0, 8)}...
              </code>
            )}
          </div>
        )}

        {/* Seller Info */}
        {product.seller && (
          <div
            className="flex items-center gap-2 p-2 -mx-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={handleSellerClick}
            title="Xem trang người bán"
          >
            <div className="w-8 h-8 bg-linear-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Người bán</p>
              <p className="text-sm font-medium text-foreground truncate">
                {product.seller.fullName}
              </p>
            </div>
          </div>
        )}

        {/* Bid Count */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Hammer className="w-3.5 h-3.5" />
          <span>
            <span className="font-semibold text-foreground">
              {product._count?.bids || 0}
            </span>{" "}
            lượt đấu giá
          </span>
        </div>

        {/* Posted Date */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>Đăng ngày {formatDate(product.createdAt)}</span>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
