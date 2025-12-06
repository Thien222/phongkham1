import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// Get all patients with optional search
router.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim();
    const visitPurpose = req.query.visitPurpose; // examination | refraction | both
    const visitStatus = req.query.visitStatus; // waiting | in_progress | completed

    // Build where clause
    const whereClause = {};

    // Search filter
    if (q) {
      whereClause.OR = [
        { fullName: { contains: q } },
        { phone: { contains: q } },
        { code: { contains: q } }
      ];
    }

    // Visit purpose filter - if requesting "examination", show "examination" OR "both" OR "examination,refraction"
    if (visitPurpose === 'examination') {
      whereClause.OR = whereClause.OR || [];
      whereClause.OR.push(
        { visitPurpose: 'examination' },
        { visitPurpose: 'both' },
        { visitPurpose: { contains: 'examination' } }
      );
    } else if (visitPurpose === 'refraction') {
      whereClause.OR = whereClause.OR || [];
      whereClause.OR.push(
        { visitPurpose: 'refraction' },
        { visitPurpose: 'both' },
        { visitPurpose: { contains: 'refraction' } }
      );
    } else if (visitPurpose && visitPurpose !== 'all') {
      whereClause.visitPurpose = visitPurpose;
    }

    // Visit status filter
    if (visitStatus) {
      whereClause.visitStatus = visitStatus;
    }

    const patients = await prisma.patient.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        _count: {
          select: { refractions: true, examinations: true, invoices: true }
        }
      }
    });
    res.json(patients);
  } catch (err) {
    next(err);
  }
});

// Get patient by ID
router.get('/:id', async (req, res, next) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        refractions: { orderBy: { createdAt: 'desc' }, take: 10 },
        examinations: { orderBy: { createdAt: 'desc' }, take: 10 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    next(err);
  }
});

// Create new patient
router.post('/', async (req, res, next) => {
  try {
    const {
      fullName, phone, gender, birthDate, address, visitPurpose, visitStatus,
      initialVaOd, initialVaOs, hasGlasses, visitReason, notes
    } = req.body ?? {};


    // Generate patient code - find the highest existing code and increment
    const lastPatient = await prisma.patient.findFirst({
      orderBy: { code: 'desc' },
      select: { code: true }
    });

    let nextNumber = 1;
    if (lastPatient && lastPatient.code) {
      // Extract number from code (e.g., "BN000000000001" -> 1)
      const match = lastPatient.code.match(/BN(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const code = `BN${String(nextNumber).padStart(12, '0')}`;


    // Generate queue number (reset daily) - STT001, STT002, ...
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPatients = await prisma.patient.count({
      where: {
        createdAt: { gte: today }
      }
    });
    const queueNumber = `STT${String(todayPatients + 1).padStart(3, '0')}`;

    const created = await prisma.patient.create({
      data: {
        code,
        queueNumber,
        fullName,
        phone: phone || null,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        address,
        visitPurpose: visitPurpose || 'both',
        visitStatus: visitStatus || 'waiting',
        initialVaOd: initialVaOd || null,
        initialVaOs: initialVaOs || null,
        hasGlasses: hasGlasses || false,
        visitReason: visitReason || null,
        notes: notes || null
      }
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Update patient
router.put('/:id', async (req, res, next) => {
  try {
    const {
      fullName, phone, gender, birthDate, address, visitPurpose, visitStatus,
      initialVaOd, initialVaOs, hasGlasses, visitReason, notes
    } = req.body ?? {};

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (address !== undefined) updateData.address = address;
    if (visitPurpose !== undefined) updateData.visitPurpose = visitPurpose;
    if (visitStatus !== undefined) updateData.visitStatus = visitStatus;
    if (initialVaOd !== undefined) updateData.initialVaOd = initialVaOd;
    if (initialVaOs !== undefined) updateData.initialVaOs = initialVaOs;
    if (hasGlasses !== undefined) updateData.hasGlasses = hasGlasses;
    if (visitReason !== undefined) updateData.visitReason = visitReason;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.patient.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Add visit purpose to patient (PATCH)
router.patch('/:id/visit-purpose', async (req, res, next) => {
  try {
    const { addPurpose } = req.body ?? {}; // "examination" | "refraction"

    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    let currentPurpose = patient.visitPurpose;
    let newPurpose = currentPurpose;

    // If adding a purpose
    if (addPurpose) {
      if (currentPurpose === 'both' || currentPurpose === 'examination,refraction' || currentPurpose === 'refraction,examination') {
        // Already has both, no change
        newPurpose = 'examination,refraction';
      } else if (currentPurpose.includes(',')) {
        // Already has multiple, check if need to add
        const purposes = currentPurpose.split(',');
        if (!purposes.includes(addPurpose)) {
          purposes.push(addPurpose);
          newPurpose = purposes.sort().join(',');
        }
      } else if (currentPurpose === addPurpose) {
        // Already has this purpose
        newPurpose = currentPurpose;
      } else {
        // Add new purpose
        newPurpose = [currentPurpose, addPurpose].sort().join(',');
      }
    }

    const updated = await prisma.patient.update({
      where: { id: req.params.id },
      data: { visitPurpose: newPurpose }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete patient
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.patient.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;


