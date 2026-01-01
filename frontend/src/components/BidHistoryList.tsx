import { useEffect } from 'react';
import { useBidHistory } from '@/hooks/useBidding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface BidHistoryListProps {
  productId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

/**
 * Component for displaying bid history with pagination
 * Supports auto-refresh for real-time updates
 */
export const BidHistoryList: React.FC<BidHistoryListProps> = ({
  productId,
  autoRefresh = false,
  refreshInterval = 5000,
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

  // Initial fetch
  useEffect(() => {
    fetchBidHistory();
  }, [fetchBidHistory]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lịch Sử Đấu Giá</CardTitle>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          {loading ? 'Đang Tải...' : 'Làm Mới'}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && !bidHistory ? (
          <div className="text-center py-8 text-muted-foreground">Đang tải lịch sử đấu giá...</div>
        ) : bidHistory && bidHistory.bids.length > 0 ? (
          <>
            <div className="space-y-3">
              {bidHistory.bids.map((bid) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bid.bidder.fullName}</span>
                      {bid.isAutoBid && (
                        <Badge variant="secondary" className="text-xs">
                          Đấu Giá Tự Động
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(bid.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {bid.amount.toLocaleString()} VND
                    </div>
                  </div>
                </div>
              ))}
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
                  Trang {currentPage} / {totalPages} • Tổng: {bidHistory.total} lượt đấu giá
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

