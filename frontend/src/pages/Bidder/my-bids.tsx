import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  title: string;
  images: string[];
  currentPrice: string;
  status: string;
  endTime: string;
  category: {
    id: string;
    name: string;
  };
  currentWinner: {
    id: string;
    fullName: string;
  } | null;
  _count: {
    bids: number;
  };
  isWinning: boolean;
  buyNowPrice?: string;
}

const MyBidsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "won" | "lost">(
    "active"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false,
  });

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    fetchBiddingProducts();
  }, [pagination.page]);

  const fetchBiddingProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/users/bidding-products?page=${pagination.page}&limit=${pagination.limit}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching bidding products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on active tab
  const filteredProducts = products.filter((product) => {
    if (activeTab === "active") {
      return product.status === "ACTIVE";
    } else if (activeTab === "won") {
      return product.status !== "ACTIVE" && product.isWinning;
    } else {
      // lost
      return product.status !== "ACTIVE" && !product.isWinning;
    }
  });

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numPrice);
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

  const getBidStatus = (product: Product) => {
    if (activeTab === "won") {
      return {
        text: "Thắng đấu giá",
        color: "text-green-600 bg-green-50 dark:bg-green-950/20",
      };
    }
    if (activeTab === "lost") {
      return {
        text: "Thua đấu giá",
        color: "text-red-600 bg-red-50 dark:bg-red-950/20",
      };
    }
    if (product.isWinning) {
      return {
        text: "Đang dẫn đầu",
        color: "text-green-600 bg-green-50 dark:bg-green-950/20",
      };
    }
    return {
      text: "Đang tham gia",
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
    };
  };

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
                  {products.filter((p) => p.status === "ACTIVE").length}
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
                  {
                    products.filter((p) => p.status !== "ACTIVE" && p.isWinning)
                      .length
                  }
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
                  {
                    products.filter(
                      (p) => p.status !== "ACTIVE" && !p.isWinning
                    ).length
                  }
                </span>
              </button>
            </div>
          </div>

          {/* Bids List */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const status = getBidStatus(product);
                return (
                  <Card key={product.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <a href={`/product/${product.id}`}>
                            <img
                              src={
                                product.images[0] ||
                                "https://via.placeholder.com/300"
                              }
                              alt={product.title}
                              className="w-full md:w-48 h-48 object-cover rounded-lg hover:opacity-90 transition"
                            />
                          </a>
                        </div>

                        {/* Bid Information */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <a
                              href={`/product/${product.id}`}
                              className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary transition"
                            >
                              {product.title}
                            </a>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <span>Danh mục: {product.category.name}</span>
                              <span>•</span>
                              <span>{product._count.bids} lượt đấu giá</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Giá hiện tại
                              </div>
                              <div className="text-lg font-bold text-primary">
                                {formatPrice(product.currentPrice)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Thời gian còn lại
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {getTimeRemaining(product.endTime)}
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
                                  {!product.isWinning && (
                                    <Button
                                      onClick={() =>
                                        navigate(`/product/${product.id}`)
                                      }
                                    >
                                      Đấu giá lại
                                    </Button>
                                  )}
                                  {/* {product.buyNowPrice && (
                                    <Button variant="outline">
                                      Mua ngay{" "}
                                      {formatPrice(product.buyNowPrice)}
                                    </Button>
                                  )} */}
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      navigate(`/product/${product.id}`)
                                    }
                                  >
                                    Xem chi tiết
                                  </Button>
                                </>
                              )}
                              {activeTab === "won" && (
                                <>
                                  <Button
                                    onClick={() =>
                                      navigate(`/order/${product.id}`)
                                    }
                                  >
                                    Hoàn tất đơn hàng
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      navigate(`/product/${product.id}`)
                                    }
                                  >
                                    Xem chi tiết
                                  </Button>
                                </>
                              )}
                              {activeTab === "lost" && (
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    navigate(`/product/${product.id}`)
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
              <Button onClick={() => navigate("/products")} size="lg">
                Khám phá sản phẩm
              </Button>
            </div>
          )}

          {/* Pagination */}
          {!loading &&
            filteredProducts.length > 0 &&
            pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (pagination.page > 1) {
                            setPagination({
                              ...pagination,
                              page: pagination.page - 1,
                            });
                          }
                        }}
                        className={
                          pagination.page === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {/* First page */}
                    {pagination.page > 2 && (
                      <>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPagination({ ...pagination, page: 1 });
                            }}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {pagination.page > 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </>
                    )}

                    {/* Previous page */}
                    {pagination.page > 1 && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPagination({
                              ...pagination,
                              page: pagination.page - 1,
                            });
                          }}
                        >
                          {pagination.page - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Current page */}
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        {pagination.page}
                      </PaginationLink>
                    </PaginationItem>

                    {/* Next page */}
                    {pagination.page < pagination.totalPages && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPagination({
                              ...pagination,
                              page: pagination.page + 1,
                            });
                          }}
                        >
                          {pagination.page + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Last page */}
                    {pagination.page < pagination.totalPages - 1 && (
                      <>
                        {pagination.page < pagination.totalPages - 2 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPagination({
                                ...pagination,
                                page: pagination.totalPages,
                              });
                            }}
                          >
                            {pagination.totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (pagination.page < pagination.totalPages) {
                            setPagination({
                              ...pagination,
                              page: pagination.page + 1,
                            });
                          }
                        }}
                        className={
                          pagination.page === pagination.totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyBidsPage;
