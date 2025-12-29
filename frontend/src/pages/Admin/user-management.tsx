import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Users,
  Search,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  TrendingUp,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "BIDDER" | "SELLER" | "ADMIN";
  status: "active" | "banned" | "pending_verification";
  joinedAt: string;
  totalBids: number;
  wonAuctions: number;
  soldItems?: number;
  rating?: {
    positive: number;
    negative: number;
  };
}

interface UpgradeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  businessName: string;
  businessAddress: string;
  phoneNumber: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"users" | "upgrades">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Calculate dates once at component mount
  const [userDates] = useState(() => {
    const now = Date.now();
    return {
      u1Joined: new Date(now - 365 * 24 * 60 * 60 * 1000).toISOString(),
      u2Joined: new Date(now - 180 * 24 * 60 * 60 * 1000).toISOString(),
      u3Joined: new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString(),
      u4Joined: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
      u5Joined: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
      req1Submit: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      req2Submit: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      req3Submit: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      req3Reviewed: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  // Mock users data
  // TODO: Replace with API call to fetch users
  const [users, setUsers] = useState<User[]>([
    {
      id: "user1",
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0912345678",
      role: "SELLER",
      status: "active",
      joinedAt: userDates.u1Joined,
      totalBids: 156,
      wonAuctions: 45,
      soldItems: 38,
      rating: { positive: 42, negative: 3 },
    },
    {
      id: "user2",
      name: "Trần Thị B",
      email: "tranthib@example.com",
      phone: "0923456789",
      role: "BIDDER",
      status: "active",
      joinedAt: userDates.u2Joined,
      totalBids: 89,
      wonAuctions: 23,
      rating: { positive: 21, negative: 2 },
    },
    {
      id: "user3",
      name: "Lê Văn C",
      email: "levanc@example.com",
      phone: "0934567890",
      role: "SELLER",
      status: "active",
      joinedAt: userDates.u3Joined,
      totalBids: 67,
      wonAuctions: 18,
      soldItems: 52,
      rating: { positive: 48, negative: 4 },
    },
    {
      id: "user4",
      name: "Phạm Thị D",
      email: "phamthid@example.com",
      phone: "0945678901",
      role: "BIDDER",
      status: "pending_verification",
      joinedAt: userDates.u4Joined,
      totalBids: 5,
      wonAuctions: 1,
      rating: { positive: 1, negative: 0 },
    },
    {
      id: "user5",
      name: "Hoàng Văn E (Vi phạm)",
      email: "hoangvane@example.com",
      phone: "0956789012",
      role: "BIDDER",
      status: "banned",
      joinedAt: userDates.u5Joined,
      totalBids: 12,
      wonAuctions: 3,
      rating: { positive: 1, negative: 5 },
    },
  ]);

  // Mock upgrade requests data
  // TODO: Replace with API call to fetch upgrade requests
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([
    {
      id: "req1",
      userId: "user6",
      userName: "TechStore VN",
      userEmail: "techstore@example.com",
      businessName: "TechStore VN",
      businessAddress: "123 Đường ABC, Quận 1, TP.HCM",
      phoneNumber: "0901234567",
      reason:
        "Có kinh nghiệm bán đồ công nghệ hơn 5 năm. Muốn mở rộng kinh doanh trên nền tảng đấu giá.",
      status: "pending",
      submittedAt: userDates.req1Submit,
    },
    {
      id: "req2",
      userId: "user7",
      userName: "Fashion Shop",
      userEmail: "fashion@example.com",
      businessName: "Fashion Luxury",
      businessAddress: "456 Đường XYZ, Quận 3, TP.HCM",
      phoneNumber: "0912345678",
      reason: "Chuyên bán đồng hồ và túi xách cao cấp chính hãng.",
      status: "pending",
      submittedAt: userDates.req2Submit,
    },
    {
      id: "req3",
      userId: "user8",
      userName: "Unknown Seller",
      userEmail: "unknown@example.com",
      businessName: "Unknown Shop",
      businessAddress: "789 Đường DEF, Quận 10, TP.HCM",
      phoneNumber: "0923456789",
      reason: "Muốn bán hàng",
      status: "rejected",
      submittedAt: userDates.req3Submit,
      reviewedAt: userDates.req3Reviewed,
      reviewNote:
        "Thông tin không đầy đủ và không rõ ràng. Vui lòng cung cấp thêm chi tiết về kinh nghiệm và giấy tờ chứng minh.",
    },
  ]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(dateString));
  };

  const getRoleBadge = (role: User["role"]) => {
    const roleConfig = {
      BIDDER: {
        label: "Người mua",
        color: "bg-blue-100 text-blue-800",
      },
      SELLER: {
        label: "Người bán",
        color: "bg-green-100 text-green-800",
      },
      ADMIN: {
        label: "Quản trị",
        color: "bg-purple-100 text-purple-800",
      },
    };

    const config = roleConfig[role];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: User["status"]) => {
    const statusConfig = {
      active: {
        label: "Hoạt động",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      banned: {
        label: "Bị khóa",
        color: "bg-red-100 text-red-800",
        icon: Ban,
      },
      pending_verification: {
        label: "Chờ xác minh",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const handleViewUser = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleBanUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (confirm(`Bạn có chắc muốn khóa tài khoản "${user.name}"?`)) {
      // TODO: Replace with API call to ban user
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, status: "banned" as const } : u
        )
      );
    }
  };

  const handleUnbanUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (confirm(`Bạn có chắc muốn mở khóa tài khoản "${user.name}"?`)) {
      // TODO: Replace with API call to unban user
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, status: "active" as const } : u
        )
      );
    }
  };

  const handleApproveUpgrade = (requestId: string) => {
    const request = upgradeRequests.find((r) => r.id === requestId);
    if (!request) return;

    const reviewNote = prompt(
      `Phê duyệt yêu cầu của "${request.userName}".\n\nGhi chú (tùy chọn):`
    );
    if (reviewNote === null) return;

    // TODO: Replace with API call to approve upgrade request
    setUpgradeRequests(
      upgradeRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "approved" as const,
              reviewedAt: new Date().toISOString(),
              reviewNote: reviewNote || "Yêu cầu đã được phê duyệt.",
            }
          : r
      )
    );

    // Update user role
    const user = users.find((u) => u.id === request.userId);
    if (user) {
      setUsers(
        users.map((u) =>
          u.id === request.userId
            ? { ...u, role: "SELLER" as const, soldItems: 0 }
            : u
        )
      );
    }
  };

  const handleRejectUpgrade = (requestId: string) => {
    const request = upgradeRequests.find((r) => r.id === requestId);
    if (!request) return;

    const reviewNote = prompt(
      `Từ chối yêu cầu của "${request.userName}".\n\nLý do từ chối (bắt buộc):`
    );
    if (!reviewNote || reviewNote.trim() === "") {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    // TODO: Replace with API call to reject upgrade request
    setUpgradeRequests(
      upgradeRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "rejected" as const,
              reviewedAt: new Date().toISOString(),
              reviewNote,
            }
          : r
      )
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const pendingUpgrades = upgradeRequests.filter((r) => r.status === "pending");
  const stats = {
    totalUsers: users.length,
    sellers: users.filter((u) => u.role === "SELLER").length,
    bidders: users.filter((u) => u.role === "BIDDER").length,
    pendingUpgrades: pendingUpgrades.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý người dùng
          </h1>
          <p className="text-gray-600">
            Quản lý tài khoản và yêu cầu nâng cấp người bán
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Tổng người dùng</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Người bán</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.sellers}
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Người mua</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.bidders}
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Yêu cầu chờ</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.pendingUpgrades}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
          >
            <Users className="w-4 h-4 mr-2" />
            Danh sách người dùng
          </Button>
          <Button
            variant={activeTab === "upgrades" ? "default" : "outline"}
            onClick={() => setActiveTab("upgrades")}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Yêu cầu nâng cấp
            {pendingUpgrades.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {pendingUpgrades.length}
              </span>
            )}
          </Button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            {/* Filters */}
            <Card className="p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tìm kiếm
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm theo tên, email..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Vai trò
                  </label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="BIDDER">Người mua</SelectItem>
                      <SelectItem value="SELLER">Người bán</SelectItem>
                      <SelectItem value="ADMIN">Quản trị</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Trạng thái
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="banned">Bị khóa</SelectItem>
                      <SelectItem value="pending_verification">
                        Chờ xác minh
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Email: {user.email}</div>
                        <div>SĐT: {user.phone}</div>
                        <div>Tham gia: {formatDate(user.joinedAt)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Lượt đấu giá</div>
                      <div className="font-semibold text-gray-900">
                        {user.totalBids}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Đã thắng</div>
                      <div className="font-semibold text-gray-900">
                        {user.wonAuctions}
                      </div>
                    </div>
                    {user.soldItems !== undefined && (
                      <div>
                        <div className="text-sm text-gray-600">Đã bán</div>
                        <div className="font-semibold text-gray-900">
                          {user.soldItems}
                        </div>
                      </div>
                    )}
                    {user.rating && (
                      <div>
                        <div className="text-sm text-gray-600">Đánh giá</div>
                        <div className="font-semibold text-gray-900">
                          <span className="text-green-600">
                            +{user.rating.positive}
                          </span>
                          {" / "}
                          <span className="text-red-600">
                            -{user.rating.negative}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewUser(user.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Xem hồ sơ
                    </Button>
                    {user.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBanUser(user.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Khóa tài khoản
                      </Button>
                    ) : user.status === "banned" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnbanUser(user.id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mở khóa
                      </Button>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Upgrade Requests Tab */}
        {activeTab === "upgrades" && (
          <div className="space-y-4">
            {upgradeRequests.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không có yêu cầu nào
                  </h3>
                  <p className="text-gray-600">
                    Chưa có yêu cầu nâng cấp người bán nào
                  </p>
                </div>
              </Card>
            ) : (
              upgradeRequests.map((request) => (
                <Card key={request.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.businessName}
                        </h3>
                        {request.status === "pending" && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Chờ xét duyệt
                          </span>
                        )}
                        {request.status === "approved" && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Đã phê duyệt
                          </span>
                        )}
                        {request.status === "rejected" && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Đã từ chối
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Người gửi: {request.userName}</div>
                        <div>Email: {request.userEmail}</div>
                        <div>Ngày gửi: {formatDate(request.submittedAt)}</div>
                        {request.reviewedAt && (
                          <div>Ngày xét duyệt: {formatDate(request.reviewedAt)}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Địa chỉ kinh doanh:
                      </div>
                      <div className="text-sm text-gray-900">
                        {request.businessAddress}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Số điện thoại:
                      </div>
                      <div className="text-sm text-gray-900">
                        {request.phoneNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Lý do:
                      </div>
                      <div className="text-sm text-gray-900">{request.reason}</div>
                    </div>
                  </div>

                  {request.reviewNote && (
                    <div
                      className={`p-3 rounded-lg mb-4 ${
                        request.status === "approved"
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        Ghi chú từ quản trị viên:
                      </div>
                      <div
                        className={`text-sm ${
                          request.status === "approved"
                            ? "text-green-800"
                            : "text-red-800"
                        }`}
                      >
                        {request.reviewNote}
                      </div>
                    </div>
                  )}

                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveUpgrade(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Phê duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectUpgrade(request.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Từ chối
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
