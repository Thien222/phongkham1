import { Router } from 'express';
import prisma from '../db.js';

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
    const {
      patientId,
      // Skiascopy (khúc xạ khách quan)
      skiasOdSph, skiasOdCyl, skiasOdAxis,
      skiasOsSph, skiasOsCyl, skiasOsAxis,
      hasCycloplegia,
      // Subjective (khúc xạ chủ quan)
      subjOdSph, subjOdCyl, subjOdAxis, subjOdVa,
      subjOsSph, subjOsCyl, subjOsAxis, subjOsVa,
      // Prescription (kính điều chỉnh)
      odSph, odCyl, odAxis, odVa,
      osSph, osCyl, osAxis, osVa,
      // Additional fields
      odAdd, osAdd, pd, lensType,
      examDate, notes
    } = req.body ?? {};

    const created = await prisma.refraction.create({
      data: {
        patientId,
        // Skiascopy
        skiasOdSph: skiasOdSph ?? null,
        skiasOdCyl: skiasOdCyl ?? null,
        skiasOdAxis: skiasOdAxis ?? null,
        skiasOsSph: skiasOsSph ?? null,
        skiasOsCyl: skiasOsCyl ?? null,
        skiasOsAxis: skiasOsAxis ?? null,
        hasCycloplegia: hasCycloplegia ?? false,
        // Subjective
        subjOdSph: subjOdSph ?? null,
        subjOdCyl: subjOdCyl ?? null,
        subjOdAxis: subjOdAxis ?? null,
        subjOdVa: subjOdVa ?? null,
        subjOsSph: subjOsSph ?? null,
        subjOsCyl: subjOsCyl ?? null,
        subjOsAxis: subjOsAxis ?? null,
        subjOsVa: subjOsVa ?? null,
        // Prescription
        odSph: odSph ?? null,
        odCyl: odCyl ?? null,
        odAxis: odAxis ?? null,
        odVa: odVa ?? null,
        osSph: osSph ?? null,
        osCyl: osCyl ?? null,
        osAxis: osAxis ?? null,
        osVa: osVa ?? null,
        // Additional
        odAdd: odAdd ?? null,
        osAdd: osAdd ?? null,
        pd: pd ?? null,
        lensType: lensType ?? null,
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
    const {
      // Skiascopy
      skiasOdSph, skiasOdCyl, skiasOdAxis,
      skiasOsSph, skiasOsCyl, skiasOsAxis,
      hasCycloplegia,
      // Subjective
      subjOdSph, subjOdCyl, subjOdAxis, subjOdVa,
      subjOsSph, subjOsCyl, subjOsAxis, subjOsVa,
      // Prescription
      odSph, odCyl, odAxis, odVa,
      osSph, osCyl, osAxis, osVa,
      // Additional
      odAdd, osAdd, pd, lensType,
      examDate, notes
    } = req.body ?? {};

    const updateData = {};

    // Skiascopy
    if (skiasOdSph !== undefined) updateData.skiasOdSph = skiasOdSph;
    if (skiasOdCyl !== undefined) updateData.skiasOdCyl = skiasOdCyl;
    if (skiasOdAxis !== undefined) updateData.skiasOdAxis = skiasOdAxis;
    if (skiasOsSph !== undefined) updateData.skiasOsSph = skiasOsSph;
    if (skiasOsCyl !== undefined) updateData.skiasOsCyl = skiasOsCyl;
    if (skiasOsAxis !== undefined) updateData.skiasOsAxis = skiasOsAxis;
    if (hasCycloplegia !== undefined) updateData.hasCycloplegia = hasCycloplegia;

    // Subjective
    if (subjOdSph !== undefined) updateData.subjOdSph = subjOdSph;
    if (subjOdCyl !== undefined) updateData.subjOdCyl = subjOdCyl;
    if (subjOdAxis !== undefined) updateData.subjOdAxis = subjOdAxis;
    if (subjOdVa !== undefined) updateData.subjOdVa = subjOdVa;
    if (subjOsSph !== undefined) updateData.subjOsSph = subjOsSph;
    if (subjOsCyl !== undefined) updateData.subjOsCyl = subjOsCyl;
    if (subjOsAxis !== undefined) updateData.subjOsAxis = subjOsAxis;
    if (subjOsVa !== undefined) updateData.subjOsVa = subjOsVa;

    // Prescription
    if (odSph !== undefined) updateData.odSph = odSph;
    if (odCyl !== undefined) updateData.odCyl = odCyl;
    if (odAxis !== undefined) updateData.odAxis = odAxis;
    if (odVa !== undefined) updateData.odVa = odVa;
    if (osSph !== undefined) updateData.osSph = osSph;
    if (osCyl !== undefined) updateData.osCyl = osCyl;
    if (osAxis !== undefined) updateData.osAxis = osAxis;
    if (osVa !== undefined) updateData.osVa = osVa;

    // Additional
    if (odAdd !== undefined) updateData.odAdd = odAdd;
    if (osAdd !== undefined) updateData.osAdd = osAdd;
    if (pd !== undefined) updateData.pd = pd;
    if (lensType !== undefined) updateData.lensType = lensType;
    if (examDate !== undefined) updateData.examDate = examDate ? new Date(examDate) : null;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.refraction.update({
      where: { id: req.params.id },
      data: updateData,
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


