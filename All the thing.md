# TODO List – Sàn Đấu Giá Trực Tuyến

---

## 1. Phân hệ Người dùng nặc danh (Guest)

### 1.1 Menu chính

* [x] Hiển thị danh sách danh mục (category) 2 cấp: (cần thêm dữ liệu mẫu)

  * Điện tử → Điện thoại di động
  * Điện tử → Máy tính xách tay
  * Thời trang → Giày
  * Thời trang → Đồng hồ
* [x] Link category có thể click để lọc sản phẩm 

### 1.2 Trang chủ

* [x] Hiển thị Top 5 sản phẩm gần kết thúc
* [x] Hiển thị Top 5 sản phẩm có nhiều lượt ra giá nhất
* [x] Hiển thị Top 5 sản phẩm có giá cao nhất 

### 1.3 Xem danh sách sản phẩm

* [ ] Lọc theo danh mục (cần dùng chung với /search)
* [ ] Phân trang (chưa đủ số lượng sản phẩm mẫu)

### 1.4 Tìm kiếm sản phẩm

* [x] Full-text search hỗ trợ tiếng Việt không dấu
* [x] Tìm theo tên sản phẩm
* [ ] Tìm theo danh mục
* [ ] Phân trang kết quả
* [ ] Sắp xếp theo:

  * Thời gian kết thúc giảm dần
  * Giá tăng dần
  * Sản phẩm mới đăng (trong N phút) nổi bật hơn 

### 1.4.1 Hiển thị sản phẩm trong danh sách

* [ ] Ảnh đại diện
* [ ] Tên sản phẩm
* [ ] Giá hiện tại
* [ ] Thông tin bidder giữ giá cao nhất
* [ ] Giá mua ngay (nếu có)
* [ ] Ngày đăng sản phẩm
* [ ] Thời gian còn lại
* [ ] Số lượt ra giá 

### 1.5 Xem chi tiết sản phẩm

* [ ] Nội dung đầy đủ sản phẩm
* [ ] Ảnh đại diện (lớn) + ít nhất 3 ảnh phụ
* [ ] Tên sản phẩm
* [ ] Giá hiện tại
* [ ] Giá mua ngay (nếu có)
* [ ] Thông tin người bán + điểm đánh giá
* [ ] Thông tin người đặt giá cao nhất + điểm đánh giá
* [ ] Thời điểm đăng + kết thúc
* [ ] Relative time nếu < 3 ngày
* [ ] Mô tả chi tiết sản phẩm
* [ ] Lịch sử hỏi/đáp
* [ ] Hiển thị 5 sản phẩm khác cùng chuyên mục 

### 1.6 Đăng ký tài khoản

* [x] Hộp đăng ký
* [x] reCaptcha
* [x] Mật khẩu hash bằng bcrypt hoặc scrypt
* [x] Thông tin: Họ tên, Địa chỉ, Email (không trùng)
* [ ] Xác nhận OTP qua email 

---

## 2. Phân hệ Người mua (Bidder)

### 2.1 Watch List

* [ ] Lưu sản phẩm yêu thích ở view danh sách sản phẩm
* [ ] Lưu sản phẩm yêu thích ở view chi tiết sản phẩm 

### 2.2 Ra giá sản phẩm

* [ ] Ra giá trực tiếp tại view chi tiết sản phẩm
* [ ] Kiểm tra điểm đánh giá ≥ 80% mới cho phép ra giá
* [ ] Bidder chưa có đánh giá được phép ra giá nếu seller cho phép
* [ ] Hệ thống gợi ý giá hợp lệ (giá hiện tại + bước giá seller thiết lập)
* [ ] Xác nhận khi user muốn đặt giá 

### 2.3 Xem lịch sử đấu giá của sản phẩm

* [ ] Hiển thị: Thời điểm, Người mua (che 1 phần), Giá 

### 2.4 Hỏi người bán về sản phẩm

* [ ] Gửi câu hỏi tại view chi tiết sản phẩm
* [ ] Người bán nhận email thông báo kèm liên kết trả lời 

### 2.5 Quản lý hồ sơ cá nhân

* [x] Đổi email, họ tên, mật khẩu (yêu cầu mật khẩu cũ)
* [ ] Xem điểm đánh giá + chi tiết các lần được đánh giá + nhận xét
* [x] Xem danh sách sản phẩm yêu thích
* [ ] Xem danh sách sản phẩm đang tham gia đấu giá
* [ ] Xem danh sách sản phẩm đã thắng + đánh giá seller (+1 / -1 + nội dung) 

### 2.6 Yêu cầu nâng cấp thành seller

* [ ] Gửi yêu cầu upgrage lên seller
* [ ] Admin duyệt yêu cầu 

---

## 3. Phân hệ Người bán (Seller)

### 3.1 Đăng sản phẩm đấu giá

