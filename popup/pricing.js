// Pricing Page JavaScript

const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  // Close button
  document.getElementById('closeBtn')?.addEventListener('click', () => {
    window.close();
  });

  // Plan buttons
  document.querySelectorAll('.btn[data-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      initPayment(plan);
    });
  });
});

async function initPayment(plan) {
  const btn = document.querySelector(`.btn[data-plan="${plan}"]`);
  const originalText = btn.textContent;
  
  try {
    btn.textContent = 'Processing...';
    btn.disabled = true;

    // Create order
    const response = await fetch(`${API_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const data = await response.json();
    const order = data.order;

    // Razorpay options
    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Job Copilot Pro',
      description: order.plan.description,
      order_id: order.order_id,
      handler: async function(response) {
        await verifyPayment(response);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#6366f1'
      },
      modal: {
        ondismiss: function() {
          btn.textContent = originalText;
          btn.disabled = false;
        }
      }
    };

    const razorpay = new Razorpay(options);
    razorpay.open();

    btn.textContent = originalText;
    btn.disabled = false;

  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment initialization failed. Please try again.');
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

async function verifyPayment(paymentResponse) {
  try {
    const response = await fetch(`${API_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentResponse)
    });

    const data = await response.json();

    if (data.success) {
      await chrome.storage.local.set({
        user_tier: 'pro',
        payment_verified: true,
        payment_id: paymentResponse.razorpay_payment_id,
        upgraded_at: new Date().toISOString()
      });

      showSuccess();
      setTimeout(() => window.close(), 2000);
    } else {
      throw new Error('Verification failed');
    }

  } catch (error) {
    console.error('Verification error:', error);
    alert('Payment verification failed. Please contact support.');
  }
}

function showSuccess() {
  document.querySelector('.container').innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center;">
      <div style="width: 64px; height: 64px; background: rgba(34, 197, 94, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
          <path d="M20 6L9 17L4 12"/>
        </svg>
      </div>
      <h2 style="font-size: 24px; margin-bottom: 8px;">Welcome to Pro</h2>
      <p style="color: #a1a1aa; font-size: 14px;">Your pro features are now active</p>
    </div>
  `;
}
