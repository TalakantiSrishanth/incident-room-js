import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Incident from '@/models/Incident';

export async function PATCH(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const { status } = await req.json();
    const valid = ['open', 'investigating', 'resolved'];
    if (!valid.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const incident = await Incident.findByIdAndUpdate(
      id,
      { status, updated_at: new Date() },
      { new: true }
    );
    if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (global.io) {
      global.io.emit('incident-status-changed', { incident_id: id, status });
    }

    return NextResponse.json(incident);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
