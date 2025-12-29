import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Folder,
  FolderPlus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  _count?: { products: number };
  children?: Category[];
}

export default function CategoryManagementPage() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    parentId: "",
  });
  const [editCategory, setEditCategory] = useState({
    name: "",
    parentId: "",
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BACKEND_URL}/api/admin/categories?limit=100`, {
        credentials: "include",
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        const isJson = contentType?.includes("application/json");
        if (isJson) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch categories");
        }
        throw new Error(`Failed to fetch categories (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      const errorMessage = err instanceof Error ? err.message : "Không thể tải danh mục";
      setError(errorMessage + " - Kiểm tra backend server");
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async () => {
    if (!newCategory.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newCategory.name,
          parentId: newCategory.parentId || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Tạo danh mục thành công!");
        setNewCategory({ name: "", parentId: "" });
        setIsCreating(false);
        fetchCategories();
      } else {
        alert(data.message || "Không thể tạo danh mục");
      }
    } catch (err) {
      console.error("Error creating category:", err);
      alert("Lỗi khi tạo danh mục");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editCategory.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editCategory.name,
          parentId: editCategory.parentId || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Cập nhật danh mục thành công!");
        setEditingId(null);
        setEditCategory({ name: "", parentId: "" });
        fetchCategories();
      } else {
        alert(data.message || "Không thể cập nhật danh mục");
      }
    } catch (err) {
      console.error("Error updating category:", err);
      alert("Lỗi khi cập nhật danh mục");
    }
  };

  const handleDelete = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    // Check if category has products
    if (category._count && category._count.products > 0) {
      alert(
        `Không thể xóa danh mục "${category.name}" vì còn ${category._count.products} sản phẩm. Vui lòng di chuyển hoặc xóa các sản phẩm trước.`
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
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/categories/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        const data = await response.json();
        if (data.success) {
          alert("Xóa danh mục thành công!");
          fetchCategories();
        } else {
          alert(data.message || "Không thể xóa danh mục");
        }
      } catch (err) {
        console.error("Error deleting category:", err);
        alert("Lỗi khi xóa danh mục");
      }
    }
  };

  const handleStartEdit = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      setEditingId(id);
      setEditCategory({
        name: category.name,
        parentId: category.parentId || "",
      });
    }
  };

  const mainCategories = categories.filter((cat) => !cat.parentId);
  const getSubcategories = (parentId: string) =>
    categories.filter((cat) => cat.parentId === parentId);

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

        {/* Loading/Error States */}
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
                          <SelectItem value="">
                            Không có (Danh mục chính)
                          </SelectItem>
                          {mainCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          setNewCategory({ name: "", parentId: "" });
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
                      {editingId === mainCategory.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editCategory.name}
                            onChange={(e) =>
                              setEditCategory({
                                ...editCategory,
                                name: e.target.value,
                              })
                            }
                            placeholder="Tên danh mục"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdate(mainCategory.id)}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Lưu
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(null);
                                setEditCategory({ name: "", parentId: "" });
                              }}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <CardTitle>{mainCategory.name}</CardTitle>
                      )}
                    </div>
                  </div>
                  {editingId !== mainCategory.id && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {mainCategory._count?.products || 0} sản phẩm
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(mainCategory.id)}
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
                      )}
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
                                {editingId === subCategory.id ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={editCategory.name}
                                      onChange={(e) =>
                                        setEditCategory({
                                          ...editCategory,
                                          name: e.target.value,
                                        })
                                      }
                                      placeholder="Tên danh mục"
                                      className="w-64"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdate(subCategory.id)}
                                      >
                                        <Save className="w-4 h-4 mr-2" />
                                        Lưu
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingId(null);
                                          setEditCategory({
                                            name: "",
                                            parentId: "",
                                          });
                                        }}
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Hủy
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <h4 className="font-medium text-gray-900">
                                    {subCategory.name}
                                  </h4>
                                )}
                              </div>
                            </div>
                            {editingId !== subCategory.id && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {subCategory._count?.products || 0} sản phẩm
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleStartEdit(subCategory.id)}
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
                            )}
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
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

