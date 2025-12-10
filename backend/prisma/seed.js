import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to generate future date
function futureDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

// Helper function to generate past date
function pastDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.chatMessage.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.order.deleteMany();
  await prisma.descriptionHistory.deleteMany();
  await prisma.deniedBidder.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.watchList.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemConfig.deleteMany();

  // Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    // Admin
    prisma.user.create({
      data: {
        email: 'admin@auction.com',
        password: hashedPassword,
        fullName: 'Admin User',
        role: 'ADMIN',
        isVerified: true,
        address: '123 Admin Street, City',
        dateOfBirth: new Date('1985-01-15'),
      },
    }),
    // Sellers
    prisma.user.create({
      data: {
        email: 'seller1@auction.com',
        password: hashedPassword,
        fullName: 'John Smith',
        role: 'SELLER',
        isVerified: true,
        address: '456 Seller Ave, New York',
        dateOfBirth: new Date('1990-05-20'),
        positiveRatings: 45,
        negativeRatings: 3,
      },
    }),
    prisma.user.create({
      data: {
        email: 'seller2@auction.com',
        password: hashedPassword,
        fullName: 'Emily Johnson',
        role: 'SELLER',
        isVerified: true,
        address: '789 Market Street, Los Angeles',
        dateOfBirth: new Date('1988-09-12'),
        positiveRatings: 38,
        negativeRatings: 2,
      },
    }),
    prisma.user.create({
      data: {
        email: 'seller3@auction.com',
        password: hashedPassword,
        fullName: 'Michael Brown',
        role: 'SELLER',
        isVerified: true,
        address: '321 Commerce Blvd, Chicago',
        dateOfBirth: new Date('1992-03-08'),
        positiveRatings: 52,
        negativeRatings: 1,
      },
    }),
    // Bidders
    prisma.user.create({
      data: {
        email: 'bidder1@auction.com',
        password: hashedPassword,
        fullName: 'Sarah Wilson',
        role: 'BIDDER',
        isVerified: true,
        address: '654 Buyer Lane, Boston',
        dateOfBirth: new Date('1995-07-22'),
        positiveRatings: 15,
        negativeRatings: 0,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bidder2@auction.com',
        password: hashedPassword,
        fullName: 'David Lee',
        role: 'BIDDER',
        isVerified: true,
        address: '987 Auction Road, Seattle',
        dateOfBirth: new Date('1993-11-30'),
        positiveRatings: 22,
        negativeRatings: 1,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bidder3@auction.com',
        password: hashedPassword,
        fullName: 'Lisa Martinez',
        role: 'BIDDER',
        isVerified: true,
        address: '147 Bid Street, Miami',
        dateOfBirth: new Date('1991-04-18'),
        positiveRatings: 18,
        negativeRatings: 0,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bidder4@auction.com',
        password: hashedPassword,
        fullName: 'James Taylor',
        role: 'BIDDER',
        isVerified: true,
        address: '258 Deal Avenue, Denver',
        dateOfBirth: new Date('1994-08-25'),
        positiveRatings: 12,
        negativeRatings: 2,
      },
    }),
    // User requesting upgrade
    prisma.user.create({
      data: {
        email: 'upgrader@auction.com',
        password: hashedPassword,
        fullName: 'Robert Anderson',
        role: 'BIDDER',
        isVerified: true,
        address: '369 Upgrade Path, Austin',
        dateOfBirth: new Date('1989-12-10'),
        upgradeRequested: true,
        upgradeRequestedAt: new Date(),
        upgradeStatus: 'PENDING',
      },
    }),
    // Guest user
    prisma.user.create({
      data: {
        email: 'guest@auction.com',
        password: hashedPassword,
        fullName: 'Guest User',
        role: 'GUEST',
        isVerified: false,
        address: '999 Guest Street, Portland',
      },
    }),
  ]);

  const [admin, seller1, seller2, seller3, bidder1, bidder2, bidder3, bidder4, upgrader, guest] = users;
  console.log(`✅ Created ${users.length} users`);

  // Create Categories
  console.log('📁 Creating categories...');
  const electronics = await prisma.category.create({
    data: { name: 'Electronics' },
  });

  const electronicsSubcategories = await Promise.all([
    prisma.category.create({ data: { name: 'Smartphones', parentId: electronics.id } }),
    prisma.category.create({ data: { name: 'Laptops', parentId: electronics.id } }),
    prisma.category.create({ data: { name: 'Cameras', parentId: electronics.id } }),
    prisma.category.create({ data: { name: 'Audio Equipment', parentId: electronics.id } }),
  ]);

  const fashion = await prisma.category.create({
    data: { name: 'Fashion' },
  });

  const fashionSubcategories = await Promise.all([
    prisma.category.create({ data: { name: 'Watches', parentId: fashion.id } }),
    prisma.category.create({ data: { name: 'Handbags', parentId: fashion.id } }),
    prisma.category.create({ data: { name: 'Jewelry', parentId: fashion.id } }),
  ]);

  const collectibles = await prisma.category.create({
    data: { name: 'Collectibles' },
  });

  const collectiblesSubcategories = await Promise.all([
    prisma.category.create({ data: { name: 'Coins', parentId: collectibles.id } }),
    prisma.category.create({ data: { name: 'Art', parentId: collectibles.id } }),
    prisma.category.create({ data: { name: 'Vintage Items', parentId: collectibles.id } }),
  ]);

  const home = await prisma.category.create({
    data: { name: 'Home & Garden' },
  });

  const homeSubcategories = await Promise.all([
    prisma.category.create({ data: { name: 'Furniture', parentId: home.id } }),
    prisma.category.create({ data: { name: 'Appliances', parentId: home.id } }),
  ]);

  console.log('✅ Created categories with subcategories');

  // Create Products
  console.log('📦 Creating products...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: 'iPhone 15 Pro Max - 256GB Space Black',
        titleNoAccent: 'iPhone 15 Pro Max - 256GB Space Black',
        description: '<h2>Brand New iPhone 15 Pro Max</h2><p>Latest model with A17 Pro chip. Includes original box and accessories. Never used, sealed package.</p><ul><li>256GB Storage</li><li>Space Black Color</li><li>6.7-inch display</li><li>48MP camera system</li></ul>',
        images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', 'https://images.unsplash.com/photo-1695048133180-21d67f331b5c?w=800'],
        startPrice: 800,
        stepPrice: 50,
        buyNowPrice: 1200,
        currentPrice: 800,
        autoExtend: true,
        status: 'ACTIVE',
        endTime: futureDate(3),
        categoryId: electronicsSubcategories[0].id,
        sellerId: seller1.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'MacBook Pro 16" M3 Max - Like New',
        titleNoAccent: 'MacBook Pro 16 M3 Max - Like New',
        description: '<h2>MacBook Pro 16-inch</h2><p>M3 Max chip, barely used for 2 months. Comes with original charger and box.</p><ul><li>16-inch Liquid Retina XDR display</li><li>M3 Max chip</li><li>36GB RAM</li><li>1TB SSD</li></ul>',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800'],
        startPrice: 2000,
        stepPrice: 100,
        buyNowPrice: 3500,
        currentPrice: 2000,
        autoExtend: false,
        status: 'ACTIVE',
        endTime: futureDate(5),
        categoryId: electronicsSubcategories[1].id,
        sellerId: seller1.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Sony Alpha A7 IV Mirrorless Camera Body',
        titleNoAccent: 'Sony Alpha A7 IV Mirrorless Camera Body',
        description: '<h2>Professional Camera</h2><p>Full-frame mirrorless camera with 33MP sensor. Excellent condition, low shutter count.</p><ul><li>33MP full-frame sensor</li><li>4K 60fps video</li><li>693-point AF system</li><li>Includes 2 batteries</li></ul>',
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'],
        startPrice: 1500,
        stepPrice: 75,
        currentPrice: 1500,
        autoExtend: true,
        status: 'ACTIVE',
        endTime: futureDate(7),
        categoryId: electronicsSubcategories[2].id,
        sellerId: seller1.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Rolex Submariner Date - Stainless Steel',
        titleNoAccent: 'Rolex Submariner Date - Stainless Steel',
        description: '<h2>Authentic Rolex Submariner</h2><p>2021 model, comes with box and papers. Excellent condition, regularly serviced.</p><ul><li>Automatic movement</li><li>Ceramic bezel</li><li>300m water resistance</li><li>All original parts</li></ul>',
        images: ['https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800'],
        startPrice: 8000,
        stepPrice: 500,
        buyNowPrice: 12000,
        currentPrice: 8000,
        autoExtend: true,
        status: 'ACTIVE',
        endTime: futureDate(4),
        categoryId: fashionSubcategories[0].id,
        sellerId: seller2.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Louis Vuitton Neverfull MM - Monogram Canvas',
        titleNoAccent: 'Louis Vuitton Neverfull MM - Monogram Canvas',
        description: '<h2>Designer Handbag</h2><p>Authentic Louis Vuitton Neverfull in excellent condition. Date code verified.</p><ul><li>Monogram Canvas</li><li>MM Size</li><li>Includes pouch</li><li>Minor signs of use</li></ul>',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'],
        startPrice: 800,
        stepPrice: 50,
        currentPrice: 800,
        autoExtend: false,
        status: 'ACTIVE',
        endTime: futureDate(2),
        categoryId: fashionSubcategories[1].id,
        sellerId: seller2.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Bose QuietComfort Ultra Headphones - Black',
        titleNoAccent: 'Bose QuietComfort Ultra Headphones - Black',
        description: '<h2>Premium Noise Cancelling Headphones</h2><p>Brand new, sealed in box. Latest model with spatial audio.</p><ul><li>World-class noise cancellation</li><li>Spatial audio</li><li>24-hour battery life</li><li>Premium materials</li></ul>',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800'],
        startPrice: 200,
        stepPrice: 20,
        buyNowPrice: 350,
        currentPrice: 200,
        autoExtend: true,
        status: 'ACTIVE',
        endTime: futureDate(6),
        categoryId: electronicsSubcategories[3].id,
        sellerId: seller2.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Vintage 1960s Gibson Les Paul Standard',
        titleNoAccent: 'Vintage 1960s Gibson Les Paul Standard',
        description: '<h2>Rare Vintage Guitar</h2><p>Authentic 1960s Gibson Les Paul in excellent playing condition. Original parts, professionally maintained.</p><ul><li>Sunburst finish</li><li>Original pickups</li><li>Comes with hard case</li><li>Certificate of authenticity</li></ul>',
        images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800', 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800'],
        startPrice: 3000,
        stepPrice: 200,
        currentPrice: 3000,
        autoExtend: true,
        status: 'ACTIVE',
        endTime: futureDate(10),
        categoryId: collectiblesSubcategories[2].id,
        sellerId: seller3.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Original Picasso Limited Edition Print',
        titleNoAccent: 'Original Picasso Limited Edition Print',
        description: '<h2>Fine Art Collectible</h2><p>Authenticated limited edition print from 1955. Numbered and signed. Excellent investment piece.</p><ul><li>Certificate of authenticity</li><li>Professional framing</li><li>Edition 45/100</li><li>Museum quality</li></ul>',
        images: ['https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800', 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=800'],
        startPrice: 5000,
        stepPrice: 300,
        currentPrice: 5000,
        autoExtend: false,
        status: 'ACTIVE',
        endTime: futureDate(8),
        categoryId: collectiblesSubcategories[1].id,
        sellerId: seller3.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Samsung Galaxy S24 Ultra - 512GB Titanium',
        titleNoAccent: 'Samsung Galaxy S24 Ultra - 512GB Titanium',
        description: '<h2>Latest Samsung Flagship</h2><p>Brand new, unlocked. Top of the line model with S Pen.</p>',
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'],
        startPrice: 900,
        stepPrice: 50,
        currentPrice: 900,
        autoExtend: false,
        status: 'ACTIVE',
        endTime: futureDate(0.5),
        categoryId: electronicsSubcategories[0].id,
        sellerId: seller1.id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Mid-Century Modern Dining Table Set',
        titleNoAccent: 'Mid-Century Modern Dining Table Set',
        description: '<h2>Beautiful Dining Set</h2><p>Solid walnut wood, seats 6. Excellent condition, minor wear consistent with age.</p>',
        images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800'],
        startPrice: 600,
        stepPrice: 50,
        currentPrice: 600,
        autoExtend: false,
        status: 'ACTIVE',
        endTime: futureDate(0.3),
        categoryId: homeSubcategories[0].id,
        sellerId: seller3.id,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create Bids
  console.log('💰 Creating bids...');
  const bids = await Promise.all([
    prisma.bid.create({ data: { amount: 850, productId: products[0].id, bidderId: bidder1.id, createdAt: pastDate(2) } }),
    prisma.bid.create({ data: { amount: 900, productId: products[0].id, bidderId: bidder2.id, createdAt: pastDate(1) } }),
    prisma.bid.create({ data: { amount: 950, maxAmount: 1100, isAutoBid: true, productId: products[0].id, bidderId: bidder3.id, createdAt: pastDate(0.5) } }),
    prisma.bid.create({ data: { amount: 2100, productId: products[1].id, bidderId: bidder2.id, createdAt: pastDate(3) } }),
    prisma.bid.create({ data: { amount: 2200, productId: products[1].id, bidderId: bidder4.id, createdAt: pastDate(2) } }),
    prisma.bid.create({ data: { amount: 8500, productId: products[3].id, bidderId: bidder1.id, createdAt: pastDate(1) } }),
    prisma.bid.create({ data: { amount: 9000, maxAmount: 11000, isAutoBid: true, productId: products[3].id, bidderId: bidder2.id, createdAt: pastDate(0.2) } }),
    prisma.bid.create({ data: { amount: 950, productId: products[8].id, bidderId: bidder3.id, createdAt: pastDate(0.2) } }),
    prisma.bid.create({ data: { amount: 1000, productId: products[8].id, bidderId: bidder1.id, createdAt: pastDate(0.1) } }),
  ]);

  await Promise.all([
    prisma.product.update({ where: { id: products[0].id }, data: { currentPrice: 950, currentWinnerId: bidder3.id, bidCount: 3 } }),
    prisma.product.update({ where: { id: products[1].id }, data: { currentPrice: 2200, currentWinnerId: bidder4.id, bidCount: 2 } }),
    prisma.product.update({ where: { id: products[3].id }, data: { currentPrice: 9000, currentWinnerId: bidder2.id, bidCount: 2 } }),
    prisma.product.update({ where: { id: products[8].id }, data: { currentPrice: 1000, currentWinnerId: bidder1.id, bidCount: 2 } }),
  ]);

  console.log(`✅ Created ${bids.length} bids`);

  // Create WatchLists
  console.log('⭐ Creating watchlists...');
  await Promise.all([
    prisma.watchList.create({ data: { userId: bidder1.id, productId: products[1].id } }),
    prisma.watchList.create({ data: { userId: bidder1.id, productId: products[3].id } }),
    prisma.watchList.create({ data: { userId: bidder1.id, productId: products[7].id } }),
    prisma.watchList.create({ data: { userId: bidder2.id, productId: products[0].id } }),
    prisma.watchList.create({ data: { userId: bidder2.id, productId: products[6].id } }),
    prisma.watchList.create({ data: { userId: bidder3.id, productId: products[4].id } }),
    prisma.watchList.create({ data: { userId: bidder4.id, productId: products[2].id } }),
  ]);
  console.log('✅ Created watchlists');

  // Create Questions and Answers
  console.log('❓ Creating questions and answers...');
  const question1 = await prisma.question.create({
    data: { content: 'Is the iPhone still under warranty?', productId: products[0].id, askerId: bidder2.id, createdAt: pastDate(1) },
  });
  await prisma.answer.create({
    data: { content: 'Yes, it has 11 months of Apple warranty remaining.', questionId: question1.id, sellerId: seller1.id },
  });

  const question2 = await prisma.question.create({
    data: { content: 'Can you provide more photos of the watch face?', productId: products[3].id, askerId: bidder1.id, createdAt: pastDate(2) },
  });
  await prisma.answer.create({
    data: { content: 'Sure, I will upload additional photos shortly.', questionId: question2.id, sellerId: seller2.id },
  });

  await prisma.question.create({
    data: { content: 'What is the shipping method?', productId: products[1].id, askerId: bidder3.id, createdAt: pastDate(0.5) },
  });

  console.log('✅ Created questions and answers');

  // Create Description History
  console.log('📝 Creating description history...');
  await Promise.all([
    prisma.descriptionHistory.create({
      data: { content: '<h2>Brand New iPhone 15 Pro Max</h2><p>Latest model with A17 Pro chip.</p>', productId: products[0].id, createdAt: pastDate(3) },
    }),
    prisma.descriptionHistory.create({
      data: { content: '<h2>Brand New iPhone 15 Pro Max</h2><p>Latest model with A17 Pro chip. Includes original box.</p>', productId: products[0].id, createdAt: pastDate(2) },
    }),
  ]);
  console.log('✅ Created description history');

  // Create Orders
  console.log('📋 Creating orders...');
  const endedProduct = await prisma.product.create({
    data: {
      title: 'iPad Pro 12.9" 2023 - 256GB WiFi',
      titleNoAccent: 'iPad Pro 12.9 2023 - 256GB WiFi',
      description: '<h2>iPad Pro</h2><p>Like new condition. M2 chip, Magic Keyboard included.</p>',
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'],
      startPrice: 700,
      stepPrice: 50,
      currentPrice: 850,
      status: 'ENDED',
      endTime: pastDate(5),
      categoryId: electronicsSubcategories[1].id,
      sellerId: seller1.id,
      currentWinnerId: bidder1.id,
      bidCount: 4,
    },
  });

  const order1 = await prisma.order.create({
    data: {
      productId: endedProduct.id,
      buyerId: bidder1.id,
      sellerId: seller1.id,
      finalPrice: 850,
      paymentMethod: 'STRIPE',
      paymentTransactionId: 'ch_3Abc123xyz',
      isPaid: true,
      paidAt: pastDate(4),
      status: 'DELIVERED',
      shippingAddress: '654 Buyer Lane, Boston, MA 02101',
      trackingNumber: '1Z999AA10123456784',
      shippedAt: pastDate(3),
      isDelivered: true,
      deliveredAt: pastDate(1),
    },
  });

  await Promise.all([
    prisma.rating.create({
      data: { type: 'POSITIVE', comment: 'Great seller! Item as described, fast shipping.', fromUserId: bidder1.id, toUserId: seller1.id, orderId: order1.id },
    }),
    prisma.rating.create({
      data: { type: 'POSITIVE', comment: 'Excellent buyer, quick payment!', fromUserId: seller1.id, toUserId: bidder1.id, orderId: order1.id },
    }),
  ]);

  const pendingProduct = await prisma.product.create({
    data: {
      title: 'Nintendo Switch OLED - White',
      titleNoAccent: 'Nintendo Switch OLED - White',
      description: '<h2>Nintendo Switch OLED Model</h2><p>Brand new, sealed.</p>',
      images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800'],
      startPrice: 250,
      stepPrice: 25,
      currentPrice: 300,
      status: 'ENDED',
      endTime: pastDate(2),
      categoryId: electronicsSubcategories[0].id,
      sellerId: seller2.id,
      currentWinnerId: bidder2.id,
      bidCount: 3,
    },
  });

  await prisma.order.create({
    data: {
      productId: pendingProduct.id,
      buyerId: bidder2.id,
      sellerId: seller2.id,
      finalPrice: 300,
      status: 'PENDING_PAYMENT',
      shippingAddress: '987 Auction Road, Seattle, WA 98101',
    },
  });

  console.log('✅ Created orders and ratings');

  // Create Chat Messages
  console.log('💬 Creating chat messages...');
  await Promise.all([
    prisma.chatMessage.create({ data: { content: 'Hi, when can you ship the item?', orderId: order1.id, senderId: bidder1.id, isRead: true, createdAt: pastDate(3) } }),
    prisma.chatMessage.create({ data: { content: 'I can ship it tomorrow morning!', orderId: order1.id, senderId: seller1.id, isRead: true, createdAt: pastDate(3) } }),
    prisma.chatMessage.create({ data: { content: 'Perfect, thank you!', orderId: order1.id, senderId: bidder1.id, isRead: true, createdAt: pastDate(2.8) } }),
  ]);
  console.log('✅ Created chat messages');

  // Create System Configs
  console.log('⚙️  Creating system configurations...');
  await Promise.all([
    prisma.systemConfig.create({ data: { key: 'AUTO_EXTEND_MINUTES', value: '5' } }),
    prisma.systemConfig.create({ data: { key: 'MIN_BID_INCREMENT', value: '1' } }),
    prisma.systemConfig.create({ data: { key: 'MAX_IMAGES_PER_PRODUCT', value: '10' } }),
    prisma.systemConfig.create({ data: { key: 'COMMISSION_RATE', value: '0.05' } }),
  ]);
  console.log('✅ Created system configurations');

  // Create Denied Bidder
  console.log('🚫 Creating denied bidder...');
  await prisma.deniedBidder.create({
    data: { productId: products[3].id, bidderId: bidder4.id, reason: 'Repeated non-payment in previous auctions' },
  });
  console.log('✅ Created denied bidder');

  console.log('\n✨ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Products: ${products.length + 2}`);
  console.log(`   - Bids: ${bids.length}`);
  console.log(`   - Orders: 2`);
  console.log(`   - Ratings: 2`);
  console.log(`   - Questions: 3`);
  console.log(`   - Watchlist items: 7\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

