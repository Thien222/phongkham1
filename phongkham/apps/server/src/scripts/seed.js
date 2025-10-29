import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.examination.deleteMany();
  await prisma.refraction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.patient.deleteMany();

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
    // Glasses
    prisma.product.create({
      data: {
        code: 'L001',
        name: 'Tròng kính cận thị',
        category: 'glasses',
        manufacturer: 'Essilor',
        material: 'Chống AS xanh, đôi màu',
        sphRange: '-20.00 đến +20.00',
        cylRange: '0.00 đến -8.00',
        price: 300000,
        quantity: 50,
        minStock: 10
      }
    }),
    prisma.product.create({
      data: {
        code: 'L002',
        name: 'Tròng kính viễn thị',
        category: 'glasses',
        manufacturer: 'Hoya',
        material: 'Chống AS xanh',
        sphRange: '-10.00 đến +10.00',
        cylRange: '0.00 đến -6.00',
        price: 400000,
        quantity: 30,
        minStock: 5
      }
    }),
    // Lenses
    prisma.product.create({
      data: {
        code: 'G001',
        name: 'Gọng kính kim loại bạc',
        category: 'lenses',
        manufacturer: 'Kim loại',
        material: 'Bạc',
        price: 350000,
        quantity: 25,
        minStock: 5
      }
    }),
    // Medicine
    prisma.product.create({
      data: {
        code: 'M001',
        name: 'Thuốc nhỏ mắt',
        category: 'medicine',
        manufacturer: 'undefined',
        price: 50000,
        quantity: 100,
        minStock: 20,
        expiresAt: new Date('2026-12-31')
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

