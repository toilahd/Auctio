// services/emailNotificationService.js
// Email notification service for auction events
import { sendEmail } from '../config/email.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('EmailNotificationService');

class EmailNotificationService {
  /**
   * Send email notification when a bid is successfully placed
   * Sends to: seller, new bidder, current winner
   *
   * @param {Object} params
   * @param {Object} params.product - Product details
   * @param {Object} params.newBidder - Person who just placed the bid
   * @param {number} params.newPrice - Current price after bid
   * @param {Object} params.previousWinner - Previous winner (if any)
   * @param {string} params.currentWinnerId - ID of current winner after this bid
   */
  async notifyBidPlaced({ product, newBidder, newPrice, previousWinner, currentWinnerId }) {
    const productUrl = `${process.env.FRONTEND_URL}/product/${product.id}`;
    const tasks = [];

    try {
      // Determine who won this round
      const newBidderWon = currentWinnerId === newBidder.id;
      const previousWinnerStillWinning = previousWinner && currentWinnerId === previousWinner.id;

      // 1. Email to seller
      if (product.seller && product.seller.email) {
        tasks.push(
          sendEmail(
            product.seller.email,
            `Giá mới cho sản phẩm: ${product.title}`,
            `Sản phẩm "${product.title}" có giá mới: ${this.formatPrice(newPrice)}`,
            `
              <h2>Giá Đấu Mới</h2>
              <p>Xin chào <strong>${product.seller.fullName}</strong>,</p>
              <p>Sản phẩm của bạn <strong>"${product.title}"</strong> vừa nhận được một giá đấu mới!</p>
              <div style="background: #f0f8ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Giá hiện tại:</strong> ${this.formatPrice(newPrice)}</p>
                <p style="margin: 5px 0;"><strong>Người đấu giá:</strong> ${this.maskName(newBidder.fullName)}</p>
              </div>
              <p><a href="${productUrl}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Xem Chi Tiết Sản Phẩm</a></p>
              <p>Trân trọng,<br><strong>Đội ngũ Auctio</strong></p>
            `
          ).catch(err => logger.error('Failed to send email to seller:', err))
        );
      }

      // 2. Email to new bidder
      if (newBidder && newBidder.email) {
        if (newBidderWon) {
          // New bidder is now leading
          tasks.push(
            sendEmail(
              newBidder.email,
              `Đấu giá thành công: ${product.title}`,
              `Bạn đã đặt giá thành công và đang dẫn đầu cho sản phẩm "${product.title}"`,
              `
                <h2>Đấu Giá Thành Công - Bạn Đang Dẫn Đầu!</h2>
                <p>Xin chào <strong>${newBidder.fullName}</strong>,</p>
                <p>Bạn đã đặt giá thành công cho sản phẩm <strong>"${product.title}"</strong>!</p>
                <div style="background: #f0fff4; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Giá hiện tại:</strong> ${this.formatPrice(newPrice)}</p>
                  <p style="margin: 5px 0;"><strong>Trạng thái:</strong> Bạn đang dẫn đầu!</p>
                </div>
                <p style="color: #666; font-size: 14px;">Lưu ý: Hệ thống sẽ tự động đấu giá cho bạn trong phạm vi giá tối đa bạn đã đặt.</p>
                <p><a href="${productUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Theo Dõi Đấu Giá</a></p>
                <p>Trân trọng,<br><strong>Đội ngũ Auctio</strong></p>
              `
            ).catch(err => logger.error('Failed to send email to new bidder:', err))
          );
        } else {
          // New bidder lost (their max bid was lower)
          tasks.push(
            sendEmail(
              newBidder.email,
              `Giá đấu của bạn chưa đủ cao: ${product.title}`,
              `Giá đấu của bạn cho sản phẩm "${product.title}" chưa đủ cao để dẫn đầu`,
              `
                <h2>Giá Đấu Chưa Đủ Cao</h2>
                <p>Xin chào <strong>${newBidder.fullName}</strong>,</p>
                <p>Bạn đã đặt giá cho sản phẩm <strong>"${product.title}"</strong>, nhưng có người đã đặt giá tối đa cao hơn bạn.</p>
                <div style="background: #fff3e0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Giá hiện tại:</strong> ${this.formatPrice(newPrice)}</p>
                  <p style="margin: 5px 0;"><strong>Trạng thái:</strong> Bạn chưa dẫn đầu</p>
                </div>
                <p>Bạn cần đặt giá tối đa cao hơn để có cơ hội thắng đấu giá này.</p>
                <p><a href="${productUrl}" style="background-color: #FF9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Đặt Giá Cao Hơn</a></p>
                <p>Trân trọng,<br><strong>Đội ngũ Auctio</strong></p>
              `
            ).catch(err => logger.error('Failed to send email to new bidder:', err))
          );
        }
      }

      // 3. Email to previous winner
      if (previousWinner && previousWinner.email && previousWinner.id !== newBidder.id) {
        if (previousWinnerStillWinning) {
          // Previous winner defended their position successfully
          tasks.push(
            sendEmail(
              previousWinner.email,
              `Bạn vẫn đang dẫn đầu: ${product.title}`,
              `Có người vào giá nhưng bạn vẫn dẫn đầu cho sản phẩm "${product.title}"`,
              `
                <h2>Bạn Vẫn Dẫn Đầu</h2>
                <p>Xin chào <strong>${previousWinner.fullName}</strong>,</p>
                <p>Có người đã thử đặt giá cho sản phẩm <strong>"${product.title}"</strong>, nhưng giá tối đa của bạn vẫn cao hơn!</p>
                <div style="background: #f0fff4; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Giá hiện tại:</strong> ${this.formatPrice(newPrice)}</p>
                  <p style="margin: 5px 0;"><strong>Trạng thái:</strong> Bạn vẫn đang dẫn đầu!</p>
                </div>
                <p style="color: #666; font-size: 14px;">Lưu ý: Hệ thống đã tự động bảo vệ vị trí của bạn trong phạm vi giá tối đa bạn đã đặt.</p>
                <p><a href="${productUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Theo Dõi Đấu Giá</a></p>
                <p>Trân trọng,<br><strong>Đội ngũ Auctio</strong></p>
              `
            ).catch(err => logger.error('Failed to send email to previous winner:', err))
          );
        } else {
          // Previous winner was outbid
          tasks.push(
            sendEmail(
              previousWinner.email,
              `Ai đó đã đặt giá cao hơn: ${product.title}`,
              `Có người đã đặt giá cao hơn bạn cho sản phẩm "${product.title}"`,
              `
                <h2>Bạn Đã Bị Vượt Qua</h2>
                <p>Xin chào <strong>${previousWinner.fullName}</strong>,</p>
                <p>Có người đã đặt giá cao hơn bạn cho sản phẩm <strong>"${product.title}"</strong>.</p>
                <div style="background: #fff3e0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Giá hiện tại:</strong> ${this.formatPrice(newPrice)}</p>
                  <p style="margin: 5px 0;"><strong>Trạng thái:</strong> Bạn không còn dẫn đầu</p>
                </div>
                <p>Bạn có thể đặt giá cao hơn để tiếp tục tham gia đấu giá.</p>
                <p><a href="${productUrl}" style="background-color: #FF9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Đặt Giá Mới</a></p>
                <p>Trân trọng,<br><strong>Đội ngũ Auctio</strong></p>
              `
            ).catch(err => logger.error('Failed to send email to previous winner:', err))
          );
        }
      }

      await Promise.allSettled(tasks);
      logger.info(`Bid placed notifications sent for product ${product.id}`);
    } catch (error) {
      logger.error('Error sending bid placed notifications:', error);
      // Don't throw error - email failures should not block the main flow
    }
  }

