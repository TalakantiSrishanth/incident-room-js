import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Incident from '@/models/Incident';
import IncidentUpdate from '@/models/IncidentUpdate';
import AIResult from '@/models/AIResult';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function ruleBasedFallback(type, incident, updates) {
  if (type === 'summary') {
    return `Incident "${incident.title}" reported by ${incident.reporter_name} with ${incident.priority} priority. Current status: ${incident.status}. ${updates.length} update(s) posted. Latest: ${incident.latest_update || 'No updates yet.'}`;
  }

  if (type === 'next_actions') {
    const actions = [];
    if (incident.status === 'open') actions.push('Assign an owner to investigate immediately.');
    if (incident.priority === 'critical' || incident.priority === 'high') actions.push('Notify stakeholders and leadership.');
    actions.push('Gather logs and reproduce the issue.');
    actions.push('Post regular updates every 15 minutes.');
    if (incident.status !== 'resolved') actions.push('Prepare a rollback or hotfix plan.');

    return actions.map((a, i) => `${i + 1}. ${a}`).join('\n');
  }

  return `Priority "${incident.priority}" appears appropriate given the current description. Reassess if scope expands.`;
}

export async function POST(req, { params }) {
  const { id } =await params;

  try {
    await connectDB();

    const { type } = await req.json();
    const validTypes = ['summary', 'next_actions', 'priority_review'];

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updates = await IncidentUpdate.find({ incident_id: id }).sort({ created_at: 1 });

    const updatesText =
      updates.map((u) => `[${u.author_name}]: ${u.message}`).join('\n') ||
      'No updates yet.';

    let result_text = '';

    try {
      const prompts = {
        summary: `You are an incident management assistant. Summarize this incident concisely in 3-4 sentences for an operations team.

Incident: ${incident.title}
Description: ${incident.description}
Priority: ${incident.priority}
Status: ${incident.status}
Reporter: ${incident.reporter_name}
Updates:
${updatesText}`,

        next_actions: `You are an incident management assistant. Based on this incident, provide 4-6 specific, actionable next steps the team should take immediately.

Incident: ${incident.title}
Description: ${incident.description}
Priority: ${incident.priority}
Status: ${incident.status}
Updates:
${updatesText}

Format as a numbered list.`,

        priority_review: `You are an incident management assistant. Review whether the current priority level (${incident.priority}) is appropriate for this incident. Provide a brief recommendation.

Incident: ${incident.title}
Description: ${incident.description}
Status: ${incident.status}
Updates:
${updatesText}`,
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompts[type],
      });

      result_text = response.text;
    } catch (aiErr) {
      console.warn('Gemini failed, using fallback:', aiErr);
      result_text = ruleBasedFallback(type, incident, updates);
    }

    const aiResult = await AIResult.create({
      incident_id: id,
      type,
      result_text,
    });

    return NextResponse.json(aiResult, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(_req, { params }) {
  const { id } =await params;

  try {
    await connectDB();

    const results = await AIResult.find({ incident_id: id })
      .sort({ created_at: -1 })
      .limit(10);

    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}