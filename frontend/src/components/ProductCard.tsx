import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Hammer, Tag, Calendar } from "lucide-react";

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
    const now = Date.now();
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

  return (
    <Card
      className={`group overflow-hidden cursor-pointer gap-1 pb-1 transition-all duration-300 hover:shadow-xl ${
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
        
        {/* Time Remaining Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          <Clock className="w-3 h-3" />
          {getTimeRemaining(product.endTime)}
        </div>

        {/* New Badge */}
        {product.isNew && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground shadow-lg">
            MỚI
          </Badge>
        )}

        {/* Category Badge */}
        {product.category && (
          <Badge
            variant="secondary"
            className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm"
          >
            {product.category.name}
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-base font-semibold text-foreground line-clamp-2 min-h-[3rem] leading-tight">
          {product.title}
        </h3>

        {/* Current Price - Highlight */}
        <div className="flex items-baseline justify-between py-2 px-3 bg-primary/5 rounded-lg border border-primary/10">
          <span className="text-sm font-medium text-muted-foreground">
            Giá hiện tại
          </span>
          <span className="text-xl font-bold text-primary">
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
        {product.currentWinnerId && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Đấu giá cao nhất</span>
            <code className="px-2 py-0.5 bg-muted rounded text-muted-foreground font-mono">
              {product.currentWinnerId.substring(0, 8)}...
            </code>
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
