import { useState, useCallback } from 'react';
import biddingService, {
  type BidHistory,
  type CurrentWinner,
  type CanBidResponse,
  type PlaceBidResponse,
} from '@/services/biddingService';

/**
 * Custom hook for bidding operations
 * Provides state management and error handling for bidding features
 */
export const useBidding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Place a bid on a product
   */
  const placeBid = useCallback(
    async (productId: string, maxAmount: number): Promise<PlaceBidResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await biddingService.placeBid(productId, maxAmount);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to place bid';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get bid history for a product
   */
  const getBidHistory = useCallback(
    async (
      productId: string,
      limit: number = 20,
      offset: number = 0
    ): Promise<BidHistory | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await biddingService.getBidHistory(productId, limit, offset);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get bid history';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get current winner information
   */
  const getCurrentWinner = useCallback(
    async (productId: string): Promise<CurrentWinner | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await biddingService.getCurrentWinner(productId);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get current winner';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Check if user can bid on a product
   */
  const canUserBid = useCallback(
    async (productId: string): Promise<CanBidResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await biddingService.canUserBid(productId);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to check bid permission';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    placeBid,
    getBidHistory,
    getCurrentWinner,
    canUserBid,
    clearError,
  };
};

/**
 * Custom hook specifically for bid history with pagination
 */
export const useBidHistory = (productId: string, initialLimit: number = 20) => {
  const [bidHistory, setBidHistory] = useState<BidHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = initialLimit;

  const fetchBidHistory = useCallback(
    async (newOffset: number = offset) => {
      setLoading(true);
      setError(null);
      try {
        const result = await biddingService.getBidHistory(productId, limit, newOffset);
        setBidHistory(result);
        setOffset(newOffset);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bid history';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [productId, limit, offset]
  );

  const nextPage = useCallback(() => {
    if (bidHistory && offset + limit < bidHistory.total) {
      fetchBidHistory(offset + limit);
    }
  }, [bidHistory, offset, limit, fetchBidHistory]);

  const prevPage = useCallback(() => {
    if (offset > 0) {
      fetchBidHistory(Math.max(0, offset - limit));
    }
  }, [offset, limit, fetchBidHistory]);

  const refresh = useCallback(() => {
    fetchBidHistory(offset);
  }, [offset, fetchBidHistory]);

  return {
    bidHistory,
    loading,
    error,
    fetchBidHistory,
    nextPage,
    prevPage,
    refresh,
    hasNextPage: bidHistory ? offset + limit < bidHistory.total : false,
    hasPrevPage: offset > 0,
    currentPage: Math.floor(offset / limit) + 1,
    totalPages: bidHistory ? Math.ceil(bidHistory.total / limit) : 0,
  };
};

