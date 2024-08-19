import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Handle file upload logic here
  // ...

  return NextResponse.json({ message: 'Upload successful' });
}

export async function GET(request: NextRequest) {
  // Handle GET requests if needed
  return NextResponse.json({ message: 'Upload endpoint is working' });
}
