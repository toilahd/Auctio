import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuctionCard from "@/components/AuctionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

// Mock categories
const categories = [
  { id: "electronics", name: "Điện tử", count: 245 },
  { id: "fashion", name: "Thời trang", count: 189 },
  { id: "home", name: "Nhà cửa & Đời sống", count: 156 },
  { id: "vehicles", name: "Xe cộ", count: 78 },
  { id: "art", name: "Nghệ thuật & Sưu tầm", count: 92 },
  { id: "sports", name: "Thể thao & Giải trí", count: 134 },
  { id: "watches", name: "Đồng hồ & Trang sức", count: 167 },
  { id: "books", name: "Sách & Văn phòng phẩm", count: 98 },
];

// Mock products (expanded from home page)
const mockProducts = [
  {
    id: "1",
    title: "iPhone 15 Pro Max 256GB - Nguyên seal, chưa kích hoạt",
    currentPrice: 25000000,
    buyNowPrice: 30000000,
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    totalBids: 45,
    seller: "TechStore VN",
    category: "electronics",
  },
  {
    id: "2",
    title: "MacBook Pro M3 14 inch 2024 - Like new 99%",
    currentPrice: 35000000,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    totalBids: 32,
    seller: "Apple Store HN",
    category: "electronics",
  },
  {
    id: "3",
    title: "Sony WH-1000XM5 - Tai nghe chống ồn cao cấp",
    currentPrice: 6500000,
    buyNowPrice: 8000000,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500",
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    totalBids: 18,
    seller: "AudioPro",
    category: "electronics",
  },
  {
    id: "6",
    title: "Nike Air Jordan 1 Retro High OG - Size 42",
    currentPrice: 8500000,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalBids: 127,
    seller: "Sneaker Heaven",
    category: "fashion",
  },
  {
    id: "7",
    title: "Rolex Submariner Date 126610LN - Fullbox 2023",
    currentPrice: 250000000,
    imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500",
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalBids: 98,
    seller: "Luxury Watches",
    category: "watches",
  },
  {
    id: "8",
    title: "PlayStation 5 Slim + 2 tay cầm + 5 game AAA",
    currentPrice: 15000000,
    buyNowPrice: 18000000,
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500",
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    totalBids: 86,
    seller: "GameHub",
    category: "sports",
  },
  {
    id: "9",
    title: "Canon EOS R6 Mark II Body - Chính hãng LBM",
    currentPrice: 52000000,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    totalBids: 74,
    seller: "Camera World",
    category: "electronics",
  },
  {
    id: "10",
    title: "Herman Miller Aeron Chair Size B - Like New",
    currentPrice: 18000000,
    buyNowPrice: 22000000,
    imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500",
    endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    totalBids: 67,
    seller: "Office Furniture Pro",
    category: "home",
  },
  {
    id: "11",
    title: "Mercedes-Benz S-Class S500 2023 - Màu đen, đi 5000km",
    currentPrice: 4500000000,
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500",
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalBids: 15,
    seller: "Luxury Auto",
    category: "vehicles",
  },
  {
    id: "13",
    title: "Tranh sơn dầu Nguyễn Gia Trí - Chính chủ",
    currentPrice: 350000000,
    imageUrl: "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=500",
    endTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    totalBids: 12,
    seller: "Fine Arts Gallery",
    category: "art",
  },
  {
    id: "16",
    title: "Gucci Marmont Bag - Authentic, có hóa đơn",
    currentPrice: 35000000,
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500",
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    totalBids: 56,
    seller: "Luxury Fashion",
    category: "fashion",
  },
  {
    id: "17",
    title: "Bộ bàn ăn gỗ óc chó nguyên khối 6 ghế",
    currentPrice: 45000000,
    imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500",
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    totalBids: 23,
    seller: "Nội Thất Cao Cấp",
    category: "home",
  },
];

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Get filter parameters from URL
  const sortBy = searchParams.get("sort") || "ending";
  const searchQuery = searchParams.get("q") || "";

  // Filter products
  let filteredProducts = [...mockProducts];

  // Filter by search query
  if (searchQuery) {
    filteredProducts = filteredProducts.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filter by categories
  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      selectedCategories.includes(p.category)
    );
  }

  // Filter by price range
  if (priceRange.min) {
    filteredProducts = filteredProducts.filter(
      (p) => p.currentPrice >= parseInt(priceRange.min)
    );
  }
  if (priceRange.max) {
    filteredProducts = filteredProducts.filter(
      (p) => p.currentPrice <= parseInt(priceRange.max)
    );
  }

  // Sort products
  const sortedProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case "ending":
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      case "price-asc":
        return a.currentPrice - b.currentPrice;
      case "price-desc":
        return b.currentPrice - a.currentPrice;
      case "bids":
        return b.totalBids - a.totalBids;
      case "newest":
        return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    searchParams.set("sort", value);
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="/" className="hover:text-primary">
              Trang chủ
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">Sản phẩm</span>
          </div>

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : "Tất cả sản phẩm"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {sortedProducts.length} sản phẩm đang đấu giá
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Bộ lọc
                  </h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Xóa tất cả
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Danh mục
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({category.count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Khoảng giá
                  </h3>
                  <div className="space-y-3">
                    <Input
                      type="number"
                      placeholder="Giá tối thiểu"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Giá tối đa"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Tính năng
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded">
                      <input type="checkbox" className="mr-3" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Có "Mua ngay"
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded">
                      <input type="checkbox" className="mr-3" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Sắp kết thúc
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Sắp xếp theo:
                  </span>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ending">Sắp kết thúc</SelectItem>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                      <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                      <SelectItem value="bids">Nhiều lượt đấu giá</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </button>
                  <button className="p-2 text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Product Grid */}
              {paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {paginatedProducts.map((product) => (
                      <AuctionCard
                        key={product.id}
                        {...product}
                        isEnding={sortBy === "ending"}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        )
                      )}
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                  <Button onClick={clearFilters}>Xóa bộ lọc</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductListPage;
