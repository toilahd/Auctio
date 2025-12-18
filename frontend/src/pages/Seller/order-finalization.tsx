import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Package,
  MapPin,
  User,
  CreditCard,
  Truck,
  CheckCircle,
  MessageSquare,
  Send,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react";

interface OrderDetails {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  finalPrice: number;
  winnerId: string;
  winnerName: string;
  sellerId: string;
  sellerName: string;
  endedAt: string;
  status: "pending_payment" | "payment_confirmed" | "shipping" | "delivered" | "completed";
}

interface ShippingInfo {
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  role: "buyer" | "seller";
}

const OrderFinalizationPage = () => {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    recipientName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
  });

  // Mock data - TODO: Fetch from backend
  const order: OrderDetails = useMemo(() => ({
    id: id || "ord1",
    productId: "1",
    productTitle: "iPhone 15 Pro Max 256GB - Nguyên seal, chưa kích hoạt",
    productImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
    finalPrice: 28500000,
    winnerId: "buyer1",
    winnerName: "Nguyễn Văn A",
    sellerId: "seller1",
    sellerName: "TechStore VN",
    endedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "payment_confirmed",
  }), [id]);

  // Determine if current user is buyer or seller - TODO: Get from auth context
  const currentUserRole: "buyer" | "seller" = "buyer";
  const isBuyer = currentUserRole === "buyer";

  const messages: Message[] = useMemo(() => [
    {
      id: "msg1",
      senderId: "seller1",
      senderName: "TechStore VN",
      content: "Xin chào anh/chị! Cảm ơn đã đấu giá thành công. Shop sẽ liên hệ với anh/chị để xác nhận đơn hàng ạ.",
      sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      role: "seller",
    },
    {
      id: "msg2",
      senderId: "buyer1",
      senderName: "Nguyễn Văn A",
      content: "Dạ em cảm ơn shop. Em muốn nhận hàng vào cuối tuần được không ạ?",
      sentAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      role: "buyer",
    },
    {
      id: "msg3",
      senderId: "seller1",
      senderName: "TechStore VN",
      content: "Dạ được ạ, shop sẽ gửi hàng vào thứ 6 để anh/chị nhận vào cuối tuần.",
      sentAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      role: "seller",
    },
  ], []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getTimeAgo = (dateString: string) => {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    return `${minutes} phút trước`;
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // TODO: Call API to send message
    console.log("Sending message:", message);
    setMessage("");
  };

  const handleSubmitShipping = () => {
    // Validate shipping info
    if (!shippingInfo.recipientName || !shippingInfo.phone || !shippingInfo.address) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    // TODO: Call API to update shipping info
    console.log("Updating shipping info:", shippingInfo);
    alert("Thông tin giao hàng đã được cập nhật!");
  };

  const handleConfirmPayment = () => {
    // TODO: Call API to confirm payment
    console.log("Confirming payment for order:", order.id);
    alert("Đã xác nhận thanh toán!");
  };

  const handleMarkAsShipped = () => {
    // TODO: Call API to mark as shipped
    console.log("Marking order as shipped:", order.id);
    alert("Đã cập nhật trạng thái giao hàng!");
  };

  const handleConfirmDelivery = () => {
    // TODO: Call API to confirm delivery
    console.log("Confirming delivery:", order.id);
    alert("Đã xác nhận đã nhận hàng!");
  };

  const getStepStatus = (step: number) => {
    const statusMap: Record<string, number> = {
      pending_payment: 1,
      payment_confirmed: 2,
      shipping: 3,
      delivered: 4,
      completed: 5,
    };
    const currentStatusStep = statusMap[order.status] || 1;
    
    if (step < currentStatusStep) return "completed";
    if (step === currentStatusStep) return "active";
    return "pending";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Hoàn tất đơn hàng
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Mã đơn hàng: #{order.id}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${((getStepStatus(1) === "completed" ? 1 : 0) + (getStepStatus(2) === "completed" ? 1 : 0) + (getStepStatus(3) === "completed" ? 1 : 0) + (getStepStatus(4) === "completed" ? 1 : 0)) * 25}%`,
                  }}
                />
              </div>
              <div className="relative flex justify-between">
                {[
                  { step: 1, label: "Thông tin", icon: User },
                  { step: 2, label: "Thanh toán", icon: CreditCard },
                  { step: 3, label: "Vận chuyển", icon: Truck },
                  { step: 4, label: "Hoàn tất", icon: CheckCircle },
                ].map(({ step, label, icon: Icon }) => {
                  const status = getStepStatus(step);
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          status === "completed"
                            ? "bg-primary text-white"
                            : status === "active"
                            ? "bg-primary text-white ring-4 ring-primary/20"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          status === "pending"
                            ? "text-gray-500"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Thông tin sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img
                      src={order.productImage}
                      alt={order.productTitle}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <a
                        href={`/product/${order.productId}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-primary mb-2 block"
                      >
                        {order.productTitle}
                      </a>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-primary">
                            {formatPrice(order.finalPrice)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Kết thúc {getTimeAgo(order.endedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              {isBuyer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Thông tin giao hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Người nhận <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={shippingInfo.recipientName}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, recipientName: e.target.value })
                            }
                            placeholder="Họ và tên"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Số điện thoại <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={shippingInfo.phone}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, phone: e.target.value })
                            }
                            placeholder="0xxxxxxxxx"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Địa chỉ <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={shippingInfo.address}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, address: e.target.value })
                          }
                          placeholder="Số nhà, tên đường"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tỉnh/Thành phố
                          </label>
                          <Input
                            value={shippingInfo.city}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, city: e.target.value })
                            }
                            placeholder="TP. Hồ Chí Minh"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quận/Huyện
                          </label>
                          <Input
                            value={shippingInfo.district}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, district: e.target.value })
                            }
                            placeholder="Quận 1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phường/Xã
                          </label>
                          <Input
                            value={shippingInfo.ward}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, ward: e.target.value })
                            }
                            placeholder="Phường Bến Nghé"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ghi chú (tùy chọn)
                        </label>
                        <Input
                          value={shippingInfo.note}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, note: e.target.value })
                          }
                          placeholder="Giao hàng giờ hành chính..."
                        />
                      </div>
                      <Button onClick={handleSubmitShipping} className="w-full md:w-auto">
                        Lưu thông tin giao hàng
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Thông tin thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <p className="font-semibold mb-1">Thông tin chuyển khoản:</p>
                          <ul className="space-y-1">
                            <li>Ngân hàng: <strong>Vietcombank</strong></li>
                            <li>Số tài khoản: <strong>1234567890</strong></li>
                            <li>Tên tài khoản: <strong>{order.sellerName}</strong></li>
                            <li>Số tiền: <strong className="text-primary">{formatPrice(order.finalPrice)}</strong></li>
                            <li>Nội dung: <strong>AUCTIO {order.id}</strong></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    {isBuyer && (
                      <Button onClick={handleConfirmPayment} className="w-full md:w-auto">
                        Tôi đã thanh toán
                      </Button>
                    )}
                    {!isBuyer && (
                      <Button onClick={handleMarkAsShipped} className="w-full md:w-auto">
                        Xác nhận đã nhận tiền & giao hàng
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Confirmation */}
              {isBuyer && order.status === "shipping" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Xác nhận nhận hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Vui lòng kiểm tra kỹ sản phẩm trước khi xác nhận đã nhận hàng. Sau khi xác nhận, bạn sẽ không thể khiếu nại.
                    </p>
                    <Button onClick={handleConfirmDelivery} className="w-full md:w-auto">
                      Xác nhận đã nhận hàng
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Chat & Details */}
            <div className="space-y-6">
              {/* Transaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Chi tiết giao dịch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {isBuyer ? "Người bán" : "Người mua"}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {isBuyer ? order.sellerName : order.winnerName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Giá thành:</span>
                    <span className="font-semibold text-primary">
                      {formatPrice(order.finalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Kết thúc:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDateTime(order.endedAt)}
                    </span>
                  </div>
                  <div className="pt-3 border-t dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Trạng thái:</span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-950/20 text-green-600">
                        {order.status === "payment_confirmed"
                          ? "Đã thanh toán"
                          : order.status === "shipping"
                          ? "Đang giao hàng"
                          : order.status === "delivered"
                          ? "Đã giao hàng"
                          : order.status === "completed"
                          ? "Hoàn tất"
                          : "Chờ thanh toán"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chat Box */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Nhắn tin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-64 overflow-y-auto space-y-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.role === currentUserRole ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.role === currentUserRole
                                ? "bg-primary text-white"
                                : "bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            }`}
                          >
                            <p className="text-sm mb-1">{msg.content}</p>
                            <span className="text-xs opacity-75">
                              {getTimeAgo(msg.sentAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                      />
                      <Button onClick={handleSendMessage} size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderFinalizationPage;
