const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true },
    frequency: { type: String, trim: true },
    duration: { type: String, trim: true },
    instructions: { type: String, trim: true },
    quantity: Number,
  },
  { _id: false }
);

const vitalSchema = new mongoose.Schema(
  {
    bp: String,
    pulse: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    spo2: Number,
    rbs: Number,
  },
  { _id: false }
);

const consultationSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    tokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      required: true,
      unique: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    chiefComplaint: String,
    symptoms: [String],
    diagnosis: String,
    differentialDiagnosis: [String],
    vitals: vitalSchema,
    medicines: [medicineSchema],
    investigations: [String],
    notes: String,
    advice: String,
    followUpDate: Date,
    followUpNotes: String,
    isSigned: { type: Boolean, default: false },
    signedAt: Date,
  },
  { timestamps: true }
);

consultationSchema.index({ clinicId: 1, patientId: 1 });
consultationSchema.index({ clinicId: 1, doctorId: 1, date: 1 });

module.exports = mongoose.model('Consultation', consultationSchema);
