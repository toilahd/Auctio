import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryCard from "@/components/CategoryCard";
import {
  Loader2,
  AlertCircle,
} from "lucide-react";

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

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/categories/menu");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          setError("Không thể tải danh mục");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Đã xảy ra lỗi khi tải danh mục");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/search?categoryId=${categoryId}`);
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    navigate(`/search?categoryId=${subcategoryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Đang tải danh mục...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <Card className="p-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Đã xảy ra lỗi</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Thử lại</Button>
            </div>
          </Card>
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
            Danh mục sản phẩm
          </h1>
          <p className="text-gray-600">
            Khám phá các sản phẩm đấu giá theo danh mục
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-8">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onCategoryClick={handleCategoryClick}
              onSubcategoryClick={handleSubcategoryClick}
            />
          ))}
        </div>

        {/* Popular Categories Section */}
        {categories.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Danh mục phổ biến
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories
                .flatMap((cat) => cat.children)
                .sort((a, b) => b.productCount - a.productCount)
                .slice(0, 6)
                .map((popular) => (
                  <button
                    key={popular.id}
                    onClick={() => handleSubcategoryClick(popular.id)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all text-center"
                  >
                    <div className="font-medium text-gray-900">{popular.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {popular.productCount} sản phẩm
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
