import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  createPrescription,
  listPrescriptions,
  getPrescriptionById,
  downloadPrescriptionPdf,
} from '../controllers/prescriptionController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listPrescriptions);
router.get('/:id', getPrescriptionById);
router.get('/:id/pdf', downloadPrescriptionPdf);
router.post('/', authorizeRoles('doctor', 'admin'), createPrescription);

export default router;
