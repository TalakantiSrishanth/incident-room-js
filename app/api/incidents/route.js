import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Incident from '@/models/Incident';

export async function GET() {
  try {
    await connectDB();
    const incidents = await Incident.find().sort({ updated_at: -1 });
    return NextResponse.json(incidents);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, description, priority, reporter_name } = body;
    if (!title || !description || !priority || !reporter_name) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }
    const incident = await Incident.create({ title, description, priority, reporter_name });
    return NextResponse.json(incident, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
