# Email Notification System Documentation

## Tổng Quan

Hệ thống email notification tự động gửi email thông báo đến các bên liên quan khi có giao dịch quan trọng xảy ra trong quá trình đấu giá.

## Các Loại Email Được Gửi

### 1. Đấu Giá Thành Công (Bid Placed)

**Khi nào:** Khi một bidder đặt giá thành công

**Người nhận:**
- ✉️ **Người bán (Seller):** Thông báo có giá mới cho sản phẩm
- ✉️ **Người đặt giá (New Bidder):** Xác nhận đặt giá thành công
- ✉️ **Người giữ giá trước đó (Previous Winner):** Thông báo bị vượt qua (nếu có)

**Nội dung:**
- Giá hiện tại
- Tên người đấu giá (được mã hóa để bảo mật)
- Trạng thái đấu giá
- Link đến sản phẩm

**Implementation:** `emailNotificationService.notifyBidPlaced()`

### 2. Bidder Bị Từ Chối (Bidder Rejected)

**Khi nào:** Khi seller từ chối một bidder tham gia đấu giá

**Người nhận:**
- ✉️ **Người mua bị từ chối (Rejected Bidder)**

**Nội dung:**
- Tên sản phẩm
- Lý do bị từ chối
- Thông tin liên hệ hỗ trợ

**Implementation:** `emailNotificationService.notifyBidderRejected()`

### 3. Đấu Giá Kết Thúc - Không Có Người Mua (Auction Ended - No Bidders)

**Khi nào:** Khi phiên đấu giá kết thúc mà không có ai đặt giá

**Người nhận:**
- ✉️ **Người bán (Seller)**

**Nội dung:**
- Thông báo không có người đấu giá
- Giá khởi điểm
- Thời gian kết thúc
- Gợi ý tạo phiên đấu giá mới hoặc điều chỉnh giá

**Implementation:** `emailNotificationService.notifyAuctionEndedNoBidders()`

### 4. Đấu Giá Kết Thúc - Có Người Thắng (Auction Ended - With Winner)

**Khi nào:** Khi phiên đấu giá kết thúc và có người thắng

**Người nhận:**
- ✉️ **Người bán (Seller):** Thông báo bán thành công
- ✉️ **Người thắng (Winner):** Chúc mừng và hướng dẫn thanh toán

**Nội dung cho Seller:**
- Giá bán cuối cùng
- Thông tin người thắng (được mã hóa)
- Link quản lý đơn hàng

**Nội dung cho Winner:**
- Giá thắng
- Thông tin người bán
- Hướng dẫn thanh toán
- Link đến sản phẩm

**Implementation:** `emailNotificationService.notifyAuctionEndedWithWinner()`

### 5. Người Mua Đặt Câu Hỏi (Question Asked)

**Khi nào:** Khi một người mua đặt câu hỏi về sản phẩm

**Người nhận:**
- ✉️ **Người bán (Seller)**

**Nội dung:**
- Câu hỏi của người mua
- Tên người hỏi
- Link để trả lời

**Implementation:** `emailNotificationService.notifyQuestionAsked()`

### 6. Người Bán Trả Lời Câu Hỏi (Question Answered)

**Khi nào:** Khi người bán trả lời câu hỏi

**Người nhận:**
- ✉️ **Người hỏi (Asker):** Email ưu tiên với tiêu đề "Câu hỏi của bạn đã được trả lời"
- ✉️ **Tất cả người đấu giá (All Bidders):** Email cập nhật Q&A
- ✉️ **Tất cả người đã đặt câu hỏi (All Questioners):** Email cập nhật Q&A

**Nội dung:**
- Câu hỏi gốc
- Câu trả lời
- Link đến sản phẩm

**Implementation:** `emailNotificationService.notifyQuestionAnswered()`

## Tích Hợp (Integration)

### 1. Bidding Service (`biddingService.js`)

```javascript
import emailNotificationService from './emailNotificationService.js';

// Trong placeBid method, sau khi transaction commit:
setImmediate(() => {
  emailNotificationService.notifyBidPlaced({
    product: productWithDetails,
    newBidder: newBidderDetails,
    newPrice: resolved.finalPrice,
    previousWinner: previousWinnerDetails
  });
});
```

