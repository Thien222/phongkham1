import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addFramesOnly() {
  console.log('🔧 Thêm gọng kính vào database...');

  try {
    // Kiểm tra xem đã có gọng kính chưa
    const existingFrames = await prisma.product.findMany({
      where: {
        category: 'frames'
      }
    });

    if (existingFrames.length > 0) {
      console.log(`✅ Đã có ${existingFrames.length} gọng kính trong database`);
      console.log('Không cần thêm nữa.');
      return;
    }

    // Thêm 15 gọng kính
    const frames = [];
    const frameData = [
      { code: 'G001', name: 'Gọng kính kim loại bạc Titanium', manufacturer: 'Rayban', material: 'Titanium, siêu nhẹ', price: 350000, quantity: 25 },
      { code: 'G002', name: 'Gọng kính nhựa TR90 đen', manufacturer: 'Oakley', material: 'TR90, dẻo dai', price: 280000, quantity: 30 },
      { code: 'G003', name: 'Gọng kính vuông Vintage', manufacturer: 'Gucci', material: 'Acetate cao cấp', price: 450000, quantity: 20 },
      { code: 'G004', name: 'Gọng kính tròn Harry Potter', manufacturer: 'Gentle Monster', material: 'Kim loại vàng', price: 320000, quantity: 28 },
      { code: 'G005', name: 'Gọng kính nửa viền thể thao', manufacturer: 'Nike', material: 'Nhựa composite', price: 290000, quantity: 32 },
      { code: 'G006', name: 'Gọng kính Aviator phi công', manufacturer: 'Rayban', material: 'Kim loại mạ vàng', price: 420000, quantity: 18 },
      { code: 'G007', name: 'Gọng kính Wayfarer cổ điển', manufacturer: 'Rayban', material: 'Acetate đen', price: 380000, quantity: 22 },
      { code: 'G008', name: 'Gọng kính Cat Eye nữ', manufacturer: 'Prada', material: 'Acetate họa tiết', price: 510000, quantity: 15 },
      { code: 'G009', name: 'Gọng kính Clubmaster retro', manufacturer: 'Rayban', material: 'Acetate + Kim loại', price: 390000, quantity: 20 },
      { code: 'G010', name: 'Gọng kính Rimless không viền', manufacturer: 'Silhouette', material: 'Titanium siêu nhẹ', price: 580000, quantity: 12 },
      { code: 'G011', name: 'Gọng kính Oversized thời trang', manufacturer: 'Gucci', material: 'Acetate đa màu', price: 650000, quantity: 10 },
      { code: 'G012', name: 'Gọng kính thể thao Wrap-around', manufacturer: 'Oakley', material: 'Nhựa chống va đập', price: 340000, quantity: 25 },
      { code: 'G013', name: 'Gọng kính Hexagon lục giác', manufacturer: 'Gentle Monster', material: 'Kim loại mỏng', price: 460000, quantity: 14 },
      { code: 'G014', name: 'Gọng kính Pilot quân đội', manufacturer: 'American Optical', material: 'Kim loại mạ crôm', price: 410000, quantity: 17 },
      { code: 'G015', name: 'Gọng kính Browline sang trọng', manufacturer: 'Persol', material: 'Acetate + Vàng', price: 530000, quantity: 13 }
    ];

    for (const frameInfo of frameData) {
      try {
        const frame = await prisma.product.create({
          data: {
            code: frameInfo.code,
            name: frameInfo.name,
            category: 'frames',
            manufacturer: frameInfo.manufacturer,
            material: frameInfo.material,
            price: frameInfo.price,
            quantity: frameInfo.quantity,
            minStock: Math.floor(frameInfo.quantity / 5)
          }
        });
        frames.push(frame);
        console.log(`✓ Đã thêm: ${frame.name} (${frame.code})`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠ Bỏ qua ${frameInfo.code} - đã tồn tại`);
        } else {
          throw error;
        }
      }
    }

    console.log(`✅ Đã thêm thành công ${frames.length} gọng kính!`);
  } catch (error) {
    console.error('❌ Lỗi khi thêm gọng kính:', error);
    throw error;
  }
}

addFramesOnly()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

