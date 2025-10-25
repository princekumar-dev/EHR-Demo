import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { listUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.use(authenticate, authorizeRoles('admin'));

router.get('/', listUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
