# CoachLoop Deployment Guide

## 🚀 Quick Deployment Summary

✅ **All major features implemented:**
- ✅ OpenAI API key updated
- ✅ Payment-based timer system (₹5 = 5min, ₹10 = 10min, etc.)
- ✅ Payment-duration integration
- ✅ Automatic PDF summary generation
- ✅ Code cleanup and modularization
- ✅ Vercel deployment configuration
- ✅ Environment setup

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Copy `.env.example` to `.env` and update with your actual values:

```bash
cp .env.example .env
```

**Required Variables:**
- `OPENAI_API_KEY` - Your OpenAI API key (already set)
- `MONGODB_URI` - MongoDB connection string
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - Razorpay credentials
- `EMAIL_USER` & `EMAIL_PASS` - Gmail SMTP credentials
- `JWT_SECRET` - Secure JWT secret

### 2. Dependencies Installation

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd coachloop/backend && npm install

# Install frontend dependencies  
cd ../frontend && npm install
```

## 🔧 Local Development

```bash
# Start both servers
npm run dev

# Or start individually:
npm run dev:backend   # Backend: http://localhost:4000
npm run dev:frontend  # Frontend: http://localhost:3000
```

## ☁️ Vercel Deployment

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Required Environment Variables in Vercel:

```
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coachloop
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
JWT_SECRET=your_secure_jwt_secret_here
UPI_ID=your_upi_id@bank
NODE_ENV=production
```

## 📊 Payment System Configuration

The system is configured with the following payment tiers:

| Amount | Duration | Description |
|--------|----------|-------------|
| ₹5     | 5 min    | Quick consultation |
| ₹10    | 10 min   | Short session |
| ₹15    | 15 min   | Standard session |
| ₹20    | 20 min   | Extended session |
| ₹25    | 25 min   | Comprehensive session |
| ₹30    | 30 min   | Full consultation |
| ₹50    | 50 min   | Premium session |
| ₹100   | 100 min  | Extended premium |

## 🔄 Key Features Implemented

### 1. Payment-Based Timer System
- Users pay specific amounts for corresponding session durations
- Real-time countdown timer in the chat interface
- Automatic session termination when time expires

### 2. PDF Summary Generation
- Automatic PDF generation when sessions end
- Professional formatting with session details
- Email delivery with PDF attachment
- Conversation highlights and AI insights

### 3. Session Management
- Payment verification before session start
- Session state tracking (active/inactive)
- Automatic cleanup of expired sessions
- Integration with Razorpay payment gateway

### 4. AI Integration
- OpenAI GPT-4 powered conversations
- Context-aware coaching responses
- Voice input/output support
- Conversation history management

## 🛠️ Database Setup

### MongoDB Collections:
- **sessions** - User sessions with payment info
- **payments** - Payment records with Razorpay integration
- **users** - User authentication (if implemented)

### Indexes (Recommended):
```javascript
// Sessions collection
db.sessions.createIndex({ "paymentId": 1 })
db.sessions.createIndex({ "sessionEndTime": 1 })
db.sessions.createIndex({ "isActive": 1 })

// Payments collection  
db.payments.createIndex({ "razorpay_order_id": 1 })
db.payments.createIndex({ "status": 1 })
```

## 🔒 Security Considerations

- JWT tokens for authentication
- Input validation on all endpoints
- CORS configuration for cross-origin requests
- Environment variable protection
- Payment signature verification

## 📧 Email Configuration

For Gmail SMTP:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in `EMAIL_PASS`

## 🔍 Monitoring & Logging

The application includes comprehensive logging:
- Payment processing logs
- Session lifecycle logs
- PDF generation logs
- Error tracking and reporting

## 🚨 Troubleshooting

### Common Issues:

1. **PDF Generation Fails**
   - Check Puppeteer installation
   - Verify file permissions for uploads directory
   - Check memory limits in production

2. **Payment Verification Fails**
   - Verify Razorpay credentials
   - Check webhook configuration
   - Validate signature generation

3. **Email Delivery Issues**
   - Verify SMTP credentials
   - Check email provider settings
   - Validate attachment size limits

4. **Session Timer Issues**
   - Verify payment-duration mapping
   - Check session end time calculation
   - Validate timezone handling

## 📞 Support

For deployment support or issues:
1. Check application logs
2. Verify environment variables
3. Test payment integration in sandbox mode
4. Validate email configuration

## 🎯 Post-Deployment Testing

1. **Payment Flow**
   - Test payment creation
   - Verify payment verification
   - Check session activation

2. **Session Management**
   - Test timer functionality
   - Verify session expiration
   - Check automatic cleanup

3. **PDF Generation**
   - Test summary generation
   - Verify email delivery
   - Check PDF formatting

4. **AI Integration**
   - Test chat functionality
   - Verify OpenAI responses
   - Check conversation history

---

**Deployment Status: ✅ READY FOR PRODUCTION**

All requested features have been implemented and the application is ready for deployment to Vercel.