  /**
   * Send email notification when a bidder is denied/rejected
   */
  async notifyBidderRejected({ product, bidder, reason }) {
    if (!bidder || !bidder.email) return;

    try {
      await sendEmail(
        bidder.email,
        `Bạn đã bị từ chối đấu giá: ${product.title}`,
        `Bạn đã bị từ chối tham gia đấu giá sản phẩm "${product.title}"`,
        `
          <h2>Từ Chối Đấu Giá</h2>
          <p>Xin chào <strong>${bidder.fullName}</strong>,</p>
          <p>Chúng tôi rất tiếc phải thông báo rằng bạn đã bị từ chối tham gia đấu giá sản phẩm <strong>"${product.title}"</strong>.</p>
          <div style="background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Lý do:</strong> ${reason || 'Không được chỉ định'}</p>
          </div>
          <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
          <p>Trân trọng,<br><strong>Đội ngũ Auctio</strong></p>
        `
      );
      logger.info(`Bidder rejected notification sent to ${bidder.email}`);
    } catch (error) {
      logger.error('Error sending bidder rejected notification:', error);
    }
  }

  /**
   * Send email notification when auction ends with no bidders
   */
  async notifyAuctionEndedNoBidders({ product }) {
    if (!product.seller || !product.seller.email) return;

    const productUrl = `${process.env.FRONTEND_URL}/products/${product.id}`;

    try {
      await sendEmail(
        product.seller.email,
        `Đấu giá kết thúc: ${product.title}`,
        `Phiên đấu giá cho sản phẩm "${product.title}" đã kết thúc không có người mua`,
        `
          <h2>Đấu Giá Kết Thúc</h2>
          <p>Xin chào <strong>${product.seller.fullName}</strong>,</p>
          <p>Phiên đấu giá cho sản phẩm <strong>"${product.title}"</strong> đã kết thúc.</p>
          <div style="background: #f5f5f5; border-left: 4px solid #9E9E9E; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Kết quả:</strong> Không có người đấu giá</p>
            <p style="margin: 5px 0;"><strong>Giá khởi điểm:</strong> ${this.formatPrice(product.startPrice)}</p>
            <p style="margin: 5px 0;"><strong>Thời gian kết thúc:</strong> ${this.formatDateTime(product.endTime)}</p>
          </div>
          <p>Bạn có thể tạo một phiên đấu giá mới hoặc điều chỉnh giá khởi điểm để thu hút người mua.</p>
          <p><a href="${productUrl}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Xem Sản Phẩm</a></p>
          <p>Trân trọng,<br><strong>Đội ngũ Auctio</strong></p>
        `
      );
      logger.info(`Auction ended (no bidders) notification sent for product ${product.id}`);
    } catch (error) {
      logger.error('Error sending auction ended (no bidders) notification:', error);
    }
  }

