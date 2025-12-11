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

  console.log(`✅ Created ${await prisma.user.count()} users\n`);

  // Create Categories
  console.log('📁 Creating categories...');
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

  console.log(`✅ Created ${await prisma.category.count()} categories\n`);

  // Create Products
  console.log('📦 Creating products...');
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

  console.log(`✅ Created ${await prisma.product.count()} products\n`);

  // Create Bids
  console.log('💰 Creating bids...');
  await prisma.bid.createMany({
    data: [
      {
        id: 'bid-001',
        amount: 800,
        productId: iphone.id,
        bidderId: bidder1.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'bid-002',
        amount: 850,
        productId: iphone.id,
        bidderId: bidder2.id,
        createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'bid-003',
        amount: 950,
        maxAmount: 1000,
        isAutoBid: true,
        productId: iphone.id,
        bidderId: bidder1.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log(`✅ Created ${await prisma.bid.count()} bids\n`);

  // Create Watchlist
  console.log('⭐ Creating watchlist items...');
  await prisma.watchList.createMany({
    data: [
      { userId: bidder1.id, productId: iphone.id },
      { userId: bidder1.id, productId: macbook.id },
      { userId: bidder2.id, productId: rolex.id },
    ],
  });

  console.log(`✅ Created ${await prisma.watchList.count()} watchlist items\n`);

  // Create Ratings
  console.log('⭐ Creating ratings...');
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

  console.log(`✅ Created ${await prisma.rating.count()} ratings\n`);

  // Create Questions & Answers
  console.log('❓ Creating questions and answers...');
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

  console.log(`✅ Created questions and answers\n`);

  console.log('========================================');
  console.log('✅ Database seeded successfully!');
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

