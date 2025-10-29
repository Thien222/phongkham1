import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// Get low stock products - MUST come before /:id
router.get('/alerts/low-stock', async (req, res, next) => {
  try {
    // SQLite doesn't support comparing columns directly, so fetch all and filter
    const products = await prisma.product.findMany({
      orderBy: { quantity: 'asc' }
    });
    const lowStock = products.filter(p => p.quantity <= p.minStock);
    res.json(lowStock);
  } catch (err) {
    next(err);
  }
});

// Get expiring products - MUST come before /:id
router.get('/alerts/expiring', async (req, res, next) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const products = await prisma.product.findMany({
      where: {
        expiresAt: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        }
      },
      orderBy: { expiresAt: 'asc' }
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// Get all products with filtering
router.get('/', async (req, res, next) => {
  try {
    const category = req.query.category;
    const q = String(req.query.q ?? '').trim();
    const products = await prisma.product.findMany({ 
      where: {
        ...(category ? { category } : {}),
        ...(q ? {
          OR: [
            { name: { contains: q } },
            { code: { contains: q } }
          ]
        } : {})
      },
      orderBy: { createdAt: 'desc' }, 
      take: 200 
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// Get product by ID - MUST come after specific routes
router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Create product
router.post('/', async (req, res, next) => {
  try {
    const { code, name, category, manufacturer, sphRange, cylRange, material, price, quantity, minStock, expiresAt, imageUrl } = req.body ?? {};
    const created = await prisma.product.create({
      data: { 
        code: code || `PRD${Date.now()}`,
        name, 
        category: category || 'glasses',
        manufacturer,
        sphRange,
        cylRange,
        material,
        price: Number(price ?? 0), 
        quantity: Number(quantity ?? 0),
        minStock: Number(minStock ?? 5),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        imageUrl
      }
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Update product
router.put('/:id', async (req, res, next) => {
  try {
    const { name, category, manufacturer, sphRange, cylRange, material, price, quantity, minStock, expiresAt, imageUrl } = req.body ?? {};
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { 
        name, category, manufacturer, sphRange, cylRange, material,
        price: price !== undefined ? Number(price) : undefined, 
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        minStock: minStock !== undefined ? Number(minStock) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        imageUrl
      }
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;


