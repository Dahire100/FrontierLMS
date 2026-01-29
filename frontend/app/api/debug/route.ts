import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Debug endpoint',
    timestamp: new Date().toISOString(),
  });
}
