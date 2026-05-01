import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import IncidentUpdate from '@/models/IncidentUpdate';
import Incident from '@/models/Incident';

export async function GET(_req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const updates = await IncidentUpdate.find({ incident_id: id }).sort({ created_at: 1 });
    return NextResponse.json(updates);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const body = await req.json();
    const { message, author_name } = body;
    if (!message || !author_name) {
      return NextResponse.json({ error: 'Message and author required' }, { status: 400 });
    }
    const update = await IncidentUpdate.create({ incident_id: id, message, author_name });
    await Incident.findByIdAndUpdate(id, {
      latest_update: message,
      updated_at: new Date(),
    });

    if (global.io) {
      global.io.to(`incident-${id}`).emit('new-update', update);
      global.io.emit('incident-updated', { incident_id: id });
    }

    return NextResponse.json(update, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
