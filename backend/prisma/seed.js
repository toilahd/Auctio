import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...\n');

  // Clean existing data
  console.log('Cleaning existing data...');
  await prisma.chatMessage.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.deniedBidder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.descriptionHistory.deleteMany();
  await prisma.watchList.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleaned\n');

  // Create Users
  console.log('Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'admin@auctio.com',
      password: hashedPassword,
      fullName: 'Admin User',
      address: '123 Admin St',
      dateOfBirth: new Date('1980-01-01'),
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'seller1@example.com',
      password: hashedPassword,
      fullName: 'John Seller',
      address: '456 Seller Ave',
      dateOfBirth: new Date('1985-05-15'),
      role: 'SELLER',
      positiveRatings: 45,
      negativeRatings: 2,
      isVerified: true,
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'seller2@example.com',
      password: hashedPassword,
      fullName: 'Jane Merchant',
      address: '789 Commerce Rd',
      dateOfBirth: new Date('1990-08-20'),
      role: 'SELLER',
      positiveRatings: 38,
      negativeRatings: 1,
      isVerified: true,
    },
  });

  const bidder1 = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440005',
      email: 'bidder1@example.com',
      password: hashedPassword,
      fullName: 'Alice Buyer',
      address: '111 Bidder Ln',
      dateOfBirth: new Date('1992-11-30'),
      role: 'BIDDER',
      positiveRatings: 12,
      isVerified: true,
    },
  });

  const bidder2 = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440006',
      email: 'bidder2@example.com',
      password: hashedPassword,
      fullName: 'Charlie Collector',
      address: '222 Auction Blvd',
      dateOfBirth: new Date('1987-07-25'),
      role: 'BIDDER',
      positiveRatings: 28,
      negativeRatings: 1,
      isVerified: true,
    },
  });

  console.log(`Created ${await prisma.user.count()} users\n`);

  // Create Categories
  console.log('Creating categories...');
  const electronics = await prisma.category.create({
    data: {
      id: 'cat-electronics-001',
      name: 'Electronics',
    },
  });

  const phones = await prisma.category.create({
    data: {
      id: 'cat-electronics-phones',
      name: 'Smartphones',
      parentId: electronics.id,
    },
  });

  const laptops = await prisma.category.create({
    data: {
      id: 'cat-electronics-laptops',
      name: 'Laptops',
      parentId: electronics.id,
    },
  });

  const fashion = await prisma.category.create({
    data: {
      id: 'cat-fashion-002',
      name: 'Fashion & Accessories',
    },
  });

  const watches = await prisma.category.create({
    data: {
      id: 'cat-fashion-watches',
      name: 'Watches',
      parentId: fashion.id,
    },
  });

  const clothing = await prisma.category.create({
    data: {
      id: 'cat-fashion-clothing',
      name: 'Clothing',
      parentId: fashion.id,
    },
  });

  const bags = await prisma.category.create({
    data: {
      id: 'cat-fashion-bags',
      name: 'Bags & Accessories',
      parentId: fashion.id,
    },
  });

  const home = await prisma.category.create({
    data: {
      id: 'cat-home-001',
      name: 'Home & Living',
    },
  });

  const art = await prisma.category.create({
    data: {
      id: 'cat-home-art',
      name: 'Art & Paintings',
      parentId: home.id,
    },
  });

  const decor = await prisma.category.create({
    data: {
      id: 'cat-home-decor',
      name: 'Decor',
      parentId: home.id,
    },
  });

  console.log(`Created ${await prisma.category.count()} categories\n`);

  // Create Products
  console.log('reating products...');
  const iphone = await prisma.product.create({
    data: {
      id: 'prod-001',
      title: 'iPhone 15 Pro Max 256GB - Like New',
      titleNoAccent: 'iphone 15 pro max 256gb like new',
      description: '<h2>iPhone 15 Pro Max</h2><p>Excellent condition, barely used.</p>',
      images: ['https://picsum.photos/seed/iphone1/800/600', 'https://picsum.photos/seed/iphone2/800/600'],
      startPrice: 800,
      stepPrice: 50,
      buyNowPrice: 1200,
      currentPrice: 950,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      bidCount: 12,
      viewCount: 245,
      categoryId: phones.id,
      sellerId: seller1.id,
      currentWinnerId: bidder1.id,
    },
  });

  const macbook = await prisma.product.create({
    data: {
      id: 'prod-002',
      title: 'MacBook Pro 16" M3 Max 2024',
      titleNoAccent: 'macbook pro 16 m3 max 2024',
      description: '<h2>MacBook Pro 16-inch</h2><p>Latest M3 Max chip, perfect for professionals.</p>',
      images: ['https://picsum.photos/seed/macbook1/800/600'],
      startPrice: 2000,
      stepPrice: 100,
      buyNowPrice: 3500,
      currentPrice: 2400,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      bidCount: 8,
      viewCount: 189,
      categoryId: laptops.id,
      sellerId: seller1.id,
      currentWinnerId: bidder2.id,
    },
  });

  const rolex = await prisma.product.create({
    data: {
      id: 'prod-004',
      title: 'Rolex Submariner Date - 2023 Model',
      titleNoAccent: 'rolex submariner date 2023 model',
      description: '<h2>Rolex Submariner</h2><p>Authentic Rolex with box and papers.</p>',
      images: ['https://picsum.photos/seed/rolex1/800/600'],
      startPrice: 8000,
      stepPrice: 500,
      buyNowPrice: 12000,
      currentPrice: 9500,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      bidCount: 15,
      viewCount: 567,
      categoryId: watches.id,
      sellerId: seller2.id,
      currentWinnerId: bidder2.id,
    },
  });

  const aoDai = await prisma.product.create({
    data: {
      id: 'prod-005',
      title: 'Áo dài Việt Nam truyền thống - Lụa cao cấp',
      titleNoAccent: 'ao dai viet nam truyen thong lua cao cap',
      description: '<h2>Áo dài truyền thống</h2><p>Chất liệu lụa cao cấp, thêu hoa văn tinh xảo. Màu đỏ tươi, size M.</p><ul><li>Chất liệu: 100% lụa tơ tằm</li><li>Thêu tay thủ công</li><li>Bảo quản theo hướng dẫn</li></ul>',
      images: ['https://picsum.photos/seed/aodai1/800/600'],
      startPrice: 150,
      stepPrice: 10,
      buyNowPrice: 300,
      currentPrice: 150,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      bidCount: 0,
      viewCount: 89,
      categoryId: clothing.id,
      sellerId: seller2.id,
    },
  });

  const tranh = await prisma.product.create({
    data: {
      id: 'prod-006',
      title: 'Tranh sơn mài Hà Nội phố cổ - Tác phẩm nghệ thuật',
      titleNoAccent: 'tranh son mai ha noi pho co tac pham nghe thuat',
      description: '<h2>Tranh sơn mài truyền thống</h2><p>Tranh vẽ phố cổ Hà Nội với kỹ thuật sơn mài truyền thống. Kích thước 60x80cm, có khung gỗ cao cấp.</p><ul><li>Họa sĩ: Nguyễn Văn A</li><li>Năm sáng tác: 2023</li><li>Kỹ thuật: Sơn mài truyền thống</li></ul>',
      images: ['https://picsum.photos/seed/painting1/800/600'],
      startPrice: 500,
      stepPrice: 50,
      buyNowPrice: 1500,
      currentPrice: 500,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      bidCount: 0,
      viewCount: 123,
      categoryId: art.id,
      sellerId: seller1.id,
    },
  });

  const binhGom = await prisma.product.create({
    data: {
      id: 'prod-007',
      title: 'Bình gốm sứ Bát Tràng - Hoa văn rồng phượng',
      titleNoAccent: 'binh gom su bat trang hoa van rong phuong',
      description: '<h2>Bình gốm Bát Tràng</h2><p>Sản phẩm gốm sứ cao cấp từ làng nghề Bát Tràng. Hoa văn rồng phượng vẽ tay, men xanh cổ.</p><ul><li>Xuất xứ: Bát Tràng, Hà Nội</li><li>Cao: 45cm</li><li>Thủ công 100%</li></ul>',
      images: ['https://picsum.photos/seed/pottery1/800/600'],
      startPrice: 200,
      stepPrice: 20,
      buyNowPrice: 600,
      currentPrice: 200,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      bidCount: 0,
      viewCount: 67,
      categoryId: decor.id,
      sellerId: seller2.id,
    },
  });

  const dongHo = await prisma.product.create({
    data: {
      id: 'prod-008',
      title: 'Đồng hồ Orient Bambino - Phiên bản Việt Nam',
      titleNoAccent: 'dong ho orient bambino phien ban viet nam',
      description: '<h2>Đồng hồ Orient</h2><p>Đồng hồ cơ automatic Orient Bambino, phiên bản đặc biệt cho thị trường Việt Nam.</p><ul><li>Máy cơ tự động</li><li>Chống nước 5ATM</li><li>Bảo hành 2 năm</li></ul>',
      images: ['https://picsum.photos/seed/orient1/800/600'],
      startPrice: 180,
      stepPrice: 10,
      buyNowPrice: 350,
      currentPrice: 180,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      bidCount: 0,
      viewCount: 156,
      categoryId: watches.id,
      sellerId: seller1.id,
    },
  });

  const tuiXach = await prisma.product.create({
    data: {
      id: 'prod-009',
      title: 'Túi xách da thật handmade - Phong cách Sài Gòn',
      titleNoAccent: 'tui xach da that handmade phong cach sai gon',
      description: '<h2>Túi xách da thật</h2><p>Túi xách da bò thật 100%, làm thủ công tại TP.HCM. Thiết kế hiện đại, phong cách Sài Gòn.</p><ul><li>Da bò thật</li><li>Handmade</li><li>Nhiều ngăn tiện dụng</li></ul>',
      images: ['https://picsum.photos/seed/bag1/800/600'],
      startPrice: 120,
      stepPrice: 10,
      buyNowPrice: 250,
      currentPrice: 120,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      bidCount: 0,
      viewCount: 234,
      categoryId: bags.id,
      sellerId: seller2.id,
    },
  });

  console.log(`Created ${await prisma.product.count()} products\n`);


  // Create Watchlist
  console.log('Creating watchlist items...');
  await prisma.watchList.createMany({
    data: [
      { userId: bidder1.id, productId: iphone.id },
      { userId: bidder1.id, productId: macbook.id },
      { userId: bidder2.id, productId: rolex.id },
    ],
  });

  console.log('Created ${await prisma.watchList.count()} watchlist items\n');

  // Create Ratings
  console.log('Creating ratings...');
  await prisma.rating.createMany({
    data: [
      {
        type: 'POSITIVE',
        comment: 'Excellent seller! Fast shipping.',
        fromUserId: bidder1.id,
        toUserId: seller1.id,
      },
      {
        type: 'POSITIVE',
        comment: 'Item exactly as described.',
        fromUserId: bidder2.id,
        toUserId: seller1.id,
      },
      {
        type: 'POSITIVE',
        comment: 'Great communication!',
        fromUserId: bidder1.id,
        toUserId: seller2.id,
      },
    ],
  });


  console.log(`Created ${await prisma.rating.count()} ratings\n`);

  // Create Questions & Answers
  console.log('Creating questions and answers...');
  const question1 = await prisma.question.create({
    data: {
      content: 'Is the battery health really 100%?',
      productId: iphone.id,
      askerId: bidder2.id,
    },
  });

  await prisma.answer.create({
    data: {
      content: 'Yes, I can verify it shows 100% in settings!',
      questionId: question1.id,
      sellerId: seller1.id,
    },
  });

  console.log(`Created questions and answers\n`);


  console.log('Creating auto-bidding test data...');

  // Create additional bidders for testing (Bidder #3 and #4)
  const bidder3 = await prisma.user.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440007' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440007',
      email: 'bidder3@example.com',
      password: hashedPassword,
      fullName: 'Bidder #3',
      address: '333 Test St',
      dateOfBirth: new Date('1995-03-15'),
      role: 'BIDDER',
      isVerified: true,
    }
  });

  const bidder4 = await prisma.user.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440008' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440008',
      email: 'bidder4@example.com',
      password: hashedPassword,
      fullName: 'Bidder #4',
      address: '444 Test Ave',
      dateOfBirth: new Date('1993-06-20'),
      role: 'BIDDER',
      isVerified: true,
    }
  });

  // Ensure test category
  const testCategory = await prisma.category.upsert({
    where: { id: 'cat-auto-bid-test' },
    update: {},
    create: {
      id: 'cat-auto-bid-test',
      name: 'Auto Bid Test'
    }
  });

  // Create fresh bidding test product (Vietnamese example scenario)
  const biddingTestProduct = await prisma.product.upsert({
    where: { id: 'prod-auto-bid-test' },
    update: {
      currentPrice: 10_000_000,
      bidCount: 0,
      currentWinnerId: null,
      status: 'ACTIVE',
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    create: {
      id: 'prod-auto-bid-test',
      title: 'Vintage Watch - Auto Bidding Test',
      titleNoAccent: 'vintage watch auto bidding test',
      description: '<h2>Vintage Watch</h2><p>For testing auto-bidding scenario with Vietnamese example</p><ul><li>Starting Price: 10,000,000 VND</li><li>Step Price: 100,000 VND</li><li>Auto-bidding enabled</li></ul>',
      images: ['https://picsum.photos/seed/watch-test/800/600'],
      startPrice: 10_000_000,
      stepPrice: 100_000,
      currentPrice: 10_000_000,
      buyNowPrice: 50_000_000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      bidCount: 0,
      viewCount: 0,
      categoryId: testCategory.id,
      sellerId: seller1.id,
    }
  });

  console.log('========================================');
  console.log('✅ Database seeded successfully!');
  console.log('========================================');
  console.log('\n📋 Summary:');
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Categories: ${await prisma.category.count()}`);
  console.log(`   Products: ${await prisma.product.count()}`);
  console.log(`   Bids: ${await prisma.bid.count()}`);
  console.log('\n🧪 Run bidding test with: ./test-bidding.sh');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

