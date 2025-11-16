import prisma from '../db.js';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function fixAdmin() {
  console.log('🔧 Fixing admin user...');
  
  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      // Update existing admin
      await prisma.user.update({
        where: { username: 'admin' },
        data: {
          password: hashPassword('admin123'),
          isActive: true,
          role: 'admin'
        }
      });
      console.log('✅ Updated existing admin user');
    } else {
      // Create new admin
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashPassword('admin123'),
          fullName: 'Quản trị viên',
          role: 'admin',
          isActive: true
        }
      });
      console.log('✅ Created new admin user');
    }
    
    console.log('✅ Admin user ready: username=admin, password=admin123');
    console.log('✅ isActive=true, role=admin');
  } catch (error) {
    console.error('❌ Error fixing admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();

