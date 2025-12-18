import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { Gavel, Package, DollarSign, Star, Eye, Heart } from "lucide-react";

interface Product {
  id: string;
  title: string;
  imageUrl: string;
  currentPrice: number;
  startingPrice: number;
  totalBids: number;
  endTime: string;
  status: "active" | "ended" | "sold" | "unsold";
  views: number;
  watchers: number;
}

const SellerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<"active" | "ended">("active");

  // Mock data - TODO: Fetch from backend
  const stats = {
    activeAuctions: 5,
    totalSold: 42,
    totalRevenue: 850000000,
    averageRating: 4.8,
    totalViews: 12450,
    totalWatchers: 345,
  };

  // Calculate end times once at component mount
  const [productDates] = useState(() => {
    const now = Date.now();
    return {
      active1: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      active2: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
      active3: new Date(now + 6 * 60 * 60 * 1000).toISOString(),
      ended1: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      ended2: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      ended3: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  const activeProducts: Product[] = [
    {
      id: "1",
      title: "iPhone 15 Pro Max 256GB - Nguyên seal",
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
      currentPrice: 25000000,
      startingPrice: 20000000,
      totalBids: 45,
      endTime: productDates.active1,
      status: "active",
      views: 1250,
      watchers: 89,
    },
    {
      id: "2",
      title: "MacBook Pro M3 14 inch 2024",
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
      currentPrice: 35000000,
      startingPrice: 30000000,
      totalBids: 32,
      endTime: productDates.active2,
      status: "active",
      views: 980,
      watchers: 67,
    },
    {
      id: "3",
      title: "Sony WH-1000XM5 - Tai nghe chống ồn",
      imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500",
      currentPrice: 6500000,
      startingPrice: 5000000,
      totalBids: 18,
      endTime: productDates.active3,
      status: "active",
      views: 560,
      watchers: 34,
    },
  ];

  const endedProducts: Product[] = [
    {
      id: "101",
      title: "iPad Air M2 2024 - WiFi 128GB",
      imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
      currentPrice: 12000000,
      startingPrice: 10000000,
      totalBids: 28,
      endTime: productDates.ended1,
      status: "sold",
      views: 850,
      watchers: 45,
    },
    {
      id: "102",
      title: "AirPods Pro 2 - Chính hãng VN",
      imageUrl: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500",
      currentPrice: 4500000,
      startingPrice: 4000000,
      totalBids: 15,
      endTime: productDates.ended2,
      status: "sold",
      views: 420,
      watchers: 28,
    },
    {
      id: "103",
      title: "Samsung Galaxy Watch 6 Classic",
      imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
      currentPrice: 3000000,
      startingPrice: 3000000,
      totalBids: 0,
      endTime: productDates.ended3,
      status: "unsold",
      views: 125,
      watchers: 8,
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

  const getStatusBadge = (status: Product["status"]) => {
    const badges = {
      active: { text: "Đang đấu giá", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400" },
      ended: { text: "Đã kết thúc", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
      sold: { text: "Đã bán", color: "bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400" },
      unsold: { text: "Chưa bán", color: "bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400" },
    };
    return badges[status];
  };

  const currentProducts = activeTab === "active" ? activeProducts : endedProducts;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Bảng điều khiển người bán
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Quản lý sản phẩm và theo dõi hoạt động bán hàng
              </p>
            </div>
            <Button onClick={() => (window.location.href = "/seller/create-product")} size="lg">
              + Đăng sản phẩm mới
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Gavel className="w-4 h-4" />
                  Đang đấu giá
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.activeAuctions}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Đã bán
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalSold}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Doanh thu
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-green-600 break-words">
                  {formatPrice(stats.totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Đánh giá
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-600" />
                  {stats.averageRating}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Lượt xem
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalViews.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Theo dõi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalWatchers}
                </div>
              </CardContent>
            </Card>
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
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-950/20 text-blue-600">
                  {activeProducts.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("ended")}
                className={`pb-4 px-2 border-b-2 font-semibold transition ${
                  activeTab === "ended"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-primary"
                }`}
              >
                Đã kết thúc
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600">
                  {endedProducts.length}
                </span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-900 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Giá khởi điểm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Giá hiện tại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Lượt đấu giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {activeTab === "active" ? "Thời gian còn lại" : "Trạng thái"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Thống kê
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentProducts.map((product) => {
                      const badge = getStatusBadge(product.status);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="ml-4">
                                <a
                                  href={`/product/${product.id}`}
                                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary"
                                >
                                  {product.title}
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatPrice(product.startingPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-primary">
                              {formatPrice(product.currentPrice)}
                            </div>
                            {product.currentPrice > product.startingPrice && (
                              <div className="text-xs text-green-600">
                                +{formatPrice(product.currentPrice - product.startingPrice)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {product.totalBids}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {activeTab === "active" ? (
                              <div className="text-sm text-gray-900 dark:text-white">
                                {getTimeRemaining(product.endTime)}
                              </div>
                            ) : (
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                                {badge.text}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1" title="Lượt xem">
                                <Eye className="w-4 h-4" /> {product.views}
                              </span>
                              <span className="flex items-center gap-1" title="Theo dõi">
                                <Heart className="w-4 h-4" /> {product.watchers}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              {activeTab === "active" ? (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => (window.location.href = `/seller/edit-product/${product.id}`)}
                                  >
                                    Sửa
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => (window.location.href = "/seller/qa-management")}
                                  >
                                    Q&A
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {product.status === "sold" ? (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => (window.location.href = `/order/${product.id}`)}
                                    >
                                      Hoàn tất
                                    </Button>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => (window.location.href = "/seller/create-product")}
                                    >
                                      Đăng lại
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellerDashboardPage;
