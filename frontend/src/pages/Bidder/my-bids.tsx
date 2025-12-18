import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface Bid {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  myMaxBid: number;
  currentPrice: number;
  totalBids: number;
  endTime: string;
  isWinning: boolean;
  isOutbid: boolean;
  seller: string;
  buyNowPrice?: number;
}

const MyBidsPage = () => {
  const [activeTab, setActiveTab] = useState<"active" | "won" | "lost">("active");

  // Mock data - TODO: Fetch from backend
  const activeBids: Bid[] = [
    {
      id: "b1",
      productId: "1",
      productTitle: "iPhone 15 Pro Max 256GB - Nguyên seal, chưa kích hoạt",
      productImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
      myMaxBid: 25000000,
      currentPrice: 25000000,
      totalBids: 45,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      isWinning: true,
      isOutbid: false,
      seller: "TechStore VN",
      buyNowPrice: 30000000,
    },
    {
      id: "b2",
      productId: "7",
      productTitle: "Rolex Submariner Date 126610LN - Fullbox 2023",
      productImage: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500",
      myMaxBid: 248000000,
      currentPrice: 250000000,
      totalBids: 98,
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      isWinning: false,
      isOutbid: true,
      seller: "Luxury Watches",
    },
    {
      id: "b3",
      productId: "8",
      productTitle: "PlayStation 5 Slim + 2 tay cầm + 5 game AAA",
      productImage: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500",
      myMaxBid: 15000000,
      currentPrice: 15000000,
      totalBids: 86,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      isWinning: true,
      isOutbid: false,
      seller: "GameHub",
      buyNowPrice: 18000000,
    },
  ];

  const wonBids: Bid[] = [
    {
      id: "w1",
      productId: "101",
      productTitle: "MacBook Air M2 2023 - 256GB Space Gray",
      productImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
      myMaxBid: 20000000,
      currentPrice: 20000000,
      totalBids: 52,
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isWinning: true,
      isOutbid: false,
      seller: "Apple Store HN",
    },
  ];

  const lostBids: Bid[] = [
    {
      id: "l1",
      productId: "201",
      productTitle: "Samsung Galaxy S24 Ultra 512GB - Bản Hàn",
      productImage: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500",
      myMaxBid: 21000000,
      currentPrice: 22500000,
      totalBids: 67,
      endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isWinning: false,
      isOutbid: true,
      seller: "Samsung Official",
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return "Đã kết thúc";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  };

  const getBidStatus = (bid: Bid) => {
    if (activeTab === "won") {
      return { text: "Thắng đấu giá", color: "text-green-600 bg-green-50 dark:bg-green-950/20" };
    }
    if (activeTab === "lost") {
      return { text: "Thua đấu giá", color: "text-red-600 bg-red-50 dark:bg-red-950/20" };
    }
    if (bid.isWinning) {
      return { text: "Đang dẫn đầu", color: "text-green-600 bg-green-50 dark:bg-green-950/20" };
    }
    if (bid.isOutbid) {
      return { text: "Bị vượt giá", color: "text-red-600 bg-red-50 dark:bg-red-950/20" };
    }
    return { text: "Đang tham gia", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" };
  };

  const currentBids =
    activeTab === "active" ? activeBids : activeTab === "won" ? wonBids : lostBids;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Đấu giá của tôi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Quản lý và theo dõi các cuộc đấu giá bạn tham gia
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("active")}
                className={`pb-4 px-2 border-b-2 font-semibold transition ${
                  activeTab === "active"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-primary"
                }`}
              >
                Đang đấu giá
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  {activeBids.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("won")}
                className={`pb-4 px-2 border-b-2 font-semibold transition ${
                  activeTab === "won"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-primary"
                }`}
              >
                Đã thắng
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-950/20 text-green-600">
                  {wonBids.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("lost")}
                className={`pb-4 px-2 border-b-2 font-semibold transition ${
                  activeTab === "lost"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-primary"
                }`}
              >
                Đã thua
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600">
                  {lostBids.length}
                </span>
              </button>
            </div>
          </div>

          {/* Bids List */}
          {currentBids.length > 0 ? (
            <div className="space-y-4">
              {currentBids.map((bid) => {
                const status = getBidStatus(bid);
                return (
                  <Card key={bid.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <a href={`/product/${bid.productId}`}>
                            <img
                              src={bid.productImage}
                              alt={bid.productTitle}
                              className="w-full md:w-48 h-48 object-cover rounded-lg hover:opacity-90 transition"
                            />
                          </a>
                        </div>

                        {/* Bid Information */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <a
                              href={`/product/${bid.productId}`}
                              className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary transition"
                            >
                              {bid.productTitle}
                            </a>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <span>Người bán: {bid.seller}</span>
                              <span>•</span>
                              <span>{bid.totalBids} lượt đấu giá</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Giá đấu của bạn
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatPrice(bid.myMaxBid)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Giá hiện tại
                              </div>
                              <div className="text-lg font-bold text-primary">
                                {formatPrice(bid.currentPrice)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Thời gian còn lại
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {getTimeRemaining(bid.endTime)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}
                            >
                              {status.text}
                            </span>

                            <div className="flex gap-2">
                              {activeTab === "active" && (
                                <>
                                  {bid.isOutbid && (
                                    <Button
                                      onClick={() =>
                                        (window.location.href = `/product/${bid.productId}`)
                                      }
                                    >
                                      Đấu giá lại
                                    </Button>
                                  )}
                                  {bid.buyNowPrice && (
                                    <Button variant="outline">
                                      Mua ngay {formatPrice(bid.buyNowPrice)}
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      (window.location.href = `/product/${bid.productId}`)
                                    }
                                  >
                                    Xem chi tiết
                                  </Button>
                                </>
                              )}
                              {activeTab === "won" && (
                                <>
                                  <Button>Hoàn tất đơn hàng</Button>
                                  <Button variant="outline">Liên hệ người bán</Button>
                                </>
                              )}
                              {activeTab === "lost" && (
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    (window.location.href = `/product/${bid.productId}`)
                                  }
                                >
                                  Xem sản phẩm
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có đấu giá nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {activeTab === "active" &&
                  "Bạn chưa tham gia đấu giá nào. Khám phá các sản phẩm và bắt đầu đấu giá ngay!"}
                {activeTab === "won" && "Bạn chưa thắng đấu giá nào."}
                {activeTab === "lost" && "Bạn chưa thua đấu giá nào."}
              </p>
              <Button onClick={() => (window.location.href = "/products")} size="lg">
                Khám phá sản phẩm
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyBidsPage;
