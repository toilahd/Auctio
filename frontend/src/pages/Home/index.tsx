import ItemCard from "@/components/ItemCard";

const HomePage = () => {
  const featuredItems = [
    {
      imgUrl: "https://placehold.co/600x400",
      title: "Điện thoại iPhone 13 Pro Max",
      description: "Điện thoại iPhone 13 Pro Max 256GB màu xanh Sierra Blue",
      details: "10:00 - 25/12/2024",
      startPrice: { symbol: "đ", price: 25000000 },
      depositPrice: { symbol: "đ", price: 5000000 },
    },
    {
      imgUrl: "https://placehold.co/600x400",
      title: "Laptop Dell XPS 13",
      description:
        "Laptop Dell XPS 13 9310, Intel Core i7, 16GB RAM, 512GB SSD",
      details: "14:00 - 30/12/2024",
      startPrice: { symbol: "đ", price: 30000000 },
      depositPrice: { symbol: "đ", price: 6000000 },
    },
    {
      imgUrl: "https://placehold.co/600x400",
      title: "Máy ảnh Sony Alpha a7 III",
      description: "Máy ảnh Sony Alpha a7 III với ống kính kit 28-70mm",
      details: "09:00 - 20/12/2024",
      startPrice: { symbol: "đ", price: 40000000 },
      depositPrice: { symbol: "đ", price: 8000000 },
    },
  ];
  return (
    <div>
      <div className="bg-red-300 w-full h-40 flex items-center">
        <h1 className="bg-amber-200">Homepage Banner/Hero section</h1>
      </div>
      <div className="container m-auto">
        <Section
          sectionName="Featured Items"
          items={featuredItems}
          className="pr-0"
        />
      </div>
    </div>
  );
};

export default HomePage;

const Section = ({
  sectionName,
  items,
  className,
}: {
  sectionName: string;
  items: any[];
  className?: string;
}) => {
  return (
    <div className={className}>
      <h2>{sectionName}</h2>
      <div className="flex flex-row flex-wrap gap-2 overflow-auto">
        {items.map((item, index) => (
          <ItemCard
            imgUrl={item.imgUrl}
            key={index}
            title={item.title}
            description={item.description}
            details={item.details}
            startPrice={item.startPrice}
            depositPrice={item.depositPrice}
          />
        ))}
      </div>
    </div>
  );
};
