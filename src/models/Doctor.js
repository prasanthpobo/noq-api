const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
    maxTokens: { type: Number, default: 20 },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    isAvailable: { type: Boolean, default: true },
    slots: [timeSlotSchema],
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    mobile: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    qualification: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },
    experience: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    availability: [availabilitySchema],
    photo: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

doctorSchema.index({ clinicId: 1, isActive: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
