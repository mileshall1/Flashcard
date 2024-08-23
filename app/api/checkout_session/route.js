import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16', // Specify the API version you're using
});

const formatAmountForStripe = (amount) => Math.round(amount * 100);

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json(checkoutSession);
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req) {
  const origin = req.headers.get('origin');
  if (!origin) {
    return NextResponse.json({ error: "Origin header is missing" }, { status: 400 });
  }

  const params = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Pro Subscription',
          },
          unit_amount: formatAmountForStripe(10), // $10.00
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/result?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/result?session_id={CHECKOUT_SESSION_ID}`,
  };

  try {
    const checkoutSession = await stripe.checkout.sessions.create(params);
    return NextResponse.json(checkoutSession);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
