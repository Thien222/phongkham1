import prisma from '../db.js';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedFull() {
  console.log('🌱 Seeding database with 50+ records...');

  // Clear existing data
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.examination.deleteMany();
  await prisma.refraction.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.product.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  await prisma.user.create({
    data: {
      username: 'admin',
      password: hashPassword('admin123'),
      fullName: 'Quản trị viên',
      role: 'admin',
      isActive: true
    }
  });
  console.log('✅ Created admin user: admin / admin123');

  // Create 50 patients with diverse data
  const patients = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 50; i++) {
    const patient = await prisma.patient.create({
      data: {
        code: `BN${String(i).padStart(12, '0')}`,
        queueNumber: `STT${String(i).padStart(3, '0')}`,
        fullName: `Bệnh nhân ${i}`,
        phone: `090${String(1000000 + i)}`,
        gender: i % 3 === 0 ? 'female' : 'male',
        birthDate: new Date(1960 + (i % 40), (i % 12), (i % 28) + 1),
        address: `Địa chỉ ${i}, TP.HCM`,
        visitPurpose: i % 3 === 0 ? 'examination' : i % 3 === 1 ? 'refraction' : 'both',
        visitStatus: i <= 10 ? 'waiting' : i <= 30 ? 'in_progress' : 'completed',
        initialVaOd: ['10/10', '9/10', '8/10', '7/10', '5/10'][i % 5],
        initialVaOs: ['10/10', '9/10', '8/10', '7/10', '5/10'][(i + 1) % 5],
        hasGlasses: i % 2 === 0,
        visitReason: ['Đau mắt', 'Nhìn mờ', 'Khó chịu', 'Kiểm tra định kỳ', 'Mắt đỏ'][i % 5],
        notes: i % 3 === 0 ? `Ghi chú cho bệnh nhân ${i}` : null,
        createdAt: new Date(today.getTime() - (50 - i) * 60000) // Spread over time
      }
    });
    patients.push(patient);
  }

  // Create products - Tròng kính đơn
  for (let i = 1; i <= 15; i++) {
    await prisma.product.create({
      data: {
        code: `TRONG_DON_${i}`,
        name: `Tròng đơn ${i}`,
        category: 'lenses',
        lensCategory: 'don_trong',
        manufacturer: ['Essilor', 'Hoya', 'Zeiss', 'Kodak'][i % 4],
        sphRange: `-10.00 to +6.00`,
        cylRange: `0 to -4.00`,
        material: ['CR-39', 'Hi-Index 1.67', 'Polycarbonate'][i % 3],
        price: 200000 + (i * 50000),
        quantity: 50 - i,
        minStock: 5
      }
    });
  }

  // Create products - Tròng 2 tròng
  for (let i = 1; i <= 10; i++) {
    await prisma.product.create({
      data: {
        code: `TRONG_2_${i}`,
        name: `Tròng 2 tròng ${i}`,
        category: 'lenses',
        lensCategory: 'hai_trong',
        manufacturer: ['Essilor', 'Hoya'][i % 2],
        sphRange: `-8.00 to +4.00`,
        cylRange: `0 to -3.00`,
        addRange: `+1.00 to +3.00`,
        leftRegion: 'Nhìn xa',
        rightRegion: 'Nhìn gần',
        material: 'Hi-Index 1.60',
        price: 800000 + (i * 100000),
        quantity: 30 - i,
        minStock: 3
      }
    });
  }

  // Create products - Tròng đa tròng
  for (let i = 1; i <= 10; i++) {
    await prisma.product.create({
      data: {
        code: `TRONG_DA_${i}`,
        name: `Tròng đa tròng Progressive ${i}`,
        category: 'lenses',
        lensCategory: 'da_trong',
        manufacturer: ['Essilor Varilux', 'Hoya', 'Zeiss Progressive'][i % 3],
        sphRange: `-10.00 to +6.00`,
        cylRange: `0 to -4.00`,
        addRange: `+0.75 to +3.50`,
        leftRegion: 'Xa - Trung gian - Gần',
        rightRegion: 'Liên tục',
        material: 'Hi-Index 1.67',
        price: 1500000 + (i * 200000),
        quantity: 20 - i,
        minStock: 2
      }
    });
  }

  // Create products - Gọng kính
  for (let i = 1; i <= 20; i++) {
    await prisma.product.create({
      data: {
        code: `GONG_${String(i).padStart(3, '0')}`,
        name: `Gọng kính ${i}`,
        category: 'glasses',
        manufacturer: ['Ray-Ban', 'Oakley', 'Gucci', 'Local'][i % 4],
        price: 300000 + (i * 100000),
        quantity: i % 5 === 0 ? 2 : 10 - (i % 10), // Some low stock
        minStock: 3
      }
    });
  }

  // Create products - Thuốc
  for (let i = 1; i <= 10; i++) {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + (i % 5 === 0 ? 2 : 12)); // Some expiring soon
    
    await prisma.product.create({
      data: {
        code: `THUOC_${i}`,
        name: `Thuốc nhỏ mắt ${i}`,
        category: 'medicine',
        manufacturer: ['Rohto', 'Santen', 'Alcon'][i % 3],
        price: 50000 + (i * 10000),
        quantity: i % 4 === 0 ? 3 : 20,
        minStock: 5,
        expiresAt: expiryDate
      }
    });
  }

  console.log('✅ Seeded 50 patients');
  console.log('✅ Seeded 15 đơn tròng, 10 hai tròng, 10 đa tròng');
  console.log('✅ Seeded 20 gọng kính, 10 thuốc');
  console.log('🎉 Seed completed successfully!');
}

seedFull()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

