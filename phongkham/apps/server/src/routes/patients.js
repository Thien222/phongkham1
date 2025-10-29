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
    const { fullName, phone, gender, birthDate, address, visitPurpose, visitStatus } = req.body ?? {};
    const count = await prisma.patient.count();
    const code = `BN${String(count + 1).padStart(12, '0')}`;
    const created = await prisma.patient.create({
      data: { 
        code, 
        fullName, 
        phone: phone || null, 
        gender, 
        birthDate: birthDate ? new Date(birthDate) : null, 
        address,
        visitPurpose: visitPurpose || 'both',
        visitStatus: visitStatus || 'waiting'
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
    const { fullName, phone, gender, birthDate, address, visitPurpose, visitStatus } = req.body ?? {};
    const updated = await prisma.patient.update({
      where: { id: req.params.id },
      data: { 
        fullName, 
        phone, 
        gender, 
        birthDate: birthDate ? new Date(birthDate) : null, 
        address,
        visitPurpose,
        visitStatus
      }
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


