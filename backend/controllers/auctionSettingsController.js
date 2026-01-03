// controllers/auctionSettingsController.js
import AuctionSettingsService from '../services/auctionSettingsService.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('AuctionSettingsController');

/**
 * Get auction settings
 * GET /api/admin/auction-settings
 */
export async function getAuctionSettings(req, res) {
  try {
    const settings = await AuctionSettingsService.getSettings();

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Error getting auction settings:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải cấu hình đấu giá'
    });
  }
}

/**
 * Update auction settings
 * PUT /api/admin/auction-settings
 */
export async function updateAuctionSettings(req, res) {
  try {
    const { autoExtendThreshold, autoExtendDuration } = req.body;

    const settings = await AuctionSettingsService.updateSettings({
      autoExtendThreshold,
      autoExtendDuration
    });

    res.json({
      success: true,
      data: settings,
      message: 'Cập nhật cấu hình thành công'
    });
  } catch (error) {
    logger.error('Error updating auction settings:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể cập nhật cấu hình'
    });
  }
}

