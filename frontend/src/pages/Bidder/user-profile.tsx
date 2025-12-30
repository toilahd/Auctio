import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  User,
  Mail,
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
  Loader2,
  AlertCircle,
  AlertTriangle,
  Send,
} from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string | null;
  joinedAt: string;
  role: "BIDDER" | "SELLER" | "ADMIN";
  isVerified?: boolean;
  avatar?: string;
  bio?: string;
  stats?: {
    totalBids?: number;
    wonAuctions?: number;
    activeAuctions?: number;
    soldItems?: number;
  };
  rating: {
    positive: number;
    negative: number;
    total: number;
    percentage: number;
  };
  upgradeRequested?: boolean;
  upgradeRequestedAt?: string | null;
  upgradeStatus?: string | null;
}

interface Review {
  id: string;
  type: "POSITIVE" | "NEGATIVE";
  comment: string;
  fromUserId: string;
  toUserId: string;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
  fromUser: {
    id: string;
    fullName: string;
  };
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, resendOTP } = useAuth();
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpMessage, setOtpMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch user profile - use ID if viewing another user, otherwise get own profile
        const profileUrl = id 
          ? `${BACKEND_URL}/api/users/profile/${id}`
          : `${BACKEND_URL}/api/users/profile`;
        
        const profileResponse = await fetch(profileUrl, {
          credentials: "include",
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const profileData = await profileResponse.json();

        if (profileData.success && profileData.data) {
          const data = profileData.data;
          setUserProfile({
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            phone: undefined, // Not provided by API
            address: data.address,
            dateOfBirth: data.dateOfBirth,
            joinedAt: data.createdAt,
            role: data.role,
            isVerified: data.isVerified, // Not provided by API - will show warning
            avatar: undefined, // Not provided by API
            bio: undefined, // Not provided by API - will show warning
            stats: undefined, // Not provided by API - will show warning
            rating: {
              positive: data.positiveRatings,
              negative: data.negativeRatings,
              total: data.totalRatings,
              percentage: data.ratingPercentage,
            },
            upgradeRequested: data.upgradeRequested,
            upgradeRequestedAt: data.upgradeRequestedAt,
            upgradeStatus: data.upgradeStatus,
          });
        }

        // Fetch ratings/reviews - use ID if viewing another user
        setIsLoadingReviews(true);
        const ratingsUrl = id
          ? `${BACKEND_URL}/api/users/${id}/ratings?page=1&limit=20`
          : `${BACKEND_URL}/api/users/ratings?page=1&limit=20`;
        
        const ratingsResponse = await fetch(ratingsUrl, {
          credentials: "include",
        });

        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          if (ratingsData.success && ratingsData.data) {
            setReviews(ratingsData.data.ratings || []);
          }
        }
        setIsLoadingReviews(false);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, BACKEND_URL]);

  // Check if viewing own profile
  const isOwnProfile = !id || (currentUser && userProfile && currentUser.id === userProfile.id);

  const handleSendOTP = async () => {
    setIsSendingOTP(true);
    setOtpMessage(null);

    try {
      const result = await resendOTP();
      setOtpMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        // Navigate to verify email page after 2 seconds
        setTimeout(() => {
          navigate("/verify-email");
        }, 2000);
      }
    } catch {
      setOtpMessage({
        type: "error",
        text: "Không thể gửi mã OTP. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

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
    if (!userProfile) return 0;
    return userProfile.rating.percentage;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Đang tải thông tin người dùng...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Không thể tải thông tin
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "Đã xảy ra lỗi khi tải thông tin người dùng"}
            </p>
            <Button onClick={() => navigate("/")}>Về trang chủ</Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - User Info */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-linear-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-5xl font-bold text-white">
                    {userProfile.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {userProfile.fullName}
                </h2>
                <div className="flex flex-col items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {userProfile.isVerified !== undefined ? (
                      userProfile.isVerified ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Đã xác thực</span>
                        </div>
                      ) : (
                        isOwnProfile && (
                          <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-xs">Chưa xác thực email</span>
                          </div>
                        )
                      )
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs">isVerified chưa có</span>
                      </div>
                    )}
                    {userProfile.role === "SELLER" && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">Người bán</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Verification Button - Only show for own profile if not verified */}
                  {isOwnProfile && userProfile.isVerified !== undefined && !userProfile.isVerified && (
                    <div className="w-full mt-2">
                      <Button
                        onClick={handleSendOTP}
                        disabled={isSendingOTP}
                        size="sm"
                        className="w-full"
                        variant="outline"
                      >
                        {isSendingOTP ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Gửi mã xác thực
                          </>
                        )}
                      </Button>
                      {otpMessage && (
                        <Alert
                          variant={otpMessage.type === "error" ? "destructive" : "default"}
                          className="mt-2"
                        >
                          <AlertDescription className="text-xs">
                            {otpMessage.text}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {/* {userProfile.bio ? (
                <div className="mb-6 pb-6 border-b">
                  <p className="text-sm text-gray-600 text-center">
                    {userProfile.bio}
                  </p>
                </div>
              ) : (
                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Bio chưa có trong API</span>
                  </div>
                </div>
              )} */}

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    {isOwnProfile ? userProfile.email : "Email ẩn"}
                  </span>
                </div>

                {/* {userProfile.phone ? (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{userProfile.phone}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-600 text-xs">
                      Số điện thoại chưa có trong API
                    </span>
                  </div>
                )} */}

                {userProfile.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{userProfile.address}</span>
                  </div>
                )}

                {userProfile.dateOfBirth && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      Sinh nhật: {formatDate(userProfile.dateOfBirth)}
                    </span>
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
              {isOwnProfile && (
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
              {!userProfile.stats ? (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-medium">Thống kê chưa có trong API</p>
                    <p className="text-xs mt-1">
                      Cần: totalBids, wonAuctions, activeAuctions, soldItems
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Gavel className="w-5 h-5" />
                      <span className="text-sm">Lượt đấu giá</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {userProfile.stats.totalBids ?? "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="w-5 h-5" />
                      <span className="text-sm">Đã thắng</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {userProfile.stats.wonAuctions ?? "N/A"}
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
              )}
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

              {isLoadingReviews ? (
                <Card className="p-8">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                </Card>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div 
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
                        onClick={() => navigate(`/profile/${review.fromUserId}`)}
                        title="Xem trang người dùng"
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 hover:text-primary transition-colors">
                            {review.fromUser.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTimeAgo(review.createdAt)}
                          </p>
                        </div>
                      </div>

                      {review.type === "POSITIVE" ? (
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

                    {review.orderId && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Package className="w-4 h-4" />
                        <span>Đơn hàng: {review.orderId}</span>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <Card className="p-8">
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
