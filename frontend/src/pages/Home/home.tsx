import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuctionCard from "@/components/AuctionCard";
import { Button } from "@/components/ui/button";

// Mock data for featured auctions
const mockAuctions = {
  endingSoon: [
    {
      id: "1",
      title: "iPhone 15 Pro Max 256GB - Nguyên seal, chưa kích hoạt",
      currentPrice: 25000000,
      buyNowPrice: 30000000,
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      totalBids: 45,
      seller: "TechStore VN",
      isEnding: true,
    },
    {
      id: "2",
      title: "MacBook Pro M3 14 inch 2024 - Like new 99%",
      currentPrice: 35000000,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      totalBids: 32,
      seller: "Apple Store HN",
      isEnding: true,
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
      isEnding: true,
    },
    {
      id: "4",
      title: "iPad Air M2 2024 - WiFi 128GB Starlight",
      currentPrice: 12000000,
      imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      totalBids: 28,
      seller: "iZone HCM",
      isEnding: true,
    },
    {
      id: "5",
      title: "Samsung Galaxy Watch 6 Classic 47mm",
      currentPrice: 7200000,
      buyNowPrice: 9000000,
      imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
      endTime: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
      totalBids: 21,
      seller: "SmartWatch VN",
      isEnding: true,
    },
  ],
  mostBid: [
    {
      id: "6",
      title: "Nike Air Jordan 1 Retro High OG - Size 42",
      currentPrice: 8500000,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 127,
      seller: "Sneaker Heaven",
    },
    {
      id: "7",
      title: "Rolex Submariner Date 126610LN - Fullbox 2023",
      currentPrice: 250000000,
      imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500",
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 98,
      seller: "Luxury Watches",
    },
    {
      id: "8",
      title: "PlayStation 5 Slim + 2 tay cầm + 5 game AAA",
      currentPrice: 15000000,
      buyNowPrice: 18000000,
      imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500",
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 86,
      seller: "GameHub",
    },
    {
      id: "9",
      title: "Canon EOS R6 Mark II Body - Chính hãng LBM",
      currentPrice: 52000000,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
      endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 74,
      seller: "Camera World",
    },
    {
      id: "10",
      title: "Herman Miller Aeron Chair Size B - Like New",
      currentPrice: 18000000,
      buyNowPrice: 22000000,
      imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500",
      endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 67,
      seller: "Office Furniture Pro",
    },
  ],
  highestPrice: [
    {
      id: "11",
      title: "Mercedes-Benz S-Class S500 2023 - Màu đen, đi 5000km",
      currentPrice: 4500000000,
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500",
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 15,
      seller: "Luxury Auto",
    },
    {
      id: "12",
      title: "Căn hộ Vinhomes Central Park 3PN - View sông",
      currentPrice: 8500000000,
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500",
      endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 8,
      seller: "VinGroup",
    },
    {
      id: "13",
      title: "Tranh sơn dầu Nguyễn Gia Trí - Chính chủ",
      currentPrice: 350000000,
      imageUrl: "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=500",
      endTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 12,
      seller: "Fine Arts Gallery",
    },
    {
      id: "14",
      title: "Patek Philippe Nautilus 5711/1A - Full set 2022",
      currentPrice: 1200000000,
      imageUrl: "https://images.unsplash.com/photo-1587836374184-4172d2e6d18d?w=500",
      endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 22,
      seller: "Swiss Time",
    },
    {
      id: "15",
      title: "Harley-Davidson Street Glide Special 2024",
      currentPrice: 950000000,
      buyNowPrice: 1200000000,
      imageUrl: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=500",
      endTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      totalBids: 18,
      seller: "Harley VN",
    },
  ],
};

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-r from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-500/20 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Chào mừng đến với Auctio
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Nền tảng đấu giá trực tuyến hàng đầu Việt Nam. Tìm kiếm và sở
                hữu những sản phẩm chất lượng với giá tốt nhất.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8">
                  Khám phá ngay
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Tìm hiểu thêm
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Ending Soon Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  ⏰ Sắp kết thúc
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Nhanh tay đấu giá trước khi quá muộn
                </p>
              </div>
              <Button variant="outline" onClick={() => window.location.href = "/products?sort=ending"}>
                Xem tất cả →
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {mockAuctions.endingSoon.map((auction) => (
                <AuctionCard key={auction.id} {...auction} />
              ))}
            </div>
          </div>
        </section>

        {/* Most Bid Section */}
        <section className="py-12 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  🔥 Đấu giá nhiều nhất
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Sản phẩm được quan tâm nhất
                </p>
              </div>
              <Button variant="outline" onClick={() => window.location.href = "/products?sort=bids"}>
                Xem tất cả →
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {mockAuctions.mostBid.map((auction) => (
                <AuctionCard key={auction.id} {...auction} />
              ))}
            </div>
          </div>
        </section>

        {/* Highest Price Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  💎 Giá trị cao nhất
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Những sản phẩm cao cấp, giá trị lớn
                </p>
              </div>
              <Button variant="outline" onClick={() => window.location.href = "/products?sort=price"}>
                Xem tất cả →
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {mockAuctions.highestPrice.map((auction) => (
                <AuctionCard key={auction.id} {...auction} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5 dark:bg-primary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Bạn muốn bán sản phẩm?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Đăng ký trở thành người bán và tiếp cận hàng ngàn khách hàng tiềm năng
            </p>
            <Button size="lg" className="text-lg px-8" onClick={() => window.location.href = "/seller/create-product"}>
              Đăng sản phẩm ngay
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
