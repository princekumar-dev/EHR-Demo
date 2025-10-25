import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
  getAnalytics,
} from '../controllers/appointmentController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorizeRoles('patient', 'doctor', 'admin'), createAppointment);
router.get('/', listAppointments);
router.patch('/:id/status', authorizeRoles('doctor', 'admin'), updateAppointmentStatus);
router.get('/analytics/summary', authorizeRoles('admin'), getAnalytics);

export default router;
