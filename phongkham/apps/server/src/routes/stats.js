import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// Get dashboard statistics
router.get('/dashboard', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    // Total patients
    const totalPatients = await prisma.patient.count();
    
    // Total products
    const totalProducts = await prisma.product.count();
    
    // Refractions today
    const refractionsToday = await prisma.refraction.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    // Revenue this month
    const invoicesThisMonth = await prisma.invoice.findMany({
      where: {
        status: 'PAID',
        createdAt: {
          gte: firstDayOfMonth,
          lt: firstDayOfNextMonth
        }
      },
      select: { total: true }
    });
    const revenueThisMonth = invoicesThisMonth.reduce((sum, inv) => sum + inv.total, 0);
    
    // Recent activities
    const recentPatients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, fullName: true, code: true, createdAt: true }
    });
    
    const recentRefractions = await prisma.refraction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { patient: { select: { fullName: true, code: true } } }
    });
    
    res.json({
      totalPatients,
      totalProducts,
      refractionsToday,
      revenueThisMonth,
      recentPatients,
      recentRefractions
    });
  } catch (err) {
    next(err);
  }
});

// Get monthly revenue chart data
router.get('/revenue/monthly', async (req, res, next) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const monthlyData = [];
    
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 1);
      
      const invoices = await prisma.invoice.findMany({
        where: {
          status: 'PAID',
          createdAt: {
            gte: firstDay,
            lt: lastDay
          }
        },
        select: { total: true }
      });
      
      const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
      monthlyData.push({ month: month + 1, total });
    }
    
    res.json(monthlyData);
  } catch (err) {
    next(err);
  }
});

// Get product category distribution
router.get('/products/categories', async (req, res, next) => {
  try {
    const products = await prisma.product.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { quantity: true }
    });
    
    res.json(products.map(p => ({
      category: p.category,
      count: p._count.id,
      totalQuantity: p._sum.quantity || 0
    })));
  } catch (err) {
    next(err);
  }
});

export default router;

