import { useState } from "react";
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
} from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: typeof Users;
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

  // Calculate dates once at component mount
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

  // Mock statistics data
  // TODO: Replace with API call to fetch admin dashboard stats
  const stats: StatCard[] = [
    {
      title: "Tổng người dùng",
      value: "12,450",
      change: "+12% so với tháng trước",
      trend: "up",
      icon: Users,
    },
    {
      title: "Đấu giá hoạt động",
      value: 342,
      change: "+8% so với tuần trước",
      trend: "up",
      icon: Package,
    },
    {
      title: "Doanh thu tháng này",
      value: "₫1.2 tỷ",
      change: "+15% so với tháng trước",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Yêu cầu nâng cấp",
      value: 28,
      change: "Đang chờ xét duyệt",
      trend: "neutral",
      icon: TrendingUp,
    },
  ];

  // Mock recent activity data
  // TODO: Replace with API call to fetch recent admin activity
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

  const formatPrice = (price: string) => {
    return price;
  };

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
          <p className="text-gray-600">
            Tổng quan và quản lý hệ thống đấu giá
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
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

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/admin/users")}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Yêu cầu nâng cấp ({stats[3].value})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
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
              <Button variant="outline" onClick={() => navigate("/admin/activity")}>
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
