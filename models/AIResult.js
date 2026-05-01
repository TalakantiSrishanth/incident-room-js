import mongoose, { Schema } from 'mongoose';

const AIResultSchema = new Schema({
  incident_id: { type: String, required: true, index: true },
  type: { type: String, enum: ['summary', 'next_actions', 'priority_review'], required: true },
  result_text: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.AIResult || mongoose.model('AIResult', AIResultSchema);
