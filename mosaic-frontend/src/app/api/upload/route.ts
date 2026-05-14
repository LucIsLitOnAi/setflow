import { NextResponse } from 'next/server';

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('[Next API/Upload] Forwarding file to Python Engine...');

    // Proxy the request to the Python Engine
    const proxyRes = await fetch(`${PYTHON_ENGINE_URL}/api/upload`, {
      method: 'POST',
      body: formData, // FormData containing the file
    });

    if (!proxyRes.ok) {
      throw new Error(`Python Engine responded with ${proxyRes.status}`);
    }

    const data = await proxyRes.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Next API/Upload] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
