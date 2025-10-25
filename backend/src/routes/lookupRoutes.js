import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { listDoctors } from '../controllers/lookupController.js';

const router = express.Router();

router.use(authenticate);
router.get('/doctors', listDoctors);

export default router;
