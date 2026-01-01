/**
 * Bidding Module - Index
 * Export all bidding-related functionality from a single entry point
 */

// Service
export { default as biddingService } from './biddingService';

// Types
export type {
  Bidder,
  Bid,
  BidHistory,
  CurrentWinner,
  CanBidResponse,
  PlaceBidRequest,
  PlaceBidResponse,
} from './biddingService';

