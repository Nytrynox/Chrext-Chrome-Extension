# 🧪 Complete Testing Guide - AI Job Copilot

## ✅ Current Status

**Backend:** Running at `http://localhost:3000` ✅  
**Gemini API:** Configured with your key ✅  
**Razorpay:** Configured with live credentials ✅

---

## 📱 STEP 1: Load Chrome Extension

### Open Chrome Extensions Page
1. Open Google Chrome
2. Type in address bar: `chrome://extensions/`
3. Press Enter

### Enable Developer Mode
1. Look at top-right corner
2. Toggle "Developer mode" ON (blue)

### Load Extension
1. Click button "Load unpacked"
2. Navigate to: `/Users/karthik/Downloads/chrext`
3. Click "Select"
4. Extension icon should appear in toolbar (purple-pink gradient)

**✅ Extension loaded successfully!**

---

## 🧪 STEP 2: Test Resume Upload

### Upload Resume
1. Click the extension icon in Chrome toolbar
2. You'll see "Upload Your Resume" section
3. Click "Browse Files" or drag & drop a PDF resume
4. Wait for parsing (5-10 seconds)
5. Should show: "✅ resume.pdf - Parsed successfully"

**What happens behind the scenes:**
```
Extension → Backend API → Gemini AI → Structured JSON
```

**No PDF resume handy?** Create a simple test resume:
- Name, email, phone
- Skills: JavaScript, React, Python
- Experience: 3 years as Software Engineer

---

## 🎯 STEP 3: Test Job Analysis

### Navigate to Job Posting
1. Open new tab
2. Go to: https://www.linkedin.com/jobs/
3. Search for: "Software Engineer"
4. Click on any job posting
5. Wait for page to load fully

### Analyze Job
1. Click extension icon again
2. Click "Analyze This Job" button
3. Wait 10-15 seconds for AI analysis
4. Results should appear with:
   - **Match Score** (35-85%)
   - **Verdict** (APPLY / APPLY_WITH_CHANGES / SKIP)
   - **Reasoning** explanation

### View Detailed Feedback
1. Click "Brutal Feedback" tab
2. See honest assessment of gaps
3. Click "Breakdown" tab
4. See skill overlap, experience gap, ATS score

**✅ Job analysis working!**

---

## 💳 STEP 4: Test Payment (Optional)

### Test Pricing Page
1. Click "Upgrade to Pro" in extension
2. New tab opens with pricing page
3. See three plans:
   - Monthly: ₹149
   - Quarterly: ₹399
   - Yearly: ₹999

### Test Razorpay (TEST MODE RECOMMENDED)
⚠️ **Your live credentials are configured!**

**For testing without real payment:**
1. Change to test mode in `.env`:
   ```bash
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=test_secret_here
   ```

**Test payment cards:**
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date

---

## 🔍 STEP 5: Verify Backend Logs

### Check Server Terminal
You should see logs for:
```
[info]: Resume upload: test.pdf, 12345 bytes
[info]: Parsing resume: test.pdf, 3456 chars
[info]: Analyzing job: Software Engineer for user
[info]: Running matching engine
[info]: Order created: order_xyz, Plan: monthly, Amount: ₹149
```

---

## ✅ Complete Test Checklist

- [ ] Extension loads in Chrome
- [ ] Upload PDF resume successfully  
- [ ] Resume parsing shows structured data
- [ ] Navigate to LinkedIn job post
- [ ] Click "Analyze This Job"
- [ ] See match score (35-85%)
- [ ] See verdict with reasoning
- [ ] View brutal feedback tab
- [ ] View breakdown tab
- [ ] Open pricing page
- [ ] (Optional) Test payment

---

## 🐛 Troubleshooting

### Extension Not Loading?
```bash
# Check if folder exists
ls -la /Users/karthik/Downloads/chrext/manifest.json

# If missing, extension not in right location
```

### Resume Upload Fails?
```bash
# Check backend is running
curl http://localhost:3000/health

# Check logs
tail -f /Users/karthik/Downloads/chrext/backend/logs/error.log
```

### Job Analysis Fails?
1. **Check you're on a job page** (LinkedIn, Indeed, etc.)
2. **Check backend logs** for errors
3. **Check Gemini API quota**: https://makersuite.google.com/app/apikey

### Popup Shows "API Error"?
1. **Backend not running** - Start with `npm run dev`
2. **Wrong API URL** - Check `shared/constants.js` has `http://localhost:3000`
3. **CORS error** - Browser console will show this

---

## 📊 Expected Results

### Good Resume (7 years experience, strong skills)
```
Match Score: 72%
Verdict: APPLY
Reasoning: "Strong technical fit with relevant experience..."
```

### Weak Resume (2 years, skill gaps)
```
Match Score: 43%
Verdict: SKIP
Reasoning: "Missing critical skills: React, AWS. 3 years below minimum..."
Brutal Feedback:
- ❌ "Lacks React (required)" [CRITICAL]
- ❌ "No cloud experience" [HIGH]
```

---

## 🎥 Quick Video Test (30 seconds)

1. **Load extension** (5 sec)
2. **Upload resume** (10 sec)
3. **Go to LinkedIn job** (5 sec)
4. **Click Analyze** (10 sec)
5. **View results** ✅

**Total time: ~30 seconds**

---

## 📸 Screenshots to Verify

Take screenshots of:
1. Extension loaded in `chrome://extensions/`
2. Resume uploaded successfully
3. Match score results page
4. Brutal feedback tab
5. Pricing page

---

## ✅ Success Criteria

**You'll know it works when:**
- ✅ Extension icon appears in Chrome
- ✅ Resume parsing completes (shows contact info)
- ✅ Match score displays (not 0% or 100%)
- ✅ Verdict shows (APPLY/SKIP)
- ✅ Brutal feedback has real issues listed
- ✅ Backend logs show API calls

---

## 🚀 Production Checklist

Before deploying to users:
- [ ] Test with 5+ different resumes
- [ ] Test on all platforms (LinkedIn, Indeed, Greenhouse, Lever)
- [ ] Verify scores are realistic (35-85%)
- [ ] Check brutal feedback is helpful
- [ ] Test payment flow fully
- [ ] Deploy backend to cloud
- [ ] Add error tracking (Sentry)

---

## 📞 Need Help?

**Common Issues:**

**"Extension not found"**
→ Make sure you selected `/Users/karthik/Downloads/chrext` folder (not a subfolder)

**"Resume parsing failed"**
→ Check backend terminal for errors, verify Gemini API key works

**"No job detected"**
→ Make sure you're on an actual job posting page (not search results)

**"Payment not working"**
→ Switch to test credentials first before testing live payments

---

## 🎯 Next: Share for Feedback!

Once testing is complete:
1. Test with real job applications
2. Share with 5 friends
3. Collect feedback
4. Iterate based on usage

**Ready to test? Start with STEP 1!** 🚀
