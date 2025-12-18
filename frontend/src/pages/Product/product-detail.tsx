import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuctionCard from "@/components/AuctionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface BidHistory {
  id: string;
  bidder: string;
  amount: number;
  timestamp: string;
}

interface Question {
  id: string;
  asker: string;
  question: string;
  answer?: string;
  askedAt: string;
  answeredAt?: string;
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [question, setQuestion] = useState("");
  const [isWatching, setIsWatching] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  // Mock product data - TODO: Fetch from backend
  const product = {
    id: id || "1",
    title: "iPhone 15 Pro Max 256GB - Nguyên seal, chưa kích hoạt",
    description: `
      <h3>Thông tin sản phẩm</h3>
      <p>iPhone 15 Pro Max 256GB màu Titan Tự Nhiên, nguyên seal chưa kích hoạt bảo hành 12 tháng chính hãng Apple Việt Nam.</p>
      
      <h3>Thông số kỹ thuật</h3>
      <ul>
        <li>Màn hình: 6.7 inch Super Retina XDR OLED, 120Hz ProMotion</li>
        <li>Chip: Apple A17 Pro (3nm)</li>
        <li>RAM: 8GB</li>
        <li>Dung lượng: 256GB</li>
        <li>Camera sau: 48MP + 12MP + 12MP + LiDAR</li>
        <li>Camera trước: 12MP</li>
        <li>Pin: 4422mAh, sạc nhanh 27W</li>
      </ul>
      
      <h3>Tình trạng</h3>
      <p>Máy mới 100%, nguyên seal chưa kích hoạt. Bảo hành 12 tháng chính hãng tại các trung tâm Apple Việt Nam.</p>
      
      <h3>Phụ kiện đi kèm</h3>
      <ul>
        <li>Hộp nguyên seal</li>
        <li>Cáp USB-C to USB-C</li>
        <li>Sách hướng dẫn</li>
      </ul>
    `,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      "https://images.unsplash.com/photo-1695048133080-6b7dbad83a0f?w=800",
      "https://images.unsplash.com/photo-1695048133526-c00c6aeaaf17?w=800",
      "https://images.unsplash.com/photo-1695048133303-c0d402052fb9?w=800",
    ],
    currentPrice: 25000000,
    buyNowPrice: 30000000,
    startingPrice: 20000000,
    bidIncrement: 500000,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    totalBids: 45,
    watchers: 128,
    seller: {
      name: "TechStore VN",
      rating: 4.8,
      totalReviews: 342,
      joinedDate: "2023-05-15",
      positiveRating: 98,
    },
    category: "Điện tử > Điện thoại",
    condition: "Mới 100%",
    autoExtend: true,
  };

  const bidHistory: BidHistory[] = [
    { id: "1", bidder: "N***h", amount: 25000000, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: "2", bidder: "T***n", amount: 24500000, timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: "3", bidder: "L***a", amount: 24000000, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: "4", bidder: "H***g", amount: 23500000, timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { id: "5", bidder: "M***h", amount: 23000000, timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  ];

  const questions: Question[] = [
    {
      id: "1",
      asker: "Nguyễn V***",
      question: "Máy có bảo hành chính hãng Apple không ạ?",
      answer: "Dạ có ạ, máy bảo hành 12 tháng chính hãng tại tất cả các trung tâm bảo hành Apple Việt Nam.",
      askedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      answeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      asker: "Trần T***",
      question: "Shop có hỗ trợ trả góp không?",
      answer: "Dạ shop hỗ trợ trả góp qua các công ty tài chính ạ. Bạn có thể liên hệ với shop sau khi thắng đấu giá.",
      askedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      answeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      asker: "Lê H***",
      question: "Có thể xem máy trực tiếp không ạ?",
      askedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const relatedProducts = [
    {
      id: "2",
      title: "MacBook Pro M3 14 inch 2024 - Like new 99%",
      currentPrice: 35000000,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      totalBids: 32,
      seller: "Apple Store HN",
    },
    {
      id: "3",
      title: "Sony WH-1000XM5 - Tai nghe chống ồn cao cấp",
      currentPrice: 6500000,
      buyNowPrice: 8000000,
      imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500",
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      totalBids: 18,
      seller: "AudioPro",
    },
    {
      id: "4",
      title: "iPad Air M2 2024 - WiFi 128GB Starlight",
      currentPrice: 12000000,
      imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      totalBids: 28,
      seller: "iZone HCM",
    },
    {
      id: "5",
      title: "Samsung Galaxy S24 Ultra 512GB - Bản Hàn",
      currentPrice: 22000000,
      buyNowPrice: 25000000,
      imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500",
      endTime: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
      totalBids: 39,
      seller: "Samsung Official",
    },
  ];

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const end = new Date(product.endTime).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining("Đã kết thúc");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days} ngày ${hours} giờ`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours} giờ ${minutes} phút`);
      } else {
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [product.endTime]);

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

  const handlePlaceBid = () => {
    const amount = parseInt(bidAmount);
    if (!amount || amount < product.currentPrice + product.bidIncrement) {
      alert(`Giá đấu tối thiểu là ${formatPrice(product.currentPrice + product.bidIncrement)}`);
      return;
    }
    // TODO: Call API to place bid
    alert(`Đấu giá thành công với giá ${formatPrice(amount)}`);
    setBidAmount("");
  };

  const handleBuyNow = () => {
    if (!product.buyNowPrice) return;
    // TODO: Call API to buy now
    if (confirm(`Xác nhận mua ngay với giá ${formatPrice(product.buyNowPrice)}?`)) {
      alert("Mua ngay thành công!");
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    // TODO: Call API to submit question
    alert("Câu hỏi của bạn đã được gửi!");
    setQuestion("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="/" className="hover:text-primary">Trang chủ</a>
            <span className="mx-2">/</span>
            <a href="/products" className="hover:text-primary">Sản phẩm</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">{product.category}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Images */}
            <div className="lg:col-span-2">
              {/* Main Image */}
              <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden mb-4">
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-[500px] object-contain"
                />
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`bg-white dark:bg-slate-900 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-24 object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Bid Information */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {product.title}
                  </h1>

                  {/* Current Price */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Giá hiện tại
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(product.currentPrice)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {product.totalBids} lượt đấu giá
                    </div>
                  </div>

                  {/* Time Remaining */}
                  <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Thời gian còn lại
                    </div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {timeRemaining}
                    </div>
                    {product.autoExtend && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        ⏰ Tự động gia hạn nếu có đấu giá phút cuối
                      </div>
                    )}
                  </div>

                  {/* Bid Form */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                        Giá đấu của bạn (tối thiểu {formatPrice(product.currentPrice + product.bidIncrement)})
                      </label>
                      <Input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={formatPrice(product.currentPrice + product.bidIncrement)}
                        className="mb-2"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setBidAmount((product.currentPrice + product.bidIncrement).toString())
                          }
                        >
                          +{formatPrice(product.bidIncrement)}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setBidAmount((product.currentPrice + product.bidIncrement * 2).toString())
                          }
                        >
                          +{formatPrice(product.bidIncrement * 2)}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setBidAmount((product.currentPrice + product.bidIncrement * 5).toString())
                          }
                        >
                          +{formatPrice(product.bidIncrement * 5)}
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handlePlaceBid} className="w-full" size="lg">
                      Đấu giá ngay
                    </Button>
                  </div>

                  {/* Buy Now */}
                  {product.buyNowPrice && (
                    <div className="mb-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Hoặc mua ngay
                      </div>
                      <Button
                        onClick={handleBuyNow}
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                        size="lg"
                      >
                        Mua ngay {formatPrice(product.buyNowPrice)}
                      </Button>
                    </div>
                  )}

                  {/* Watch Button */}
                  <Button
                    variant="outline"
                    className="w-full mb-6"
                    onClick={() => setIsWatching(!isWatching)}
                  >
                    {isWatching ? "❤️ Đang theo dõi" : "🤍 Thêm vào danh sách theo dõi"}
                  </Button>

                  {/* Seller Info */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Thông tin người bán
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tên:</span>
                        <a href="#" className="text-primary hover:underline font-medium">
                          {product.seller.name}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Đánh giá:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{product.seller.rating}</span>
                          <span className="text-gray-500 text-sm">
                            ({product.seller.totalReviews})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tích cực:</span>
                        <span className="font-medium text-green-600">
                          {product.seller.positiveRating}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Mô tả sản phẩm
            </h2>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          {/* Bid History */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Lịch sử đấu giá
            </h2>
            <div className="space-y-3">
              {bidHistory.map((bid, index) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {bid.bidder}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDateTime(bid.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(bid.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q&A Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Hỏi & Đáp
            </h2>

            {/* Ask Question Form */}
            <form onSubmit={handleAskQuestion} className="mb-6">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Đặt câu hỏi cho người bán..."
                className="mb-2"
              />
              <Button type="submit">Gửi câu hỏi</Button>
            </form>

            {/* Questions List */}
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="border-b pb-4 last:border-0">
                  <div className="mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {q.asker}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      {formatDateTime(q.askedAt)}
                    </span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 mb-2">
                    ❓ {q.question}
                  </div>
                  {q.answer && (
                    <div className="ml-6 pl-4 border-l-2 border-primary/30">
                      <div className="mb-1">
                        <span className="font-medium text-primary">
                          {product.seller.name}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          {q.answeredAt && formatDateTime(q.answeredAt)}
                        </span>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">
                        💬 {q.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Related Products */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Sản phẩm tương tự
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <AuctionCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
