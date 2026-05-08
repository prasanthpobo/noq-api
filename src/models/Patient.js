const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    email: { type: String, lowercase: true, trim: true },
    dob: Date,
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    allergies: [String],
    chronicConditions: [String],
    emergencyContact: {
      name: String,
      mobile: String,
      relation: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

patientSchema.index({ clinicId: 1, mobile: 1 }, { unique: true });
patientSchema.index({ clinicId: 1, name: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
