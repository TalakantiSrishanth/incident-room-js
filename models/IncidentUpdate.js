import mongoose, { Schema } from 'mongoose';

const IncidentUpdateSchema = new Schema({
  incident_id: { type: String, required: true, index: true },
  message: { type: String, required: true },
  author_name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.IncidentUpdate || mongoose.model('IncidentUpdate', IncidentUpdateSchema);
