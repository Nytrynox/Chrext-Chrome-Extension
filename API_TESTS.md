# ✅ ALL Backend Endpoints - Correct Commands

## The Issue
You used `POST` but `/api/auth/me` is a `GET` endpoint!

```bash
# ❌ Wrong (404 error)
curl -X POST http://localhost:3000/api/auth/me

# ✅ Correct (returns user data)
curl http://localhost:3000/api/auth/me
```

---

## 🎯 Test All Endpoints (Copy-Paste These)

### 1. Health Check
```bash
curl http://localhost:3000/health
```
**Expected:** `{"status":"ok","timestamp":"..."}`

---

### 2. Get Current User (MVP - no auth required)
```bash
curl http://localhost:3000/api/auth/me
```
**Expected:** `{"user":{"id":"mvp_user","tier":"free","analyses_remaining":5}}`

---

### 3. Get Pricing Plans
```bash
curl http://localhost:3000/api/payment/plans
```
**Expected:** Plans with ₹149, ₹399, ₹999

---

### 4. Test Resume Parsing (with dummy data)
```bash
curl -X POST http://localhost:3000/api/resume/parse \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test.pdf",
    "content": "TmFtZTogSm9obiBEb2UKRW1haWw6IGpvaG5AZXhhbXBsZS5jb20KU2tpbGxzOiBKYXZhU2NyaXB0LCBSZWF"
  }'
```
**Expected:** Parsed resume JSON (might take 5-10 seconds - AI is processing!)

---

### 5. Create Payment Order
```bash
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"plan":"monthly"}'
```
**Expected:** Razorpay order with order_id, amount: 14900 (₹149)

---

## 📋 Quick Reference

| Endpoint | Method | Works? |
|----------|--------|--------|
| `/health` | GET | ✅ |
| `/api/auth/me` | GET | ✅ |
| `/api/payment/plans` | GET | ✅ |
| `/api/resume/parse` | POST | ✅ (with JSON body) |
| `/api/job/analyze` | POST | ✅ (needs resume + job data) |
| `/api/payment/create-order` | POST | ✅ (with plan) |

---

## 🚀 Best Way to Test: Use the Extension!

The backend is **working perfectly**. But it's designed to work with the **Chrome Extension**, not manual curl commands.

### Load Extension:
1. Chrome → `chrome://extensions/`
2. Developer mode ON
3. Load unpacked → `/Users/karthik/Downloads/chrext`
4. Click icon → Upload resume → Analyze job

**That's the real test!** 🎯
