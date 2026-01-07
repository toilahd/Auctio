import { useEffect } from "react";
import { useBidHistory } from "@/hooks/useBidding";
import { useSocket } from "@/contexts/SocketContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface BidHistoryListProps {
  productId: string;
  productStatus?: string;
}

/**
 * Component for displaying bid history with pagination
 * Uses Socket.io for real-time updates
 */
export const BidHistoryList: React.FC<BidHistoryListProps> = ({
  productId,
  productStatus,
}) => {
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

    socket.on("bid:placed", handleBidPlaced);

    // Cleanup
    return () => {
      socket.off("bid:placed", handleBidPlaced);
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {/* {error} */}
          Đã có lỗi xảy ra khi tải lịch sử đấu giá. Vui lòng thử lại sau.
          </AlertDescription>
      </Alert>
    );
  }

  return (
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
                <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                  ℹ️
                </div>
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
                  </tr>
                </thead>
                <tbody>
                  {bidHistory.bids.map((bid, index) => {
                    const isWinning = index === 0;
                    return (
                      <tr
                        key={bid.id}
                        className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                          isWinning ? "bg-green-50 dark:bg-green-900/10" : ""
                        }`}
                      >
                        {/* STT */}
                        <td className="py-3 px-2 text-sm font-medium text-muted-foreground">
                          #{bidHistory.total - (offset + index)}
                        </td>

                        {/* Người Đấu Giá */}
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {bid.bidder.fullName}
                            </span>
                            {isWinning && (
                              <Badge variant="default" className="text-xs">
                                🏆 Đang Dẫn Đầu
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Giá Vào Sản Phẩm */}
                        <td className="py-3 px-2 text-right">
                          <div className="flex flex-col items-end">
                            <span
                              className={`font-semibold ${
                                isWinning
                                  ? "text-green-600 dark:text-green-400 text-base"
                                  : "text-sm"
                              }`}
                            >
                              {bid.amount.toLocaleString()} VND
                            </span>
                          </div>
                        </td>

                        {/* Thời Gian */}
                        <td className="py-3 px-2 text-xs text-muted-foreground">
                          {formatDate(bid.createdAt)}
                        </td>
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
  );
};
