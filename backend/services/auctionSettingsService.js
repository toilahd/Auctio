// services/auctionSettingsService.js
import prisma from '../config/prisma.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('AuctionSettingsService');

/**
 * Simple in-memory cache for auction settings
 */
let settingsCache = null;
let cacheTime = null;
const CACHE_TTL = 60000; // 1 phút

/**
 * Default settings nếu chưa có trong DB
 */
const DEFAULT_SETTINGS = {
  autoExtendThreshold: 5,  // phút
  autoExtendDuration: 10  // phút
};

class AuctionSettingsService {
  /**
   * Get auction settings (with caching)
   */
  static async getSettings() {
    const now = Date.now();

    // Return from cache if valid
    if (settingsCache && cacheTime && (now - cacheTime < CACHE_TTL)) {
      return settingsCache;
    }

    try {
      // Try to get from database
      let settings = await prisma.auctionSettings.findFirst();

      // If not exists, create with defaults
      if (!settings) {
        settings = await prisma.auctionSettings.create({
          data: DEFAULT_SETTINGS
        });
        logger.info('Created default auction settings');
      }

      // Update cache
      settingsCache = {
        autoExtendThreshold: settings.autoExtendThreshold,
        autoExtendDuration: settings.autoExtendDuration
      };
      cacheTime = now;

      return settingsCache;
    } catch (error) {
      logger.error('Error getting auction settings:', error);
      // Return defaults if DB error
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update auction settings
   */
  static async updateSettings({ autoExtendThreshold, autoExtendDuration }) {
    try {
      // Validate
      if (autoExtendThreshold !== undefined) {
        const threshold = Number(autoExtendThreshold);
        if (isNaN(threshold) || threshold < 1 || threshold > 60) {
          throw new Error('Thời gian gia hạn tự động phải từ 1-60 phút');
        }
      }

      if (autoExtendDuration !== undefined) {
        const duration = Number(autoExtendDuration);
        if (isNaN(duration) || duration < 1 || duration > 120) {
          throw new Error('Thời lượng gia hạn phải từ 1-120 phút');
        }
      }

      // Find existing settings
      let settings = await prisma.auctionSettings.findFirst();

      const updateData = {};
      if (autoExtendThreshold !== undefined) updateData.autoExtendThreshold = Number(autoExtendThreshold);
      if (autoExtendDuration !== undefined) updateData.autoExtendDuration = Number(autoExtendDuration);

      if (settings) {
        // Update existing
        settings = await prisma.auctionSettings.update({
          where: { id: settings.id },
          data: updateData
        });
      } else {
        // Create new
        settings = await prisma.auctionSettings.create({
          data: {
            ...DEFAULT_SETTINGS,
            ...updateData
          }
        });
      }

      // Clear cache
      settingsCache = null;
      cacheTime = null;

      logger.info('Auction settings updated:', updateData);

      return {
        autoExtendThreshold: settings.autoExtendThreshold,
        autoExtendDuration: settings.autoExtendDuration
      };
    } catch (error) {
      logger.error('Error updating auction settings:', error);
      throw error;
    }
  }

  /**
   * Clear cache (for testing)
   */
  static clearCache() {
    settingsCache = null;
    cacheTime = null;
  }
}

export default AuctionSettingsService;

