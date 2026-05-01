import mongoose, { Schema } from 'mongoose';

const IncidentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
  reporter_name: { type: String, required: true },
  latest_update: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.Incident || mongoose.model('Incident', IncidentSchema);
