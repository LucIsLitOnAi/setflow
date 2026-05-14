import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phoneNumber, downloadLink } = await request.json();

    if (!phoneNumber || !downloadLink) {
      return NextResponse.json({ error: 'Missing phoneNumber or downloadLink' }, { status: 400 });
    }

    // Mock Twilio SMS integration
    console.log(`\n================= MOCK SMS DISPATCH =================`);
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: Your Mosaic AI Print Kit is ready! Download it here: ${downloadLink}`);
    console.log(`=====================================================\n`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, message: `SMS successfully sent to ${phoneNumber}` });
  } catch (err: unknown) {
    console.error('[SMS API] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
