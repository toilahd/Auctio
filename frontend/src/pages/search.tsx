import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import ProductCard from "@/components/ProductCard";
import {
  Search as SearchIcon,
  Filter,
  X,
  AlertCircle,
  Loader2,
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

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("categoryId") || "all";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<string>("endTime");
  const [order, setOrder] = useState<string>("asc");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([{ value: "all", label: "Tất cả danh mục" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync search query with URL params when they change
  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam !== null) {
      setSearchQuery(decodeURIComponent(queryParam));
    } else {
      setSearchQuery("");
    }
  }, [searchParams]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/categories");
        const data = await response.json();
        if (data.success) {
          const categoryOptions = [
            { value: "all", label: "Tất cả danh mục" },
            ...data.data.map((cat: any) => ({
              value: cat.id.toString(),
              label: cat.name,
            })),
          ];
          setCategories(categoryOptions);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("q", searchQuery);
        if (selectedCategory && selectedCategory !== "all")
          params.append("categoryId", selectedCategory);
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        params.append("sortBy", sortBy);
        params.append("order", order);
        params.append("highlightMinutes", "30");

        const response = await fetch(
          `http://localhost:3000/api/products/search?${params.toString()}`
        );
        const data = await response.json();

        if (data.success) {
          setProducts(data.data.products || []);
          setTotalProducts(data.data.pagination?.total || 0);
        } else {
          setError("Không thể tải danh sách sản phẩm");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Đã xảy ra lỗi khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, page, limit, sortBy, order]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory && selectedCategory !== "all")
      params.set("categoryId", selectedCategory);
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSortBy("endTime");
    setOrder("asc");
    setPage(1);
    setSearchParams({});
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    // Parse sort value like "endTime-asc" or "price-desc"
    const [sortField, sortOrder] = value.split("-");
    setSortBy(sortField);
    setOrder(sortOrder || "asc");
    setPage(1);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const totalPages = Math.ceil(totalProducts / limit);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
            Tìm kiếm sản phẩm
          </h1>
          <p className="text-lg text-muted-foreground">
            {searchQuery
              ? `Kết quả tìm kiếm cho "${searchQuery}"`
              : "Nhập từ khóa để tìm kiếm sản phẩm"}
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-8 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm đấu giá..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" size="lg">
              Tìm kiếm
            </Button>
          </form>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Bộ lọc
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa
                </Button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Danh mục
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Sắp xếp
                  </label>
                  <Select
                    value={`${sortBy}-${order}`}
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="endTime-asc">Sắp kết thúc</SelectItem>
                      <SelectItem value="endTime-desc">Mới nhất</SelectItem>
                      <SelectItem value="price-asc">
                        Giá thấp đến cao
                      </SelectItem>
                      <SelectItem value="price-desc">
                        Giá cao đến thấp
                      </SelectItem>
                      <SelectItem value="bidCount-desc">
                        Nhiều lượt đấu giá
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-base text-muted-foreground">
                Tìm thấy{" "}
                <span className="font-semibold text-foreground">
                  {totalProducts}
                </span>{" "}
                sản phẩm
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="p-12 shadow-sm">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Đã xảy ra lỗi
                  </h3>
                  <p className="text-muted-foreground mb-6">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Thử lại
                  </Button>
                </div>
              </Card>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={handleProductClick}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "default" : "outline"}
                              onClick={() => setPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <Card className="p-12 shadow-sm">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Không có sản phẩm nào phù hợp với từ khóa tìm kiếm của bạn.
                    <br />
                    Vui lòng thử lại với từ khóa khác hoặc điều chỉnh bộ lọc.
                  </p>
                  <Button onClick={handleClearFilters}>Xóa bộ lọc</Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
