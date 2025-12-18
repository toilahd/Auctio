import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Search,
  Filter,
} from "lucide-react";

interface WonAuction {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  finalPrice: number;
  wonAt: string;
  sellerId: string;
  sellerName: string;
  orderStatus:
    | "pending_payment"
    | "payment_confirmed"
    | "shipping"
    | "delivered"
    | "completed";
  paymentDeadline?: string;
  trackingNumber?: string;
  deliveredAt?: string;
}

export default function WonAuctionsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Calculate dates once at component mount
  const [orderDates] = useState(() => {
    const now = Date.now();
    return {
      order1Won: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      order1Deadline: new Date(now + 22 * 60 * 60 * 1000).toISOString(),
      order2Won: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      order3Won: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      order3Delivered: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      order4Won: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
      order4Delivered: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
      order5Won: new Date(now - 30 * 60 * 1000).toISOString(),
      order5Deadline: new Date(now + 23.5 * 60 * 60 * 1000).toISOString(),
    };
  });

  // Mock won auctions data
  // TODO: Replace with API call to fetch user's won auctions
  const wonAuctions: WonAuction[] = useMemo(
    () => [
      {
        id: "order1",
        productId: "1",
        productTitle: "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
        productImage: "https://via.placeholder.com/400x300",
        finalPrice: 25000000,
        wonAt: orderDates.order1Won,
        sellerId: "seller1",
        sellerName: "TechStore VN",
        orderStatus: "payment_confirmed",
        paymentDeadline: orderDates.order1Deadline,
      },
      {
        id: "order2",
        productId: "2",
        productTitle: "MacBook Pro 14 inch M3 Pro 18GB 512GB",
        productImage: "https://via.placeholder.com/400x300",
        finalPrice: 45000000,
        wonAt: orderDates.order2Won,
        sellerId: "seller2",
        sellerName: "Apple Premium",
        orderStatus: "shipping",
        trackingNumber: "VNP123456789",
      },
      {
        id: "order3",
        productId: "3",
        productTitle: "Đồng hồ Rolex Submariner Date Automatic",
        productImage: "https://via.placeholder.com/400x300",
        finalPrice: 180000000,
        wonAt: orderDates.order3Won,
        sellerId: "seller3",
        sellerName: "Luxury Watches",
        orderStatus: "delivered",
        deliveredAt: orderDates.order3Delivered,
      },
      {
        id: "order4",
        productId: "4",
        productTitle: "iPad Pro 12.9 inch M2 256GB WiFi",
        productImage: "https://via.placeholder.com/400x300",
        finalPrice: 18000000,
        wonAt: orderDates.order4Won,
        sellerId: "seller1",
        sellerName: "TechStore VN",
        orderStatus: "completed",
        deliveredAt: orderDates.order4Delivered,
      },
      {
        id: "order5",
        productId: "5",
        productTitle: "Sony WH-1000XM5 Wireless Headphones",
        productImage: "https://via.placeholder.com/400x300",
        finalPrice: 6500000,
        wonAt: orderDates.order5Won,
        sellerId: "seller4",
        sellerName: "Audio Store",
        orderStatus: "pending_payment",
        paymentDeadline: orderDates.order5Deadline,
      },
    ],
    [orderDates]
  );

  const getStatusBadge = (status: WonAuction["orderStatus"]) => {
    const statusConfig = {
      pending_payment: {
        label: "Chờ thanh toán",
        color: "bg-orange-100 text-orange-800 border-orange-300",
        icon: Clock,
      },
      payment_confirmed: {
        label: "Đã xác nhận thanh toán",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: CreditCard,
      },
      shipping: {
        label: "Đang giao hàng",
        color: "bg-purple-100 text-purple-800 border-purple-300",
        icon: Truck,
      },
      delivered: {
        label: "Đã giao hàng",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: Package,
      },
      completed: {
        label: "Hoàn thành",
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: CheckCircle,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </div>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTimeRemaining = (deadline: string) => {
    const end = new Date(deadline).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return "Đã hết hạn";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  const handlePayNow = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  const filteredAuctions = useMemo(() => {
    let results = [...wonAuctions];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((auction) =>
        auction.productTitle.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      results = results.filter((auction) => auction.orderStatus === statusFilter);
    }

    return results;
  }, [wonAuctions, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: wonAuctions.length,
      pendingPayment: wonAuctions.filter((a) => a.orderStatus === "pending_payment")
        .length,
      shipping: wonAuctions.filter((a) => a.orderStatus === "shipping").length,
      completed: wonAuctions.filter((a) => a.orderStatus === "completed").length,
    };
  }, [wonAuctions]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đấu giá đã thắng
          </h1>
          <p className="text-gray-600">
            Quản lý các đơn hàng từ đấu giá bạn đã thắng
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng số</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ thanh toán</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.pendingPayment}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang giao</p>
                <p className="text-2xl font-bold text-purple-600">{stats.shipping}</p>
              </div>
              <Truck className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending_payment">Chờ thanh toán</SelectItem>
                  <SelectItem value="payment_confirmed">Đã thanh toán</SelectItem>
                  <SelectItem value="shipping">Đang giao hàng</SelectItem>
                  <SelectItem value="delivered">Đã giao hàng</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Auctions List */}
        {filteredAuctions.length > 0 ? (
          <div className="space-y-4">
            {filteredAuctions.map((auction) => (
              <Card key={auction.id} className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={auction.productImage}
                      alt={auction.productTitle}
                      className="w-full md:w-40 h-32 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {auction.productTitle}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Người bán: {auction.sellerName}
                        </p>
                      </div>
                      {getStatusBadge(auction.orderStatus)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Giá thắng đấu giá</p>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-primary" />
                          <span className="text-xl font-bold text-primary">
                            {formatPrice(auction.finalPrice)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Thời gian thắng</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDateTime(auction.wonAt)}
                        </p>
                      </div>
                    </div>

                    {/* Status-specific info */}
                    {auction.orderStatus === "pending_payment" &&
                      auction.paymentDeadline && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 text-orange-800">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">
                              Vui lòng thanh toán trong{" "}
                              <strong>{getTimeRemaining(auction.paymentDeadline)}</strong>
                            </span>
                          </div>
                        </div>
                      )}

                    {auction.orderStatus === "shipping" && auction.trackingNumber && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-purple-800">
                          <Truck className="w-5 h-5" />
                          <span className="text-sm">
                            Mã vận đơn:{" "}
                            <strong className="font-mono">{auction.trackingNumber}</strong>
                          </span>
                        </div>
                      </div>
                    )}

                    {auction.orderStatus === "delivered" && auction.deliveredAt && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm">
                            Đã giao hàng vào {formatDateTime(auction.deliveredAt)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {auction.orderStatus === "pending_payment" ? (
                        <>
                          <Button
                            onClick={() => handlePayNow(auction.id)}
                            className="bg-primary"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Thanh toán ngay
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleViewOrder(auction.id)}
                          >
                            Xem chi tiết
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handleViewOrder(auction.id)}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Xem đơn hàng
                        </Button>
                      )}

                      {auction.orderStatus === "delivered" && (
                        <Button variant="outline">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Xác nhận đã nhận
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy đơn hàng
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Không có đơn hàng nào phù hợp với bộ lọc của bạn."
                  : "Bạn chưa thắng đấu giá nào."}
              </p>
              <Button onClick={() => navigate("/products")}>
                Khám phá sản phẩm đấu giá
              </Button>
            </div>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
