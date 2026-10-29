import Razorpay from "razorpay";

let razorpayInstance = null;

export function getRazorpayClient() {
  if (!razorpayInstance) {
    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      throw new Error("Razorpay API Keys are not configured. Check NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    }

    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return razorpayInstance;
}

export default getRazorpayClient;

