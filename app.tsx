import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Bắt buộc để chạy trên Cloudflare

export async function POST(req: NextRequest) {
  const { type, content } = await req.json();
  const db = (process.env as any).DB; // DB là binding từ Cloudflare

  try {
    await db.prepare(
      "INSERT INTO qr_history (type, content) VALUES (?, ?)"
    ).bind(type, content).run();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
