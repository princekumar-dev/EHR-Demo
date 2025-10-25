#!/usr/bin/env node
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Appointment } from '../src/models/Appointment.js';
import { Prescription } from '../src/models/Prescription.js';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const seed = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI not defined');
  }
  await connectDatabase(mongoUri);

  await Promise.all([
    Appointment.deleteMany({}),
    Prescription.deleteMany({}),
    User.deleteMany({}),
  ]);

  const password = await bcrypt.hash('Password123', 10);

  const admin = await User.create({
    name: 'Alice Admin',
    email: 'admin@ehr.demo',
    passwordHash: password,
    role: 'admin',
  });

  const doctors = await User.create([
    {
      name: 'Dr. James Wilson',
      email: 'j.wilson@ehr.demo',
      passwordHash: password,
      role: 'doctor',
      specialization: 'Cardiology',
        licenseNumber: 'MD-87921',
      availabilitySlots: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 3, startTime: '13:00', endTime: '17:00' },
      ],
    },
    {
      name: 'Dr. Lisa Cuddy',
      email: 'l.cuddy@ehr.demo',
      passwordHash: password,
      role: 'doctor',
      specialization: 'Endocrinology',
        licenseNumber: 'MD-44512',
      availabilitySlots: [
        { dayOfWeek: 2, startTime: '10:00', endTime: '15:00' },
      ],
    },
  ]);

  const patients = await User.create([
    {
      name: 'John Doe',
      email: 'john.doe@ehr.demo',
      passwordHash: password,
      role: 'patient',
      phone: '+1-555-0001',
      dob: new Date('1990-05-01'),
      gender: 'male',
      address: '123 Main Street',
      medicalHistory: 'Hypertension',
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@ehr.demo',
      passwordHash: password,
      role: 'patient',
      phone: '+1-555-0002',
      dob: new Date('1985-11-20'),
      gender: 'female',
      address: '456 Oak Avenue',
      medicalHistory: 'Diabetes',
    },
  ]);

  const [doctor1] = doctors;
  const [patient1] = patients;

  const appointment = await Appointment.create({
    doctorId: doctor1._id,
    patientId: patient1._id,
    date: new Date(),
    startTime: '10:00',
    endTime: '10:30',
    status: 'confirmed',
    reason: 'Regular check-up',
    createdBy: patient1._id,
  });

  await Prescription.create({
    appointmentId: appointment._id,
    doctorId: doctor1._id,
    patientId: patient1._id,
    medications: [
      {
        name: 'Atorvastatin',
        dose: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take with dinner',
      },
    ],
    notes: 'Monitor cholesterol levels',
  });

  console.log('Seed data created');
  await mongoose.connection.close();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
