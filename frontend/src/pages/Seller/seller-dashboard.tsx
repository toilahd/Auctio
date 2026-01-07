import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import {
  Gavel,
  Package,
  DollarSign,
  Star,
  Eye,
  Heart,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  XCircle,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  imageUrl: string;
  currentPrice: number;
  startingPrice: number;
  totalBids: number;
  endTime: string;
  status: "ACTIVE" | "ENDED" | "CANCELED" | "PAYED";
  views: number;
  watchers: number;
  currentWinnerId?: string;
  currentWinnerName?: string;
  hasRated?: boolean;
}

const SellerDashboardPage = () => {
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const [activeTab, setActiveTab] = useState<"active" | "ended">("active");
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [endedProducts, setEndedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [ratingType, setRatingType] = useState<1 | -1 | null>(null);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [endedPage, setEndedPage] = useState(1);
  const [activeTotalPages, setActiveTotalPages] = useState(1);
  const [endedTotalPages, setEndedTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({
    activeAuctions: 0,
    totalSold: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalViews: 0,
    totalWatchers: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        // Fetch active products
        const activeResponse = await fetch(
          `${BACKEND_URL}/api/seller/products/active?page=${activePage}&limit=${itemsPerPage}`,
          { credentials: "include" }
        );
        const activeData = await activeResponse.json();

        // Fetch completed products
        const completedResponse = await fetch(
          `${BACKEND_URL}/api/seller/products/completed?page=${endedPage}&limit=${itemsPerPage}`,
          { credentials: "include" }
        );
        const completedData = await completedResponse.json();

        if (activeData.success && activeData.data) {
          const formattedActive = activeData.data.products.map((p: any) => ({
            id: p.id,
            title: p.title,
            imageUrl: p.images[0] || "https://via.placeholder.com/500",
            currentPrice: p.currentPrice,
            startingPrice: p.startPrice,
            totalBids: p._count?.bids || 0,
            endTime: p.endTime,
            status: p.status as "ACTIVE" | "ENDED" | "CANCELED" | "PAYED",
            views: 0, // Not available in backend
            watchers: p._count?.watchLists || 0,
          }));
          setActiveProducts(formattedActive);
          setActiveTotalPages(
            Math.ceil(
              (activeData.data.total || activeData.data.products.length) /
                itemsPerPage
            )
          );
        }

        if (completedData.success && completedData.data) {
          const formattedCompleted = completedData.data.products.map(
            (p: any) => ({
              id: p.id,
              title: p.title,
              imageUrl: p.images[0] || "https://via.placeholder.com/500",
              currentPrice: p.currentPrice,
              startingPrice: p.startPrice,
              totalBids: p._count?.bids || 0,
              endTime: p.endTime,
              status: p.status as "ACTIVE" | "ENDED" | "CANCELED" | "PAYED",
              views: 0, // Not available in backend
              watchers: 0,
              currentWinnerId: p.currentWinnerId,
              currentWinnerName: p.currentWinner?.fullName || "Unknown",
              hasRated: p.hasRatedWinner || false,
            })
          );
          setEndedProducts(formattedCompleted);
          setEndedTotalPages(
            Math.ceil(
              (completedData.data.total || completedData.data.products.length) /
                itemsPerPage
            )
          );

          // Calculate stats (only once when on first page)
          if (endedPage === 1 && activePage === 1) {
            const totalSold = completedData.data.products.filter(
              (p: any) => p.currentWinnerId
            ).length;
            const totalRevenue = completedData.data.products
              .filter((p: any) => p.currentWinnerId)
              .reduce((sum: number, p: any) => sum + p.currentPrice, 0);

            setStats({
              activeAuctions:
                activeData.data.total || activeData.data.products.length,
              totalSold,
              totalRevenue,
              averageRating: 0, // Not calculated yet
              totalViews: 0, // Not available in backend
              totalWatchers: activeData.data.products.reduce(
                (sum: number, p: any) => sum + (p._count?.watchLists || 0),
                0
              ),
            });
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [activePage, endedPage]);

  const handleOpenRatingModal = (product: Product) => {
    setSelectedProduct(product);
    setRatingType(null);
    setRatingComment("");
    setShowRatingModal(true);
  };

  const handleOpenCancelModal = (product: Product) => {
    setSelectedProduct(product);
    setShowCancelModal(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedProduct || !ratingType) {
      alert("Vui lòng chọn loại đánh giá");
      return;
    }

    if (ratingComment.trim().length < 10) {
      alert("Nhận xét phải có ít nhất 10 ký tự");
      return;
    }

    setIsSubmittingRating(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/seller/products/${selectedProduct.id}/rate-winner`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            rating: ratingType,
            comment: ratingComment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể gửi đánh giá");
      }

      alert("Đánh giá đã được gửi thành công!");
      setShowRatingModal(false);

      // Update product in list
      setEndedProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id ? { ...p, hasRated: true } : p
        )
      );
    } catch (error: any) {
      alert(error.message || "Đã xảy ra lỗi");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleCancelTransaction = async () => {
    if (!selectedProduct) return;

    setIsSubmittingRating(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/seller/products/${selectedProduct.id}/cancel-transaction`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể hủy giao dịch");
      }

      alert(
        "Giao dịch đã được hủy và người thắng đã nhận đánh giá tiêu cực (-1)"
      );
      setShowCancelModal(false);

      // Update product in list
      setEndedProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id ? { ...p, hasRated: true } : p
        )
      );
    } catch (error: any) {
      alert(error.message || "Đã xảy ra lỗi");
    } finally {
      setIsSubmittingRating(false);
    }
  };

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
      ACTIVE: {
        text: "Đang đấu giá",
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400",
      },
      ENDED: {
        text: "Chờ thanh toán",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400",
      },
      PAYED: {
        text: "Đã thanh toán",
        color:
          "bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400",
      },
      CANCELED: {
        text: "Không có người thắng",
        color: "bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400",
      },
    };
    return badges[status];
  };

  const currentProducts =
    activeTab === "active" ? activeProducts : endedProducts;
  const currentPage = activeTab === "active" ? activePage : endedPage;
  const totalPages =
    activeTab === "active" ? activeTotalPages : endedTotalPages;
  const setCurrentPage = activeTab === "active" ? setActivePage : setEndedPage;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
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
            <Button
              onClick={() => (window.location.href = "/seller/create-product")}
              size="lg"
            >
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
                        {activeTab === "active"
                          ? "Thời gian còn lại"
                          : "Trạng thái"}
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
                      console.log(
                        `Product ID: ${product.id}, Status: ${product.status}, Badge:`,
                        badge
                      );
                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
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
                                +
                                {formatPrice(
                                  product.currentPrice - product.startingPrice
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {product.totalBids}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.status === "ACTIVE" ? (
                              <div className="text-sm text-gray-900 dark:text-white">
                                {getTimeRemaining(product.endTime)}
                              </div>
                            ) : (
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}
                              >
                                {badge.text}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-3">
                              <span
                                className="flex items-center gap-1"
                                title="Lượt xem"
                              >
                                <Eye className="w-4 h-4" /> {product.views}
                              </span>
                              <span
                                className="flex items-center gap-1"
                                title="Theo dõi"
                              >
                                <Heart className="w-4 h-4" /> {product.watchers}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              {product.status === "ACTIVE" ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      (window.location.href = `/seller/edit-product/${product.id}`)
                                    }
                                  >
                                    Sửa
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      (window.location.href =
                                        "/seller/qa-management")
                                    }
                                  >
                                    Q&A
                                  </Button>
                                </>
                              ) : product.status === "ENDED" ||
                                product.status === "PAYED" ||
                                product.status === "SHIPPING" ||
                                product.status === "DELIVERED" ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() =>
                                      (window.location.href = `/order/${product.id}`)
                                    }
                                  >
                                    Quản lý đơn hàng
                                  </Button>
                                  {!product.hasRated &&
                                    product.status === "ENDED" && (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          handleOpenCancelModal(product)
                                        }
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Hủy
                                      </Button>
                                    )}
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    (window.location.href =
                                      "/seller/create-product")
                                  }
                                >
                                  Đăng lại
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                          }}
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      {/* First page */}
                      {currentPage > 2 && (
                        <>
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(1);
                              }}
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>
                          {currentPage > 3 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                        </>
                      )}

                      {/* Current page and neighbors */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === currentPage ||
                            page === currentPage - 1 ||
                            page === currentPage + 1
                        )
                        .map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                      {/* Last page */}
                      {currentPage < totalPages - 1 && (
                        <>
                          {currentPage < totalPages - 2 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(totalPages);
                              }}
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages)
                              handlePageChange(currentPage + 1);
                          }}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đánh giá người thắng đấu giá</DialogTitle>
            <DialogDescription>
              {selectedProduct?.title}
              <br />
              Người thắng: <strong>{selectedProduct?.currentWinnerName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-3">
                Đánh giá của bạn
              </label>
              <div className="flex gap-4">
                <Button
                  variant={ratingType === 1 ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setRatingType(1)}
                >
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  Tích cực (+1)
                </Button>
                <Button
                  variant={ratingType === -1 ? "destructive" : "outline"}
                  className="flex-1"
                  onClick={() => setRatingType(-1)}
                >
                  <ThumbsDown className="w-5 h-5 mr-2" />
                  Tiêu cực (-1)
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Nhận xét (tối thiểu 10 ký tự)
              </label>
              <Textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn với người thắng..."
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                {ratingComment.length} ký tự
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRatingModal(false)}
              disabled={isSubmittingRating}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={isSubmittingRating || !ratingType}
            >
              {isSubmittingRating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi đánh giá"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Transaction Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận hủy giao dịch</DialogTitle>
            <DialogDescription>
              {selectedProduct?.title}
              <br />
              Người thắng: <strong>{selectedProduct?.currentWinnerName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Lưu ý:</strong> Khi hủy giao dịch:
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 ml-4 list-disc space-y-1">
                <li>Người thắng sẽ tự động nhận đánh giá tiêu cực (-1)</li>
                <li>Nhận xét mặc định: "Người thắng không thanh toán"</li>
                <li>Hành động này không thể hoàn tác</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={isSubmittingRating}
            >
              Quay lại
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelTransaction}
              disabled={isSubmittingRating}
            >
              {isSubmittingRating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận hủy"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SellerDashboardPage;
