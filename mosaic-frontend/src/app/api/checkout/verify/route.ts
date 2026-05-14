import { NextResponse } from 'next/server';
import { mockDb } from '../db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  const job = mockDb[jobId];

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (!job.isPaid) {
    return NextResponse.json({ error: 'Payment not completed' }, { status: 402 });
  }

  return NextResponse.json({ zipUrl: job.zipUrl });
}
