import { useState, useMemo } from "react";
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
import {
  Search as SearchIcon,
  Filter,
  X,
  AlertCircle,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  currentPrice: number;
  image: string;
  endTime: string;
  totalBids: number;
  category: string;
  subcategory: string;
  description: string;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");

  // Calculate end times once at component mount
  const [productEndTimes] = useState(() => {
    const now = Date.now();
    return {
      product1: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      product2: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
      product3: new Date(now + 6 * 60 * 60 * 1000).toISOString(),
      product4: new Date(now + 1 * 60 * 60 * 1000).toISOString(),
      product5: new Date(now + 8 * 60 * 60 * 1000).toISOString(),
      product6: new Date(now + 12 * 60 * 60 * 1000).toISOString(),
      product7: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
      product8: new Date(now + 5 * 60 * 60 * 1000).toISOString(),
    };
  });

  // Mock product data
  // TODO: Replace with API call to search products
  const allProducts: Product[] = useMemo(() => [
    {
      id: "1",
      title: "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
      currentPrice: 25000000,
      image: "https://via.placeholder.com/400x300",
      endTime: productEndTimes.product1,
      totalBids: 45,
      category: "electronics",
      subcategory: "phone",
      description: "iPhone mới nguyên seal chưa kích hoạt bảo hành 12 tháng",
    },
    {
      id: "2",
      title: "MacBook Pro 14 inch M3 Pro 18GB 512GB",
      currentPrice: 45000000,
      image: "https://via.placeholder.com/400x300",
      endTime: productEndTimes.product2,
      totalBids: 32,
      category: "electronics",
      subcategory: "laptop",
      description: "MacBook Pro mới 100% chính hãng Apple Việt Nam",
    },
    {
      id: "3",
      title: "Đồng hồ Rolex Submariner Date Automatic",
      currentPrice: 180000000,
      image: "https://via.placeholder.com/400x300",
      endTime: productEndTimes.product3,
      totalBids: 28,
      category: "fashion",
      subcategory: "watches",
      description: "Đồng hồ Rolex chính hãng kèm hộp và giấy tờ đầy đủ",
    },
    {
      id: "4",
      title: "iPad Pro 12.9 inch M2 256GB WiFi",
      currentPrice: 18000000,
      image: "https://via.placeholder.com/400x300",
      endTime: productEndTimes.product4,
      totalBids: 18,
      category: "electronics",
      subcategory: "tablet",
      description: "iPad Pro M2 mới nguyên seal",
    },
    {
      id: "5",
      title: "Mercedes-Benz C200 2020 màu đen",
      currentPrice: 950000000,
      image: "https://via.placeholder.com/400x300",
      endTime: productEndTimes.product5,
      totalBids: 12,
      category: "vehicles",
      subcategory: "car",
      description: "Mercedes C200 đời 2020 chính chủ biển Hà Nội",
    },
    {
      id: "6",
      title: "Tranh sơn dầu phong cảnh Hạ Long 120x80cm",
      currentPrice: 15000000,
      image: "https://via.placeholder.com/400x300",
      endTime: productEndTimes.product6,
      totalBids: 8,
      category: "art",
      subcategory: "painting",
      description: "Tranh sơn dầu vẽ tay phong cảnh Vịnh Hạ Long",
    },
    {
      id: "7",
      title: "Tai nghe AirPods Pro 2 USB-C",
      currentPrice: 4500000,
      image: "https://via.placeholder.com/400x300",
      endTime: productEndTimes.product7,
      totalBids: 23,
      category: "electronics",
      subcategory: "headphone",
      description: "AirPods Pro 2 chính hãng Apple VN",
    },
    {
      id: "8",
      title: "Túi xách Louis Vuitton Neverfull MM",
      currentPrice: 28000000,
      image: "https://via.placeholder.com/400x300",
      endTime: productEndTimes.product8,
      totalBids: 15,
      category: "fashion",
      subcategory: "bags",
      description: "Túi Louis Vuitton authentic kèm hóa đơn và hộp",
    },
  ], [productEndTimes]);

  // Vietnamese text normalization for search
  // TODO: Implement proper Vietnamese diacritics removal
  const normalizeVietnamese = (text: string): string => {
    // Simple stub - in real implementation, would remove Vietnamese diacritics
    // For now, just lowercase
    return text.toLowerCase().trim();
  };

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let results = [...allProducts];

    // Search by query
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeVietnamese(searchQuery);
      results = results.filter((product) => {
        const normalizedTitle = normalizeVietnamese(product.title);
        const normalizedDesc = normalizeVietnamese(product.description);
        return (
          normalizedTitle.includes(normalizedQuery) ||
          normalizedDesc.includes(normalizedQuery)
        );
      });
    }

    // Filter by category
    if (selectedCategory !== "all") {
      results = results.filter((p) => p.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange !== "all") {
      results = results.filter((p) => {
        if (priceRange === "under10m") return p.currentPrice < 10000000;
        if (priceRange === "10m-50m")
          return p.currentPrice >= 10000000 && p.currentPrice < 50000000;
        if (priceRange === "50m-100m")
          return p.currentPrice >= 50000000 && p.currentPrice < 100000000;
        if (priceRange === "over100m") return p.currentPrice >= 100000000;
        return true;
      });
    }

    // Sort results
    if (sortBy === "price-asc") {
      results.sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (sortBy === "price-desc") {
      results.sort((a, b) => b.currentPrice - a.currentPrice);
    } else if (sortBy === "ending-soon") {
      results.sort(
        (a, b) =>
          new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
      );
    } else if (sortBy === "most-bids") {
      results.sort((a, b) => b.totalBids - a.totalBids);
    }

    return results;
  }, [allProducts, searchQuery, selectedCategory, priceRange, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already reactive via useMemo
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setPriceRange("all");
    setSortBy("relevance");
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
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

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} ngày`;
    }
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const categories = [
    { value: "all", label: "Tất cả danh mục" },
    { value: "electronics", label: "Điện tử" },
    { value: "fashion", label: "Thời trang" },
    { value: "home", label: "Nhà cửa" },
    { value: "vehicles", label: "Xe cộ" },
    { value: "art", label: "Nghệ thuật" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tìm kiếm sản phẩm
          </h1>
          <p className="text-gray-600">
            {searchQuery
              ? `Kết quả tìm kiếm cho "${searchQuery}"`
              : "Nhập từ khóa để tìm kiếm sản phẩm"}
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm đấu giá..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Tìm kiếm</Button>
          </form>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Danh mục
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

                {/* Price Range Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Khoảng giá
                  </label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="under10m">Dưới 10 triệu</SelectItem>
                      <SelectItem value="10m-50m">10 - 50 triệu</SelectItem>
                      <SelectItem value="50m-100m">50 - 100 triệu</SelectItem>
                      <SelectItem value="over100m">Trên 100 triệu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Sắp xếp
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Liên quan nhất</SelectItem>
                      <SelectItem value="ending-soon">Sắp kết thúc</SelectItem>
                      <SelectItem value="most-bids">Nhiều lượt đấu giá</SelectItem>
                      <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                      <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
              </p>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-sm font-medium">
                        {getTimeRemaining(product.endTime)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Giá hiện tại</span>
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(product.currentPrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{product.totalBids} lượt đấu giá</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-gray-600 mb-6">
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
