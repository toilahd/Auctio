import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import type { LucideIcon } from "lucide-react";

interface Subcategory {
  id: string;
  name: string;
  productCount: number;
}

interface Category {
  id: string;
  name: string;
  children: Subcategory[];
  productCount: number;
}

interface CategoryCardProps {
  category: Category;
  onCategoryClick: (categoryId: string) => void;
  onSubcategoryClick: (subcategoryId: string) => void;
}

const getCategoryIcon = (categoryName: string): LucideIcon => {
  const iconMap: { [key: string]: LucideIcon } = {
    "Điện tử": Smartphone,
    "Thời trang": ShirtIcon,
    "Nhà cửa": Home,
    "Xe cộ": Car,
    "Nghệ thuật": Palette,
  };
  return iconMap[categoryName] || Sparkles;
};

const getCategoryColor = (categoryName: string): string => {
  const colorMap: { [key: string]: string } = {
    "Điện tử": "bg-blue-500",
    "Thời trang": "bg-pink-500",
    "Nhà cửa": "bg-green-500",
    "Xe cộ": "bg-orange-500",
    "Nghệ thuật": "bg-purple-500",
  };
  return colorMap[categoryName] || "bg-gray-500";
};

const getSubcategoryIcon = (subcategoryName: string): LucideIcon => {
  const iconMap: { [key: string]: LucideIcon } = {
    "Điện thoại": Smartphone,
    Laptop: Laptop,
    "Máy tính bảng": Tablet,
    "Tai nghe": Headphones,
    "Phụ kiện": Cable,
    "Giày dép": ShirtIcon,
    "Quần áo": ShirtIcon,
    "Túi xách": ShoppingBag,
    "Đồng hồ": Watch,
    "Trang sức": Gem,
    "Nội thất": Sofa,
    "Trang trí": Sparkles,
    "Đồ gia dụng": Home,
    "Nhà bếp": UtensilsCrossed,
    "Ô tô": Car,
    "Xe máy": Bike,
    "Xe đạp": Bike,
    "Phụ kiện xe": Wrench,
    Tranh: ImageIcon,
    "Điêu khắc": Palette,
    Tem: ImageIcon,
    "Tiền xu": Coins,
    "Đồ cổ": Sparkles,
  };
  return iconMap[subcategoryName] || ChevronRight;
};

const CategoryCard = ({
  category,
  onCategoryClick,
  onSubcategoryClick,
}: CategoryCardProps) => {
  const Icon = getCategoryIcon(category.name);
  const color = getCategoryColor(category.name);
  const totalCount =
    category.children.reduce((sum, sub) => sum + sub.productCount, 0) +
    category.productCount;

  return (
    <Card className="p-6">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`${color} p-3 rounded-lg`}>
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
        {/* <Button variant="outline" onClick={() => onCategoryClick(category.id)}>
          Xem tất cả
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button> */}
      </div>

      {/* Subcategories Grid */}
      {category.children.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {category.children.map((subcategory) => {
            const SubIcon = getSubcategoryIcon(subcategory.name);

            return (
              <button
                key={subcategory.id}
                onClick={() => onSubcategoryClick(subcategory.id)}
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
      )}
    </Card>
  );
};

export default CategoryCard;
