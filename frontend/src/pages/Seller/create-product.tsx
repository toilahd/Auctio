import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { X, ImagePlus, AlertCircle, Loader2 } from "lucide-react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface Category {
  id: string;
  name: string;
  children: Array<{
    id: string;
    name: string;
  }>;
}

interface FormData {
  title: string;
  category: string;
  subCategory: string;
  condition: string;
  startingPrice: string;
  bidIncrement: string;
  buyNowPrice: string;
  duration: string;
  autoExtend: boolean;
  description: string;
  images: File[];
}

const CreateProductPage = () => {
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    subCategory: "",
    condition: "",
    startingPrice: "",
    bidIncrement: "",
    buyNowPrice: "",
    duration: "7",
    autoExtend: true,
    description: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<Quill | null>(null);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/seller/config`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        if (data.success) {
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setErrors({ ...errors, categories: "Không thể tải danh mục" });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize Quill editor
  useEffect(() => {
    if (!quillRef.current || quillInstanceRef.current) return;

    const quill = new Quill(quillRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link"],
          [{ color: [] }],
          ["clean"],
        ],
      },
      placeholder:
        "Mô tả chi tiết về sản phẩm: tình trạng, nguồn gốc, phụ kiện kèm theo, lý do bán...",
    });

    // Set initial content if exists
    if (formData.description) {
      quill.root.innerHTML = formData.description;
    }

    // Listen for text changes
    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      setFormData((prev) => ({ ...prev, description: html }));
    });

    quillInstanceRef.current = quill;

    return () => {
      quillInstanceRef.current = null;
    };
  }, []);

  const selectedCategory = categories.find(
    (cat) => cat.id === formData.category
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = formData.images.length + files.length;

    if (totalImages > 10) {
      setErrors({ ...errors, images: "Tối đa 10 ảnh" });
      return;
    }

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setFormData({ ...formData, images: [...formData.images, ...files] });
    setErrors({ ...errors, images: "" });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(newPreviews);
    setFormData({ ...formData, images: newImages });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tên sản phẩm";
    if (!formData.category) newErrors.category = "Vui lòng chọn danh mục";
    if (formData.images.length < 3)
      newErrors.images = "Vui lòng tải lên ít nhất 3 ảnh";
    if (!formData.startingPrice || parseFloat(formData.startingPrice) <= 0)
      newErrors.startingPrice = "Giá khởi điểm phải lớn hơn 0";
    if (!formData.bidIncrement || parseFloat(formData.bidIncrement) <= 0)
      newErrors.bidIncrement = "Bước giá phải lớn hơn 0";
    if (
      formData.buyNowPrice &&
      parseFloat(formData.buyNowPrice) <= parseFloat(formData.startingPrice)
    )
      newErrors.buyNowPrice = "Giá mua ngay phải lớn hơn giá khởi điểm";
    const textContent = quillInstanceRef.current?.getText().trim() || "";
    if (!textContent || textContent.length < 50)
      newErrors.description = "Mô tả phải có ít nhất 50 ký tự";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageFormData = new FormData();
      formData.images.forEach((file) => {
        imageFormData.append("images", file);
      });

      const uploadResponse = await fetch(`${BACKEND_URL}/api/upload/images`, {
        method: "POST",
        credentials: "include",
        body: imageFormData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || "Không thể tải ảnh lên");
      }

      const imageUrls = uploadData.data.urls;

      // Calculate end time based on duration
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + parseInt(formData.duration));

      // Prepare data for backend
      const productData = {
        title: formData.title,
        description: formData.description,
        images: imageUrls,
        startPrice: parseFloat(formData.startingPrice),
        stepPrice: parseFloat(formData.bidIncrement),
        buyNowPrice: formData.buyNowPrice
          ? parseFloat(formData.buyNowPrice)
          : null,
        categoryId: formData.subCategory || formData.category, // Use subcategory if selected, otherwise category
        autoExtend: formData.autoExtend,
        endTime: endTime.toISOString(),
      };

      const response = await fetch(`${BACKEND_URL}/api/seller/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể tạo sản phẩm");
      }

      alert("Sản phẩm đã được tạo thành công!");
      window.location.href = "/seller";
    } catch (error: any) {
      console.error("Error creating product:", error);
      alert(error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (value: string) => {
    const number = parseFloat(value.replace(/[^\d]/g, ""));
    if (isNaN(number)) return "";
    return number.toLocaleString("vi-VN");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Đăng sản phẩm đấu giá
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Điền đầy đủ thông tin để bắt đầu đấu giá sản phẩm của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="VD: iPhone 15 Pro Max 256GB - Nguyên seal"
                    maxLength={200}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.title.length}/200 ký tự
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          category: value,
                          subCategory: "",
                        })
                      }
                      disabled={isLoadingCategories}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingCategories
                              ? "Đang tải..."
                              : "Chọn danh mục"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Danh mục con
                    </label>
                    <Select
                      value={formData.subCategory}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subCategory: value })
                      }
                      disabled={
                        !formData.category || !selectedCategory?.children.length
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục con" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory?.children.map((subCat) => (
                          <SelectItem key={subCat.id} value={subCat.id}>
                            {subCat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tình trạng
                  </label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) =>
                      setFormData({ ...formData, condition: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tình trạng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Mới 100%</SelectItem>
                      <SelectItem value="like-new">Như mới</SelectItem>
                      <SelectItem value="used-good">
                        Đã qua sử dụng - Tốt
                      </SelectItem>
                      <SelectItem value="used-fair">
                        Đã qua sử dụng - Khá
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Hình ảnh sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                            Ảnh chính
                          </div>
                        )}
                      </div>
                    ))}

                    {formData.images.length < 10 && (
                      <label className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition">
                        <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Thêm ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {errors.images && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.images}
                    </p>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-semibold mb-1">Yêu cầu về ảnh:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Tối thiểu 3 ảnh, tối đa 10 ảnh</li>
                        <li>Ảnh đầu tiên sẽ là ảnh đại diện</li>
                        <li>Định dạng: JPG, PNG (tối đa 5MB/ảnh)</li>
                        <li>Ảnh rõ nét, không chứa watermark</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Thông tin giá</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Giá khởi điểm <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={formatPrice(formData.startingPrice)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startingPrice: e.target.value.replace(/[^\d]/g, ""),
                          })
                        }
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        VND
                      </span>
                    </div>
                    {errors.startingPrice && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.startingPrice}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bước giá <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={formatPrice(formData.bidIncrement)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bidIncrement: e.target.value.replace(/[^\d]/g, ""),
                          })
                        }
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        VND
                      </span>
                    </div>
                    {errors.bidIncrement && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.bidIncrement}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Giá mua ngay (không bắt buộc)
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={formatPrice(formData.buyNowPrice)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buyNowPrice: e.target.value.replace(/[^\d]/g, ""),
                        })
                      }
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      VND
                    </span>
                  </div>
                  {errors.buyNowPrice && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.buyNowPrice}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    Người mua có thể mua ngay sản phẩm với giá này mà không cần
                    đấu giá
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Duration & Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Thời gian & Cài đặt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thời gian đấu giá
                  </label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) =>
                      setFormData({ ...formData, duration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 ngày</SelectItem>
                      <SelectItem value="5">5 ngày</SelectItem>
                      <SelectItem value="7">7 ngày</SelectItem>
                      <SelectItem value="10">10 ngày</SelectItem>
                      <SelectItem value="14">14 ngày</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="autoExtend"
                    checked={formData.autoExtend}
                    onChange={(e) =>
                      setFormData({ ...formData, autoExtend: e.target.checked })
                    }
                    className="mt-1"
                  />
                  <label htmlFor="autoExtend" className="cursor-pointer flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      Tự động gia hạn
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Nếu có đấu giá trong 5 phút cuối, tự động gia hạn thêm để
                      đảm bảo công bằng
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  Mô tả sản phẩm <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div
                    ref={quillRef}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-gray-700 min-h-[300px] [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-300 [&_.ql-toolbar]:dark:border-gray-700 [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[250px] [&_.ql-editor]:text-base [&_.ql-editor.ql-blank::before]:text-gray-400 [&_.ql-editor.ql-blank::before]:dark:text-gray-500 [&_.ql-stroke]:stroke-gray-700 [&_.ql-stroke]:dark:stroke-gray-300 [&_.ql-fill]:fill-gray-700 [&_.ql-fill]:dark:fill-gray-300 [&_.ql-picker-label]:text-gray-700 [&_.ql-picker-label]:dark:text-gray-300 [&_.ql-editor]:text-gray-900 [&_.ql-editor]:dark:text-gray-100"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm">
                    {quillInstanceRef.current?.getText().trim().length || 0} ký
                    tự (tối thiểu 50 ký tự)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang đăng...
                  </>
                ) : (
                  "Đăng sản phẩm"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => (window.location.href = "/seller")}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateProductPage;
