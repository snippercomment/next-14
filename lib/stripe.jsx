// stripe.jsx
// Sử dụng khóa API bí mật cho server-side (Node.js)
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;