  /**
   * Send email notification when auction ends with a winner
   * Sends to: seller and winner
   */
  async notifyAuctionEndedWithWinner({ product, winner, finalPrice }) {
    const productUrl = `${process.env.FRONTEND_URL}/products/${product.id}`;
    const tasks = [];

    try {
      // 1. Email to seller
      if (product.seller && product.seller.email) {
        tasks.push(
          sendEmail(
            product.seller.email,
            `Đấu giá thành công: ${product.title}`,
            `Sản phẩm "${product.title}" đã được bán với giá ${this.formatPrice(finalPrice)}`,
            `
              <h2>Chúc Mừng! Đấu Giá Thành Công</h2>
              <p>Xin chào <strong>${product.seller.fullName}</strong>,</p>
              <p>Phiên đấu giá cho sản phẩm <strong>"${product.title}"</strong> đã kết thúc thành công!</p>
              <div style="background: #f0fff4; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Giá bán:</strong> ${this.formatPrice(finalPrice)}</p>
                <p style="margin: 5px 0;"><strong>Người thắng:</strong> ${this.maskName(winner.fullName)}</p>
                <p style="margin: 5px 0;"><strong>Thời gian kết thúc:</strong> ${this.formatDateTime(product.endTime)}</p>
              </div>
              <p>Vui lòng liên hệ với người mua để hoàn tất giao dịch và giao hàng.</p>
              <p><a href="${productUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Quản Lý Đơn Hàng</a></p>
              <p>Trân trọng,<br><strong>Đội ngũ Auctio</strong></p>
            `
          ).catch(err => logger.error('Failed to send email to seller:', err))
        );
      }

      // 2. Email to winner
      if (winner && winner.email) {
        tasks.push(
          sendEmail(
            winner.email,
            `Chúc mừng! Bạn đã thắng đấu giá: ${product.title}`,
            `Bạn đã thắng đấu giá cho sản phẩm "${product.title}" với giá ${this.formatPrice(finalPrice)}`,
            `
              <h2>Chúc Mừng! Bạn Đã Thắng</h2>
              <p>Xin chào <strong>${winner.fullName}</strong>,</p>
              <p>Chúc mừng! Bạn đã thắng đấu giá cho sản phẩm <strong>"${product.title}"</strong>!</p>
              <div style="background: #fff8e1; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Giá thắng:</strong> ${this.formatPrice(finalPrice)}</p>
                <p style="margin: 5px 0;"><strong>Người bán:</strong> ${product.seller ? this.maskName(product.seller.fullName) : 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Thời gian kết thúc:</strong> ${this.formatDateTime(product.endTime)}</p>
              </div>
              <p><strong style="color: #d32f2f;">Quan trọng:</strong> Vui lòng thanh toán và liên hệ với người bán để hoàn tất đơn hàng.</p>
              <p><a href="${productUrl}" style="background-color: #FFC107; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Thanh Toán Ngay</a></p>
              <p>Trân trọng,<br><strong>Đội ngũ Auctio</strong></p>
            `
          ).catch(err => logger.error('Failed to send email to winner:', err))
        );
      }

      await Promise.allSettled(tasks);
      logger.info(`Auction ended (with winner) notifications sent for product ${product.id}`);
    } catch (error) {
      logger.error('Error sending auction ended (with winner) notifications:', error);
    }
  }

