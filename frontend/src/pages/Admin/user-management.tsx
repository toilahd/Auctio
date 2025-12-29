import { useState, useEffect, useCallback } from "react";
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
  Users,
  Search,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "BIDDER" | "SELLER" | "ADMIN";
  positiveRatings: number;
  negativeRatings: number;
  upgradeRequested: boolean;
  upgradeRequestedAt: string | null;
  upgradeStatus: string | null;
  isVerified: boolean;
  createdAt: string;
  _count: {
    products: number;
    bids: number;
    watchList: number;
  };
}

interface UpgradeRequest {
  id: string;
  email: string;
  fullName: string;
  upgradeRequestedAt: string;
  upgradeStatus: "PENDING" | "APPROVED" | "REJECTED";
  positiveRatings: number;
  negativeRatings: number;
  createdAt: string;
  _count: {
    bids: number;
  };
}

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"users" | "upgrades">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (roleFilter !== "all") {
        params.append("role", roleFilter);
      }

      const response = await fetch(`${BACKEND_URL}/api/admin/users?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        const isJson = contentType?.includes("application/json");
        if (isJson) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch users");
        }
        throw new Error(`Failed to fetch users (${response.status})`);
      }
      
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users || []);
        setTotalPages(data.data.totalPages || 1);
        setTotalUsers(data.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Không thể tải danh sách người dùng - Kiểm tra backend server");
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, page, roleFilter]);

  // Fetch upgrade requests
  const fetchUpgradeRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
      });

      const response = await fetch(
        `${BACKEND_URL}/api/admin/upgrade-requests?${params}`,
        {
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        const isJson = contentType?.includes("application/json");
        if (isJson) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch upgrade requests");
        }
        throw new Error(`Failed to fetch upgrade requests (${response.status})`);
      }
      
      const data = await response.json();

      if (data.success) {
        setUpgradeRequests(data.data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching upgrade requests:", error);
      alert("Không thể tải danh sách yêu cầu nâng cấp - Kiểm tra backend server");
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchUpgradeRequests();
    }
  }, [activeTab, fetchUsers, fetchUpgradeRequests]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [roleFilter, searchQuery]);

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

  const getStatusBadge = (user: User) => {
    if (!user.isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Chờ xác minh
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" />
        Đã xác minh
      </span>
    );
  };

  const handleViewUser = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleBanUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (confirm(`Bạn có chắc muốn khóa tài khoản "${user.fullName}"?`)) {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/admin/users/${userId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        const data = await response.json();

        if (data.success) {
          fetchUsers();
        }
      } catch (error) {
        console.error("Error banning user:", error);
        alert("Không thể khóa tài khoản");
      }
    }
  };

  const handleApproveUpgrade = async (userId: string) => {
    const request = upgradeRequests.find((r) => r.id === userId);
    if (!request) return;

    if (!confirm(`Phê duyệt yêu cầu nâng cấp của "${request.fullName}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/upgrade-requests/${userId}/approve`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        alert("Đã phê duyệt yêu cầu thành công");
        fetchUpgradeRequests();
      } else {
        alert(data.message || "Không thể phê duyệt yêu cầu");
      }
    } catch (error) {
      console.error("Error approving upgrade:", error);
      alert("Không thể phê duyệt yêu cầu");
    }
  };

  const handleRejectUpgrade = async (userId: string) => {
    const request = upgradeRequests.find((r) => r.id === userId);
    if (!request) return;

    const reason = prompt(
      `Từ chối yêu cầu của "${request.fullName}".\n\nLý do từ chối (bắt buộc):`
    );
    if (!reason || reason.trim() === "") {
      if (reason !== null) {
        alert("Vui lòng nhập lý do từ chối");
      }
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/upgrade-requests/${userId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reason }),
        }
      );
      const data = await response.json();

      if (data.success) {
        alert("Đã từ chối yêu cầu");
        fetchUpgradeRequests();
      } else {
        alert(data.message || "Không thể từ chối yêu cầu");
      }
    } catch (error) {
      console.error("Error rejecting upgrade:", error);
      alert("Không thể từ chối yêu cầu");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && user.isVerified) ||
      (statusFilter === "unverified" && !user.isVerified);

    return matchesSearch && matchesStatus;
  });

  const pendingUpgrades = upgradeRequests.filter(
    (r) => r.upgradeStatus === "PENDING"
  );
  const stats = {
    totalUsers: totalUsers,
    sellers: users.filter((u) => u.role === "SELLER").length,
    bidders: users.filter((u) => u.role === "BIDDER").length,
    pendingUpgrades: pendingUpgrades.length,
  };

  if (loading && users.length === 0 && upgradeRequests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

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
                  {pendingUpgrades.length}
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
                      <SelectItem value="verified">Đã xác minh</SelectItem>
                      <SelectItem value="unverified">Chưa xác minh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Users List */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không tìm thấy người dùng
                  </h3>
                  <p className="text-gray-600">
                    Thử thay đổi bộ lọc hoặc tìm kiếm
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {user.fullName}
                            </h3>
                            {getRoleBadge(user.role)}
                            {getStatusBadge(user)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Email: {user.email}</div>
                            <div>Tham gia: {formatDate(user.createdAt)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600">Sản phẩm</div>
                          <div className="font-semibold text-gray-900">
                            {user._count.products}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">
                            Lượt đấu giá
                          </div>
                          <div className="font-semibold text-gray-900">
                            {user._count.bids}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Theo dõi</div>
                          <div className="font-semibold text-gray-900">
                            {user._count.watchList}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Đánh giá</div>
                          <div className="font-semibold text-gray-900">
                            <span className="text-green-600">
                              +{user.positiveRatings}
                            </span>
                            {" / "}
                            <span className="text-red-600">
                              -{user.negativeRatings}
                            </span>
                          </div>
                        </div>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBanUser(user.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Khóa tài khoản
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Card className="p-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Trang {page} / {totalPages} (Tổng {totalUsers} người
                        dùng)
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Trước
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={page === totalPages}
                        >
                          Sau
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        {/* Upgrade Requests Tab */}
        {activeTab === "upgrades" && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : upgradeRequests.length === 0 ? (
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
                          {request.fullName}
                        </h3>
                        {request.upgradeStatus === "PENDING" && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Chờ xét duyệt
                          </span>
                        )}
                        {request.upgradeStatus === "APPROVED" && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Đã phê duyệt
                          </span>
                        )}
                        {request.upgradeStatus === "REJECTED" && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Đã từ chối
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Email: {request.email}</div>
                        <div>
                          Ngày gửi: {formatDate(request.upgradeRequestedAt)}
                        </div>
                        <div>Tham gia: {formatDate(request.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Lượt đấu giá</div>
                      <div className="font-semibold text-gray-900">
                        {request._count.bids}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Đánh giá (+)</div>
                      <div className="font-semibold text-green-600">
                        {request.positiveRatings}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Đánh giá (-)</div>
                      <div className="font-semibold text-red-600">
                        {request.negativeRatings}
                      </div>
                    </div>
                  </div>

                  {request.upgradeStatus === "PENDING" && (
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
