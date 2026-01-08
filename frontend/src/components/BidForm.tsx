import { useState, useEffect } from 'react';
import { useBidding } from '@/hooks/useBidding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BidFormProps {
  productId: string;
  currentPrice: number;
  stepPrice: number;
  onBidPlaced?: () => void;
}

/**
 * Component for placing bids on a product
 * Includes validation and real-time feedback
 */
export const BidForm: React.FC<BidFormProps> = ({
  productId,
  currentPrice,
  stepPrice,
  onBidPlaced,
}) => {
  const { loading, error, placeBid, canUserBid, clearError } = useBidding();
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [canBid, setCanBid] = useState<boolean>(false);
  const [bidCheckReason, setBidCheckReason] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Check if user can bid when component mounts
  useEffect(() => {
    const checkBidPermission = async () => {
      const result = await canUserBid(productId);
      if (result) {
        setCanBid(result.canBid);
        if (!result.canBid && result.reason) {
          setBidCheckReason(result.reason);
        }
      }
    };
    checkBidPermission();
  }, [productId, canUserBid]);

  const minBidAmount = currentPrice + stepPrice;

  const formatNumber = (value: string): string => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    
    // Format with thousand separators
    return parseInt(numericValue).toLocaleString('vi-VN');
  };

  const parseFormattedNumber = (value: string): number => {
    // Remove all non-digit characters and parse
    const numericValue = value.replace(/\D/g, '');
    return parseInt(numericValue) || 0;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatNumber(inputValue);
    setMaxAmount(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    clearError();

    const amount = parseFormattedNumber(maxAmount);

    // Validation
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    if (amount < minBidAmount) {
      alert(`Giá đấu phải ít nhất ${minBidAmount.toLocaleString()} VND`);
      return;
    }

    // Place bid
    const result = await placeBid(productId, amount);

    if (result) {
      if (result.buyNowTriggered) {
        setSuccessMessage(
          `🎉 Chúc mừng! Bạn đã mua thành công với giá mua ngay: ${result.currentPrice.toLocaleString()} VND`
        );
      } else {
        setSuccessMessage(
          `Đấu giá thành công! Giá hiện tại: ${result.currentPrice.toLocaleString()} VND`
        );
      }
      setMaxAmount('');

      // Call callback if provided
      if (onBidPlaced) {
        onBidPlaced();
      }
    }
  };

  if (!canBid) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {bidCheckReason || 'Bạn không thể đấu giá sản phẩm này'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đặt Giá Đấu</CardTitle>
        <CardDescription>
          Giá hiện tại: {currentPrice.toLocaleString()} VND • Giá tối thiểu:{' '}
          {minBidAmount.toLocaleString()} VND
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="maxAmount" className="block text-sm font-medium mb-2">
              Giá Đấu Tối Đa Của Bạn (VND)
            </label>
            <Input
              id="maxAmount"
              type="text"
              value={maxAmount}
              onChange={handleAmountChange}
              placeholder={`Tối thiểu: ${minBidAmount.toLocaleString('vi-VN')}`}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nhập số tiền tối đa bạn sẵn sàng trả. Hệ thống sẽ tự động đấu giá
              cho bạn đến số tiền này.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Đang Đấu Giá...' : 'Đặt Giá Đấu'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

