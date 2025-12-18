import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Cable,
  ShirtIcon,
  Watch,
  Gem,
  ShoppingBag,
  Home,
  Sofa,
  Sparkles,
  UtensilsCrossed,
  Car,
  Bike,
  Wrench,
  Palette,
  ImageIcon,
  Coins,
  ChevronRight,
} from "lucide-react";

interface Subcategory {
  id: string;
  name: string;
  productCount: number;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  subcategories: Subcategory[];
}

export default function CategoriesPage() {
  const navigate = useNavigate();

  // Mock category data with product counts
  // TODO: Replace with API call to fetch categories
  const categories: Category[] = [
    {
      id: "electronics",
      name: "Điện tử",
      icon: Smartphone,
      color: "bg-blue-500",
      subcategories: [
        { id: "phone", name: "Điện thoại", productCount: 245 },
        { id: "laptop", name: "Laptop", productCount: 178 },
        { id: "tablet", name: "Máy tính bảng", productCount: 89 },
        { id: "headphone", name: "Tai nghe", productCount: 156 },
        { id: "accessory", name: "Phụ kiện", productCount: 312 },
      ],
    },
    {
      id: "fashion",
      name: "Thời trang",
      icon: ShirtIcon,
      color: "bg-pink-500",
      subcategories: [
        { id: "shoes", name: "Giày dép", productCount: 198 },
        { id: "clothes", name: "Quần áo", productCount: 267 },
        { id: "bags", name: "Túi xách", productCount: 134 },
        { id: "watches", name: "Đồng hồ", productCount: 223 },
        { id: "jewelry", name: "Trang sức", productCount: 176 },
      ],
    },
    {
      id: "home",
      name: "Nhà cửa",
      icon: Home,
      color: "bg-green-500",
      subcategories: [
        { id: "furniture", name: "Nội thất", productCount: 145 },
        { id: "decor", name: "Trang trí", productCount: 189 },
        { id: "household", name: "Đồ gia dụng", productCount: 234 },
        { id: "kitchen", name: "Nhà bếp", productCount: 167 },
      ],
    },
    {
      id: "vehicles",
      name: "Xe cộ",
      icon: Car,
      color: "bg-orange-500",
      subcategories: [
        { id: "car", name: "Ô tô", productCount: 67 },
        { id: "motorcycle", name: "Xe máy", productCount: 123 },
        { id: "bicycle", name: "Xe đạp", productCount: 89 },
        { id: "vehicle-accessories", name: "Phụ kiện xe", productCount: 198 },
      ],
    },
    {
      id: "art",
      name: "Nghệ thuật",
      icon: Palette,
      color: "bg-purple-500",
      subcategories: [
        { id: "painting", name: "Tranh", productCount: 156 },
        { id: "sculpture", name: "Điêu khắc", productCount: 78 },
        { id: "stamps", name: "Tem", productCount: 234 },
        { id: "coins", name: "Tiền xu", productCount: 189 },
        { id: "antiques", name: "Đồ cổ", productCount: 145 },
      ],
    },
  ];

  const getSubcategoryIcon = (subcategoryId: string) => {
    const iconMap: { [key: string]: any } = {
      phone: Smartphone,
      laptop: Laptop,
      tablet: Tablet,
      headphone: Headphones,
      accessory: Cable,
      shoes: ShirtIcon,
      clothes: ShirtIcon,
      bags: ShoppingBag,
      watches: Watch,
      jewelry: Gem,
      furniture: Sofa,
      decor: Sparkles,
      household: Home,
      kitchen: UtensilsCrossed,
      car: Car,
      motorcycle: Bike,
      bicycle: Bike,
      "vehicle-accessories": Wrench,
      painting: ImageIcon,
      sculpture: Palette,
      stamps: ImageIcon,
      coins: Coins,
      antiques: Sparkles,
    };
    return iconMap[subcategoryId] || ChevronRight;
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${categoryId}`);
  };

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string) => {
    navigate(`/products?category=${categoryId}&subcategory=${subcategoryId}`);
  };

  const getTotalProductCount = (category: Category) => {
    return category.subcategories.reduce((sum, sub) => sum + sub.productCount, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Danh mục sản phẩm
          </h1>
          <p className="text-gray-600">
            Khám phá các sản phẩm đấu giá theo danh mục
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const totalCount = getTotalProductCount(category);

            return (
              <Card key={category.id} className="p-6">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`${category.color} p-3 rounded-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {category.name}
                      </h2>
                      <p className="text-gray-600">
                        {totalCount.toLocaleString()} sản phẩm
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    Xem tất cả
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Subcategories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {category.subcategories.map((subcategory) => {
                    const SubIcon = getSubcategoryIcon(subcategory.id);

                    return (
                      <button
                        key={subcategory.id}
                        onClick={() =>
                          handleSubcategoryClick(category.id, subcategory.id)
                        }
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                      >
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                          <SubIcon className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                            {subcategory.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subcategory.productCount.toLocaleString()} SP
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Popular Categories Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Danh mục phổ biến
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Điện thoại", count: 245, categoryId: "electronics", subcategoryId: "phone" },
              { name: "Laptop", count: 178, categoryId: "electronics", subcategoryId: "laptop" },
              { name: "Đồng hồ", count: 223, categoryId: "fashion", subcategoryId: "watches" },
              { name: "Túi xách", count: 134, categoryId: "fashion", subcategoryId: "bags" },
              { name: "Ô tô", count: 67, categoryId: "vehicles", subcategoryId: "car" },
              { name: "Tranh", count: 156, categoryId: "art", subcategoryId: "painting" },
            ].map((popular) => (
              <button
                key={popular.name}
                onClick={() =>
                  handleSubcategoryClick(popular.categoryId, popular.subcategoryId)
                }
                className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all text-center"
              >
                <div className="font-medium text-gray-900">{popular.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {popular.count} sản phẩm
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
