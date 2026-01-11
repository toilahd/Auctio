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
import { useNavigate } from "react-router-dom";
import { X, ImagePlus, AlertCircle, Loader2 } from "lucide-react";
import Quill from "quill";
import QuillEditor from "@/components/QuillEditor";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

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
  const navigate = useNavigate();
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
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
    },
  });

  const watchedCategory = watch("category");
  const watchedImages = watch("images");
  const watchedTitle = watch("title");

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const quillRef = useRef<Quill | null>(null);

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
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCategory = categories.find((cat) => cat.id === watchedCategory);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentImages = watchedImages || [];
    const totalImages = currentImages.length + files.length;

    if (totalImages > 10) {
      setError("images", { type: "manual", message: "Tối đa 10 ảnh" });
      return;
    }

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setValue("images", [...currentImages, ...files]);
    clearErrors("images");
  };

  const removeImage = (index: number) => {
    const currentImages = watchedImages || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(newPreviews);
    setValue("images", newImages);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // Validate images
    if (data.images.length < 3) {
      setError("images", {
        type: "manual",
        message: "Vui lòng tải lên ít nhất 3 ảnh",
      });
      return;
    }

    // Validate description
    const textContent = quillRef.current?.getText().trim() || "";
    if (!textContent || textContent.length < 50) {
      setError("description", {
        type: "manual",
        message: "Mô tả phải có ít nhất 50 ký tự",
      });
      return;
    }

    // Validate buy now price
    if (
      data.buyNowPrice &&
      parseFloat(data.buyNowPrice) <= parseFloat(data.startingPrice)
    ) {
      setError("buyNowPrice", {
        type: "manual",
        message: "Giá mua ngay phải lớn hơn giá khởi điểm",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageFormData = new FormData();
      data.images.forEach((file) => {
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
      endTime.setDate(endTime.getDate() + parseInt(data.duration));

      // Prepare data for backend
      const productData = {
        title: data.title,
        description: data.description,
        images: imageUrls,
        startPrice: parseFloat(data.startingPrice),
        stepPrice: parseFloat(data.bidIncrement),
        buyNowPrice: data.buyNowPrice ? parseFloat(data.buyNowPrice) : null,
        categoryId: data.subCategory || data.category, // Use subcategory if selected, otherwise category
        autoExtend: data.autoExtend,
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

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Không thể tạo sản phẩm");
      }

      alert("Sản phẩm đã được tạo thành công!");
      navigate("/seller");
    } catch (error: any) {
      console.error("Error creating product:", error);
      alert(error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
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

          <form onSubmit={handleSubmit(onSubmit)}>
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
                    {...register("title", {
                      required: "Vui lòng nhập tên sản phẩm",
                      minLength: {
                        value: 10,
                        message: "Tên sản phẩm phải có ít nhất 10 ký tự",
                      },
                      maxLength: {
                        value: 200,
                        message: "Tên sản phẩm không được vượt quá 200 ký tự",
                      },
                    })}
                    placeholder="VD: iPhone 15 Pro Max 256GB - Nguyên seal"
                    maxLength={200}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.title.message as string}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {watchedTitle?.length || 0}/200 ký tự
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="category"
                      control={control}
                      rules={{ required: "Vui lòng chọn danh mục" }}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setValue("subCategory", "");
                          }}
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
                      )}
                    />
                    {errors.category && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.category.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Danh mục con
                    </label>
                    <Controller
                      name="subCategory"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={
                            !watchedCategory ||
                            !selectedCategory?.children.length
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
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tình trạng
                  </label>
                  <Controller
                    name="condition"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
                    )}
                  />
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

                    {(watchedImages?.length || 0) < 10 && (
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
                    <p className="text-sm text-red-600 mt-1">
                      {errors.images.message as string}
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
                        {...register("startingPrice", {
                          required: "Vui lòng nhập giá khởi điểm",
                          validate: (value) =>
                            parseFloat(value) > 0 ||
                            "Giá khởi điểm phải lớn hơn 0",
                        })}
                        type="text"
                        placeholder="0"
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, "");
                          setValue("startingPrice", value);
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        VND
                      </span>
                    </div>
                    {errors.startingPrice && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.startingPrice.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bước giá <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        {...register("bidIncrement", {
                          required: "Vui lòng nhập bước giá",
                          validate: (value) =>
                            parseFloat(value) > 0 || "Bước giá phải lớn hơn 0",
                        })}
                        type="text"
                        placeholder="0"
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, "");
                          setValue("bidIncrement", value);
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        VND
                      </span>
                    </div>
                    {errors.bidIncrement && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.bidIncrement.message as string}
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
                      {...register("buyNowPrice")}
                      type="text"
                      placeholder="0"
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "");
                        setValue("buyNowPrice", value);
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      VND
                    </span>
                  </div>
                  {errors.buyNowPrice && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.buyNowPrice.message as string}
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
                  <Controller
                    name="duration"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
                    )}
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <Controller
                    name="autoExtend"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="autoExtend"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    )}
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
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-gray-700 min-h-[300px] [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-300 [&_.ql-toolbar]:dark:border-gray-700 [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[250px] [&_.ql-editor]:text-base [&_.ql-editor.ql-blank::before]:text-gray-400 [&_.ql-editor.ql-blank::before]:dark:text-gray-500 [&_.ql-stroke]:stroke-gray-700 [&_.ql-stroke]:dark:stroke-gray-300 [&_.ql-fill]:fill-gray-700 [&_.ql-fill]:dark:fill-gray-300 [&_.ql-picker-label]:text-gray-700 [&_.ql-picker-label]:dark:text-gray-300 [&_.ql-editor]:text-gray-900 [&_.ql-editor]:dark:text-gray-100">
                    <Controller
                      name="description"
                      control={control}
                      rules={{ required: "Vui lòng nhập mô tả sản phẩm" }}
                      render={({ field }) => (
                        <QuillEditor
                          ref={quillRef}
                          defaultValue={field.value}
                          onTextChange={(html) => {
                            field.onChange(html);
                            const textContent =
                              quillRef.current?.getText().trim() || "";
                            setCharCount(textContent.length);
                          }}
                          placeholder="Mô tả chi tiết về sản phẩm: tình trạng, nguồn gốc, phụ kiện kèm theo, lý do bán..."
                        />
                      )}
                    />
                  </div>
                  {errors.description && (
                    <p className="text-sm text-red-600">
                      {errors.description.message as string}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm">
                    {charCount} ký tự (tối thiểu 50 ký tự)
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
                onClick={() => navigate("/seller")}
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
