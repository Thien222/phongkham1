import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// Get refractions
router.get('/', async (req, res, next) => {
  try {
    const patientId = String(req.query.patientId ?? '');
    const data = await prisma.refraction.findMany({
      where: patientId ? { patientId } : undefined,
      include: { patient: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Get refraction by ID
router.get('/:id', async (req, res, next) => {
  try {
    const refraction = await prisma.refraction.findUnique({
      where: { id: req.params.id },
      include: { patient: true }
    });
    if (!refraction) {
      return res.status(404).json({ error: 'Refraction not found' });
    }
    res.json(refraction);
  } catch (err) {
    next(err);
  }
});

// Create refraction
router.post('/', async (req, res, next) => {
  try {
    const { patientId, odSph, odCyl, odAxis, odVa, osSph, osCyl, osAxis, osVa, examDate, notes } = req.body ?? {};
    const created = await prisma.refraction.create({
      data: {
        patientId,
        odSph: odSph ?? null,
        odCyl: odCyl ?? null,
        odAxis: odAxis ?? null,
        odVa: odVa ?? null,
        osSph: osSph ?? null,
        osCyl: osCyl ?? null,
        osAxis: osAxis ?? null,
        osVa: osVa ?? null,
        examDate: examDate ? new Date(examDate) : new Date(),
        notes: notes ?? null
      },
      include: { patient: true }
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Update refraction
router.put('/:id', async (req, res, next) => {
  try {
    const { odSph, odCyl, odAxis, odVa, osSph, osCyl, osAxis, osVa, examDate, notes } = req.body ?? {};
    const updated = await prisma.refraction.update({
      where: { id: req.params.id },
      data: {
        odSph, odCyl, odAxis, odVa, osSph, osCyl, osAxis, osVa,
        examDate: examDate ? new Date(examDate) : undefined,
        notes
      },
      include: { patient: true }
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete refraction
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.refraction.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;


