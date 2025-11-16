import { Router } from 'express';
import prisma from '../db.js';

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
    const lensCategory = req.query.lensCategory; // don_trong | hai_trong | da_trong
    const q = String(req.query.q ?? '').trim();
    
    const whereClause = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    if (lensCategory) {
      whereClause.lensCategory = lensCategory;
    }
    
    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { code: { contains: q } }
      ];
    }
    
    const products = await prisma.product.findMany({ 
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
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
    const { 
      code, name, category, lensCategory, manufacturer, 
      sphRange, cylRange, addRange, leftRegion, rightRegion,
      material, price, quantity, minStock, expiresAt, imageUrl 
    } = req.body ?? {};
    
    const created = await prisma.product.create({
      data: { 
        code: code || `PRD${Date.now()}`,
        name, 
        category: category || 'glasses',
        lensCategory: lensCategory || null,
        manufacturer: manufacturer || null,
        sphRange: sphRange || null,
        cylRange: cylRange || null,
        addRange: addRange || null,
        leftRegion: leftRegion || null,
        rightRegion: rightRegion || null,
        material: material || null,
        price: Number(price ?? 0), 
        quantity: Number(quantity ?? 0),
        minStock: Number(minStock ?? 5),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        imageUrl: imageUrl || null
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
    const { 
      name, category, lensCategory, manufacturer, 
      sphRange, cylRange, addRange, leftRegion, rightRegion,
      material, price, quantity, minStock, expiresAt, imageUrl 
    } = req.body ?? {};
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (lensCategory !== undefined) updateData.lensCategory = lensCategory;
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
    if (sphRange !== undefined) updateData.sphRange = sphRange;
    if (cylRange !== undefined) updateData.cylRange = cylRange;
    if (addRange !== undefined) updateData.addRange = addRange;
    if (leftRegion !== undefined) updateData.leftRegion = leftRegion;
    if (rightRegion !== undefined) updateData.rightRegion = rightRegion;
    if (material !== undefined) updateData.material = material;
    if (price !== undefined) updateData.price = Number(price);
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (minStock !== undefined) updateData.minStock = Number(minStock);
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData
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


