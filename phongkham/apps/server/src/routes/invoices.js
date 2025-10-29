import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// Get all invoices
router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status;
    const invoices = await prisma.invoice.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { patient: true, items: { include: { product: true } } },
      take: 100
    });
    res.json(invoices);
  } catch (err) {
    next(err);
  }
});

// Get invoice by ID
router.get('/:id', async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { patient: true, items: { include: { product: true } } }
    });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    next(err);
  }
});

// Create invoice
router.post('/', async (req, res, next) => {
  try {
    const { 
      patientId, 
      type, 
      items, 
      discount, 
      voucherCode,
      voucherDiscount,
      processingFee,
      shippingFee,
      serviceFee,
      signature, 
      notes 
    } = req.body ?? {};
    
    const code = type === 'glasses' 
      ? `HK-${new Date().getFullYear()}${String(Date.now()).slice(-9)}`
      : `HT-${new Date().getFullYear()}${String(Date.now()).slice(-9)}`;
    
    const subtotal = (items ?? []).reduce((s, it) => s + Number(it.quantity ?? 1) * Number(it.unitPrice ?? 0), 0);
    
    // Calculate fees
    const processingFeeAmount = Number(processingFee ?? 0);
    const shippingFeeAmount = Number(shippingFee ?? 0);
    const serviceFeeAmount = Number(serviceFee ?? 0);
    
    // Calculate tax on subtotal + fees
    const totalBeforeTax = subtotal + processingFeeAmount + shippingFeeAmount + serviceFeeAmount;
    const tax = Math.round(totalBeforeTax * 0.1); // 10% VAT
    
    const discountAmount = Number(discount ?? 0);
    const voucherDiscountAmount = Number(voucherDiscount ?? 0);
    
    const total = totalBeforeTax + tax - discountAmount - voucherDiscountAmount;
    
    const created = await prisma.invoice.create({
      data: {
        code,
        patientId,
        type: type || 'glasses',
        subtotal,
        discount: discountAmount,
        voucherCode: voucherCode || null,
        voucherDiscount: voucherDiscountAmount,
        processingFee: processingFeeAmount,
        shippingFee: shippingFeeAmount,
        serviceFee: serviceFeeAmount,
        tax,
        total,
        signature,
        notes,
        items: {
          create: (items ?? []).map((it) => {
            const qty = Number(it.quantity ?? 1);
            const price = Number(it.unitPrice ?? 0);
            return {
              productId: it.productId,
              quantity: qty,
              unitPrice: price,
              totalPrice: qty * price
            };
          })
        }
      },
      include: { patient: true, items: { include: { product: true } } }
    });
    
    // Update product quantities
    for (const item of items ?? []) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: Number(item.quantity ?? 1) } }
      });
    }
    
    // Update voucher usage count
    if (voucherCode) {
      await prisma.voucher.update({
        where: { code: voucherCode },
        data: { usageCount: { increment: 1 } }
      });
    }
    
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Update invoice status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body ?? {};
    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status },
      include: { patient: true, items: { include: { product: true } } }
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Update invoice signature
router.patch('/:id/signature', async (req, res, next) => {
  try {
    const { signature } = req.body ?? {};
    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { signature },
      include: { patient: true, items: { include: { product: true } } }
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete invoice
router.delete('/:id', async (req, res, next) => {
  try {
    // Get invoice items before deletion to restore quantities
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    
    if (invoice) {
      // Restore product quantities
      for (const item of invoice.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } }
        });
      }
    }
    
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;