* [ ] Nhập tên sản phẩm
* [ ] Tối thiểu 3 ảnh
* [ ] Giá khởi điểm
* [ ] Bước giá
* [ ] Giá mua ngay (nếu có)
* [ ] Mô tả sản phẩm với WYSIWYG
* [ ] Tùy chọn tự động gia hạn (cài đặt 5 phút trước khi hết hạn thêm 10 phút)
* [ ] Cho phép admin điều chỉnh toàn cục tham số gia hạn 

### 3.2 Bổ sung mô tả sản phẩm

* [ ] Bổ sung thêm nội dung mô tả (append) 

### 3.3 Từ chối lượt ra giá bidder

* [ ] Seller có quyền từ chối bidder
* [ ] Nếu bidder bị từ chối đang giữ giá cao nhất → chọn bidder đứng thứ hai 

### 3.4 Trả lời câu hỏi

* [ ] Trả lời câu hỏi bidder tại view chi tiết sản phẩm 

### 3.5 Quản lý hồ sơ cá nhân seller

* [ ] Xem danh sách sản phẩm đang đăng còn hạn
* [ ] Xem danh sách sản phẩm đã đấu giá xong
* [ ] Đánh giá người thắng đấu giá (+1/-1 + nội dung)
* [ ] Hủy giao dịch + auto đánh giá -1 với lý do người mua không thanh toán 

---

## 4. Phân hệ Quản trị viên (Administrator)

### 4.1 Quản lý danh mục (Category)

* [ ] Xem danh sách
* [ ] Xem chi tiết
* [ ] Tạo mới
* [ ] Cập nhật
* [ ] Xoá (không được xoá nếu đã có sản phẩm) 

### 4.2 Quản lý sản phẩm đấu giá

* [ ] Gỡ bỏ sản phẩm 

### 4.3 Quản lý danh sách người dùng

* [ ] Xem danh sách bidder, seller
* [ ] Duyệt nâng cấp bidder → seller 

### 4.4 Admin Dashboard

* [ ] Biểu đồ số lượng sàn đấu giá mới
* [ ] Doanh thu
* [ ] Số lượng người dùng mới
* [ ] Số bidder nâng cấp seller mới
* [ ] Các thống kê khác do sinh viên đề xuất 

---

## 5. Các tính năng chung cho mọi user

### 5.1 Đăng nhập

* [x] Hệ thống đăng nhập thuần
* [x] Đăng nhập qua Google, Facebook, Twitter, Github (khuyến khích) 

### 5.2 Cập nhật thông tin cá nhân

* [x] Họ tên
* [x] Email liên lạc
* [x] Ngày tháng năm sinh 

### 5.3 Đổi mật khẩu

* [x] Bảo mật bằng bcrypt hoặc scrypt 

### 5.4 Quên mật khẩu

* [ ] Xác nhận bằng OTP qua email 

---

## 6. Hệ thống & Các yêu cầu khác

### 6.1 Mailing System

*Bắt buộc gửi email khi:*

* [ ] Ra giá thành công (seller, bidder, bidder trước)
* [ ] Bidder bị từ chối
* [ ] Đấu giá kết thúc không có bidder
* [ ] Đấu giá kết thúc có người thắng
* [ ] Người mua đặt câu hỏi
* [ ] Người bán trả lời
* [ ] Gửi email tới các bidder tham gia đấu giá và hỏi đáp 

### 6.2 Đấu giá tự động

* [ ] Hỗ trợ đấu giá tự động
* [ ] Người mua đặt giá tối đa
* [ ] Hệ thống tính toán giá thắng tự động không cần tương tác liên tục
* [ ] Chỉ chọn 1 cơ chế: thường hoặc tự động 

---

## 7. Quy trình thanh toán sau đấu giá

* [ ] Thanh toán (MoMo/ZaloPay/VNPay-QR/Stripe/PayPal/…)
* [ ] Người mua gửi địa chỉ giao hàng
* [ ] Seller xác nhận nhận tiền + gửi hoá đơn vận chuyển
* [ ] Người mua xác nhận đã nhận hàng
* [ ] Người mua & seller đánh giá giao dịch (+/- + nhận xét)
* [ ] Chat giữa buyer–seller trong quá trình hoàn tất đơn hàng
* [ ] Seller có thể cancel trong quá trình và auto -1 bidder nếu buyer không thanh toán đúng hạn 

---

## 8. Yêu cầu kỹ thuật

### Backend

* [x] API RESTful đầy đủ
* [ ] Validation mọi endpoint
* [x] Swagger Docs
* [x] Logs/monitor (Grafana/ELK)
* [x] JWT AccessToken + RefreshToken 

### Frontend

* [x] CSR SPA
* [x] Router
* [x] Form processing & validation (formik / react-hook-form)
* [x] State management (redux / zustand / context)
* [x] Một ngôn ngữ thiết kế xuyên suốt 

---

## 9. Dữ liệu & Quản lý mã nguồn

* [ ] Ít nhất 20 sản phẩm thuộc 4–5 danh mục
* [ ] Mỗi sản phẩm có ≥ 5 lượt đấu giá
* [x] Source code up lên GitHub từ đầu dự án 

