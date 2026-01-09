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
      fullName: 'Quản Trị Viên',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      dateOfBirth: new Date('1980-01-01'),
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const seller1 = await prisma.user. create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'seller1@example.com',
      password: hashedPassword,
      fullName:  'Nguyễn Văn Bán',
      address: '456 Lê Lợi, Quận 1, TP.HCM',
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
      fullName: 'Trần Thị Kinh Doanh',
      address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
      dateOfBirth: new Date('1990-08-20'),
      role: 'SELLER',
      positiveRatings: 38,
      negativeRatings: 1,
      isVerified: true,
    },
  });

  const seller3 = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440004',
      email: 'seller3@example.com',
      password: hashedPassword,
      fullName: 'Lê Minh Thương',
      address: '321 Võ Văn Tần, Quận 3, TP.HCM',
      dateOfBirth: new Date('1988-03-10'),
      role: 'SELLER',
      positiveRatings: 52,
      negativeRatings: 0,
      isVerified: true,
    },
  });

  const bidder1 = await prisma.user. create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440005',
      email: 'bidder1@example.com',
      password: hashedPassword,
      fullName: 'Phạm Thị Mua',
      address: '111 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
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
      fullName: 'Hoàng Văn Đấu Giá',
      address: '222 Hai Bà Trưng, Quận 3, TP.HCM',
      dateOfBirth: new Date('1987-07-25'),
      role: 'BIDDER',
      positiveRatings: 28,
      negativeRatings: 20,
      isVerified: true,
    },
  });

  console.log(`Created ${await prisma.user.count()} users\n`);

  // ========================================
  // DANH MỤC CHA 1:  ĐIỆN TỬ (3 danh mục con)
  // ========================================
  console.log('Creating categories.. .');

  const dienTu = await prisma.category.create({
    data: {
      id: 'cat-dien-tu',
      name: 'Điện tử',
    },
  });

  const dienThoai = await prisma.category.create({
    data: {
      id: 'cat-dien-thoai',
      name: 'Điện thoại di động',
      parentId: dienTu.id,
    },
  });

  const laptop = await prisma.category.create({
    data: {
      id: 'cat-laptop',
      name: 'Máy tính xách tay',
      parentId: dienTu.id,
    },
  });

  const taiNghe = await prisma.category.create({
    data: {
      id: 'cat-tai-nghe',
      name: 'Tai nghe & Âm thanh',
      parentId: dienTu.id,
    },
  });

  // ========================================
  // DANH MỤC CHA 2: THỜI TRANG (2 danh mục con)
  // ========================================

  const thoiTrang = await prisma.category. create({
    data: {
      id: 'cat-thoi-trang',
      name: 'Thời trang',
    },
  });

  const giay = await prisma.category.create({
    data: {
      id: 'cat-giay',
      name: 'Giày thể thao',
      parentId:  thoiTrang.id,
    },
  });

  const dongHo = await prisma.category.create({
    data: {
      id: 'cat-dong-ho',
      name: 'Đồng hồ cao cấp',
      parentId:  thoiTrang.id,
    },
  });

  // ========================================
  // DANH MỤC CHA 3: GIA DỤNG (2 danh mục con)
  // ========================================

  const giaDung = await prisma.category.create({
    data: {
      id: 'cat-gia-dung',
      name: 'Gia dụng & Đời sống',
    },
  });

  const noiThat = await prisma.category.create({
    data: {
      id: 'cat-noi-that',
      name: 'Nội thất',
      parentId: giaDung.id,
    },
  });

  const doTrangTri = await prisma.category.create({
    data: {
      id: 'cat-do-trang-tri',
      name: 'Đồ trang trí',
      parentId: giaDung.id,
    },
  });

  console.log(`Created ${await prisma.category.count()} categories\n`);

  // ========================================
  // TẠO SẢN PHẨM
  // ========================================
  console.log('Creating products...');

  // Helper function to generate future date
  const getFutureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const products = [];

  // ========== ĐIỆN THOẠI DI ĐỘNG (5 sản phẩm) ==========

  products.push(await prisma.product.create({
    data: {
      title: 'iPhone 15 Pro Max 256GB - Titan Tự Nhiên',
      titleNoAccent: 'iphone 15 pro max 256gb titan tu nhien',
      description: '<h2>iPhone 15 Pro Max 256GB</h2><p>Màu Titan Tự Nhiên, máy mới 100%, nguyên seal, chưa kích hoạt.  Chip A17 Pro mạnh mẽ nhất. </p><ul><li>Chip:  A17 Pro 3nm</li><li>Màn hình: 6.7 inch Super Retina XDR</li><li>Camera: 48MP chính + 12MP telephoto 5x</li><li>Pin:  4422mAh, sạc nhanh 20W</li><li>Bảo hành:  12 tháng chính hãng Apple</li><li>Khung Titan cao cấp, nhẹ và bền</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
        'https://images.unsplash.com/photo-1695048064942-7e6c2f7f9c10?w=800',
        'https://images.unsplash.com/photo-1695048133082-f5d06c45b39a?w=800',
      ],
      startPrice: 25000000,
      stepPrice: 500000,
      buyNowPrice: 35000000,
      currentPrice: 25000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(3),
      bidCount: 0,
      viewCount: 156,
      categoryId: dienThoai.id,
      sellerId: seller1.id,
    },
  }));

  products.push(await prisma. product.create({
    data: {
      title: 'Samsung Galaxy S24 Ultra 512GB - Titanium Gray',
      titleNoAccent:  'samsung galaxy s24 ultra 512gb titanium gray',
      description: '<h2>Samsung Galaxy S24 Ultra</h2><p>Flagship cao cấp nhất của Samsung.  Màn hình Dynamic AMOLED 2X 6.8 inch cực đẹp. </p><ul><li>Chip: Snapdragon 8 Gen 3 for Galaxy</li><li>RAM: 12GB | ROM: 512GB</li><li>Camera: 200MP chính, zoom quang học 10x</li><li>S Pen tích hợp sẵn trong thân máy</li><li>Pin: 5000mAh, sạc nhanh 45W</li><li>Khung Titanium siêu bền, chống trầy</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      ],
      startPrice: 22000000,
      stepPrice: 500000,
      buyNowPrice: 30000000,
      currentPrice:  22000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(4),
      bidCount: 0,
      viewCount: 203,
      categoryId: dienThoai.id,
      sellerId: seller2.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Xiaomi 14 Ultra 16GB/512GB - Đen Titan',
      titleNoAccent:  'xiaomi 14 ultra 16gb 512gb den titan',
      description: '<h2>Xiaomi 14 Ultra</h2><p>Camera phone hàng đầu, hợp tác với Leica.  Chip Snapdragon 8 Gen 3 mạnh mẽ nhất Android.</p><ul><li>Camera Leica:  50MP chính + telephoto kép 75mm & 120mm</li><li>RAM: 16GB LPDDR5X | ROM: 512GB UFS 4.0</li><li>Màn hình:  6.73 inch 2K LTPO AMOLED 120Hz</li><li>Pin:  5000mAh, HyperCharge 90W, sạc không dây 80W</li><li>Chống nước IP68 cao cấp</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800',
        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800',
      ],
      startPrice: 18000000,
      stepPrice:  300000,
      buyNowPrice: 25000000,
      currentPrice: 18000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(2),
      bidCount: 0,
      viewCount: 178,
      categoryId: dienThoai.id,
      sellerId: seller3.id,
    },
  }));

  products.push(await prisma. product.create({
    data: {
      title: 'Google Pixel 8 Pro 256GB - Bay Blue',
      titleNoAccent:  'google pixel 8 pro 256gb bay blue',
      description: '<h2>Google Pixel 8 Pro</h2><p>Trải nghiệm Android thuần túy với AI mạnh mẽ từ Google. Camera đỉnh cao với tính năng AI độc quyền.</p><ul><li>Chip: Google Tensor G3 với AI tiên tiến</li><li>Camera: 50MP + 48MP telephoto 5x + 48MP ultrawide</li><li>Màn hình: 6.7 inch LTPO OLED 120Hz, Super Actua</li><li>Magic Eraser, Best Take, Photo Unblur AI</li><li>Cập nhật 7 năm Android & bảo mật</li><li>Pin 5050mAh, sạc nhanh 30W</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800',
      ],
      startPrice: 16000000,
      stepPrice:  300000,
      buyNowPrice: 22000000,
      currentPrice:  16000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(6),
      bidCount: 0,
      viewCount: 167,
      categoryId: dienThoai.id,
      sellerId: seller1.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'iPhone 14 Pro 256GB - Deep Purple - 99%',
      titleNoAccent:  'iphone 14 pro 256gb deep purple 99',
      description: '<h2>iPhone 14 Pro</h2><p>Máy đã qua sử dụng nhưng còn mới 99%, pin 100%, Dynamic Island độc đáo, màu Deep Purple sang trọng.</p><ul><li>Chip: A16 Bionic 4nm</li><li>Dynamic Island - đảo thông minh tương tác</li><li>Camera: 48MP ProRAW + 12MP telephoto 3x</li><li>Always-On Display luôn hiển thị</li><li>ProMotion 120Hz siêu mượt</li><li>Bảo hành: 6 tháng, pin health 100%</li></ul>',
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyvlWDntD6UieAY4zyiLuEkFw5l_nobNIEBw&s?w=800',
        'https://cdn.nguyenkimmall.com/images/detailed/824/dien-thoai-iphone-14-pro-256gb-tim-4.jpg?w=800',
        'https://phucanhcdn.com/media/lib/01-10-2022/iphone-14-pro-promax-deep-purple.png',
      ],
      startPrice: 18000000,
      stepPrice:  300000,
      buyNowPrice: 24000000,
      currentPrice:  18000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(3),
      bidCount: 0,
      viewCount: 234,
      categoryId: dienThoai.id,
      sellerId: seller2.id,
    },
  }));

  // ========== MÁY TÍNH XÁCH TAY (5 sản phẩm) ==========

  products. push(await prisma.product. create({
    data: {
      title: 'MacBook Pro 16" M3 Max 2024 - Space Black',
      titleNoAccent:  'macbook pro 16 m3 max 2024 space black',
      description: '<h2>MacBook Pro 16 inch M3 Max</h2><p>Laptop cao cấp nhất của Apple, hiệu năng vượt trội cho professional, content creator. </p><ul><li>Chip: M3 Max 16-core CPU, 40-core GPU</li><li>RAM: 48GB unified memory thống nhất</li><li>SSD: 1TB NVMe siêu nhanh</li><li>Màn hình: 16.2 inch Liquid Retina XDR mini-LED</li><li>Pin: 22 giờ sử dụng liên tục</li><li>Bảo hành: 12 tháng Apple Việt Nam</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8? w=800',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
        'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800',
      ],
      startPrice: 80000000,
      stepPrice:  2000000,
      buyNowPrice: 110000000,
      currentPrice:  80000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(7),
      bidCount: 0,
      viewCount: 289,
      categoryId: laptop.id,
      sellerId: seller3.id,
    },
  }));

  products.push(await prisma.product. create({
    data: {
      title: 'Dell XPS 15 9530 - i9 13900H, RTX 4070',
      titleNoAccent:  'dell xps 15 9530 i9 13900h rtx 4070',
      description: '<h2>Dell XPS 15</h2><p>Laptop Windows cao cấp, thiết kế đẹp, màn hình 4K OLED tuyệt vời cho đồ họa và sáng tạo.</p><ul><li>CPU: Intel Core i9-13900H (14 nhân 20 luồng)</li><li>GPU: NVIDIA RTX 4070 8GB GDDR6</li><li>RAM: 32GB DDR5-4800MHz</li><li>SSD: 1TB NVMe Gen 4</li><li>Màn hình: 15.6" 4K OLED Touch 100% DCI-P3</li><li>Bảo hành: 12 tháng Dell Việt Nam</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      ],
      startPrice: 45000000,
      stepPrice:  1000000,
      buyNowPrice: 65000000,
      currentPrice:  45000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(4),
      bidCount: 0,
      viewCount: 198,
      categoryId: laptop. id,
      sellerId: seller1.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'ASUS ROG Zephyrus G16 - Gaming Laptop RTX 4090',
      titleNoAccent:  'asus rog zephyrus g16 gaming laptop rtx 4090',
      description: '<h2>ASUS ROG Zephyrus G16</h2><p>Gaming laptop mỏng nhẹ, hiệu năng khủng với RTX 4090, màn hình Mini LED cực đẹp.</p><ul><li>CPU: Intel Core i9-14900HX (24 nhân)</li><li>GPU: RTX 4090 16GB Laptop GPU</li><li>RAM: 32GB DDR5-5600MHz</li><li>SSD: 2TB PCIe 4.0 NVMe</li><li>Màn hình: 16" 2. 5K 240Hz ROG Nebula HDR Mini LED</li><li>RGB Aura Sync đồng bộ, tản nhiệt Vapor Chamber</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
        'https://images.unsplash.com/photo-1625019030820-e4ed970a6c95?w=800',
        'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800',
      ],
      startPrice: 60000000,
      stepPrice:  1500000,
      buyNowPrice: 85000000,
      currentPrice:  60000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(5),
      bidCount: 0,
      viewCount: 312,
      categoryId: laptop. id,
      sellerId: seller2.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Lenovo ThinkPad X1 Carbon Gen 11 - Doanh nhân',
      titleNoAccent: 'lenovo thinkpad x1 carbon gen 11 doanh nhan',
      description: '<h2>ThinkPad X1 Carbon Gen 11</h2><p>Laptop doanh nhân cao cấp, nhẹ chỉ 1. 12kg, bền bỉ theo tiêu chuẩn quân đội MIL-STD-810H.</p><ul><li>CPU: Intel Core i7-1365U vPro (10 nhân)</li><li>RAM: 32GB LPDDR5</li><li>SSD: 1TB PCIe 4.0 NVMe</li><li>Màn hình: 14" 2.8K OLED 400nit</li><li>Pin: 16 giờ làm việc liên tục</li><li>Bảo hành: 36 tháng Lenovo toàn cầu</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
        'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800',
      ],
      startPrice: 35000000,
      stepPrice:  1000000,
      buyNowPrice: 50000000,
      currentPrice:  35000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(6),
      bidCount: 0,
      viewCount: 156,
      categoryId: laptop. id,
      sellerId: seller3.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'MacBook Air 15" M3 2024 - Midnight',
      titleNoAccent: 'macbook air 15 m3 2024 midnight',
      description: '<h2>MacBook Air 15 inch M3</h2><p>Laptop mỏng nhẹ với màn hình lớn 15 inch, chip M3 mạnh mẽ, pin trâu cả ngày.</p><ul><li>Chip: Apple M3 8-core CPU, 10-core GPU</li><li>RAM: 16GB unified memory</li><li>SSD: 512GB</li><li>Màn hình: 15.3" Liquid Retina 500nit</li><li>Pin:  18 giờ sử dụng liên tục</li><li>Chỉ 1. 51kg, mỏng 11. 5mm, không quạt tản nhiệt</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8? w=800',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
        'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800',
      ],
      startPrice: 28000000,
      stepPrice:  500000,
      buyNowPrice: 38000000,
      currentPrice:  28000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(4),
      bidCount: 0,
      viewCount: 267,
      categoryId: laptop. id,
      sellerId: seller1.id,
    },
  }));

  // ========== TAI NGHE & ÂM THANH (5 sản phẩm) ==========

  products. push(await prisma.product. create({
    data: {
      title: 'Sony WH-1000XM5 - Tai nghe chống ồn đỉnh cao',
      titleNoAccent:  'sony wh 1000xm5 tai nghe chong on dinh cao',
      description: '<h2>Sony WH-1000XM5</h2><p>Tai nghe over-ear với công nghệ chống ồn tốt nhất thế giới, âm thanh Hi-Res Audio tuyệt vời.</p><ul><li>Chống ồn ANC thế hệ mới với 8 micro</li><li>8 micro cho cuộc gọi rõ ràng tuyệt đối</li><li>Pin:  30 giờ (ANC bật), sạc nhanh 3 phút dùng 3 giờ</li><li>Hỗ trợ:  LDAC, DSEE Extreme AI upscale</li><li>Multipoint kết nối 2 thiết bị cùng lúc</li><li>Còn bảo hành 8 tháng chính hãng</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
        'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800',
      ],
      startPrice: 6000000,
      stepPrice:  200000,
      buyNowPrice: 9000000,
      currentPrice:  6000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(3),
      bidCount: 0,
      viewCount: 198,
      categoryId: taiNghe.id,
      sellerId: seller2.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'AirPods Max - Space Gray - Like New 98%',
      titleNoAccent:  'airpods max space gray like new 98',
      description: '<h2>Apple AirPods Max</h2><p>Tai nghe cao cấp của Apple, thiết kế sang trọng với khung nhôm, âm thanh spatial audio tuyệt vời.</p><ul><li>Driver 40mm thiết kế riêng của Apple</li><li>Chống ồn chủ động ANC + Transparency mode</li><li>Spatial Audio with dynamic head tracking</li><li>Chip H1 cho kết nối nhanh với Apple</li><li>Pin: 20 giờ nghe nhạc</li><li>Máy đẹp 98%, fullbox đầy đủ phụ kiện</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1641893978985-a0c233b14f9b?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800',
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800',
      ],
      startPrice: 9000000,
      stepPrice: 300000,
      buyNowPrice: 13000000,
      currentPrice:  9000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(4),
      bidCount: 0,
      viewCount: 245,
      categoryId: taiNghe.id,
      sellerId: seller3.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Bose QuietComfort Ultra - Chống ồn huyền thoại',
      titleNoAccent: 'bose quietcomfort ultra chong on huyen thoai',
      description: '<h2>Bose QC Ultra</h2><p>Tai nghe chống ồn huyền thoại từ Bose, thoải mái đeo cả ngày dài, âm bass đặc trưng Bose.</p><ul><li>Chống ồn CustomTune tự động hiệu chỉnh</li><li>Immersive Audio âm thanh không gian sống động</li><li>Pin: 24 giờ sử dụng liên tục</li><li>Bluetooth 5.3 multipoint kết nối đa thiết bị</li><li>Vật liệu cao cấp, đệm tai êm ái</li><li>Mới 100%, nguyên seal chính hãng</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
        'https://images.unsplash.com/photo-1577174881658-0f30157e271b?w=800',
      ],
      startPrice: 7000000,
      stepPrice:  200000,
      buyNowPrice: 10000000,
      currentPrice:  7000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(5),
      bidCount: 0,
      viewCount: 167,
      categoryId: taiNghe.id,
      sellerId: seller1.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'JBL Charge 5 - Loa Bluetooth chống nước IP67',
      titleNoAccent:  'jbl charge 5 loa bluetooth chong nuoc ip67',
      description:  '<h2>JBL Charge 5</h2><p>Loa Bluetooth mạnh mẽ, âm bass sâu đặc trưng JBL, chống nước IP67 hoàn toàn, pin trâu 20 giờ.</p><ul><li>Công suất:  40W RMS cực đỉnh</li><li>Driver bass racetrack độc quyền</li><li>Chống nước, bụi IP67 - ngâm nước 1m</li><li>Pin: 20 giờ phát nhạc liên tục</li><li>PowerBank sạc điện thoại qua USB</li><li>JBL PartyBoost kết nối nhiều loa</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800',
        'https://images.unsplash.com/photo-1531104985437-603d6490e6d4?w=800',
      ],
      startPrice: 2500000,
      stepPrice:  100000,
      buyNowPrice: 4000000,
      currentPrice: 2500000,
      autoExtend:  true,
      status: 'ACTIVE',
      endTime:  getFutureDate(2),
      bidCount: 0,
      viewCount: 289,
      categoryId: taiNghe.id,
      sellerId: seller2.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Sennheiser Momentum 4 Wireless - Audiophile',
      titleNoAccent: 'sennheiser momentum 4 wireless audiophile',
      description: '<h2>Sennheiser Momentum 4</h2><p>Tai nghe cho audiophile, chất âm Sennheiser đẳng cấp Đức, pin 60 giờ khủng nhất phân khúc.</p><ul><li>Driver 42mm Transducer chất âm audiophile</li><li>Chống ồn Adaptive ANC tự động điều chỉnh</li><li>Pin: 60 giờ sử dụng cực kỳ lâu</li><li>Codec:  aptX Adaptive, AAC chất lượng cao</li><li>App Sennheiser Smart Control tùy chỉnh EQ</li><li>Còn bảo hành 10 tháng chính hãng</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
        'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800',
        'https://images.unsplash.com/photo-1577174881658-0f30157e271b?w=800',
      ],
      startPrice:  6500000,
      stepPrice:  200000,
      buyNowPrice: 9500000,
      currentPrice: 6500000,
      autoExtend: true,
      status:  'ACTIVE',
      endTime: getFutureDate(6),
      bidCount: 0,
      viewCount: 178,
      categoryId: taiNghe.id,
      sellerId: seller3.id,
    },
  }));

  // ========== GIÀY THỂ THAO (5 sản phẩm) ==========

  products.push(await prisma.product.create({
    data: {
      title: 'Nike Air Jordan 1 Retro High OG "Chicago" - Size 42',
      titleNoAccent:  'nike air jordan 1 retro high og chicago size 42',
      description: '<h2>Air Jordan 1 "Chicago"</h2><p>Giày huyền thoại Nike Air Jordan 1 phối màu Chicago iconic, deadstock mới 100%, chưa đi lần nào.</p><ul><li>Colorway: Chicago - Trắng Đỏ Đen huyền thoại</li><li>Size: US 8.5 / EU 42</li><li>Condition: Deadstock - mới 100%</li><li>Fullbox nguyên tem, giấy gói</li><li>Chất liệu da thật cao cấp</li><li>Hàng chính hãng Nike, có bill</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800',
        'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
      ],
      startPrice: 8000000,
      stepPrice: 300000,
      buyNowPrice: 15000000,
      currentPrice:  8000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(5),
      bidCount: 0,
      viewCount: 356,
      categoryId: giay.id,
      sellerId: seller1.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Adidas Yeezy Boost 350 V2 "Zebra" - Size 41',
      titleNoAccent:  'adidas yeezy boost 350 v2 zebra size 41',
      description:  '<h2>Yeezy Boost 350 V2 "Zebra"</h2><p>Giày Yeezy huyền thoại của Kanye West, phối màu Zebra đẹp nhất, công nghệ Boost siêu êm.</p><ul><li>Colorway: Zebra - Trắng Đen sọc vằn</li><li>Size:  US 8 / EU 41</li><li>Condition:  VNDS - mới 99%</li><li>Công nghệ đế Boost cực êm ái</li><li>Upper Primeknit co giãn ôm chân</li><li>Kèm box, receipt chính hãng Adidas</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
        'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800',
      ],
      startPrice: 6000000,
      stepPrice: 200000,
      buyNowPrice: 10000000,
      currentPrice:  6000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(4),
      bidCount: 0,
      viewCount: 298,
      categoryId: giay.id,
      sellerId: seller2.id,
    },
  }));

  products.push(await prisma.product. create({
    data: {
      title: 'New Balance 550 "White Green" - Size 43 - Vintage',
      titleNoAccent:  'new balance 550 white green size 43 vintage',
      description: '<h2>New Balance 550 "White Green"</h2><p>Giày basketball retro phong cách vintage, hot trend 2024, phối màu trắng xanh lá dễ mặc. </p><ul><li>Colorway: White/Green - phối màu clean</li><li>Size: US 9.5 / EU 43</li><li>Condition: Brand New - mới tinh</li><li>Phong cách retro basketball 90s</li><li>Chất liệu da cao cấp bền đẹp</li><li>Hot trend được giới trẻ yêu thích</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
        'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
      ],
      startPrice: 3000000,
      stepPrice: 150000,
      buyNowPrice: 5000000,
      currentPrice: 3000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(3),
      bidCount: 0,
      viewCount: 234,
      categoryId: giay.id,
      sellerId: seller3.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Nike Dunk Low "Panda" - Size 40 - Cổ điển',
      titleNoAccent:  'nike dunk low panda size 40 co dien',
      description: '<h2>Nike Dunk Low "Panda"</h2><p>Giày Dunk Low phối màu Panda (đen trắng) cổ điển, dễ phối đồ nhất, phù hợp mọi outfit.</p><ul><li>Colorway: Panda - Đen Trắng cổ điển</li><li>Size: US 7 / EU 40</li><li>Condition: Used 9/10 - đẹp như mới</li><li>Phối màu versatile dễ mặc nhất</li><li>Phù hợp cả nam và nữ</li><li>Vệ sinh sạch sẽ, không ố vàng</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
      ],
      startPrice: 2000000,
      stepPrice: 100000,
      buyNowPrice: 3500000,
      currentPrice:  2000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(2),
      bidCount: 0,
      viewCount: 412,
      categoryId: giay.id,
      sellerId: seller1.id,
    },
  }));

  products.push(await prisma.product. create({
    data: {
      title: 'Converse Chuck 70 High "Parchment" - Size 42. 5',
      titleNoAccent: 'converse chuck 70 high parchment size 42 5',
      description: '<h2>Converse Chuck 70 High</h2><p>Giày Converse Chuck 70 cao cổ màu kem Parchment, phong cách vintage minimalist, chất vải cao cấp hơn bản thường.</p><ul><li>Colorway: Parchment/Egret - màu kem vintage</li><li>Size: US 9 / EU 42.5</li><li>Condition: New with box</li><li>Chuck 70 cao cấp hơn Chuck Taylor thường</li><li>Đế OrthoLite êm chân hơn</li><li>Phong cách minimalist dễ phối</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=800',
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86? w=800',
        'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800',
      ],
      startPrice: 1500000,
      stepPrice: 50000,
      buyNowPrice: 2500000,
      currentPrice: 1500000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(4),
      bidCount: 0,
      viewCount: 189,
      categoryId: giay.id,
      sellerId: seller2.id,
    },
  }));

  // ========== ĐỒNG HỒ CAO CẤP (5 sản phẩm) ==========

  products.push(await prisma.product.create({
    data: {
      title: 'Rolex Submariner Date 41mm - Thép 904L - Fullbox',
      titleNoAccent:  'rolex submariner date 41mm thep 904l fullbox',
      description: '<h2>Rolex Submariner Date 126610LN</h2><p>Đồng hồ lặn huyền thoại của Rolex, thép 904L chống gỉ tuyệt đối, máy chronometer chứng nhận.</p><ul><li>Máy:  Caliber 3235 tự động, trữ cót 70 giờ</li><li>Vỏ: Thép Oystersteel 904L 41mm</li><li>Chống nước:  300m (1000ft) chuẩn lặn</li><li>Kính:  Sapphire chống trầy, cycops date</li><li>Fullbox, papers, bảo hành còn 3 năm</li><li>Tình trạng: 98% like new</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800',
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
        'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
      ],
      startPrice: 250000000,
      stepPrice: 5000000,
      buyNowPrice: 350000000,
      currentPrice:  250000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(7),
      bidCount: 0,
      viewCount: 478,
      categoryId: dongHo.id,
      sellerId: seller3.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Omega Speedmaster Professional Moonwatch - Mặt Trăng',
      titleNoAccent: 'omega speedmaster professional moonwatch mat trang',
      description: '<h2>Omega Speedmaster Professional</h2><p>Chiếc đồng hồ đầu tiên lên Mặt Trăng, biểu tượng của NASA, máy chronograph thủ công huyền thoại.</p><ul><li>Máy: Caliber 1861 thủ công (manual wind)</li><li>Vỏ: Thép inox 42mm cổ điển</li><li>Mặt số:  Đen với 3 subdials chronograph</li><li>Kính: Hesalite dome cổ điển (không sapphire)</li><li>Dây:  Thép bracelet chính hãng</li><li>Fullbox, papers, bảo hành 2 năm còn lại</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800',
        'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800',
      ],
      startPrice: 120000000,
      stepPrice:  3000000,
      buyNowPrice: 180000000,
      currentPrice:  120000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(6),
      bidCount: 0,
      viewCount: 389,
      categoryId: dongHo.id,
      sellerId: seller1.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Patek Philippe Calatrava 5227G - Vàng trắng 18k',
      titleNoAccent: 'patek philippe calatrava 5227g vang trang 18k',
      description: '<h2>Patek Philippe Calatrava 5227G</h2><p>Đồng hồ dress watch đỉnh cao từ Patek Philippe, vỏ vàng trắng 18k, thiết kế Bauhaus tối giản hoàn mỹ.</p><ul><li>Máy: Caliber 315 S C tự động siêu mỏng</li><li>Vỏ: Vàng trắng 18k 39mm</li><li>Mặt số: Ivory cream officer-style</li><li>Dây: Da cá sấu Alligator chính hãng</li><li>Kính: Sapphire 2 mặt chống phản quang</li><li>Fullbox, papers, extract từ archives PP</li></ul>',
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSglTMDFckfDN3MgL7wTQZsrZcPhUB6RVWV5A&s',
        'https://patek-res.cloudinary.com/dfsmedia/0906caea301d42b3b8bd23bd656d1711/176088-51883',
        'https://patek-res.cloudinary.com/dfsmedia/0906caea301d42b3b8bd23bd656d1711/176087-51883',
      ],
      startPrice: 600000000,
      stepPrice:  10000000,
      buyNowPrice: 850000000,
      currentPrice:  600000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(10),
      bidCount: 0,
      viewCount: 567,
      categoryId: dongHo.id,
      sellerId: seller2.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Seiko Presage Cocktail Time "Blue Moon" - JDM',
      titleNoAccent: 'seiko presage cocktail time blue moon jdm',
      description: '<h2>Seiko Presage SRPB41J</h2><p>Đồng hồ Nhật chất lượng cao, mặt số xanh dương gradient tuyệt đẹp lấy cảm hứng từ cocktail Blue Moon.</p><ul><li>Máy: Caliber 4R35 tự động Nhật Bản</li><li>Vỏ: Thép inox 40. 5mm đánh bóng</li><li>Mặt số: Blue gradient sunburst tuyệt đẹp</li><li>Kính:  Sapphire chống trầy, phủ AR</li><li>Chống nước: 50m</li><li>Hàng JDM (Japan Domestic Market)</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800',
        'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
        'https://images.unsplash.com/photo-1495704907664-81f74a7efd9b?w=800',
      ],
      startPrice: 8000000,
      stepPrice:  200000,
      buyNowPrice: 12000000,
      currentPrice:  8000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(4),
      bidCount: 0,
      viewCount: 267,
      categoryId: dongHo.id,
      sellerId: seller3.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'TAG Heuer Monaco Calibre 11 - Steve McQueen Edition',
      titleNoAccent:  'tag heuer monaco calibre 11 steve mcqueen edition',
      description: '<h2>TAG Heuer Monaco CAW211P</h2><p>Đồng hồ vuông iconic của TAG Heuer, nổi tiếng qua bộ phim Le Mans với Steve McQueen, thiết kế độc nhất.</p><ul><li>Máy: Calibre 11 tự động chronograph</li><li>Vỏ: Thép 39mm vuông iconic</li><li>Mặt số: Xanh dương racing với date</li><li>Chống nước: 100m</li><li>Dây: Da đục lỗ racing style</li><li>Fullbox, papers, bảo hành 18 tháng</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800',
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800',
      ],
      startPrice: 95000000,
      stepPrice:  2000000,
      buyNowPrice: 140000000,
      currentPrice:  95000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(5),
      bidCount: 0,
      viewCount: 312,
      categoryId: dongHo.id,
      sellerId: seller1.id,
    },
  }));

  // ========== NỘI THẤT (5 sản phẩm) ==========

  products. push(await prisma.product. create({
    data: {
      title: 'Ghế Eames Lounge Chair - Da bò thật - Bản Replica cao cấp',
      titleNoAccent: 'ghe eames lounge chair da bo that ban replica cao cap',
      description: '<h2>Eames Lounge Chair & Ottoman</h2><p>Ghế thư giãn iconic thiết kế năm 1956, bản replica cao cấp 1:1, da bò thật, gỗ veneer tự nhiên.</p><ul><li>Chất liệu: Da bò Aniline cao cấp</li><li>Khung: Gỗ veneer tự nhiên 7 lớp</li><li>Đệm: Mút foam cao cấp siêu êm</li><li>Chân:  Nhôm đúc mạ chrome sáng bóng</li><li>Kích thước: 84 x 85 x 85cm</li><li>Kèm ottoman (đôn để chân)</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
        'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800',
      ],
      startPrice: 15000000,
      stepPrice:  500000,
      buyNowPrice: 25000000,
      currentPrice:  15000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(5),
      bidCount: 0,
      viewCount: 234,
      categoryId: noiThat.id,
      sellerId: seller2.id,
    },
  }));

  products.push(await prisma.product. create({
    data: {
      title: 'Bàn làm việc gỗ óc chó nguyên khối - Walnut Live Edge',
      titleNoAccent:  'ban lam viec go oc cho nguyen khoi walnut live edge',
      description:  '<h2>Bàn gỗ óc chó Live Edge</h2><p>Bàn làm việc từ gỗ óc chó Walnut nguyên khối, giữ nguyên cạnh tự nhiên live edge, vân gỗ đẹp tự nhiên độc nhất vô nhị.</p><ul><li>Chất liệu: Gỗ óc chó (Walnut) nguyên khối</li><li>Kích thước: 180 x 80 x 75cm</li><li>Mặt bàn: Live edge tự nhiên 5cm dày</li><li>Chân bàn: Sắt sơn tĩnh điện chữ A</li><li>Hoàn thiện: Sơn PU bóng, chống nước</li><li>Trọng lượng: 85kg cực chắc chắn</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',
        'https://images.unsplash.com/photo-1595815771614-4e9b1f1b1c5f?w=800',
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
      ],
      startPrice: 22000000,
      stepPrice: 1000000,
      buyNowPrice: 35000000,
      currentPrice:  22000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(6),
      bidCount: 0,
      viewCount: 298,
      categoryId: noiThat.id,
      sellerId: seller3.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Sofa da công nghiệp phong cách Vintage - 3 chỗ ngồi',
      titleNoAccent: 'sofa da cong nghiep phong cach vintage 3 cho ngoi',
      description: '<h2>Sofa da Vintage 3 Seater</h2><p>Sofa da công nghiệp phong cách vintage industrial, màu cognac ấm áp, thiết kế chân thấp Scandinavian.</p><ul><li>Chất liệu:  Da công nghiệp cao cấp</li><li>Màu sắc: Cognac/Tan Brown vintage</li><li>Kích thước: 210 x 90 x 85cm</li><li>Đệm ngồi: Foam cao cấp + lò xo túi</li><li>Chân: Gỗ sồi tự nhiên 15cm</li><li>Phong cách: Industrial Vintage</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
        'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      ],
      startPrice: 12000000,
      stepPrice:  500000,
      buyNowPrice: 20000000,
      currentPrice:  12000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(4),
      bidCount: 0,
      viewCount: 267,
      categoryId: noiThat.id,
      sellerId: seller1.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Kệ sách gỗ sắt công nghiệp 5 tầng - Industrial Bookshelf',
      titleNoAccent: 'ke sach go sat cong nghiep 5 tang industrial bookshelf',
      description: '<h2>Kệ sách Industrial 5 tầng</h2><p>Kệ sách phong cách công nghiệp, kết hợp gỗ thông và sắt đen, chắc chắn, phù hợp phòng làm việc hiện đại.</p><ul><li>Chất liệu:  Gỗ thông tự nhiên + Sắt hộp</li><li>Kích thước: 180 x 80 x 35cm (5 tầng)</li><li>Khung sắt: Sơn tĩnh điện đen nhám</li><li>Tải trọng:  Mỗi tầng ch���u 30kg</li><li>Lắp ráp:  Ốc vít, dễ dàng tháo lắp</li><li>Phong cách: Industrial / Loft</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800',
        'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',
        'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800',
      ],
      startPrice: 5000000,
      stepPrice:  200000,
      buyNowPrice: 8500000,
      currentPrice: 5000000,
      autoExtend: true,
      status:  'ACTIVE',
      endTime: getFutureDate(3),
      bidCount: 0,
      viewCount: 189,
      categoryId: noiThat.id,
      sellerId: seller2.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Giường ngủ gỗ sồi tự nhiên King Size - Phong cách Nhật',
      titleNoAccent: 'giuong ngu go soi tu nhien king size phong cach nhat',
      description: '<h2>Giường gỗ sồi King Size</h2><p>Giường ngủ cao cấp từ gỗ sồi tự nhiên 100%, thiết kế tối giản Nhật Bản, chắc chắn, bền đẹp theo thời gian.</p><ul><li>Chất liệu:  Gỗ sồi Mỹ tự nhiên 100%</li><li>Kích thước: 180 x 200cm (King Size)</li><li>Thiết kế: Minimalist Nhật Bản</li><li>Hoàn thiện: Sơn PU bóng chống nước</li><li>Độ cao: 40cm từ mặt đất</li><li>Không bao gồm nệm</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
        'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800',
        'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800',
      ],
      startPrice: 18000000,
      stepPrice:  500000,
      buyNowPrice: 28000000,
      currentPrice:  18000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(7),
      bidCount: 0,
      viewCount: 312,
      categoryId: noiThat.id,
      sellerId: seller3.id,
    },
  }));

  // ========== ĐỒ TRANG TRÍ (5 sản phẩm) ==========

  products. push(await prisma.product. create({
    data: {
      title: 'Tranh sơn dầu phong cảnh biển - Handmade 80x120cm',
      titleNoAccent: 'tranh son dau phong canh bien handmade 80x120cm',
      description: '<h2>Tranh sơn dầu phong cảnh biển</h2><p>Bức tranh sơn dầu vẽ tay hoàn toàn, khung gỗ sồi tự nhiên, phong cảnh bờ biển lúc hoàng hôn tuyệt đẹp.</p><ul><li>Kỹ thuật: Sơn dầu vẽ tay 100%</li><li>Kích thước: 80 x 120cm</li><li>Chất liệu canvas: Cotton 100% cao cấp</li><li>Khung:  Gỗ sồi tự nhiên</li><li>Chủ đề: Phong cảnh biển hoàng hôn</li><li>Tác giả: Họa sĩ Nguyễn Văn A</li></ul>',
      images: [
        'https://thegioitranhsondau.com/upload/sanpham/tranh-son-dau-trat-bay-ve-bien-xanh-menh-mong.jpg?w=800',
        'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
      ],
      startPrice: 8000000,
      stepPrice:  300000,
      buyNowPrice: 15000000,
      currentPrice:  8000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(5),
      bidCount: 0,
      viewCount: 178,
      categoryId: doTrangTri.id,
      sellerId: seller1.id,
    },
  }));

  products.push(await prisma.product. create({
    data: {
      title: 'Bình gốm sứ Bát Tràng vẽ tay - Hoa sen truyền thống',
      titleNoAccent: 'binh gom su bat trang ve tay hoa sen truyen thong',
      description:  '<h2>Bình gốm Bát Tràng vẽ tay</h2><p>Bình hoa gốm sứ Bát Tràng cao cấp, vẽ tay hoa sen truyền thống, men trắng ngà đẹp mắt, nghệ nhân đắp nổi tinh xảo.</p><ul><li>Xuất xứ: Làng gốm Bát Tràng</li><li>Kích thước:  Cao 45cm, đường kính 25cm</li><li>Kỹ thuật: Vẽ tay, đắp nổi</li><li>Họa tiết: Hoa sen cổ truyền</li><li>Men:  Trắng ngà men lụa</li><li>Tác giả: Nghệ nhân Trần Văn B</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800',
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
      ],
      startPrice: 3500000,
      stepPrice: 150000,
      buyNowPrice: 6000000,
      currentPrice:  3500000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(4),
      bidCount: 0,
      viewCount: 145,
      categoryId: doTrangTri.id,
      sellerId: seller2.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Đèn bàn Tiffany cổ điển - Kính màu ghép thủ công',
      titleNoAccent:  'den ban tiffany co dien kinh mau ghep thu cong',
      description: '<h2>Đèn Tiffany Style Table Lamp</h2><p>Đèn bàn phong cách Tiffany cổ điển Mỹ, chao đèn kính màu ghép thủ công, chân đồng đúc, ánh sáng ấm đẹp lung linh.</p><ul><li>Phong cách: Tiffany Classic American</li><li>Chao đèn: Kính màu ghép 350 mảnh</li><li>Chân đèn: Đồng đúc mạ bronze</li><li>Kích thước:  Cao 65cm, chao rộng 40cm</li><li>Bóng đèn: E27, 40W max</li><li>Họa tiết: Hoa Dragonfly (chuồn chuồn)</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800',
        'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800',
      ],
      startPrice: 5500000,
      stepPrice: 200000,
      buyNowPrice: 9000000,
      currentPrice:  5500000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(6),
      bidCount: 0,
      viewCount: 234,
      categoryId: doTrangTri.id,
      sellerId: seller3.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Tượng đồng Phật Di Lặc - Cao 30cm đúc thủ công',
      titleNoAccent:  'tuong dong phat di lac cao 30cm duc thu cong',
      description: '<h2>Tượng đồng Phật Di Lặc</h2><p>Tượng Phật Di Lặc bằng đồng thau đúc thủ công, chạm khắc tinh xảo, mang ý nghĩa may mắn, tài lộc, phúc khí.</p><ul><li>Chất liệu:  Đồng thau nguyên chất</li><li>Kích thước:  Cao 30cm, rộng 25cm</li><li>Kỹ thuật: Đúc đồng thủ công truyền thống</li><li>Hoàn thiện: Đánh bóng sáng tự nhiên</li><li>Trọng lượng: 3.5kg</li><li>Ý nghĩa: Tài lộc, may mắn, hạnh phúc</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800',
        'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800',
        'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800',
      ],
      startPrice: 2500000,
      stepPrice: 100000,
      buyNowPrice: 4500000,
      currentPrice: 2500000,
      autoExtend: true,
      status:  'ACTIVE',
      endTime: getFutureDate(3),
      bidCount: 0,
      viewCount: 267,
      categoryId: doTrangTri.id,
      sellerId: seller1.id,
    },
  }));

  products.push(await prisma.product.create({
    data: {
      title: 'Thảm trải sàn Persian Carpet 2x3m - Thổ Nhĩ Kỳ',
      titleNoAccent: 'tham trai san persian carpet 2x3m tho nhi ky',
      description: '<h2>Thảm Persian Thổ Nhĩ Kỳ</h2><p>Thảm trải sàn phong cách Ba Tư nhập khẩu Thổ Nhĩ Kỳ, họa tiết Medallion cổ điển, chất liệu len cao cấp dệt thủ công.</p><ul><li>Xuất xứ: Thổ Nhĩ Kỳ (Turkey)</li><li>Kích thước: 200 x 300cm</li><li>Chất liệu: Len 80% + Cotton 20%</li><li>Kỹ thuật:  Dệt thủ công (Hand-woven)</li><li>Họa tiết: Persian Medallion cổ điển</li><li>Màu sắc: Đỏ Burgundy chủ đạo</li></ul>',
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8fggDT4stWA6Ev5y74R0ayvcboRliE9HAzw&s?w=800',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
        'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800',
      ],
      startPrice: 12000000,
      stepPrice:  500000,
      buyNowPrice: 20000000,
      currentPrice:  12000000,
      autoExtend: true,
      status: 'ACTIVE',
      endTime: getFutureDate(7),
      bidCount: 0,
      viewCount: 198,
      categoryId: doTrangTri.id,
      sellerId: seller2.id,
    },
  }));

  console.log(`Created ${await prisma.product.count()} products\n`);

  console.log('Database seeded successfully!');
  console.log(`Total users: ${await prisma.user. count()}`);
  console.log(`Total categories: ${await prisma.category. count()}`);
  console.log(`Total products: ${await prisma.product.count()}`);
}

main()
    .catch((e) => {
      console.error('Error seeding database:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });