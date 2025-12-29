import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Loader2,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: typeof Users;
}

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalBids: number;
  totalRevenue: number;
  activeAuctions: number;
  pendingUpgrades: number;
}

interface TopSeller {
  id: string;
  fullName: string;
  email: string;
  totalRevenue: number;
  totalSales: number;
}

interface TopProduct {
  id: string;
  title: string;
  currentPrice: number;
  totalBids: number;
  seller: {
    fullName: string;
  };
}

interface RecentActivity {
  id: string;
  type: "user" | "auction" | "upgrade" | "report";
  title: string;
  description: string;
  timestamp: string;
  status?: "pending" | "approved" | "rejected";
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, sellersRes, productsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/dashboard/stats`, {
          credentials: "include",
        }),
        fetch(`${BACKEND_URL}/api/admin/dashboard/top-sellers?limit=5`, {
          credentials: "include",
        }),
        fetch(
          `${BACKEND_URL}/api/admin/dashboard/top-products?limit=5&sortBy=bids`,
          {
            credentials: "include",
          }
        ),
      ]);

      // Check responses and provide specific error messages
      if (!statsRes.ok) {
        const contentType = statsRes.headers.get("content-type");
        const isJson = contentType?.includes("application/json");
        const errorMsg = isJson
          ? await statsRes.json().then((data) => data.message)
          : `API stats endpoint failed (${statsRes.status})`;
        throw new Error(errorMsg || "Failed to fetch stats");
      }

      if (!sellersRes.ok) {
        throw new Error(`Failed to fetch top sellers (${sellersRes.status})`);
      }

      if (!productsRes.ok) {
        throw new Error(`Failed to fetch top products (${productsRes.status})`);
      }

      const [statsData, sellersData, productsData] = await Promise.all([
        statsRes.json(),
        sellersRes.json(),
        productsRes.json(),
      ]);

      if (statsData.success) {
        setStats(statsData.data);
      }
      if (sellersData.success) {
        setTopSellers(sellersData.data);
      }
      if (productsData.success) {
        setTopProducts(productsData.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải dữ liệu dashboard";
      setError(
        errorMessage + " - Vui lòng kiểm tra backend server có đang chạy không"
      );
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const statCards: StatCard[] = stats && stats.totalUsers !== undefined
    ? [
        {
          title: "Tổng người dùng",
          value: stats.totalUsers.toLocaleString(),
          change: `${stats.totalUsers} tài khoản`,
          trend: "neutral" as const,
          icon: Users,
        },
        {
          title: "Đấu giá hoạt động",
          value: stats.activeAuctions ?? 0,
          change: `${stats.totalProducts ?? 0} tổng sản phẩm`,
          trend: "neutral" as const,
          icon: Package,
        },
        {
          title: "Tổng lượt đấu giá",
          value: (stats.totalBids ?? 0).toLocaleString(),
          change: `Trên toàn hệ thống`,
          trend: "neutral" as const,
          icon: DollarSign,
        },
        {
          title: "Yêu cầu nâng cấp",
          value: stats.pendingUpgrades ?? 0,
          change: "Đang chờ xét duyệt",
          trend: "neutral" as const,
          icon: TrendingUp,
        },
      ]
    : [];

  // Generate mock recent activity for now
  // TODO: Add API endpoint for recent activity/audit logs
  const [activityDates] = useState(() => {
    const now = Date.now();
    return {
      act1: new Date(now - 30 * 60 * 1000).toISOString(),
      act2: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
      act3: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      act4: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      act5: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    };
  });

  // Mock recent activity data
  // TODO: Add API endpoint for recent activity/audit logs
  const recentActivity: RecentActivity[] = [
    {
      id: "1",
      type: "upgrade",
      title: "Yêu cầu nâng cấp người bán mới",
      description: "TechStore VN đã gửi yêu cầu nâng cấp tài khoản người bán",
      timestamp: activityDates.act1,
      status: "pending",
    },
    {
      id: "2",
      type: "auction",
      title: "Đấu giá mới được tạo",
      description: "iPhone 15 Pro Max 256GB - Giá khởi điểm ₫20,000,000",
      timestamp: activityDates.act2,
    },
    {
      id: "3",
      type: "user",
      title: "Người dùng mới đăng ký",
      description: "Nguyễn Văn A đã hoàn tất đăng ký tài khoản",
      timestamp: activityDates.act3,
    },
    {
      id: "4",
      type: "report",
      title: "Báo cáo sản phẩm vi phạm",
      description: "Sản phẩm #1234 bị báo cáo vi phạm chính sách",
      timestamp: activityDates.act4,
      status: "pending",
    },
    {
      id: "5",
      type: "upgrade",
      title: "Phê duyệt người bán",
      description: "Apple Premium đã được phê duyệt làm người bán",
      timestamp: activityDates.act5,
      status: "approved",
    },
  ];

  const getTimeAgo = (dateString: string) => {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return "Vừa xong";
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "user":
        return Users;
      case "auction":
        return Package;
      case "upgrade":
        return TrendingUp;
      case "report":
        return AlertCircle;
      default:
        return Activity;
    }
  };

  const getStatusBadge = (status?: RecentActivity["status"]) => {
    if (!status) return null;

    const statusConfig = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: Clock,
      },
      approved: {
        label: "Đã duyệt",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
      },
      rejected: {
        label: "Từ chối",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản trị hệ thống
          </h1>
          <p className="text-gray-600">Tổng quan và quản lý hệ thống đấu giá</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <Card className="p-6 mb-8 border-red-200 bg-red-50">
            <p className="text-red-600">{error}</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="pt-6">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </CardTitle>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <p
                        className={`text-sm ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : stat.trend === "down"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Top Sellers and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Sellers */}
              <Card className="pt-6">
                <CardHeader>
                  <CardTitle>Người bán hàng đầu</CardTitle>
                </CardHeader>
                <CardContent>
                  {topSellers.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      Chưa có dữ liệu
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {topSellers.map((seller, index) => (
                        <div
                          key={seller.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {seller.fullName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {seller.totalSales} sản phẩm
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatPrice(seller.totalRevenue)}
                            </div>
                            <div className="text-xs text-gray-600">
                              Doanh thu
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card className="pt-6">
                <CardHeader>
                  <CardTitle>Sản phẩm hot nhất</CardTitle>
                </CardHeader>
                <CardContent>
                  {topProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      Chưa có dữ liệu
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 line-clamp-1">
                                {product.title}
                              </div>
                              <div className="text-sm text-gray-600">
                                {product.seller.fullName}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {product.totalBids} lượt
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatPrice(product.currentPrice)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <Card className="mb-8 pt-6">
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/admin/users")}
              >
                <Users className="w-4 h-4 mr-2" />
                Quản lý người dùng
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/admin/products")}
              >
                <Package className="w-4 h-4 mr-2" />
                Quản lý sản phẩm
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/admin/categories")}
              >
                <FileText className="w-4 h-4 mr-2" />
                Quản lý danh mục
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="pt-6">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {activity.title}
                        </h4>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/activity")}
              >
                Xem tất cả hoạt động
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
