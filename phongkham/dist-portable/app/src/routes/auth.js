import express from 'express';
import crypto from 'crypto';
import prisma from '../db.js';

const router = express.Router();

// Hash password với SHA-256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ ok: false, message: 'Thiếu thông tin đăng nhập' });
    }
    
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ ok: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ ok: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    // Không trả về password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      ok: true, 
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Đổi mật khẩu
router.post('/change-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    
    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({ ok: false, message: 'Thiếu thông tin' });
    }
    
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user) {
      return res.status(404).json({ ok: false, message: 'Không tìm thấy người dùng' });
    }
    
    const hashedOldPassword = hashPassword(oldPassword);
    if (user.password !== hashedOldPassword) {
      return res.status(401).json({ ok: false, message: 'Mật khẩu cũ không đúng' });
    }
    
    const hashedNewPassword = hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });
    
    res.json({ ok: true, message: 'Đã đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Lấy danh sách users (chỉ admin)
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;

