import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Incident from '@/models/Incident';

export async function GET(_req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const incident = await Incident.findById(id);
    if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(incident);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
