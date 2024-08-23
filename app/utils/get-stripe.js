import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const getStripe = () => {
  return stripePromise;
};

export default getStripe;
