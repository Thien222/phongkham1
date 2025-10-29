import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// Lấy tất cả settings
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Cập nhật settings
router.put('/', async (req, res) => {
  try {
    const updates = req.body;
    
    // Upsert từng setting
    for (const [key, value] of Object.entries(updates)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }
    
    res.json({ ok: true, message: 'Đã cập nhật cài đặt' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;

