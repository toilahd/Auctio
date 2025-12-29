import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Clock,
  Flame,
  Gem,
  Search,
  Sparkles,
} from "lucide-react";

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

const HomePage = () => {
  const navigate = useNavigate();
  const [endingSoon, setEndingSoon] = useState<Product[]>([]);
  const [mostBid, setMostBid] = useState<Product[]>([]);
  const [highestPrice, setHighestPrice] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [endingSoonRes, mostBidRes, highestPriceRes] = await Promise.all([
          fetch("http://localhost:3000/api/products/top/ending_soon"),
          fetch("http://localhost:3000/api/products/top/most_bids"),
          fetch("http://localhost:3000/api/products/top/highest_price"),
        ]);

        const [endingSoonData, mostBidData, highestPriceData] =
          await Promise.all([
            endingSoonRes.json(),
            mostBidRes.json(),
            highestPriceRes.json(),
          ]);

        if (endingSoonData.success) setEndingSoon(endingSoonData.data);
        if (mostBidData.success) setMostBid(mostBidData.data);
        if (highestPriceData.success) setHighestPrice(highestPriceData.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-r from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-500/20 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Chào mừng đến với Auctio
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Nền tảng đấu giá trực tuyến hàng đầu Việt Nam. Tìm kiếm và sở
                hữu những sản phẩm chất lượng với giá tốt nhất.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-lg px-8"
                  onClick={() => navigate("/search")}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Khám phá ngay
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                  onClick={() => navigate("/about")}
                >
                  Tìm hiểu thêm
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Ending Soon Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-7 h-7 text-destructive" />
                  Sắp kết thúc
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Nhanh tay đấu giá trước khi quá muộn
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/search?sortBy=endTime&order=asc")}
              >
                Xem tất cả <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {endingSoon.length > 0 ? (
                endingSoon.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                  />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
                  Không có sản phẩm nào
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Most Bid Section */}
        <section className="py-12 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-7 h-7 text-orange-500" />
                  Đấu giá nhiều nhất
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Sản phẩm được quan tâm nhất
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/search?sortBy=bidCount&order=desc")}
              >
                Xem tất cả <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {mostBid.length > 0 ? (
                mostBid.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                  />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
                  Không có sản phẩm nào
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Highest Price Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Gem className="w-7 h-7 text-blue-500" />
                  Giá trị cao nhất
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Những sản phẩm cao cấp, giá trị lớn
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/search?sortBy=price&order=desc")}
              >
                Xem tất cả <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {highestPrice.length > 0 ? (
                highestPrice.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                  />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
                  Không có sản phẩm nào
                </p>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5 dark:bg-primary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Bạn muốn bán sản phẩm?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Đăng ký trở thành người bán và tiếp cận hàng ngàn khách hàng tiềm
              năng
            </p>
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => navigate("/seller/create-product")}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Đăng sản phẩm ngay
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
