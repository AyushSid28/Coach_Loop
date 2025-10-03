# CoachLoop 🎯

Hey there! Welcome to CoachLoop - the AI coaching platform I built to make personalized coaching accessible to everyone. 

## What's This All About? 🤔

You know how expensive personal coaching can be? I wanted to solve that. CoachLoop is my take on democratizing coaching through AI - you pay what you want, get the time you need, and receive genuinely helpful coaching advice.

The cool part? It's not just another chatbot. I've built it with a payment-per-minute system where your money directly translates to coaching time. Pay ₹5, get 5 minutes. Pay ₹100, get 100 minutes. Simple as that.

## What Makes It Special? ✨

**Smart Payment System** - I got tired of subscription models. Here, you pay exactly for what you use. ₹5 = 5 minutes, ₹10 = 10 minutes, and so on.

**Real Coaching Experience** - Powered by GPT-4, but I've fine-tuned the prompts to actually give you actionable coaching advice, not generic responses.

**Voice Support** - Sometimes you just want to talk it out. Built-in speech recognition and text-to-speech because typing isn't always convenient.

**Session Summaries** - After each session, you get a beautiful PDF summary emailed to you with key insights and action points. No more forgetting what you discussed.

**Timer That Actually Works** - Your session timer counts down based on what you paid. When time's up, it gracefully ends and sends you that summary.

## The Tech Behind It 🛠️

I built this with:
- **Backend**: Node.js + Express (because I know it well)
- **Frontend**: EJS templates (keeping it simple)
- **Database**: MongoDB (session storage and user data)
- **AI**: OpenAI GPT-4 (the brain of the operation)
- **Payments**: Razorpay (UPI integration for Indian users)
- **Voice**: OpenAI Whisper + TTS (speech processing)
- **PDF Generation**: Puppeteer (for those session summaries)

## Getting It Running 🚀

If you want to run this locally (maybe you're curious about the code):

```bash
# Clone this repo
git clone https://github.com/AyushSid28/Coach_LOOP.git
cd Coach_LOOP

# Install everything
npm install
npm run install:all

# Set up your environment variables (you'll need OpenAI API key, MongoDB, etc.)
cp .env.example .env
# Edit .env with your actual credentials

# Start both servers
npm run dev
```

Then hit up:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## How The Payment Thing Works 💰

This was actually the trickiest part to get right. Here's how I set it up:

| What You Pay | Time You Get | Why This Pricing |
|--------------|--------------|------------------|
| ₹5           | 5 minutes    | Quick questions  |
| ₹10          | 10 minutes   | Short session    |
| ₹15          | 15 minutes   | Standard chat    |
| ₹30          | 30 minutes   | Deep dive        |
| ₹50          | 50 minutes   | Comprehensive    |
| ₹100         | 100 minutes  | Extended coaching|

I wanted to keep it affordable but also sustainable. These rates work for both users and the platform.

## The Story Behind This 📖

I started building CoachLoop because I was frustrated with the coaching industry. Great coaches charge ₹3000+ per hour, making it inaccessible for most people. AI coaching platforms were either too expensive or gave terrible advice.

So I thought - what if I could combine the accessibility of AI with actually useful coaching frameworks? What if people could pay small amounts for quick advice sessions?

Took me about 3 months of evenings and weekends to build this. The hardest parts were:
1. Getting the payment-to-time mapping right
2. Making the AI responses actually helpful (so much prompt engineering!)
3. The PDF generation (styling nightmares!)
4. Voice integration (browser compatibility is a pain)

## What's Next? 🔮

I'm working on:
- More coaching specializations (career, relationships, fitness)
- Group coaching sessions
- Better mobile experience
- Integration with calendar apps
- Maybe a mobile app if this takes off

## Want to Contribute? 🤝

If you're interested in making this better, I'd love the help! Whether it's:
- Bug fixes
- New features
- Better UI/UX
- More coaching frameworks
- Performance improvements

Just fork it and send a PR. I review everything personally.

## Live Demo 🌐

Check it out at: [coach-loop.vercel.app](https://coach-loop.vercel.app)

## Issues & Support 🆘

If something breaks or you have ideas, just open an issue. I usually respond within 24 hours.

## A Quick Thanks 🙏

Shoutout to the OpenAI team for making such powerful APIs accessible. And to everyone who's tested this and given feedback - you know who you are!

---

Built with ❤️ by Ayush. Making coaching accessible, one conversation at a time.

*P.S. - If you're a coach and want to integrate this into your practice, reach out. I'm always interested in collaboration.*