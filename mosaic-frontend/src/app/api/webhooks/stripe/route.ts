import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_123', {
  // @ts-expect-error Stripe SDK version mismatch local vs types
  apiVersion: '2025-02-24.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock_123';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    // MOCK MODE: Since we are mocking Stripe locally without the CLI, we will just parse the JSON
    // instead of verifying the signature. In production, signature verification is MANDATORY.

    let event;

    if (process.env.NODE_ENV === 'production') {
      if (!sig) return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } else {
      event = JSON.parse(body);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log(`[Stripe Webhook] Payment successful for session ${session.id}!`);
      console.log(`[Stripe Webhook] Unlocking Download/ZIP for Job: ${session.metadata?.jobId}`);

      // Here we would normally update our Database:
      // db.updateJobStatus(session.metadata.jobId, 'paid')
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Stripe Webhook] Error: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }
}
