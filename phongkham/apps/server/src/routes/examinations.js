import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// Get all examinations
router.get('/', async (req, res, next) => {
  try {
    const patientId = req.query.patientId;
    const examinations = await prisma.examination.findMany({
      where: patientId ? { patientId } : undefined,
      include: { patient: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(examinations);
  } catch (err) {
    next(err);
  }
});

// Get examination by ID
router.get('/:id', async (req, res, next) => {
  try {
    const examination = await prisma.examination.findUnique({
      where: { id: req.params.id },
      include: { patient: true }
    });
    if (!examination) {
      return res.status(404).json({ error: 'Examination not found' });
    }
    res.json(examination);
  } catch (err) {
    next(err);
  }
});

// Create examination
router.post('/', async (req, res, next) => {
  try {
    const { patientId, symptoms, diagnosis, treatment, medications, examDate } = req.body ?? {};
    const created = await prisma.examination.create({
      data: {
        patientId,
        symptoms,
        diagnosis,
        treatment,
        medications,
        examDate: examDate ? new Date(examDate) : new Date()
      },
      include: { patient: true }
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Update examination
router.put('/:id', async (req, res, next) => {
  try {
    const { symptoms, diagnosis, treatment, medications, examDate } = req.body ?? {};
    const updated = await prisma.examination.update({
      where: { id: req.params.id },
      data: {
        symptoms,
        diagnosis,
        treatment,
        medications,
        examDate: examDate ? new Date(examDate) : undefined
      },
      include: { patient: true }
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete examination
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.examination.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;