  /**
   * Send email notification when buyer asks a question
   * Sends to: seller
   */
  async notifyQuestionAsked({ product, asker, question }) {
    if (!product.seller || !product.seller.email) return;

    const productUrl = `${process.env.FRONTEND_URL}/products/${product.id}`;

    try {
      await sendEmail(
        product.seller.email,
        `Câu hỏi mới về sản phẩm: ${product.title}`,
        `Có người đã hỏi về sản phẩm "${product.title}"`,
        `
          <h2>Câu Hỏi Mới Từ Người Mua</h2>
          <p>Xin chào <strong>${product.seller.fullName}</strong>,</p>
          <p>Có người đã đặt câu hỏi về sản phẩm <strong>"${product.title}"</strong>:</p>
          <blockquote style="border-left: 3px solid #2196F3; padding-left: 15px; margin: 20px 0; background: #f0f8ff; padding: 15px;">
            ${question}
          </blockquote>
          <p style="font-size: 14px; color: #666;">Người hỏi: <strong>${asker.fullName}</strong></p>
          <p>Vui lòng trả lời sớm để tăng cơ hội bán hàng!</p>
          <p><a href="${productUrl}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Xem & Trả Lời</a></p>
          <p>Trân trọng,<br><strong>Đội ngũ Auctio</strong></p>
        `
      );
      logger.info(`Question asked notification sent for product ${product.id}`);
    } catch (error) {
      logger.error('Error sending question asked notification:', error);
    }
  }

