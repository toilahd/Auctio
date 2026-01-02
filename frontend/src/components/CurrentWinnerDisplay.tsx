import { useState, useEffect } from 'react';
import { useBidding } from '@/hooks/useBidding';
import { useSocket } from '@/contexts/SocketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CurrentWinner } from '@/services/biddingService';

interface CurrentWinnerDisplayProps {
  productId: string;
  productStatus?: string;
}

/**
 * Component for displaying the current winner of an auction
 * Uses Socket.io for real-time updates
 */
export const CurrentWinnerDisplay: React.FC<CurrentWinnerDisplayProps> = ({
  productId,
  productStatus,
}) => {
  const { getCurrentWinner } = useBidding();
  const { socket, isConnected, joinProduct, leaveProduct } = useSocket();
  const [winnerData, setWinnerData] = useState<CurrentWinner | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    const fetchWinner = async () => {
      const result = await getCurrentWinner(productId);
      if (result) {
        setWinnerData(result);
      }
      setLoading(false);
    };

    fetchWinner();
  }, [productId, getCurrentWinner]);

  // Join product room and listen for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the product room
    joinProduct(productId);

    // Listen for bid updates
    const handleBidPlaced = (data: any) => {
      console.log('🔔 Bid placed event received:', data);
      if (data.productId === productId) {
        // Update winner data in real-time
        setWinnerData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentPrice: data.currentPrice,
            bidCount: data.bidCount,
          };
        });
      }
    };

    socket.on('bid:placed', handleBidPlaced);

    // Cleanup
    return () => {
      socket.off('bid:placed', handleBidPlaced);
      leaveProduct(productId);
    };
  }, [socket, isConnected, productId, joinProduct, leaveProduct]);

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
        <CardTitle className="flex items-center gap-2">
          Trạng Thái Hiện Tại
          {isConnected && productStatus === "ACTIVE" && (
            <Badge variant="outline" className="text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </Badge>
          )}
        </CardTitle>
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

