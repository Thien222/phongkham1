import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// Get all vouchers
router.get('/', async (req, res, next) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(vouchers);
  } catch (err) {
    next(err);
  }
});

// Validate voucher
router.post('/validate', async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    
    const voucher = await prisma.voucher.findUnique({
      where: { code }
    });
    
    if (!voucher) {
      return res.status(404).json({ valid: false, message: 'Mã voucher không tồn tại' });
    }
    
    const now = new Date();
    
    // Check if voucher is active
    if (!voucher.isActive) {
      return res.status(400).json({ valid: false, message: 'Mã voucher đã bị vô hiệu hóa' });
    }
    
    // Check date range
    if (now < voucher.startDate) {
      return res.status(400).json({ valid: false, message: 'Mã voucher chưa có hiệu lực' });
    }
    
    if (now > voucher.endDate) {
      return res.status(400).json({ valid: false, message: 'Mã voucher đã hết hạn' });
    }
    
    // Check usage limit
    if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
      return res.status(400).json({ valid: false, message: 'Mã voucher đã hết lượt sử dụng' });
    }
    
    // Check minimum amount
    if (amount < voucher.minAmount) {
      return res.status(400).json({ 
        valid: false, 
        message: `Đơn hàng tối thiểu ${voucher.minAmount.toLocaleString()}đ để áp dụng voucher này` 
      });
    }
    
    // Calculate discount
    let discount = 0;
    if (voucher.type === 'percent') {
      discount = Math.round(amount * voucher.value / 100);
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = voucher.value;
    }
    
    res.json({ 
      valid: true, 
      voucher,
      discount,
      message: `Giảm ${discount.toLocaleString()}đ`
    });
  } catch (err) {
    next(err);
  }
});

// Create voucher
router.post('/', async (req, res, next) => {
  try {
    const { code, description, type, value, minAmount, maxDiscount, startDate, endDate, usageLimit } = req.body;
    
    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(),
        description,
        type,
        value: Number(value),
        minAmount: Number(minAmount || 0),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? Number(usageLimit) : null
      }
    });
    
    res.status(201).json(voucher);
  } catch (err) {
    next(err);
  }
});

// Update voucher
router.put('/:id', async (req, res, next) => {
  try {
    const { description, type, value, minAmount, maxDiscount, startDate, endDate, isActive, usageLimit } = req.body;
    
    const voucher = await prisma.voucher.update({
      where: { id: req.params.id },
      data: {
        description,
        type,
        value: value !== undefined ? Number(value) : undefined,
        minAmount: minAmount !== undefined ? Number(minAmount) : undefined,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
        usageLimit: usageLimit ? Number(usageLimit) : null
      }
    });
    
    res.json(voucher);
  } catch (err) {
    next(err);
  }
});

// Delete voucher
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.voucher.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;

