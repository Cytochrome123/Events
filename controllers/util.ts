import axios from 'axios';

// Set Paystack API base URL and secret key
const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

// Initialize payment function
export const initializePayment = async (email: string, amount: number, reference: string) => {
  try {
    // Make request to Paystack initialize transaction API endpoint
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount,
        reference,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

// Verify payment function
export const verifyPayment = async (reference: string) => {
  try {
    // Make request to Paystack verify transaction API endpoint
    const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
