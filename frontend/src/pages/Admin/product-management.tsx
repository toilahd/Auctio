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
  Package,
  Search,
  Eye,
  Ban,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Settings,
  Save,
  RefreshCw,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  buyNowPrice: number | null;
  endTime: string;
  status: string;
  createdAt: string;
  seller: {
    id: string;
    fullName: string;
  };
  category: {
    id: string;
    name: string;
  };
  _count: {
    bids: number;
  };
}

export default function ProductManagementPage() {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchedProduct, setSearchedProduct] = useState<Product | null>(null);
  const [searchingById, setSearchingById] = useState(false);

  // Auction Settings
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [auctionSettings, setAuctionSettings] = useState({
    autoExtendThreshold: 5,
    autoExtendDuration: 10,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [closingExpired, setClosingExpired] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter.toUpperCase());
      }

      const response = await fetch(`${BACKEND_URL}/api/admin/products?${params}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        const isJson = contentType?.includes("application/json");
        if (isJson) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch products");
        }
        throw new Error(`Failed to fetch products (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products || []);
        setTotalPages(data.data.totalPages || 1);
        setTotalProducts(data.data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      const errorMessage = err instanceof Error ? err.message : "Không thể tải danh sách sản phẩm";
      setError(errorMessage + " - Kiểm tra backend server");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, BACKEND_URL]);

  const fetchAuctionSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/auction-settings`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAuctionSettings(data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching auction settings:", err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveAuctionSettings = async () => {
    try {
      setSettingsSaving(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/auction-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(auctionSettings),
      });

      const data = await response.json();
      if (data.success) {
        alert("✓ Cập nhật cấu hình thành công!");
        setAuctionSettings(data.data);
      } else {
        alert("✗ " + (data.message || "Không thể cập nhật cấu hình"));
      }
    } catch (err) {
      console.error("Error saving auction settings:", err);
      alert("✗ Lỗi khi lưu cấu hình");
    } finally {
      setSettingsSaving(false);
    }
  };

  const closeExpiredAuctions = async () => {
    try {
      setClosingExpired(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/close-expired-auctions`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        alert(`✓ ${data.message}\n${data.data.closed} sản phẩm đã được cập nhật status.`);
        // Reload products to see updated statuses
        fetchProducts();
      } else {
        alert("✗ " + (data.message || "Không thể đóng phiên đấu giá"));
      }
    } catch (err) {
      console.error("Error closing expired auctions:", err);
      alert("✗ Lỗi khi đóng phiên đấu giá hết hạn");
    } finally {
      setClosingExpired(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchAuctionSettings();
  }, []);

  // Fetch product by ID when search query changes
  useEffect(() => {
    const searchProductById = async () => {
      if (!searchQuery.trim()) {
        setSearchedProduct(null);
        return;
      }

      // Check if the product with this ID is already in the current page
      const existingProduct = products.find(p => p.id === searchQuery.trim());
      if (existingProduct) {
        setSearchedProduct(null);
        return;
      }

      try {
        setSearchingById(true);
        const response = await fetch(`${BACKEND_URL}/api/admin/products/${searchQuery.trim()}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSearchedProduct(data.data);
          } else {
            setSearchedProduct(null);
          }
        } else {
          setSearchedProduct(null);
        }
      } catch (err) {
        console.error("Error searching product by ID:", err);
        setSearchedProduct(null);
      } finally {
        setSearchingById(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchProductById();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, products, BACKEND_URL]);

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, any> = {
      ACTIVE: {
        label: "Đang đấu giá",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
      },
      ENDED: {
        label: "Đã kết thúc",
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: Clock,
      },
      REMOVED: {
        label: "Đã gỡ",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: Ban,
      },
      REPORTED: {
        label: "Bị báo cáo",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;
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

  const handleDeleteProduct = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const reason = prompt(
      `Nhập lý do gỡ sản phẩm "${product.title}":`,
      "Vi phạm chính sách"
    );
    if (!reason) return;

    if (
      confirm(
        `Bạn có chắc muốn GỠ sản phẩm "${product.title}"? Hành động này không thể hoàn tác.`
      )
    ) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reason }),
        });

        const data = await response.json();
        if (data.success) {
          alert("Gỡ sản phẩm thành công!");
          fetchProducts();
        } else {
          alert(data.message || "Không thể gỡ sản phẩm");
        }
      } catch (err) {
        console.error("Error removing product:", err);
        alert("Lỗi khi gỡ sản phẩm");
      }
    }
  };

  const handleViewSeller = (sellerId: string) => {
    navigate(`/profile/${sellerId}`);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id === searchQuery.trim();

    return matchesSearch;
  });

  // Combine filtered products with searched product (if exists and not already in list)
  let displayProducts = searchQuery ? filteredProducts : products;
  
  if (searchedProduct && !displayProducts.find(p => p.id === searchedProduct.id)) {
    displayProducts = [searchedProduct, ...displayProducts];
  }

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

        {/* Auction Settings */}
        <Card className="p-6 mb-6 border-blue-200 bg-blue-50/50">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setSettingsExpanded(!settingsExpanded)}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Cấu hình đấu giá toàn cục
                </h3>
                <p className="text-sm text-gray-600">
                  Áp dụng cho tất cả sản phẩm trong hệ thống
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600"
            >
              {settingsExpanded ? "Thu gọn ▲" : "Mở rộng ▼"}
            </Button>
          </div>

          {settingsExpanded && (
            <div className="mt-6 pt-6 border-t border-blue-200">
              {settingsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Auto Extend Threshold */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block font-medium text-gray-900 mb-1">
                        Thời gian gia hạn tự động
                      </label>
                      <p className="text-sm text-gray-600">
                        Nếu có bid mới trong khoảng thời gian này trước khi kết thúc, sẽ gia hạn thêm
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        (Giá trị: 1-60 phút)
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={auctionSettings.autoExtendThreshold}
                        onChange={(e) =>
                          setAuctionSettings({
                            ...auctionSettings,
                            autoExtendThreshold: Number(e.target.value),
                          })
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">phút</span>
                    </div>
                  </div>

                  {/* Auto Extend Duration */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block font-medium text-gray-900 mb-1">
                        Thời lượng gia hạn
                      </label>
                      <p className="text-sm text-gray-600">
                        Thời gian gia hạn thêm khi có bid mới
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        (Giá trị: 1-120 phút)
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        value={auctionSettings.autoExtendDuration}
                        onChange={(e) =>
                          setAuctionSettings({
                            ...auctionSettings,
                            autoExtendDuration: Number(e.target.value),
                          })
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">phút</span>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t border-blue-200">
                    <Button
                      onClick={saveAuctionSettings}
                      disabled={settingsSaving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {settingsSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Lưu cấu hình
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>ℹ️ Lưu ý:</strong> Cấu hình này áp dụng cho tất cả sản phẩm đấu giá.
                      Tính năng gia hạn tự động được bật mặc định cho tất cả sản phẩm mới,
                      seller có thể tắt khi đăng sản phẩm nếu muốn.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Stats - showing from API */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Tổng sản phẩm</div>
              <div className="text-2xl font-bold text-gray-900">
                {totalProducts.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Trang hiện tại</div>
              <div className="text-2xl font-bold text-blue-600">
                {page} / {totalPages}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Sản phẩm hiển thị</div>
              <div className="text-2xl font-bold text-gray-900">
                {products.length}
              </div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Bộ lọc & Tìm kiếm</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={closeExpiredAuctions}
              disabled={closingExpired}
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              {closingExpired ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đóng...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Đóng phiên hết hạn
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tìm kiếm theo ID hoặc tên
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập ID sản phẩm, tên sản phẩm hoặc tên người bán..."
                  className="pl-10"
                />
                {searchingById && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-gray-500 mt-1">
                  {searchedProduct 
                    ? "✓ Tìm thấy sản phẩm theo ID" 
                    : "Tìm kiếm trong trang hiện tại và theo ID"}
                </p>
              )}
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
                  <SelectItem value="removed">Đã gỡ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Loading/Error/Products List */}
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
            {/* Products List */}
            <div className="space-y-4 mb-6">
              {displayProducts.length === 0 ? (
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
                displayProducts.map((product) => (
                  <Card key={product.id} className="p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <img
                        src={product.images[0] || "https://via.placeholder.com/400x300"}
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
                              <span>{product.category.name}</span>
                              <span>•</span>
                              <button
                                onClick={() => handleViewSeller(product.seller.id)}
                                className="text-blue-600 hover:underline"
                              >
                                {product.seller.fullName}
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
                              {product._count.bids}
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

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewProduct(product.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Gỡ sản phẩm
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trang trước
              </Button>
              <span className="text-sm text-gray-600">
                Trang {page} / {totalPages} (Tổng {totalProducts} sản phẩm)
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Trang sau
              </Button>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
