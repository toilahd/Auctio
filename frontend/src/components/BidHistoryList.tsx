import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBidHistory } from "@/hooks/useBidding";
import { useSocket } from "@/contexts/SocketContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Trophy, Info, UserX, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface BidHistoryListProps {
  productId: string;
  productStatus?: string;
  currentWinnerId?: string | null;
  sellerId?: string;
}

interface Bid {
  id: string;
  amount: string | number;
  createdAt: string;
  bidder: {
    id: string;
    fullName: string;
    isDenied?: boolean; // Backend returns isDenied flag
  };
}

/**
 * Component for displaying bid history with pagination and rejection feature
 * Uses Socket.io for real-time updates
 */
export const BidHistoryList: React.FC<BidHistoryListProps> = ({
                                                                productId,
                                                                productStatus,
                                                                currentWinnerId,
                                                                sellerId,
                                                              }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    bidHistory,
    loading,
    error,
    fetchBidHistory,
    nextPage,
    prevPage,
    refresh,
    hasNextPage,
    hasPrevPage,
    currentPage,
    totalPages,
  } = useBidHistory(productId, 20);

  const { socket, isConnected, joinProduct, leaveProduct } = useSocket();

  // State for rejection modal
  const [rejectModal, setRejectModal] = useState<{
    show: boolean;
    bidderId: string | null;
    bidderName: string | null;
  }>({
    show: false,
    bidderId: null,
    bidderName: null,
  });
  const [isRejecting, setIsRejecting] = useState(false);

  // State for notifications
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  // Check if current user can reject bidders (admin or seller)
  const canReject = user && (user.role === "ADMIN" || user.id === sellerId);

  // Get offset for calculating bid numbers
  const offset = bidHistory ? (currentPage - 1) * 20 : 0;

  // Initial fetch
  useEffect(() => {
    fetchBidHistory();
  }, [fetchBidHistory]);

  // Join product room and listen for real-time bid updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the product room
    joinProduct(productId);

    // Listen for bid updates
    const handleBidPlaced = (data: any) => {
      console.log("🔔 New bid received in history:", data);
      if (data.productId === productId) {
        // Refresh bid history when new bid is placed
        refresh();
      }
    };

    // Listen for bidder rejection
    const handleBidderRejected = (data: any) => {
      console.log("🚫 Bidder rejected:", data);
      if (data.productId === productId) {
        // Show notification
        if (data.newWinner) {
          setNotification({
            show: true,
            message: `Người thắng mới: ${data.newWinner.username} - ${formatPrice(data.newWinner.bidAmount)}`,
            type: 'info'
          });
          // Auto-hide after 5 seconds
          setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 5000);
        } else {
          setNotification({
            show: true,
            message: "Người mua đã bị từ chối",
            type: 'info'
          });
          // Auto-hide after 3 seconds
          setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 3000);
        }

        // Refresh bid history
        refresh();
      }
    };

    socket.on("bid:placed", handleBidPlaced);
    socket.on("bidder:rejected", handleBidderRejected);

    // Cleanup
    return () => {
      socket.off("bid:placed", handleBidPlaced);
      socket.off("bidder:rejected", handleBidderRejected);
      leaveProduct(productId);
    };
  }, [socket, isConnected, productId, joinProduct, leaveProduct, refresh]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numPrice);
  };

  const handleRejectClick = (bidderId: string, bidderName: string) => {
    setRejectModal({
      show: true,
      bidderId,
      bidderName,
    });
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.bidderId) return;

    try {
      setIsRejecting(true);
      const response = await api.post("/api/seller/products/" + productId + "/deny-bidder", {
        bidderId: rejectModal.bidderId,
        reason: "Từ chối bởi người bán"
      });

      const result = await response.json();

      if (result.success || response.ok) {
        setNotification({
          show: true,
          message: "Đã từ chối người mua thành công",
          type: 'success'
        });
        // Auto-hide after 3 seconds
        setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 3000);

        // Close modal
        setRejectModal({ show: false, bidderId: null, bidderName: null });

        // Refresh bid history
        refresh();
      } else {
        throw new Error(result.message || 'Không thể từ chối người mua');
      }
    } catch (error: any) {
      console.error("Error rejecting bidder:", error);
      setNotification({
        show: true,
        message: error.message || "Không thể từ chối người mua",
        type: 'error'
      });
      // Auto-hide after 5 seconds
      setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 5000);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleCancelReject = () => {
    setRejectModal({ show: false, bidderId: null, bidderName: null });
  };

  if (error) {
    return (
        <Alert variant="destructive">
          <AlertDescription>
            Đã có lỗi xảy ra khi tải lịch sử đấu giá. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
    );
  }

  return (
      <>
        {/* Notification Banner */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
            <Alert
              variant={notification.type === 'error' ? 'destructive' : 'default'}
              className={`max-w-md ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100' 
                  : notification.type === 'info'
                  ? 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100'
                  : ''
              }`}
            >
              <AlertDescription className="flex items-center justify-between gap-2">
                <span>{notification.message}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setNotification({ show: false, message: '', type: 'info' })}
                >
                  ✕
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Lịch Sử Đấu Giá
              {isConnected && productStatus === "ACTIVE" && (
                  <Badge
                      variant="outline"
                      className="text-xs flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </Badge>
              )}
            </CardTitle>
            <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
            >
              {loading ? "Đang Tải..." : "Làm Mới"}
            </Button>
          </CardHeader>
          <CardContent>
            {loading && !bidHistory ? (
                <div className="text-center py-8 text-muted-foreground">
                  Đang tải lịch sử đấu giá...
                </div>
            ) : bidHistory && bidHistory.bids.length > 0 ? (
                <>
                  {/* Explanation Banner */}
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>Đấu giá tự động:</strong> Bạn chỉ cần đặt giá tối đa
                        một lần. Hệ thống sẽ tự động tăng giá{" "}
                        <strong>vừa đủ để thắng</strong> đối thủ, giúp bạn tiết kiệm
                        thời gian và giữ bí mật giá tối đa của mình.
                      </div>
                    </div>
                  </div>

                  {/* Bid History Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-3 px-2 font-semibold text-sm">
                          STT
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-sm">
                          Người Đấu Giá
                        </th>
                        <th className="text-right py-3 px-2 font-semibold text-sm">
                          Giá Vào Sản Phẩm
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-sm">
                          Thời Gian
                        </th>
                        {canReject && (
                            <th className="text-center py-3 px-2 font-semibold text-sm">
                              Hành Động
                            </th>
                        )}
                      </tr>
                      </thead>
                      <tbody>
                      {bidHistory.bids.map((bid: Bid, index) => {
                        const isDenied = bid.bidder.isDenied || false;
                        const isWinning = currentWinnerId && bid.bidder.id === currentWinnerId && !isDenied;
                        const isOutbid = !isWinning && index === 0 && currentWinnerId && currentWinnerId !== bid.bidder.id && !isDenied;

                        return (
                            <tr
                                key={bid.id}
                                className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                                    isDenied
                                        ? "bg-red-50 dark:bg-red-900/10 opacity-60"
                                        : isWinning
                                            ? "bg-green-50 dark:bg-green-900/10"
                                            : isOutbid
                                                ? "bg-orange-50 dark:bg-orange-900/10"
                                                : ""
                                }`}
                            >
                              {/* STT */}
                              <td className="py-3 px-2 text-sm font-medium text-muted-foreground">
                                #{bidHistory.total - (offset + index)}
                              </td>

                              {/* Người Đấu Giá */}
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2 flex-wrap">
                              <span
                                  className="font-medium text-sm hover:text-primary cursor-pointer transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/profile/${bid.bidder.id}`);
                                  }}
                                  title="Xem trang người đấu giá"
                              >
                                {bid.bidder.fullName}
                              </span>

                                  {isDenied && (
                                      <Badge
                                          variant="destructive"
                                          className="text-xs flex items-center gap-1"
                                      >
                                        <UserX className="w-3 h-3" />
                                        Đã bị từ chối
                                      </Badge>
                                  )}

                                  {isWinning && !isDenied && (
                                      <Badge
                                          variant="default"
                                          className="text-xs flex items-center gap-1"
                                      >
                                        <Trophy className="w-3 h-3" />
                                        Đang Dẫn Đầu
                                      </Badge>
                                  )}

                                  {isOutbid && !isDenied && (
                                      <Badge
                                          variant="outline"
                                          className="text-xs flex items-center gap-1 text-orange-600 border-orange-300 dark:text-orange-400 dark:border-orange-600"
                                      >
                                        <Info className="w-3 h-3" />
                                        Đã bị vượt
                                      </Badge>
                                  )}
                                </div>
                              </td>

                              {/* Giá Vào Sản Phẩm */}
                              <td className="py-3 px-2 text-right">
                            <span
                                className={`font-semibold ${
                                    isDenied
                                        ? "line-through text-muted-foreground"
                                        : isWinning
                                            ? "text-green-600 dark:text-green-400 text-base"
                                            : "text-sm"
                                }`}
                            >
                              {formatPrice(bid.amount)}
                            </span>
                              </td>

                              {/* Thời Gian */}
                              <td className="py-3 px-2 text-xs text-muted-foreground">
                                {formatDate(bid.createdAt)}
                              </td>

                              {/* Hành Động */}
                              {canReject && (
                                  <td className="py-3 px-2 text-center">
                                    {!isDenied && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                handleRejectClick(
                                                    bid.bidder.id,
                                                    bid.bidder.fullName
                                                )
                                            }
                                            className="text-xs"
                                        >
                                          <UserX className="w-3 h-3 mr-1" />
                                          Từ chối
                                        </Button>
                                    )}
                                  </td>
                              )}
                            </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prevPage}
                            disabled={!hasPrevPage || loading}
                        >
                          Trước
                        </Button>
                        <span className="text-sm text-muted-foreground">
                    Trang {currentPage} / {totalPages} • Tổng: {bidHistory.total}{" "}
                          lượt đấu giá
                  </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={nextPage}
                            disabled={!hasNextPage || loading}
                        >
                          Sau
                        </Button>
                      </div>
                  )}
                </>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có ai đấu giá. Hãy là người đầu tiên!
                </div>
            )}
          </CardContent>
        </Card>

        {/* Rejection Confirmation Modal */}
        {rejectModal.show && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      Xác nhận từ chối người mua
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Bạn có chắc chắn muốn từ chối người mua{" "}
                      <strong className="text-gray-900 dark:text-white">
                        {rejectModal.bidderName}
                      </strong>
                      ?
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-6">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Lưu ý:</strong> Nếu người này đang thắng đấu giá, sản
                    phẩm sẽ được chuyển cho người có giá cao thứ hai (nếu có).
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                      variant="outline"
                      onClick={handleCancelReject}
                      disabled={isRejecting}
                  >
                    Hủy
                  </Button>
                  <Button
                      variant="destructive"
                      onClick={handleConfirmReject}
                      disabled={isRejecting}
                  >
                    {isRejecting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Đang xử lý...
                        </>
                    ) : (
                        <>
                          <UserX className="w-4 h-4 mr-2" />
                          Từ chối
                        </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
        )}
      </>
  );
};
