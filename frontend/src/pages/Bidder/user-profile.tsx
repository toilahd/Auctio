import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  ThumbsUp,
  ThumbsDown,
  Package,
  Gavel,
  Edit,
  Shield,
  CheckCircle,
} from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  joinedAt: string;
  role: "BIDDER" | "SELLER" | "ADMIN";
  isVerified: boolean;
  avatar?: string;
  bio?: string;
  stats: {
    totalBids: number;
    wonAuctions: number;
    activeAuctions?: number;
    soldItems?: number;
  };
  rating: {
    positive: number;
    negative: number;
    total: number;
  };
}

interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  type: "positive" | "negative";
  comment: string;
  createdAt: string;
  orderId: string;
  productTitle: string;
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Mock current user ID (would come from auth context)
  const currentUserId = "user1";
  const isSelfView = !id || id === currentUserId;
  const profileUserId = id || currentUserId;

  // Calculate dates once at component mount
  const [profileDates] = useState(() => {
    const now = Date.now();
    return {
      joinedAt: new Date(now - 365 * 24 * 60 * 60 * 1000).toISOString(),
      review1: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      review2: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      review3: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
      review4: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
      review5: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  // Mock user profile data
  // TODO: Replace with API call to fetch user profile
  const userProfile: UserProfile = useMemo(
    () => ({
      id: profileUserId,
      fullName: isSelfView ? "Nguyễn Văn A" : "Trần Thị B",
      email: isSelfView ? "nguyenvana@example.com" : "tranthib@example.com",
      phone: isSelfView ? "0912345678" : undefined,
      address: isSelfView
        ? "123 Đường ABC, Quận 1, TP.HCM"
        : "Quận 3, TP.HCM",
      joinedAt: profileDates.joinedAt,
      role: isSelfView ? "SELLER" : "BIDDER",
      isVerified: true,
      bio: isSelfView
        ? "Người mua và bán đồ điện tử uy tín. Luôn giao dịch minh bạch và nhanh chóng."
        : "Người mua hàng đáng tin cậy.",
      stats: {
        totalBids: isSelfView ? 156 : 89,
        wonAuctions: isSelfView ? 45 : 23,
        activeAuctions: isSelfView ? 12 : undefined,
        soldItems: isSelfView ? 38 : undefined,
      },
      rating: {
        positive: isSelfView ? 42 : 21,
        negative: isSelfView ? 3 : 2,
        total: isSelfView ? 45 : 23,
      },
    }),
    [profileUserId, isSelfView, profileDates]
  );

  // Mock reviews data
  // TODO: Replace with API call to fetch user reviews
  const reviews: Review[] = useMemo(
    () => [
      {
        id: "1",
        fromUserId: "user2",
        fromUserName: "Lê V***",
        type: "positive",
        comment: "Người bán uy tín, giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ tiếp!",
        createdAt: profileDates.review1,
        orderId: "order1",
        productTitle: "iPhone 15 Pro Max 256GB",
      },
      {
        id: "2",
        fromUserId: "user3",
        fromUserName: "Hoàng T***",
        type: "positive",
        comment: "Sản phẩm đúng mô tả, giao dịch nhanh chóng.",
        createdAt: profileDates.review2,
        orderId: "order2",
        productTitle: "MacBook Pro 14 inch M3",
      },
      {
        id: "3",
        fromUserId: "user4",
        fromUserName: "Phạm H***",
        type: "positive",
        comment: "Rất hài lòng với sản phẩm và người bán.",
        createdAt: profileDates.review3,
        orderId: "order3",
        productTitle: "iPad Pro 12.9 inch",
      },
      {
        id: "4",
        fromUserId: "user5",
        fromUserName: "Võ M***",
        type: "negative",
        comment: "Giao hàng hơi chậm so với thỏa thuận.",
        createdAt: profileDates.review4,
        orderId: "order4",
        productTitle: "AirPods Pro 2",
      },
      {
        id: "5",
        fromUserId: "user6",
        fromUserName: "Đỗ K***",
        type: "positive",
        comment: "Shop nhiệt tình, sản phẩm chất lượng tốt.",
        createdAt: profileDates.review5,
        orderId: "order5",
        productTitle: "Samsung Galaxy S24 Ultra",
      },
    ],
    [profileDates]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getTimeAgo = (dateString: string) => {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diff = now - then;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} ngày trước`;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours} giờ trước`;

    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} phút trước`;
  };

  const getRatingPercentage = () => {
    if (userProfile.rating.total === 0) return 0;
    return Math.round(
      (userProfile.rating.positive / userProfile.rating.total) * 100
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - User Info */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-5xl font-bold text-white">
                    {userProfile.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {userProfile.fullName}
                </h2>
                <div className="flex items-center gap-2 mb-2">
                  {userProfile.isVerified && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Đã xác thực</span>
                    </div>
                  )}
                  {userProfile.role === "SELLER" && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Người bán</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {userProfile.bio && (
                <div className="mb-6 pb-6 border-b">
                  <p className="text-sm text-gray-600 text-center">
                    {userProfile.bio}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    {isSelfView ? userProfile.email : "Email ẩn"}
                  </span>
                </div>

                {userProfile.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{userProfile.phone}</span>
                  </div>
                )}

                {userProfile.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{userProfile.address}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    Tham gia {formatDate(userProfile.joinedAt)}
                  </span>
                </div>
              </div>

              {/* Edit Profile Button (self view only) */}
              {isSelfView && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate("/edit-profile")}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa hồ sơ
                </Button>
              )}
            </Card>

            {/* Stats Card */}
            <Card className="p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Gavel className="w-5 h-5" />
                    <span className="text-sm">Lượt đấu giá</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {userProfile.stats.totalBids}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package className="w-5 h-5" />
                    <span className="text-sm">Đã thắng</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {userProfile.stats.wonAuctions}
                  </span>
                </div>

                {userProfile.stats.activeAuctions !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Gavel className="w-5 h-5" />
                      <span className="text-sm">Đang đấu giá</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {userProfile.stats.activeAuctions}
                    </span>
                  </div>
                )}

                {userProfile.stats.soldItems !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="w-5 h-5" />
                      <span className="text-sm">Đã bán</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {userProfile.stats.soldItems}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Content - Reviews */}
          <div className="lg:col-span-2">
            {/* Rating Summary */}
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Đánh giá của người dùng
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Rating */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {getRatingPercentage()}%
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-gray-600">
                      {userProfile.rating.total} đánh giá
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Đánh giá tích cực</p>
                </div>

                {/* Positive */}
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <ThumbsUp className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {userProfile.rating.positive}
                    </div>
                    <p className="text-sm text-gray-600">Tích cực</p>
                  </div>
                </div>

                {/* Negative */}
                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                  <ThumbsDown className="w-8 h-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {userProfile.rating.negative}
                    </div>
                    <p className="text-sm text-gray-600">Tiêu cực</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Đánh giá gần đây ({reviews.length})
              </h3>

              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.fromUserName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTimeAgo(review.createdAt)}
                          </p>
                        </div>
                      </div>

                      {review.type === "positive" ? (
                        <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          <ThumbsUp className="w-4 h-4" />
                          Tích cực
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          <ThumbsDown className="w-4 h-4" />
                          Tiêu cực
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Package className="w-4 h-4" />
                      <span>Đơn hàng: {review.productTitle}</span>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12">
                  <div className="text-center">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Chưa có đánh giá
                    </h3>
                    <p className="text-gray-600">
                      Người dùng này chưa nhận được đánh giá nào.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
