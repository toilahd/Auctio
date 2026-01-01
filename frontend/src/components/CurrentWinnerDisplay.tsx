import { useState, useEffect } from 'react';
import { useBidding } from '@/hooks/useBidding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CurrentWinner } from '@/services/biddingService';

interface CurrentWinnerDisplayProps {
  productId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

/**
 * Component for displaying the current winner of an auction
 * Supports auto-refresh for real-time updates
 */
export const CurrentWinnerDisplay: React.FC<CurrentWinnerDisplayProps> = ({
  productId,
  autoRefresh = false,
  refreshInterval = 3000,
}) => {
  const { getCurrentWinner } = useBidding();
  const [winnerData, setWinnerData] = useState<CurrentWinner | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWinner = async () => {
    const result = await getCurrentWinner(productId);
    if (result) {
      setWinnerData(result);
    }
    setLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchWinner();
  }, [productId]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchWinner();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, productId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Đang tải...</div>
        </CardContent>
      </Card>
    );
  }

  if (!winnerData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trạng Thái Hiện Tại</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Giá Hiện Tại</div>
          <div className="text-3xl font-bold text-primary">
            {winnerData.currentPrice.toLocaleString()} VND
          </div>
        </div>

        {winnerData.currentWinner && (
          <div>
            <div className="text-sm text-muted-foreground mb-1">Người Đấu Giá Cao Nhất</div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{winnerData.currentWinner.fullName}</span>
              <Badge variant="outline">Đang Dẫn Đầu</Badge>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">Tổng Số Lượt Đấu Giá</div>
          <Badge variant="secondary">{winnerData.bidCount}</Badge>
        </div>

        {winnerData.lastBid && (
          <div className="text-xs text-muted-foreground">
            Lượt đấu giá cuối: {new Date(winnerData.lastBid.createdAt).toLocaleString('vi-VN')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

