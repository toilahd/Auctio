import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuctionCard from "@/components/AuctionCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const WatchlistPage = () => {
  // Mock watchlist data - TODO: Fetch from backend
  const [watchlist, setWatchlist] = useState([
    {
      id: "1",
      title: "iPhone 15 Pro Max 256GB - Nguyên seal, chưa kích hoạt",
      currentPrice: 25000000,
      buyNowPrice: 30000000,
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      totalBids: 45,
      seller: "TechStore VN",
      isEnding: true,
    },
    {
      id: "3",
      title: "Sony WH-1000XM5 - Tai nghe chống ồn cao cấp",
      currentPrice: 6500000,
      buyNowPrice: 8000000,
      imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500",
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      totalBids: 18,
      seller: "AudioPro",
    },
    {
      id: "7",
      title: "Rolex Submariner Date 126610LN - Fullbox 2023",
      currentPrice: 250000000,
      imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500",
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 98,
      seller: "Luxury Watches",
    },
    {
      id: "8",
      title: "PlayStation 5 Slim + 2 tay cầm + 5 game AAA",
      currentPrice: 15000000,
      buyNowPrice: 18000000,
      imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500",
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 86,
      seller: "GameHub",
    },
    {
      id: "11",
      title: "Mercedes-Benz S-Class S500 2023 - Màu đen, đi 5000km",
      currentPrice: 4500000000,
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500",
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 15,
      seller: "Luxury Auto",
    },
  ]);

  const handleRemoveFromWatchlist = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này khỏi danh sách theo dõi?")) {
      setWatchlist((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Danh sách theo dõi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {watchlist.length} sản phẩm đang theo dõi
            </p>
          </div>

          {watchlist.length > 0 ? (
            <>
              {/* Filter Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Lọc theo:
                  </span>
                  <Button variant="outline" size="sm">
                    Tất cả
                  </Button>
                  <Button variant="ghost" size="sm">
                    Sắp kết thúc
                  </Button>
                  <Button variant="ghost" size="sm">
                    Có "Mua ngay"
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách theo dõi?")) {
                      setWatchlist([]);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Xóa tất cả
                </Button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {watchlist.map((product) => (
                  <div key={product.id} className="relative group">
                    <AuctionCard {...product} isEnding={product.isEnding} />
                    <button
                      onClick={() => handleRemoveFromWatchlist(product.id)}
                      className="absolute top-2 right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950/20"
                      title="Xóa khỏi danh sách theo dõi"
                    >
                      <svg
                        className="w-5 h-5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Info Banner */}
              <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Thông báo về sản phẩm theo dõi
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Bạn sẽ nhận được thông báo khi sản phẩm sắp kết thúc (còn 1 giờ) hoặc khi
                      có người đấu giá vượt qua bạn. Bật thông báo trong phần cài đặt để không
                      bỏ lỡ.
                    </p>
                  </div>
                </div>
              </div>
            </>
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Danh sách theo dõi trống
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Bạn chưa theo dõi sản phẩm nào. Nhấn vào biểu tượng trái tim trên sản phẩm để
                thêm vào danh sách theo dõi.
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

export default WatchlistPage;