  /**
   * Send email notification when seller answers a question
   * Sends to: asker, all bidders, and all users who asked questions
   */
  async notifyQuestionAnswered({ product, question, answer, recipients }) {
    if (!recipients || recipients.length === 0) return;

    const productUrl = `${process.env.FRONTEND_URL}/products/${product.id}`;
    const tasks = [];

    try {
      for (const recipient of recipients) {
        if (!recipient.email) continue;

        const isAsker = recipient.id === question.askerId;

        tasks.push(
          sendEmail(
            recipient.email,
            isAsker
              ? `Câu hỏi của bạn đã được trả lời: ${product.title}`
              : `Cập nhật Q&A cho sản phẩm: ${product.title}`,
            isAsker
              ? `Người bán đã trả lời câu hỏi của bạn về "${product.title}"`
              : `Có câu hỏi mới được trả lời về sản phẩm "${product.title}"`,
            `
              <h2>${isAsker ? 'Câu Hỏi Của Bạn Đã Được Trả Lời' : 'Cập Nhật Q&A'}</h2>
              <p>Xin chào <strong>${recipient.fullName}</strong>,</p>
              <p>${isAsker ? 'Người bán đã trả lời câu hỏi của bạn' : 'Có câu hỏi mới được trả lời'} về sản phẩm <strong>"${product.title}"</strong>:</p>
              <blockquote style="border-left: 3px solid #9E9E9E; padding-left: 15px; margin: 20px 0; background: #f9f9f9; padding: 10px 15px;">
                <strong>Câu hỏi:</strong><br>
                ${question.content}
              </blockquote>
              <blockquote style="border-left: 3px solid #4CAF50; padding-left: 15px; margin: 20px 0; background: #f0fff4; padding: 10px 15px;">
                <strong>Trả lời:</strong><br>
                ${answer.content}
              </blockquote>
              <p><a href="${productUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Xem Sản Phẩm</a></p>
              <p>Trân trọng,<br><strong>Đội ngũ Auctio</strong></p>
            `
          ).catch(err => logger.error(`Failed to send email to ${recipient.email}:`, err))
        );
      }

      await Promise.allSettled(tasks);
      logger.info(`Question answered notifications sent for product ${product.id} to ${recipients.length} recipients`);
    } catch (error) {
      logger.error('Error sending question answered notifications:', error);
    }
  }

  /**
   * Notify bidders when product description is updated
   * @param {Object} params
   * @param {Object} params.product - Product details (id, title)
   * @param {Object} params.seller - Seller details (id, fullName)
   * @param {Array<Object>} params.bidders - All bidders/watchers to notify (must have id, fullName, email)
   */
  async notifyProductDescriptionUpdated({ product, seller, bidders }) {
    if (!bidders || bidders.length === 0) {
      return;
    }

    const productUrl = `${process.env.FRONTEND_URL}/products/${product.id}`;

    try {
      const emailPromises = bidders.map(async (bidder) => {
        if (!bidder || !bidder.email) return;

        const subject = `Cập nhật sản phẩm: ${product.title}`;
        const plainText = `Sản phẩm "${product.title}" đã được cập nhật mô tả bởi người bán.\nXem chi tiết: ${productUrl}`;

        const html = `
          <h2>Cập Nhật Mô Tả Sản Phẩm</h2>
          <p>Xin chào <strong>${bidder.fullName}</strong>,</p>
          <p>Sản phẩm <strong>"${product.title}"</strong> mà bạn đang quan tâm đã được người bán cập nhật mô tả.</p>
          <div style="background: #f9f9f9; border-left: 4px solid #2196F3; padding: 12px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Người bán:</strong> ${this.maskName(seller.fullName)}</p>
            <p style="margin: 4px 0;">Vui lòng xem lại thông tin sản phẩm để cập nhật các thay đổi mới nhất.</p>
          </div>
          <p><a href="${productUrl}" style="background-color: #2196F3; color: white; padding: 10px 18px; text-decoration: none; border-radius: 4px; display: inline-block;">Xem Sản Phẩm</a></p>
          <p>Trân trọng,<br><strong>Đội ngũ Auctio</strong></p>
        `;

        return sendEmail(bidder.email, subject, plainText, html)
          .catch((err) =>
            logger.error(
              `Failed to send description update email to ${bidder.email}:`,
              err
            )
          );
      });

      await Promise.allSettled(emailPromises);
      logger.info(
        `Product description update notifications sent for product ${product.id} to ${bidders.length} bidders`
      );
    } catch (error) {
      logger.error("Error sending product description update notifications:", error);
    }
  }

  /**
   * Helper: Format price in VND
   */
  formatPrice(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Helper: Format date time
   */
  formatDateTime(date) {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  /**
   * Helper: Mask user name for privacy
   */
  maskName(fullName) {
    if (!fullName) return 'N/A';
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) {
      return '****' + fullName.slice(-3);
    }
    const lastName = nameParts[nameParts.length - 1];
    return '****' + lastName;
  }
}

export default new EmailNotificationService();

