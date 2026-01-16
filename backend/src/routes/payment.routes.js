import express from 'express';
import paymentService from '../services/payment.service.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.get('/plans', (req, res) => {
  const plans = paymentService.getAllPlans();
  res.json({ plans });
});

router.get('/pricing', (req, res) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Upgrade to Pro - Job Copilot</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root { --bg: #0a0a0b; --card: #111113; --border: #27272a; --text: #fafafa; --muted: #a1a1aa; --accent: #6366f1; --success: #22c55e; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; padding: 40px 20px; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 48px; }
    .header h1 { font-size: 32px; margin-bottom: 8px; }
    .header p { color: var(--muted); }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 48px; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 32px 24px; text-align: center; position: relative; }
    .card.featured { border-color: var(--accent); }
    .badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--accent); color: white; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .plan-name { font-size: 14px; color: var(--muted); text-transform: uppercase; margin-bottom: 16px; }
    .price { font-size: 48px; font-weight: 700; }
    .price span { font-size: 18px; color: var(--muted); }
    .period { color: var(--muted); margin-bottom: 8px; }
    .savings { color: var(--success); font-size: 14px; margin-bottom: 24px; min-height: 20px; }
    .features { list-style: none; text-align: left; margin-bottom: 24px; }
    .features li { padding: 10px 0; border-bottom: 1px solid var(--border); color: var(--muted); font-size: 14px; }
    .btn { display: block; width: 100%; padding: 14px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
    .btn-primary { background: var(--accent); color: white; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--muted); }
    .btn-outline:hover { background: var(--card); color: var(--text); }
    .trust { display: flex; justify-content: center; gap: 40px; color: var(--muted); font-size: 14px; }
    .footer { text-align: center; margin-top: 32px; color: var(--muted); font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Upgrade to Pro</h1>
      <p>Unlock unlimited analyses and AI-powered features</p>
    </div>
    <div class="grid">
      <div class="card">
        <div class="plan-name">Monthly</div>
        <div class="price"><span>Rs.</span>149</div>
        <div class="period">/month</div>
        <div class="savings"></div>
        <ul class="features">
          <li>Unlimited job analyses</li>
          <li>AI interview answers</li>
          <li>Cover letter generation</li>
          <li>Priority support</li>
        </ul>
        <button class="btn btn-outline" onclick="checkout('monthly')">Select</button>
      </div>
      <div class="card featured">
        <div class="badge">Best Value</div>
        <div class="plan-name">Quarterly</div>
        <div class="price"><span>Rs.</span>399</div>
        <div class="period">/3 months</div>
        <div class="savings">Save 25%</div>
        <ul class="features">
          <li>Everything in Monthly</li>
          <li>3 months access</li>
          <li>Extended analytics</li>
          <li>Email support</li>
        </ul>
        <button class="btn btn-primary" onclick="checkout('quarterly')">Select</button>
      </div>
      <div class="card">
        <div class="plan-name">Yearly</div>
        <div class="price"><span>Rs.</span>999</div>
        <div class="period">/year</div>
        <div class="savings">Save 44%</div>
        <ul class="features">
          <li>Everything in Monthly</li>
          <li>12 months access</li>
          <li>VIP support</li>
          <li>Early feature access</li>
        </ul>
        <button class="btn btn-outline" onclick="checkout('yearly')">Select</button>
      </div>
    </div>
    <div class="trust">
      <span>Secure Payment</span>
      <span>Cancel Anytime</span>
      <span>Instant Access</span>
    </div>
    <div class="footer"><p>Prices in Indian Rupees. Powered by Razorpay.</p></div>
  </div>
  <script>function checkout(plan) { window.location.href = '/api/payment/checkout/' + plan; }</script>
</body>
</html>`;
  res.send(html);
});

router.get('/checkout/:plan', async (req, res) => {
  try {
    const { plan } = req.params;
    const order = await paymentService.createOrder(plan, 'user_' + Date.now());
    
    if (order.mock) {
      const mockHtml = `<!DOCTYPE html>
<html>
<head><title>Demo</title>
<style>body{font-family:sans-serif;background:#0a0a0b;color:#fafafa;min-height:100vh;display:flex;align-items:center;justify-content:center}.box{text-align:center;padding:40px}h1{color:#f59e0b;margin-bottom:16px}p{color:#a1a1aa;margin-bottom:24px}.btn{padding:12px 32px;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer}</style>
</head>
<body><div class="box"><h1>Demo Mode</h1><p>Click to simulate payment</p><button class="btn" onclick="simulate()">Simulate Payment</button></div>
<script>
async function simulate(){
  await fetch('/api/payment/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({razorpay_order_id:'${order.order_id}',razorpay_payment_id:'mock',razorpay_signature:'mock'})});
  document.body.innerHTML='<div class="box"><h1 style="color:#22c55e">Success!</h1><p style="color:#a1a1aa">Pro activated.</p><button class="btn" onclick="window.close()">Close</button></div>';
}
</script>
</body></html>`;
      return res.send(mockHtml);
    }
    
    const checkoutHtml = `<!DOCTYPE html>
<html>
<head><title>Payment</title>
<style>body{font-family:sans-serif;background:#0a0a0b;color:#fafafa;min-height:100vh;display:flex;align-items:center;justify-content:center}.box{text-align:center}.spinner{width:48px;height:48px;border:4px solid #27272a;border-top-color:#6366f1;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 24px}@keyframes spin{to{transform:rotate(360deg)}}.btn{margin-top:24px;padding:12px 32px;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer}</style>
</head>
<body>
<div class="box" id="loading"><div class="spinner"></div><h1>Opening Payment</h1><p style="color:#a1a1aa">Please wait...</p></div>
<div class="box" id="success" style="display:none"><h1 style="color:#22c55e">Payment Successful!</h1><p style="color:#a1a1aa">Pro account active.</p><button class="btn" onclick="window.close()">Close</button></div>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
var order=${JSON.stringify(order)};
var rzp=new Razorpay({key:order.key_id,amount:order.amount,currency:order.currency,name:'Job Copilot Pro',description:order.plan.description,order_id:order.order_id,
handler:async function(r){await fetch('/api/payment/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(r)});document.getElementById('loading').style.display='none';document.getElementById('success').style.display='block';},
modal:{ondismiss:function(){document.querySelector('.box').innerHTML='<h1>Cancelled</h1><p style="color:#a1a1aa">You can close this window.</p>';}},
theme:{color:'#6366f1'}});
rzp.open();
</script>
</body></html>`;
    res.send(checkoutHtml);
  } catch (error) {
    logger.error('Checkout error:', error);
    res.status(500).send('Payment failed');
  }
});

router.post('/create-order', async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan) return res.status(400).json({ error: 'Plan required' });
    const order = await paymentService.createOrder(plan, 'user_' + Date.now());
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const result = await paymentService.processPayment(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/webhook', (req, res) => {
  logger.info('Webhook received');
  res.json({ status: 'ok' });
});

export default router;
