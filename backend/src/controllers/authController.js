import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { generateToken } from '../utils/token.js';

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const { name, email, password, role, phone, dob, gender, address, specialization } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    phone,
    dob,
    gender,
    address,
    specialization,
    createdBy: req.user?._id,
  });

  const token = generateToken(user);
  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user);
  res.json({ user, token });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = (({
    name,
    phone,
    dob,
    gender,
    address,
    medicalHistory,
    specialization,
    availabilitySlots,
  }) => ({
    name,
    phone,
    dob,
    gender,
    address,
    medicalHistory,
    specialization,
    availabilitySlots,
  }))(req.body);

  Object.keys(updates).forEach((key) => {
    if (typeof updates[key] === 'undefined') {
      delete updates[key];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select('-passwordHash');

  res.json({ user });
});
