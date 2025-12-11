// config/prisma.js
// Prisma Client instance for database operations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

async function testDatabase() {
  console.log('🔍 Testing database connection and seeded data...\n');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Users: ${userCount}`);

    // Count categories
    const categoryCount = await prisma.category.count();
    console.log(`📁 Categories: ${categoryCount}`);

    // Count products
    const productCount = await prisma.product.count();
    const activeProducts = await prisma.product.count({ where: { status: 'ACTIVE' } });
    console.log(`📦 Products: ${productCount} (${activeProducts} active)`);

    // Count bids
    const bidCount = await prisma.bid.count();
    console.log(`💰 Bids: ${bidCount}`);

    // Count watchlist items
    const watchlistCount = await prisma.watchList.count();
    console.log(`⭐ Watchlist items: ${watchlistCount}`);

    // Count ratings
    const ratingCount = await prisma.rating.count();
    const positiveRatings = await prisma.rating.count({ where: { type: 'POSITIVE' } });
    const negativeRatings = await prisma.rating.count({ where: { type: 'NEGATIVE' } });
    console.log(`⭐ Ratings: ${ratingCount} (${positiveRatings} positive, ${negativeRatings} negative)`);

    // Count orders
    const orderCount = await prisma.order.count();
    console.log(`📋 Orders: ${orderCount}`);

    // Count questions
    const questionCount = await prisma.question.count();
    console.log(`❓ Questions: ${questionCount}`);

    // Count answers
    const answerCount = await prisma.answer.count();
    console.log(`💬 Answers: ${answerCount}`);

    console.log('\n✅ All checks passed! Database is properly seeded.\n');

    // Show sample users
    console.log('📝 Sample Users:');
    const users = await prisma.user.findMany({
      take: 3,
      select: { email: true, role: true, fullName: true }
    });
    users.forEach(user => {
      console.log(`  - ${user.fullName} (${user.email}) - ${user.role}`);
    });

    console.log('\n📝 Sample Products:');
    const products = await prisma.product.findMany({
      take: 3,
      select: { title: true, currentPrice: true, status: true }
    });
    products.forEach(product => {
      console.log(`  - ${product.title} - $${product.currentPrice} (${product.status})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

export default prisma;
