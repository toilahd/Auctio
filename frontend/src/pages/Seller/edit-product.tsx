import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Quill from "quill";
import QuillEditor from "@/components/QuillEditor";

interface DescriptionHistory {
  id: string;
  content: string;
  addedAt: string;
  addedBy: string;
}

const EditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [newDescription, setNewDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [product, setProduct] = useState<any>(null);
  const [descriptionHistory, setDescriptionHistory] = useState<
    DescriptionHistory[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const quillRef = useRef<Quill | null>(null);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/products/${id}`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.success && data.data) {
          console.log("Fetched product data:", data.data);
          setProduct(data.data);
        } else {
          setErrors({ fetch: "Không thể tải thông tin sản phẩm" });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setErrors({ fetch: "Đã xảy ra lỗi khi tải sản phẩm" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const textContent = quillRef.current?.getText().trim() || "";
    if (!textContent) {
      setErrors({ description: "Vui lòng nhập nội dung bổ sung" });
      return;
    }

    if (textContent.length < 20) {
      setErrors({ description: "Nội dung bổ sung phải có ít nhất 20 ký tự" });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${BACKEND_URL}/api/seller/products/${id}/description`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ description: newDescription }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể cập nhật mô tả");
      }

      alert("Mô tả đã được cập nhật thành công!");
      navigate("/seller");
      setNewDescription("");
      setErrors({});

      // Refetch product to get updated description
      const updatedResponse = await fetch(`${BACKEND_URL}/api/products/${id}`, {
        credentials: "include",
      });
      const updatedData = await updatedResponse.json();
      if (updatedData.success) {
        setProduct(updatedData.data);
      }
    } catch (error: any) {
      console.error("Error updating description:", error);
      setErrors({
        submit: error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : !product ? (
            <div className="text-center py-20">
              <p className="text-red-500">Không tìm thấy sản phẩm</p>
            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Chỉnh sửa mô tả sản phẩm
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {product.title}
                </p>
              </div>

              {/* Warning Notice */}
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Bạn chỉ có thể <strong>bổ sung thêm</strong> thông tin,
                        không thể xóa hoặc sửa nội dung cũ
                      </li>
                      <li>
                        Tất cả các thay đổi sẽ được ghi lại và hiển thị lịch sử
                        chỉnh sửa
                      </li>
                      <li>
                        Điều này đảm bảo tính minh bạch và công bằng cho người
                        đấu giá
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Current Description */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Mô tả hiện tại</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="des prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: product.description,
                    }}
                  />
                </CardContent>
              </Card>

              {/* Description History */}
              {descriptionHistory.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Lịch sử bổ sung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {descriptionHistory.map((history) => (
                        <div
                          key={history.id}
                          className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {history.addedBy}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDateTime(history.addedAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {history.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Add New Description */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Bổ sung thông tin mới</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nội dung bổ sung <span className="text-red-500">*</span>
                      </label>
                      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-gray-700 min-h-[200px] [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-300 [&_.ql-toolbar]:dark:border-gray-700 [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-base [&_.ql-editor.ql-blank::before]:text-gray-400 [&_.ql-editor.ql-blank::before]:dark:text-gray-500 [&_.ql-stroke]:stroke-gray-700 [&_.ql-stroke]:dark:stroke-gray-300 [&_.ql-fill]:fill-gray-700 [&_.ql-fill]:dark:fill-gray-300 [&_.ql-picker-label]:text-gray-700 [&_.ql-picker-label]:dark:text-gray-300 [&_.ql-editor]:text-gray-900 [&_.ql-editor]:dark:text-gray-100">
                        <QuillEditor
                          ref={quillRef}
                          defaultValue={newDescription}
                          onTextChange={(html) => setNewDescription(html)}
                          placeholder="VD: Cập nhật: Sản phẩm đã được kiểm tra kỹ càng, đảm bảo 100% chính hãng..."
                        />
                      </div>
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.description}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm mt-1">
                        {quillRef.current?.getText().trim().length || 0} ký tự
                        (tối thiểu 20 ký tự)
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button type="submit" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          "Lưu bổ sung"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          navigate("/seller");
                        }}
                      >
                        Quay lại
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Guidelines */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">
                      Hướng dẫn viết bổ sung hiệu quả:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Bắt đầu bằng "Cập nhật:", "Bổ sung:", "Lưu ý:" để dễ
                        phân biệt
                      </li>
                      <li>Cung cấp thông tin hữu ích, chính xác</li>
                      <li>Tránh spam hoặc lặp lại thông tin đã có</li>
                      <li>Không thay đổi giá trị cốt lõi của sản phẩm</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditProductPage;
