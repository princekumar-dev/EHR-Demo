import asyncHandler from 'express-async-handler';
import { User } from '../models/User.js';

export const listDoctors = asyncHandler(async (_req, res) => {
  const doctors = await User.find({ role: 'doctor' })
    .select('name email specialization availabilitySlots')
    .sort({ name: 1 });
  res.json({ doctors });
});
