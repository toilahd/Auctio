import { BidForm } from '@/components/BidForm';
import { BidHistoryList } from '@/components/BidHistoryList';
import { CurrentWinnerDisplay } from '@/components/CurrentWinnerDisplay';

interface ProductBiddingPageProps {
  productId: string;
  currentPrice: number;
  stepPrice: number;
}

/**
 * Example page demonstrating complete bidding functionality
 * Combines BidForm, CurrentWinnerDisplay, and BidHistoryList
 */
export const ProductBiddingPage: React.FC<ProductBiddingPageProps> = ({
  productId,
  currentPrice,
  stepPrice,
}) => {
  const handleBidPlaced = () => {
    // This callback is triggered when a bid is successfully placed
    // You can use it to refresh other data, show notifications, etc.
    console.log('Bid placed successfully!');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Bid form and current winner */}
        <div className="lg:col-span-1 space-y-6">
          <CurrentWinnerDisplay
            productId={productId}
            autoRefresh={true}
            refreshInterval={3000}
          />

          <BidForm
            productId={productId}
            currentPrice={currentPrice}
            stepPrice={stepPrice}
            onBidPlaced={handleBidPlaced}
          />
        </div>

        {/* Right column: Bid history */}
        <div className="lg:col-span-2">
          <BidHistoryList
            productId={productId}
            autoRefresh={true}
            refreshInterval={5000}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductBiddingPage;

