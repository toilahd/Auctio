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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  currentWinner?: {
    id: string;
    fullName: string;
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
  const initialSortBy = searchParams.get("sortBy") || "endTime";
  const initialOrder = searchParams.get("order") || "asc";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [order, setOrder] = useState<string>(initialOrder);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(12);
  const [highlightMinutes, setHighlightMinutes] = useState(30);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<
    { value: string; label: string; indent?: number; isParent?: boolean }[]
  >([{ value: "all", label: "Tất cả danh mục" }]);
  const [categoryMap, setCategoryMap] = useState<Map<string, string>>(
    new Map()
  );
  const [categoryChildrenMap, setCategoryChildrenMap] = useState<
    Map<string, string[]>
  >(new Map());
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

  // Sync category with URL params when they change
  useEffect(() => {
    const categoryParam = searchParams.get("categoryId");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("all");
    }
  }, [searchParams]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/categories/menu"
        );
        const data = await response.json();
        if (data.success) {
          const categoryOptions: {
            value: string;
            label: string;
            indent?: number;
            isParent?: boolean;
          }[] = [{ value: "all", label: "Tất cả danh mục" }];
          const idToNameMap = new Map<string, string>();
          const parentToChildrenMap = new Map<string, string[]>();

          // Build flat list with parent and children, and create ID to name map
          data.data.forEach((cat: any) => {
            const hasChildren = cat.children && cat.children.length > 0;

            // Add parent category
            categoryOptions.push({
              value: cat.id.toString(),
              label: cat.name,
              indent: 0,
              isParent: hasChildren,
            });
            idToNameMap.set(cat.id.toString(), cat.name);

            // Add subcategories with indentation
            if (cat.children && cat.children.length > 0) {
              const childIds = cat.children.map((subcat: any) =>
                subcat.id.toString()
              );
              parentToChildrenMap.set(cat.id.toString(), childIds);

              cat.children.forEach((subcat: any) => {
                categoryOptions.push({
                  value: subcat.id.toString(),
                  label: subcat.name,
                  indent: 1,
                });
                idToNameMap.set(subcat.id.toString(), subcat.name);
              });
            }
          });

          setCategories(categoryOptions);
          setCategoryMap(idToNameMap);
          setCategoryChildrenMap(parentToChildrenMap);
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
        params.append("highlightMinutes", highlightMinutes.toString());

        const response = await fetch(
          `http://localhost:3000/api/products/search?${params.toString()}`
        );
        const data = await response.json();

        if (data.success) {
          setProducts(data.data.products || []);
          console.log("Fetched products:", data.data.products || []);
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
  }, [
    searchQuery,
    selectedCategory,
    page,
    limit,
    sortBy,
    order,
    highlightMinutes,
    categoryChildrenMap,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory && selectedCategory !== "all")
      params.set("categoryId", selectedCategory);
    params.set("sortBy", sortBy);
    params.set("order", order);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("endTime");
    setOrder("asc");
    setPage(1);
    setSearchParams({});
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (value !== "all") {
      params.set("categoryId", value);
    } else {
      params.delete("categoryId");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleSortChange = (value: string) => {
    // Parse sort value like "endTime-asc" or "price-desc"
    const [sortField, sortOrder] = value.split("-");
    setSortBy(sortField);
    setOrder(sortOrder || "asc");
    setPage(1);
    // Update URL params
    const params = new URLSearchParams(searchParams);
    params.set("sortBy", sortField);
    params.set("order", sortOrder || "asc");
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        {/* <Card className="p-6 mb-8 shadow-sm">
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
        </Card> */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Bộ lọc
                  {(selectedCategory !== "all" ||
                    sortBy !== "endTime" ||
                    order !== "asc") && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {
                        [
                          selectedCategory !== "all",
                          sortBy !== "endTime" || order !== "asc",
                        ].filter(Boolean).length
                      }
                    </span>
                  )}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-sm"
                  disabled={
                    selectedCategory === "all" &&
                    sortBy === "endTime" &&
                    order === "asc" &&
                    !searchQuery
                  }
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa
                </Button>
              </div>

              <div className="space-y-6">
                {/* Active Filters Summary */}
                {(selectedCategory !== "all" || searchQuery) && (
                  <div className="pb-4 border-b border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Bộ lọc đang áp dụng:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {searchQuery && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                          <SearchIcon className="w-3 h-3" />"{searchQuery}"
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              const params = new URLSearchParams(searchParams);
                              params.delete("q");
                              setSearchParams(params);
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {selectedCategory !== "all" && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                          {categoryMap.get(selectedCategory) ||
                            categories.find((c) => c.value === selectedCategory)
                              ?.label ||
                            selectedCategory}
                          <button
                            onClick={() => handleCategoryChange("all")}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                        <SelectItem
                          key={cat.value}
                          value={cat.value}
                          // disabled={cat.isParent}
                        >
                          <span
                            style={{
                              paddingLeft: `${(cat.indent || 0) * 1}rem`,
                            }}
                          >
                            {cat.indent ? "└ " : ""}
                            {cat.label}
                          </span>
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
                      <SelectItem value="newest-desc">Mới nhất</SelectItem>
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
                  <Button
                    onClick={() => {
                      navigate(0);
                      // window.location.reload();
                    }}
                  >
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
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (page > 1) handlePageChange(page - 1);
                            }}
                            className={
                              page === 1 ? "pointer-events-none opacity-50" : ""
                            }
                          />
                        </PaginationItem>

                        {/* First page */}
                        {page > 2 && (
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
                            {page > 3 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                          </>
                        )}

                        {/* Current page and neighbors */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(
                            (pageNum) =>
                              pageNum === page ||
                              pageNum === page - 1 ||
                              pageNum === page + 1
                          )
                          .map((pageNum) => (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(pageNum);
                                }}
                                isActive={pageNum === page}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          ))}

                        {/* Last page */}
                        {page < totalPages - 1 && (
                          <>
                            {page < totalPages - 2 && (
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
                              if (page < totalPages) handlePageChange(page + 1);
                            }}
                            className={
                              page === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
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
