import asyncHandler from 'express-async-handler';
import dayjs from 'dayjs';
import { Appointment } from '../models/Appointment.js';
import { User } from '../models/User.js';
import { sendEmail } from '../services/emailService.js';

const formatTimeToMinutes = (time) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

const hasOverlap = (appointments, startTime, endTime) => {
  const startMinutes = formatTimeToMinutes(startTime);
  const endMinutes = formatTimeToMinutes(endTime);

  return appointments.some((appt) => {
    const apptStart = formatTimeToMinutes(appt.startTime);
    const apptEnd = formatTimeToMinutes(appt.endTime);
    return Math.max(startMinutes, apptStart) < Math.min(endMinutes, apptEnd);
  });
};

export const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, startTime, endTime, reason, patientId } = req.body;

  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    res.status(400);
    throw new Error('Invalid doctor');
  }

  if (req.user.role !== 'patient' && !patientId) {
    res.status(400);
    throw new Error('Patient is required');
  }

  const dayStart = dayjs(date).startOf('day').toDate();
  const dayEnd = dayjs(date).endOf('day').toDate();

  const doctorAppointments = await Appointment.find({
    doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $ne: 'cancelled' },
  });

  if (hasOverlap(doctorAppointments, startTime, endTime)) {
    res.status(409);
    throw new Error('Time slot already booked');
  }

  const appointment = await Appointment.create({
    patientId: req.user.role === 'patient' ? req.user._id : patientId,
    doctorId,
    date,
    startTime,
    endTime,
    reason,
    status: 'pending',
    createdBy: req.user._id,
  });

  await sendEmail({
    to: doctor.email,
    subject: 'New appointment request',
    text: `Patient requested appointment on ${date} at ${startTime}`,
  });

  res.status(201).json({ appointment });
});

export const listAppointments = asyncHandler(async (req, res) => {
  const { role, _id: userId } = req.user;
  const { status, doctorId, patientId } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (doctorId) filter.doctorId = doctorId;
  if (patientId) filter.patientId = patientId;

  if (role === 'patient') {
    filter.patientId = userId;
  } else if (role === 'doctor') {
    filter.doctorId = userId;
  }

  const appointments = await Appointment.find(filter)
    .sort({ date: 1, startTime: 1 })
    .populate('doctorId', 'name specialization email')
    .populate('patientId', 'name email medicalHistory phone dob gender');

  res.json({ appointments });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, newDate, newStartTime, newEndTime, notes } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (['doctor', 'admin'].includes(req.user.role) && !appointment.doctorId.equals(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify this appointment');
  }

  if (status) {
    appointment.status = status;
  }

  if (newDate || newStartTime || newEndTime) {
    const date = newDate || appointment.date;
    const startTime = newStartTime || appointment.startTime;
    const endTime = newEndTime || appointment.endTime;

    const dayStart = dayjs(date).startOf('day').toDate();
    const dayEnd = dayjs(date).endOf('day').toDate();

    const doctorAppointments = await Appointment.find({
      _id: { $ne: appointment._id },
      doctorId: appointment.doctorId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'cancelled' },
    });

    if (hasOverlap(doctorAppointments, startTime, endTime)) {
      res.status(409);
      throw new Error('Time slot already booked');
    }

    appointment.date = date;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
  }

  if (typeof notes !== 'undefined') {
    appointment.notes = notes;
  }

  await appointment.save();
  await appointment.populate([
    { path: 'patientId', select: 'email name' },
    { path: 'doctorId', select: 'email name' },
  ]);

  await sendEmail({
    to: req.user.role === 'doctor'
      ? appointment.patientId.email
      : appointment.doctorId.email,
    subject: `Appointment ${appointment.status}`,
    text: `Appointment updated to ${appointment.status}`,
  });

  res.json({ appointment });
});

export const getAnalytics = asyncHandler(async (_req, res) => {
  const pipeline = [
    {
      $group: {
        _id: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          status: '$status',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.day',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ];

  const stats = await Appointment.aggregate(pipeline);
  res.json({ stats });
});
