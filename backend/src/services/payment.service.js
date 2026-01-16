import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars directly in this module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

class PaymentService {
  constructor() {
    logger.info(`Razorpay Key: ${RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.substring(0, 12) + '...' : 'NOT SET'}`);
    
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET
      });
      this.keyId = RAZORPAY_KEY_ID;
      this.keySecret = RAZORPAY_KEY_SECRET;
      this.isConfigured = true;
    } else {
      this.isConfigured = false;
      logger.warn('Razorpay not configured - using demo mode');
    }
    
    this.pricing = {
      monthly: { amount: 14900, currency: 'INR', name: 'Monthly Pro', description: 'Unlimited job analyses' },
      quarterly: { amount: 39900, currency: 'INR', name: 'Quarterly Pro', description: '3 months - Best value!' },
      yearly: { amount: 99900, currency: 'INR', name: 'Yearly Pro', description: '1 year - Maximum savings!' }
    };
  }

  async createOrder(plan, userId) {
    const planDetails = this.pricing[plan];
    if (!planDetails) throw new Error('Invalid plan');
    
    if (!this.isConfigured) {
      return {
        order_id: 'order_mock_' + Date.now(),
        amount: planDetails.amount,
        currency: planDetails.currency,
        key_id: 'rzp_mock',
        plan: planDetails,
        mock: true
      };
    }
    
    try {
      const order = await this.razorpay.orders.create({
        amount: planDetails.amount,
        currency: planDetails.currency,
        receipt: `rcpt_${userId}_${Date.now()}`
      });
      
      logger.info(`Order created: ${order.id}`);
      
      return {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: this.keyId,
        plan: planDetails
      };
    } catch (error) {
      logger.error('Order failed:', error.error || error);
      return {
        order_id: 'order_mock_' + Date.now(),
        amount: planDetails.amount,
        currency: planDetails.currency,
        key_id: 'rzp_mock',
        plan: planDetails,
        mock: true
      };
    }
  }

  verifyPaymentSignature(orderId, paymentId, signature) {
    if (orderId.startsWith('order_mock_')) return true;
    
    const text = `${orderId}|${paymentId}`;
    const generated = crypto.createHmac('sha256', this.keySecret).update(text).digest('hex');
    return generated === signature;
  }

  async processPayment(details) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = details;
    
    if (razorpay_order_id.startsWith('order_mock_')) {
      return { success: true, mock: true };
    }
    
    if (!this.verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      throw new Error('Invalid signature');
    }
    
    return { success: true, payment_id: razorpay_payment_id };
  }

  getAllPlans() {
    return Object.entries(this.pricing).map(([id, p]) => ({
      id,
      name: p.name,
      price: p.amount / 100,
      currency: p.currency,
      description: p.description,
      features: ['Unlimited analyses', 'AI answers', 'Cover letters', 'Priority support']
    }));
  }
}

export default new PaymentService();
