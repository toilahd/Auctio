import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, Clock } from "lucide-react";

interface DescriptionHistory {
  id: string;
  content: string;
  addedAt: string;
  addedBy: string;
}

const EditProductPage = () => {
  const { id } = useParams();
  const [newDescription, setNewDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock product data - TODO: Fetch from backend
  const product = useMemo(() => ({
    id: id || "1",
    title: "iPhone 15 Pro Max 256GB - Nguyên seal, chưa kích hoạt",
    currentPrice: 25000000,
    totalBids: 45,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: "active",
    currentDescription: `<h3>Thông tin sản phẩm</h3>
<p>iPhone 15 Pro Max 256GB màu Titan Tự Nhiên, nguyên seal chưa kích hoạt bảo hành 12 tháng chính hãng Apple Việt Nam.</p>

<h3>Thông số kỹ thuật</h3>
<ul>
  <li>Màn hình: 6.7 inch Super Retina XDR OLED, 120Hz ProMotion</li>
  <li>Chip: Apple A17 Pro (3nm)</li>
  <li>RAM: 8GB</li>
  <li>Dung lượng: 256GB</li>
</ul>`,
  }), [id]);

  const descriptionHistory: DescriptionHistory[] = useMemo(() => [
    {
      id: "1",
      content: "Cập nhật: Sản phẩm còn nguyên seal 100%, chưa mở hộp.",
      addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      addedBy: "TechStore VN",
    },
    {
      id: "2",
      content: "Bổ sung: Bảo hành chính hãng 12 tháng tại tất cả trung tâm Apple.",
      addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      addedBy: "TechStore VN",
    },
  ], []);

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDescription.trim()) {
      setErrors({ description: "Vui lòng nhập nội dung bổ sung" });
      return;
    }

    if (newDescription.length < 20) {
      setErrors({ description: "Nội dung bổ sung phải có ít nhất 20 ký tự" });
      return;
    }

    // TODO: Call API to append description
    console.log("Appending description:", newDescription);
    alert("Mô tả đã được cập nhật thành công!");
    setNewDescription("");
    setErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <li>Bạn chỉ có thể <strong>bổ sung thêm</strong> thông tin, không thể xóa hoặc sửa nội dung cũ</li>
                  <li>Tất cả các thay đổi sẽ được ghi lại và hiển thị lịch sử chỉnh sửa</li>
                  <li>Điều này đảm bảo tính minh bạch và công bằng cho người đấu giá</li>
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
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: product.currentDescription }}
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
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white resize-none"
                    placeholder="VD: Cập nhật: Sản phẩm đã được kiểm tra kỹ càng, đảm bảo 100% chính hãng..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {newDescription.length} ký tự (tối thiểu 20 ký tự)
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Button type="submit" size="lg">
                    Lưu bổ sung
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => (window.location.href = "/seller")}
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
                <p className="font-semibold mb-1">Hướng dẫn viết bổ sung hiệu quả:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Bắt đầu bằng "Cập nhật:", "Bổ sung:", "Lưu ý:" để dễ phân biệt</li>
                  <li>Cung cấp thông tin hữu ích, chính xác</li>
                  <li>Tránh spam hoặc lặp lại thông tin đã có</li>
                  <li>Không thay đổi giá trị cốt lõi của sản phẩm</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditProductPage;
