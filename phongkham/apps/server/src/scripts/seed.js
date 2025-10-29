import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  if (prisma.user) {
    await prisma.user.deleteMany();
  }
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.examination.deleteMany();
  await prisma.refraction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.patient.deleteMany();
  if (prisma.voucher) {
    await prisma.voucher.deleteMany();
  }

  if (prisma.setting) {
    await prisma.setting.deleteMany();
  }

  // Create default admin user
  if (prisma.user) {
    console.log('Creating default admin user...');
    await prisma.user.create({
      data: {
        username: 'admin',
        password: hashPassword('admin123'),
        fullName: 'Quản trị viên',
        role: 'admin',
        isActive: true
      }
    });
  }

  if (prisma.setting) {
    console.log('Creating default settings...');
    await prisma.setting.createMany({
      data: [
        { key: 'clinicName', value: 'Phòng khám Mắt Sài Gòn' },
        { key: 'clinicAddress', value: '123 Lê Lợi, Quận 1, TP.HCM' },
        { key: 'clinicPhone', value: '028-1234-5678' },
        { key: 'clinicEmail', value: 'contact@saigoneyecare.vn' },
        { key: 'taxRate', value: '10' },
        { key: 'lowStockThreshold', value: '5' },
        { key: 'maxBackups', value: '10' },
        { key: 'backupPath', value: '' }
      ]
    });
  }

  // Create patients
  console.log('Creating patients...');
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        code: 'BN000000000001',
        fullName: 'Nguyễn Văn A',
        phone: '0901234567',
        gender: 'male',
        birthDate: new Date('1990-05-15'),
        address: '123 Đường Lê Lợi, Q1, TP.HCM',
        visitPurpose: 'refraction',
        visitStatus: 'waiting'
      }
    }),
    prisma.patient.create({
      data: {
        code: 'BN000000000002',
        fullName: 'Trần Thị B',
        phone: '0912345678',
        gender: 'female',
        birthDate: new Date('1985-08-20'),
        address: '456 Đường Nguyễn Huệ, Q1, TP.HCM',
        visitPurpose: 'examination',
        visitStatus: 'waiting'
      }
    }),
    prisma.patient.create({
      data: {
        code: 'BN000000000003',
        fullName: 'Lê Văn C',
        phone: '0923456789',
        gender: 'male',
        birthDate: new Date('1995-03-10'),
        address: '789 Đường Pasteur, Q3, TP.HCM',
        visitPurpose: 'both',
        visitStatus: 'waiting'
      }
    }),
    prisma.patient.create({
      data: {
        code: 'BN000000000004',
        fullName: 'Phạm Thị D',
        phone: '0934567890',
        gender: 'female',
        birthDate: new Date('1992-12-25'),
        address: '321 Đường Điện Biên Phủ, Q3, TP.HCM',
        visitPurpose: 'refraction',
        visitStatus: 'waiting'
      }
    }),
    prisma.patient.create({
      data: {
        code: 'BN000000000005',
        fullName: 'Hoàng Văn E',
        phone: '0945678901',
        gender: 'male',
        birthDate: new Date('1988-07-18'),
        address: '654 Đường Cách Mạng Tháng 8, Q10, TP.HCM',
        visitPurpose: 'examination',
        visitStatus: 'waiting'
      }
    })
  ]);

  // Create products
  console.log('Creating products...');
  const products = await Promise.all([
    // TRÒNG KÍNH (Glasses)
    prisma.product.create({
      data: {
        code: 'L001',
        name: 'Tròng kính cận thị Essilor',
        category: 'glasses',
        manufacturer: 'Essilor',
        material: 'Chống AS xanh, đôi màu',
        sphRange: '-3.00',
        cylRange: '-1.00',
        price: 300000,
        quantity: 50,
        minStock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400'
      }
    }),
    prisma.product.create({
      data: {
        code: 'L002',
        name: 'Tròng kính viễn thị Hoya',
        category: 'glasses',
        manufacturer: 'Hoya',
        material: 'Chống AS xanh',
        sphRange: '+2.50',
        cylRange: '-0.50',
        price: 400000,
        quantity: 30,
        minStock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400'
      }
    }),
    prisma.product.create({
      data: {
        code: 'L003',
        name: 'Tròng kính đổi màu Transitions',
        category: 'glasses',
        manufacturer: 'Essilor',
        material: 'Đổi màu, chống UV',
        sphRange: '-2.00',
        cylRange: 'Plano',
        price: 550000,
        quantity: 40,
        minStock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1606497426098-cd0c2ccc3cb5?w=400'
      }
    }),
    prisma.product.create({
      data: {
        code: 'L004',
        name: 'Tròng kính chống ánh sáng xanh',
        category: 'glasses',
        manufacturer: 'Zeiss',
        material: 'Blue Light Protection',
        sphRange: '-1.50',
        cylRange: '-0.75',
        price: 480000,
        quantity: 35,
        minStock: 7,
        imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400'
      }
    }),
    prisma.product.create({
      data: {
        code: 'L005',
        name: 'Tròng kính loạn Hoya Premium',
        category: 'glasses',
        manufacturer: 'Hoya',
        material: 'Chống trầy, chống bám bẩn',
        sphRange: 'Plano',
        cylRange: '-2.00',
        price: 520000,
        quantity: 25,
        minStock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=400'
      }
    }),
    
    // GỌNG KÍNH (Frames/Lenses)
    prisma.product.create({
      data: {
        code: 'G001',
        name: 'Gọng kính kim loại bạc Titanium',
        category: 'lenses',
        manufacturer: 'Rayban',
        material: 'Titanium, siêu nhẹ',
        price: 350000,
        quantity: 25,
        minStock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400'
      }
    }),
    prisma.product.create({
      data: {
        code: 'G002',
        name: 'Gọng kính nhựa TR90 đen',
        category: 'lenses',
        manufacturer: 'Oakley',
        material: 'TR90, dẻo dai',
        price: 280000,
        quantity: 30,
        minStock: 6,
        imageUrl: 'https://images.unsplash.com/photo-1501472312651-726afe119ff1?w=400'
      }
    }),
    prisma.product.create({
      data: {
        code: 'G003',
        name: 'Gọng kính vuông Vintage',
        category: 'lenses',
        manufacturer: 'Gucci',
        material: 'Acetate cao cấp',
        price: 450000,
        quantity: 20,
        minStock: 4,
        imageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400'
      }
    }),
    prisma.product.create({
      data: {
        code: 'G004',
        name: 'Gọng kính tròn Harry Potter',
        category: 'lenses',
        manufacturer: 'Gentle Monster',
        material: 'Kim loại vàng',
        price: 320000,
        quantity: 28,
        minStock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400'
      }
    }),
    prisma.product.create({
      data: {
        code: 'G005',
        name: 'Gọng kính nửa viền thể thao',
        category: 'lenses',
        manufacturer: 'Nike',
        material: 'Nhựa composite',
        price: 290000,
        quantity: 32,
        minStock: 6,
        imageUrl: 'https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=400'
      }
    }),
    
    // THUỐC (Medicine)
    prisma.product.create({
      data: {
        code: 'M001',
        name: 'Thuốc nhỏ mắt Refresh Tears',
        category: 'medicine',
        manufacturer: 'Allergan',
        price: 50000,
        quantity: 100,
        minStock: 20,
        expiresAt: new Date('2026-12-31'),
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'
      }
    }),
    prisma.product.create({
      data: {
        code: 'M002',
        name: 'Vitamin A cho mắt',
        category: 'medicine',
        manufacturer: 'Blackmores',
        price: 120000,
        quantity: 80,
        minStock: 15,
        expiresAt: new Date('2027-06-30'),
        imageUrl: 'https://images.unsplash.com/photo-1550572017-4a6e8e3b7e2f?w=400'
      }
    }),
    prisma.product.create({
      data: {
        code: 'M003',
        name: 'Thuốc kháng viêm mắt Tobradex',
        category: 'medicine',
        manufacturer: 'Novartis',
        price: 85000,
        quantity: 60,
        minStock: 12,
        expiresAt: new Date('2026-09-15'),
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400'
      }
    }),
    prisma.product.create({
      data: {
        code: 'M004',
        name: 'Nước rửa mắt Optrex',
        category: 'medicine',
        manufacturer: 'Reckitt Benckiser',
        price: 75000,
        quantity: 90,
        minStock: 18,
        expiresAt: new Date('2026-11-20'),
        imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400'
      }
    }),
    prisma.product.create({
      data: {
        code: 'M005',
        name: 'Thuốc giảm khô mắt Systane',
        category: 'medicine',
        manufacturer: 'Alcon',
        price: 95000,
        quantity: 70,
        minStock: 14,
        expiresAt: new Date('2027-03-10'),
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400'
      }
    })
  ]);

  // Create refractions
  console.log('Creating refractions...');
  await prisma.refraction.create({
    data: {
      patientId: patients[0].id,
      odSph: '-3.50',
      odCyl: '-1.00',
      odAxis: '180',
      odVa: '10/10',
      osSph: '-3.25',
      osCyl: '-0.75',
      osAxis: '15',
      osVa: '10/10',
      notes: 'Bệnh nhân cận thị, đeo kính thường xuyên'
    }
  });

  // Create examinations
  console.log('Creating examinations...');
  await prisma.examination.create({
    data: {
      patientId: patients[1].id,
      symptoms: 'Mắt mờ, nhức đầu khi đọc sách',
      diagnosis: 'Cận thị nhẹ, cần đeo kính',
      treatment: 'Đeo kính chống ánh sáng xanh',
      medications: 'Không cần thuốc'
    }
  });

  // Create invoices
  console.log('Creating invoices...');
  await prisma.invoice.create({
    data: {
      code: 'INV-20250903-001',
      patientId: patients[0].id,
      type: 'glasses',
      status: 'PAID',
      subtotal: 650000,
      tax: 65000,
      discount: 0,
      total: 715000,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            unitPrice: 300000,
            totalPrice: 300000
          },
          {
            productId: products[2].id,
            quantity: 1,
            unitPrice: 350000,
            totalPrice: 350000
          }
        ]
      }
    }
  });

  await prisma.invoice.create({
    data: {
      code: 'INV-20250903-002',
      patientId: patients[1].id,
      type: 'glasses',
      status: 'UNPAID',
      subtotal: 400000,
      tax: 40000,
      discount: 0,
      total: 440000,
      items: {
        create: [
          {
            productId: products[1].id,
            quantity: 1,
            unitPrice: 400000,
            totalPrice: 400000
          }
        ]
      }
    }
  });

  // Create vouchers
  console.log('Creating vouchers...');
  await Promise.all([
    prisma.voucher.create({
      data: {
        code: 'KHAI2025',
        description: 'Khuyến mãi khai trương - Giảm 10%',
        type: 'percent',
        value: 10,
        minAmount: 200000,
        maxDiscount: 100000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        usageLimit: 100
      }
    }),
    prisma.voucher.create({
      data: {
        code: 'VIP50K',
        description: 'Voucher VIP - Giảm 50K',
        type: 'fixed',
        value: 50000,
        minAmount: 300000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        usageLimit: 50
      }
    }),
    prisma.voucher.create({
      data: {
        code: 'TET2025',
        description: 'Khuyến mãi Tết - Giảm 15%',
        type: 'percent',
        value: 15,
        minAmount: 500000,
        maxDiscount: 200000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-02-28'),
        usageLimit: 200
      }
    })
  ]);

  console.log('✅ Seeding completed successfully!');
  console.log(`Created ${patients.length} patients`);
  console.log(`Created ${products.length} products`);
  console.log('Created 3 vouchers');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

