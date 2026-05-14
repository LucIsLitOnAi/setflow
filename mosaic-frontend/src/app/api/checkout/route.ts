import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { mockDb } from './db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_123', {
  // @ts-expect-error Stripe SDK version mismatch local vs types
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    const { jobId, zipUrl } = await request.json();

    console.log(`[Stripe API] Saving job ${jobId} to DB as unpaid...`);
    mockDb[jobId] = { zipUrl, isPaid: false };

    console.log(`[Stripe API] Creating checkout session for Job: ${jobId}`);
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Simulate successful payment redirect for testing instead of hitting real Stripe without valid keys
    const mockCheckoutUrl = `${origin}/checkout/success?jobId=${jobId}&session_id=mock_session_${jobId}`;

    // We auto-mark it as paid here because we're mocking the checkout flow.
    // In reality, the webhook below does this.
    mockDb[jobId].isPaid = true;

    return NextResponse.json({ url: mockCheckoutUrl });

    /* Real implementation example (Uncomment when real keys are added):
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Mosaic AI Premium Print & Digital Kit',
            },
            unit_amount: 1999, // 19.99 EUR
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        jobId,
        zipUrl
      }
    });
    return NextResponse.json({ url: session.url });
    */

  } catch (err: unknown) {
    console.error('[Stripe API] Error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
