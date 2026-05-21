import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    ok: true,
    service: 'xpayout-callback-proxy-nextjs-standalone',
    targetConfigured: Boolean(process.env.CONNECT_CALLBACK_URL),
    time: new Date().toISOString()
  });
}
