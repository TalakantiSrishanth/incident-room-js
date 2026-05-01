import { NextResponse } from 'next/server';

export async function GET() {
  // Socket.IO is initialized via custom server
  return NextResponse.json({ status: 'Socket.IO handled by custom server' });
}