**Các trường hợp gửi email:**
- First bid (lần đầu đấu giá)
- Normal bid (đấu giá bình thường)
- Buy now triggered (mua ngay)

### 2. Auction Scheduler Service (`auctionSchedulerService.js`)

```javascript
import emailNotificationService from './emailNotificationService.js';

// Trong closeExpiredAuctions method:
setImmediate(() => {
  if (product.currentWinnerId && product.currentWinner) {
    emailNotificationService.notifyAuctionEndedWithWinner({
      product,
      winner: product.currentWinner,
      finalPrice: product.currentPrice
    });
  } else {
    emailNotificationService.notifyAuctionEndedNoBidders({ product });
  }
});
```

### 3. Seller Service (`sellerService.js`)

```javascript
import emailNotificationService from './emailNotificationService.js';

// Trong denyBidder method:
setImmediate(() => {
  emailNotificationService.notifyBidderRejected({
    product: productDetails,
    bidder: bidderDetails,
    reason
  });
});
```

### 4. Question Service (`questionService.js`)

```javascript
import emailNotificationService from './emailNotificationService.js';

// Khi người mua đặt câu hỏi:
emailNotificationService.notifyQuestionAsked({
  product: { id, title, seller },
  asker: question.asker,
  question: content
});

// Khi người bán trả lời:
emailNotificationService.notifyQuestionAnswered({
  product,
  question: { askerId, content },
  answer: { content },
  recipients: [asker, ...bidders, ...questioners]
});
```

## Đặc Điểm Kỹ Thuật

### Asynchronous Email Sending

Tất cả email được gửi **bất đồng bộ** sử dụng `setImmediate()` để:
- Không block database transaction
- Không làm chậm response time
- Failure của email không ảnh hưởng đến logic chính

### Email Formatting

- **Template:** HTML emails với styling inline
- **Currency:** Format VND với separator
- **DateTime:** Format theo locale Việt Nam
- **Names:** Mask tên người dùng để bảo mật (****Lastname)

### Error Handling

```javascript
try {
  await emailNotificationService.notifyXXX({...});
} catch (emailError) {
  logger.error('Failed to send email:', emailError);
  // Don't throw - email failures should not block main flow
}
```

Email failures được log nhưng **không throw error** để không ảnh hưởng đến flow chính.

### Privacy & Security

1. **Name Masking:** 
   - "Nguyễn Văn A" → "****A"
   - "John" → "****ohn"

2. **Email Hiding:** Không hiển thị email của user khác

3. **Max Bid Hiding:** Không expose max bid của bidder

## Testing

### Manual Testing

```bash
# Test bid placed notification
curl -X POST http://localhost:3000/api/bids \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod-001", "maxAmount": 15000000}'

# Check email in inbox (configured EMAIL in .env)
```

### Environment Variables Required

```env
EMAIL=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

## Email Templates

Tất cả email templates được viết bằng **Tiếng Việt** và có:
- ✅ Clear subject lines
- ✅ Personalized greeting
- ✅ Visual hierarchy (headings, blockquotes)
- ✅ Call-to-action buttons
- ✅ Professional signature

## Monitoring & Logs

```javascript
logger.info(`Bid placed notifications sent for product ${productId}`);
logger.error('Failed to send email to seller:', err);
```

Check logs tại: `backend/logs/app-YYYY-MM-DD.log`

## Future Improvements

- [ ] Email templates với template engine (Handlebars, EJS)
- [ ] Email queue system (Bull, BeeQueue)
- [ ] Retry mechanism cho failed emails
- [ ] User preferences cho email notifications
- [ ] Email analytics & tracking
- [ ] SMS notifications
- [ ] In-app notifications

## Troubleshooting

### Email không được gửi

1. Check `.env` file có đúng EMAIL và EMAIL_PASS
2. Check Gmail App Password (không dùng password thường)
3. Check logs: `tail -f backend/logs/app-*.log`
4. Check network/firewall settings

### Email đi vào spam

1. Sử dụng professional email domain
2. Setup SPF, DKIM, DMARC records
3. Avoid spam trigger words
4. Include unsubscribe link

### Performance issues

1. Email được gửi async nên không ảnh hưởng performance
2. Nếu có nhiều emails, consider email queue system
3. Rate limiting nếu cần

---

**Created:** January 7, 2026  
**Version:** 1.0  
**Author:** Auctio Development Team

