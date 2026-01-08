import {useNavigate} from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuctionCardProps {
  id: string;
  title: string;
  currentPrice: number;
  buyNowPrice?: number;
  imageUrl: string;
  endTime: string;
  totalBids: number;
  seller: string;
  isEnding?: boolean;
}

const AuctionCard = ({
  id,
  title,
  currentPrice,
  buyNowPrice,
  imageUrl,
  endTime,
  totalBids,
  seller,
  isEnding = false,
}: AuctionCardProps) => {
  const navigate = useNavigate();
  // Calculate time remaining
  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return "Đã kết thúc";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} ngày`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <a href={`/product/${id}`}>
        <div className="relative">
          {/* Image */}
          <div className="aspect-square overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isEnding && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                Sắp kết thúc
              </span>
            )}
            {buyNowPrice && (
              <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
                Mua ngay
              </span>
            )}
          </div>

          {/* Watchlist button */}
          <button
            className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-50"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to watchlist
              console.log("Add to watchlist:", id);
            }}
          >
            <svg
              className="w-5 h-5 text-gray-600 hover:text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-base line-clamp-2 mb-2 min-h-[3rem] group-hover:text-primary">
            {title}
          </h3>

          {/* Price */}
          <div className="space-y-1 mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-gray-500">Giá hiện tại:</span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(currentPrice)}
              </span>
            </div>
            {buyNowPrice && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-500">Mua ngay:</span>
                <span className="text-sm font-semibold text-blue-600">
                  {formatPrice(buyNowPrice)}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{totalBids} lượt đấu giá</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={isEnding ? "text-red-600 font-semibold" : ""}>
                {getTimeRemaining(endTime)}
              </span>
            </div>
          </div>

          {/* Seller */}
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold">
                {seller.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {seller}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <Button
              className="flex-1 h-9"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/product/${id}`);
                // window.location.href = `/product/${id}`;
              }}
            >
              Đấu giá
            </Button>
            {buyNowPrice && (
              <Button
                variant="outline"
                className="flex-1 h-9"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Buy now
                  console.log("Buy now:", id);
                }}
              >
                Mua ngay
              </Button>
            )}
          </div>
        </CardContent>
      </a>
    </Card>
  );
};

export default AuctionCard;
