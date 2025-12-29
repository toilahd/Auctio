import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Folder,
  FolderPlus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  productCount: number;
  isActive: boolean;
  icon?: string;
}

export default function CategoryManagementPage() {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "",
    icon: "",
  });

  // Mock categories data
  // TODO: Replace with API call to fetch categories
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Điện tử",
      slug: "electronics",
      description: "Các sản phẩm điện tử, công nghệ",
      parentId: null,
      productCount: 245,
      isActive: true,
      icon: "Smartphone",
    },
    {
      id: "1-1",
      name: "Điện thoại",
      slug: "phone",
      description: "Smartphone, điện thoại di động",
      parentId: "1",
      productCount: 89,
      isActive: true,
    },
    {
      id: "1-2",
      name: "Laptop",
      slug: "laptop",
      description: "Máy tính xách tay",
      parentId: "1",
      productCount: 67,
      isActive: true,
    },
    {
      id: "1-3",
      name: "Tablet",
      slug: "tablet",
      description: "Máy tính bảng",
      parentId: "1",
      productCount: 34,
      isActive: true,
    },
    {
      id: "2",
      name: "Thời trang",
      slug: "fashion",
      description: "Quần áo, phụ kiện thời trang",
      parentId: null,
      productCount: 156,
      isActive: true,
      icon: "Shirt",
    },
    {
      id: "2-1",
      name: "Đồng hồ",
      slug: "watches",
      description: "Đồng hồ đeo tay",
      parentId: "2",
      productCount: 45,
      isActive: true,
    },
    {
      id: "2-2",
      name: "Túi xách",
      slug: "bags",
      description: "Túi xách, balo",
      parentId: "2",
      productCount: 38,
      isActive: true,
    },
    {
      id: "3",
      name: "Xe cộ",
      slug: "vehicles",
      description: "Ô tô, xe máy",
      parentId: null,
      productCount: 78,
      isActive: true,
      icon: "Car",
    },
  ]);

  const mainCategories = categories.filter((cat) => !cat.parentId);
  const getSubcategories = (parentId: string) =>
    categories.filter((cat) => cat.parentId === parentId);

  const handleCreate = () => {
    if (!newCategory.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    // TODO: Replace with API call to create category
    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      slug: newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, "-"),
      description: newCategory.description,
      parentId: newCategory.parentId || null,
      productCount: 0,
      isActive: true,
      icon: newCategory.icon,
    };

    setCategories([...categories, category]);
    setNewCategory({ name: "", slug: "", description: "", parentId: "", icon: "" });
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    // Check if category has products
    if (category.productCount > 0) {
      alert(
        `Không thể xóa danh mục "${category.name}" vì còn ${category.productCount} sản phẩm. Vui lòng di chuyển hoặc xóa các sản phẩm trước.`
      );
      return;
    }

    // Check if category has subcategories
    const hasSubcategories = categories.some((c) => c.parentId === id);
    if (hasSubcategories) {
      alert(
        `Không thể xóa danh mục "${category.name}" vì còn danh mục con. Vui lòng xóa danh mục con trước.`
      );
      return;
    }

    if (confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      // TODO: Replace with API call to delete category
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    // TODO: Replace with API call to toggle category status
    setCategories(
      categories.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý danh mục
            </h1>
            <p className="text-gray-600">
              Tạo, chỉnh sửa và xóa danh mục sản phẩm
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Tạo danh mục mới
          </Button>
        </div>

        {/* Create Category Form */}
        {isCreating && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5" />
                Tạo danh mục mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                      placeholder="VD: Điện tử"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Slug (URL)
                    </label>
                    <Input
                      value={newCategory.slug}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, slug: e.target.value })
                      }
                      placeholder="electronics (tự động tạo nếu để trống)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Danh mục cha (để trống nếu là danh mục chính)
                  </label>
                  <Select
                    value={newCategory.parentId}
                    onValueChange={(value) =>
                      setNewCategory({ ...newCategory, parentId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục cha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Không có (Danh mục chính)</SelectItem>
                      {mainCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Mô tả
                  </label>
                  <Textarea
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    placeholder="Mô tả về danh mục này..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreate}>
                    <Save className="w-4 h-4 mr-2" />
                    Tạo danh mục
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setNewCategory({
                        name: "",
                        slug: "",
                        description: "",
                        parentId: "",
                        icon: "",
                      });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <div className="space-y-6">
          {mainCategories.map((mainCategory) => (
            <Card key={mainCategory.id}>
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle>{mainCategory.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {mainCategory.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {mainCategory.productCount} sản phẩm
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(mainCategory.id)}
                    >
                      {mainCategory.isActive ? "Ẩn" : "Hiện"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(mainCategory.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(mainCategory.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Subcategories */}
              {getSubcategories(mainCategory.id).length > 0 && (
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {getSubcategories(mainCategory.id).map((subCategory) => (
                      <div
                        key={subCategory.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-8 bg-blue-200 rounded" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {subCategory.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {subCategory.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {subCategory.productCount} sản phẩm
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleActive(subCategory.id)}
                          >
                            {subCategory.isActive ? "Ẩn" : "Hiện"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(subCategory.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(subCategory.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">Lưu ý khi xóa danh mục:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Không thể xóa danh mục đang có sản phẩm</li>
                  <li>Không thể xóa danh mục cha khi còn danh mục con</li>
                  <li>Nên ẩn danh mục thay vì xóa để giữ lại dữ liệu lịch sử</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
