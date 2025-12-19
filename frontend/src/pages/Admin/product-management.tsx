import { useState } from "react";
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
  Search,
  Filter,
  Eye,
  Ban,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  seller: string;
  sellerId: string;
  currentPrice: number;
  startingPrice: number;
  totalBids: number;
  status: "active" | "ended" | "removed" | "reported";
  endTime: string;
  createdAt: string;
  reportCount: number;
}

export default function ProductManagementPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Calculate dates once at component mount
  const [productDates] = useState(() => {
    const now = Date.now();
    return {
      p1End: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      p1Created: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      p2End: new Date(now + 5 * 60 * 60 * 1000).toISOString(),
      p2Created: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      p3End: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      p3Created: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      p4End: new Date(now + 1 * 60 * 60 * 1000).toISOString(),
      p4Created: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      p5End: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      p5Created: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  // Mock products data
  // TODO: Replace with API call to fetch products
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      title: "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
      imageUrl: "https://via.placeholder.com/400x300",
      category: "Điện tử",
      seller: "TechStore VN",
      sellerId: "seller1",
      currentPrice: 25000000,
      startingPrice: 20000000,
      totalBids: 45,
      status: "active",
      endTime: productDates.p1End,
      createdAt: productDates.p1Created,
      reportCount: 0,
    },
    {
      id: "2",
      title: "MacBook Pro M3 14 inch 2024",
      imageUrl: "https://via.placeholder.com/400x300",
      category: "Điện tử",
      seller: "Apple Premium",
      sellerId: "seller2",
      currentPrice: 35000000,
      startingPrice: 30000000,
      totalBids: 32,
      status: "active",
      endTime: productDates.p2End,
      createdAt: productDates.p2Created,
      reportCount: 0,
    },
    {
      id: "3",
      title: "Đồng hồ Rolex Submariner - Hàng nhái",
      imageUrl: "https://via.placeholder.com/400x300",
      category: "Thời trang",
      seller: "WatchFake Shop",
      sellerId: "seller3",
      currentPrice: 5000000,
      startingPrice: 3000000,
      totalBids: 12,
      status: "reported",
      endTime: productDates.p3End,
      createdAt: productDates.p3Created,
      reportCount: 5,
    },
    {
      id: "4",
      title: "iPad Pro 12.9 inch M2 256GB WiFi",
      imageUrl: "https://via.placeholder.com/400x300",
      category: "Điện tử",
      seller: "TechStore VN",
      sellerId: "seller1",
      currentPrice: 18000000,
      startingPrice: 15000000,
      totalBids: 28,
      status: "active",
      endTime: productDates.p4End,
      createdAt: productDates.p4Created,
      reportCount: 0,
    },
    {
      id: "5",
      title: "Mercedes-Benz C200 2020",
      imageUrl: "https://via.placeholder.com/400x300",
      category: "Xe cộ",
      seller: "AutoSales",
      sellerId: "seller4",
      currentPrice: 950000000,
      startingPrice: 900000000,
      totalBids: 8,
      status: "ended",
      endTime: productDates.p5End,
      createdAt: productDates.p5Created,
      reportCount: 0,
    },
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: Product["status"]) => {
    const statusConfig = {
      active: {
        label: "Đang đấu giá",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
      },
      ended: {
        label: "Đã kết thúc",
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: Clock,
      },
      removed: {
        label: "Đã gỡ",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: Ban,
      },
      reported: {
        label: "Bị báo cáo",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
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

  const handleViewProduct = (id: string) => {
    navigate(`/product/${id}`);
  };

  const handleRemoveProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (
      confirm(
        `Bạn có chắc muốn gỡ sản phẩm "${product.title}"? Hành động này không thể hoàn tác.`
      )
    ) {
      // TODO: Replace with API call to remove product
      setProducts(
        products.map((p) =>
          p.id === id ? { ...p, status: "removed" as const } : p
        )
      );
    }
  };

  const handleDeleteProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (
      confirm(
        `Bạn có chắc muốn XÓA VĨNH VIỄN sản phẩm "${product.title}"? Hành động này không thể hoàn tác.`
      )
    ) {
      // TODO: Replace with API call to delete product
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleViewSeller = (sellerId: string) => {
    navigate(`/profile/${sellerId}`);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    ended: products.filter((p) => p.status === "ended").length,
    reported: products.filter((p) => p.status === "reported").length,
    removed: products.filter((p) => p.status === "removed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý sản phẩm
          </h1>
          <p className="text-gray-600">
            Xem, gỡ bỏ và quản lý sản phẩm đấu giá
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Tổng số</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Đang đấu giá</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Đã kết thúc</div>
            <div className="text-2xl font-bold text-gray-600">{stats.ended}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Bị báo cáo</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.reported}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Đã gỡ</div>
            <div className="text-2xl font-bold text-red-600">{stats.removed}</div>
          </Card>
        </div>

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
                  placeholder="Tìm theo tên sản phẩm, người bán..."
                  className="pl-10"
                />
              </div>
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
                  <SelectItem value="active">Đang đấu giá</SelectItem>
                  <SelectItem value="ended">Đã kết thúc</SelectItem>
                  <SelectItem value="reported">Bị báo cáo</SelectItem>
                  <SelectItem value="removed">Đã gỡ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Danh mục
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Điện tử">Điện tử</SelectItem>
                  <SelectItem value="Thời trang">Thời trang</SelectItem>
                  <SelectItem value="Xe cộ">Xe cộ</SelectItem>
                  <SelectItem value="Nhà cửa">Nhà cửa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Products List */}
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600">
                  Thử thay đổi bộ lọc hoặc tìm kiếm khác
                </p>
              </div>
            </Card>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>ID: {product.id}</span>
                          <span>•</span>
                          <span>{product.category}</span>
                          <span>•</span>
                          <button
                            onClick={() => handleViewSeller(product.sellerId)}
                            className="text-blue-600 hover:underline"
                          >
                            {product.seller}
                          </button>
                        </div>
                      </div>
                      {getStatusBadge(product.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Giá hiện tại</div>
                        <div className="font-semibold text-gray-900">
                          {formatPrice(product.currentPrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Số lượt đấu</div>
                        <div className="font-semibold text-gray-900">
                          {product.totalBids}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Thời gian kết thúc</div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {formatDateTime(product.endTime)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Ngày tạo</div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {formatDateTime(product.createdAt)}
                        </div>
                      </div>
                    </div>

                    {product.reportCount > 0 && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Sản phẩm này có {product.reportCount} báo cáo vi phạm
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProduct(product.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                      {product.status !== "removed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Gỡ sản phẩm
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa vĩnh viễn
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
