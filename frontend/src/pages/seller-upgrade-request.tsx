import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Store,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

interface UpgradeRequest {
  id: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
  businessName: string;
  businessAddress: string;
  phoneNumber: string;
  reason: string;
  documentUrl?: string;
}

export default function SellerUpgradeRequestPage() {
  const navigate = useNavigate();

  // Mock current user role (would come from auth context)
  const userRole: "BIDDER" | "SELLER" = "BIDDER";
  const isAlreadySeller = userRole === "SELLER";

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Calculate dates once at component mount
  const [requestDates] = useState(() => {
    const now = Date.now();
    return {
      submitted: new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString(),
      reviewed: new Date(now - 58 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  // Mock previous requests
  // TODO: Replace with API call to fetch user's upgrade requests
  const previousRequests: UpgradeRequest[] = useMemo(
    () => [
      {
        id: "req2",
        status: "rejected",
        submittedAt: requestDates.submitted,
        reviewedAt: requestDates.reviewed,
        reviewNote:
          "Vui lòng cung cấp thêm thông tin về kinh nghiệm bán hàng và đính kèm giấy tờ hợp lệ.",
        businessName: "Tech Shop ABC",
        businessAddress: "123 Đường XYZ, Quận 1, TP.HCM",
        phoneNumber: "0901234567",
        reason: "Muốn bán đồ điện tử",
      },
    ],
    [requestDates]
  );

  // Check if user has pending request
  const hasPendingRequest = previousRequests.some((r) => r.status === "pending");

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status: UpgradeRequest["status"]) => {
    const statusConfig = {
      pending: {
        label: "Đang chờ duyệt",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: Clock,
      },
      approved: {
        label: "Đã phê duyệt",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
      },
      rejected: {
        label: "Bị từ chối",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: XCircle,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
      >
        <Icon className="w-4 h-4" />
        {config.label}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (businessName.trim().length < 3) {
      alert("Tên cửa hàng phải có ít nhất 3 ký tự");
      return;
    }

    if (businessAddress.trim().length < 10) {
      alert("Địa chỉ phải có ít nhất 10 ký tự");
      return;
    }

    if (phoneNumber.trim().length < 10) {
      alert("Số điện thoại không hợp lệ");
      return;
    }

    if (reason.trim().length < 20) {
      alert("Lý do phải có ít nhất 20 ký tự");
      return;
    }

    setIsSubmitting(true);

    // TODO: Replace with API call to submit upgrade request
    console.log("Submitting upgrade request:", {
      businessName: businessName.trim(),
      businessAddress: businessAddress.trim(),
      phoneNumber: phoneNumber.trim(),
      reason: reason.trim(),
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (isAlreadySeller) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto p-12">
            <div className="text-center">
              <Store className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bạn đã là người bán
              </h2>
              <p className="text-gray-600 mb-6">
                Tài khoản của bạn đã có quyền người bán. Bạn có thể bắt đầu đăng sản
                phẩm để đấu giá.
              </p>
              <Button onClick={() => navigate("/seller")}>
                Đến trang quản lý người bán
              </Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto p-12">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Gửi yêu cầu thành công!
              </h2>
              <p className="text-gray-600 mb-6">
                Yêu cầu nâng cấp tài khoản của bạn đã được gửi đi. Chúng tôi sẽ xem
                xét và phản hồi trong vòng 2-3 ngày làm việc.
              </p>
              <Button onClick={() => navigate("/")}>Về trang chủ</Button>
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
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nâng cấp tài khoản người bán
            </h1>
            <p className="text-gray-600">
              Trở thành người bán để đăng sản phẩm và tham gia bán đấu giá
            </p>
          </div>

          {/* Benefits Section */}
          <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Lợi ích khi trở thành người bán
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Đăng sản phẩm
                  </h4>
                  <p className="text-sm text-gray-600">
                    Tự do đăng bán các sản phẩm của bạn
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Tiếp cận khách hàng
                  </h4>
                  <p className="text-sm text-gray-600">
                    Hàng ngàn người mua tiềm năng
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Uy tín</h4>
                  <p className="text-sm text-gray-600">
                    Hệ thống đánh giá minh bạch
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Pending Request Warning */}
          {hasPendingRequest && (
            <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-3 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  Bạn đã có yêu cầu nâng cấp đang chờ duyệt. Vui lòng đợi kết quả
                  trước khi gửi yêu cầu mới.
                </p>
              </div>
            </Card>
          )}

          {/* Request Form */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin đăng ký
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Business Name */}
                <div>
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Tên cửa hàng / Doanh nghiệp
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="VD: TechStore VN"
                    required
                    disabled={hasPendingRequest}
                  />
                </div>

                {/* Business Address */}
                <div>
                  <label
                    htmlFor="businessAddress"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Địa chỉ kinh doanh
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    id="businessAddress"
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    required
                    disabled={hasPendingRequest}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Số điện thoại liên hệ
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0912345678"
                    required
                    disabled={hasPendingRequest}
                  />
                </div>

                {/* Reason */}
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Lý do muốn trở thành người bán
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                    placeholder="Mô tả kinh nghiệm bán hàng, loại sản phẩm bạn muốn bán, kế hoạch kinh doanh... (tối thiểu 20 ký tự)"
                    rows={5}
                    className="resize-none"
                    required
                    disabled={hasPendingRequest}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {reason.length} / 500 ký tự
                  </p>
                </div>

                {/* Document Upload (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Giấy tờ chứng minh (nếu có)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Tải lên giấy phép kinh doanh hoặc CMND/CCCD
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF tối đa 5MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      disabled={hasPendingRequest}
                    >
                      Chọn file
                    </Button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex gap-3">
                <Button
                  type="submit"
                  disabled={
                    hasPendingRequest ||
                    isSubmitting ||
                    businessName.trim().length < 3 ||
                    businessAddress.trim().length < 10 ||
                    phoneNumber.trim().length < 10 ||
                    reason.trim().length < 20
                  }
                  className="flex-1"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu nâng cấp"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </Card>

          {/* Previous Requests */}
          {previousRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Lịch sử yêu cầu
              </h3>
              <div className="space-y-4">
                {previousRequests.map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {request.businessName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Gửi lúc: {formatDateTime(request.submittedAt)}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Địa chỉ: </span>
                        <span className="text-gray-900">
                          {request.businessAddress}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">SĐT: </span>
                        <span className="text-gray-900">
                          {request.phoneNumber}
                        </span>
                      </div>
                    </div>

                    {request.reviewedAt && request.reviewNote && (
                      <div
                        className={`mt-4 p-3 rounded-lg ${
                          request.status === "rejected"
                            ? "bg-red-50 border border-red-200"
                            : "bg-green-50 border border-green-200"
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Phản hồi từ quản trị viên:
                        </p>
                        <p
                          className={`text-sm ${
                            request.status === "rejected"
                              ? "text-red-800"
                              : "text-green-800"
                          }`}
                        >
                          {request.reviewNote}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDateTime(request.reviewedAt)}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
