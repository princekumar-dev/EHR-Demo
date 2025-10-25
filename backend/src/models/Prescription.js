import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dose: String,
    frequency: String,
    duration: String,
    instructions: String,
  },
  { _id: false },
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medications: [medicationSchema],
    notes: String,
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
