const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, required: true, enum: ['Residential', 'Commercial', 'Interiors', 'Concept'] },
  location: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 800 },
  imageUrl: { type: String, trim: true, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, trim: true, lowercase: true },
  projectType: { type: String, required: true },
  budget: { type: String, required: true },
  timeline: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true, maxlength: 1200 },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  Project: mongoose.model('Project', projectSchema),
  Inquiry: mongoose.model('Inquiry', inquirySchema)
};
