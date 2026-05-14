import { NextResponse } from 'next/server';

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('[Next API/Style] Forwarding styling request to Python Engine...');

    const formData = new FormData();
    formData.append('vibe', body.quiz?.vibe || '');
    formData.append('recipient', body.quiz?.recipient || '');
    formData.append('occasion', body.quiz?.occasion || '');
    formData.append('mainImageId', body.mainImageId || '');
    formData.append('tileImageIds', body.tileImageIds?.join(',') || '');

    // Proxy the request to the Python Engine
    const proxyRes = await fetch(`${PYTHON_ENGINE_URL}/api/style`, {
      method: 'POST',
      body: formData,
    });

    if (!proxyRes.ok) {
      throw new Error(`Python Engine responded with ${proxyRes.status}`);
    }

    const data = await proxyRes.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Next API/Style] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
