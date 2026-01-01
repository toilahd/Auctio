import { api } from '@/lib/api';

// Types
export interface Bidder {
  id: string;
  fullName: string;
  email: string | null;
}

export interface Bid {
  id: string;
  amount: number;
  maxAmount: number | null;
  isAutoBid: boolean;
  createdAt: string;
  bidder: Bidder;
}

export interface BidHistory {
  bids: Bid[];
  total: number;
  limit: number;
  offset: number;
}

export interface CurrentWinner {
  currentPrice: number;
  currentWinner: Bidder | null;
  lastBid: Bid | null;
  bidCount: number;
}

export interface CanBidResponse {
  canBid: boolean;
  reason?: string;
}

export interface PlaceBidRequest {
  productId: string;
  maxAmount: number;
}

export interface PlaceBidResponse {
  success: boolean;
  winnerId: string;
  currentPrice: number;
  buyNowTriggered?: boolean;
  message?: string;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class BiddingService {
  /**
   * Place a bid on a product
   * @param productId - The ID of the product to bid on
   * @param maxAmount - The maximum amount the user is willing to bid
   * @returns Promise with bid result
   */
  async placeBid(productId: string, maxAmount: number): Promise<PlaceBidResponse> {
    try {
      const response = await api.post('/api/bids', {
        productId,
        maxAmount,
      });

      const result: ApiResponse<PlaceBidResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Không thể đặt giá đấu');
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã xảy ra lỗi không mong muốn khi đặt giá đấu');
    }
  }

  /**
   * Get bid history for a product
   * @param productId - The ID of the product
   * @param limit - Number of bids to retrieve (default: 20)
   * @param offset - Pagination offset (default: 0)
   * @returns Promise with bid history
   */
  async getBidHistory(
    productId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<BidHistory> {
    try {
      const response = await api.get(
        `/api/bids/product/${productId}?limit=${limit}&offset=${offset}`
      );

      const result: ApiResponse<BidHistory> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Không thể lấy lịch sử đấu giá');
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã xảy ra lỗi không mong muốn khi lấy lịch sử đấu giá');
    }
  }

  /**
   * Get current winner information for a product
   * @param productId - The ID of the product
   * @returns Promise with current winner data
   */
  async getCurrentWinner(productId: string): Promise<CurrentWinner> {
    try {
      const response = await api.get(`/api/bids/product/${productId}/winner`);

      const result: ApiResponse<CurrentWinner> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Không thể lấy thông tin người thắng cuộc');
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã xảy ra lỗi không mong muốn khi lấy thông tin người thắng cuộc');
    }
  }

  /**
   * Check if the current user can bid on a product
   * @param productId - The ID of the product
   * @returns Promise with permission check result
   */
  async canUserBid(productId: string): Promise<CanBidResponse> {
    try {
      const response = await api.get(`/api/bids/product/${productId}/can-bid`);

      const result: ApiResponse<CanBidResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to check bid permission');
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while checking bid permission');
    }
  }
}

// Export singleton instance
export const biddingService = new BiddingService();
export default biddingService;

