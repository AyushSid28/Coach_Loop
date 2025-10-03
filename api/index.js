const express = require('express');
const path = require('path');
const cors = require('cors');

// Import backend modules
const connectDB = require('../coachloop/backend/config/db');
const sessionRoutes = require('../coachloop/backend/routes/sessions');
const authRoutes = require('../coachloop/backend/routes/authRoutes');
const errorHandler = require('../coachloop/backend/middlewares/errorHandler');
const agentRoutes = require("../coachloop/backend/routes/agentRoutes");
const feedbackRoutes = require('../coachloop/backend/routes/feedbackRoutes');
const emailRoutes = require('../coachloop/backend/routes/emailRoutes');
const reminderRoutes = require('../coachloop/backend/routes/reminderRoutes');
const sessionSummaryRoutes = require('../coachloop/backend/routes/sessionSummaryRoutes');
const paymentRoutes = require('../coachloop/backend/routes/paymentRoutes');
const subscriptionRoutes = require("../coachloop/backend/routes/subscriptionRoutes");
const webhookRoutes = require("../coachloop/backend/routes/webhookRoutes");
const voiceRoutes = require('../coachloop/backend/routes/voiceRoutes');
const { startSessionMonitoring } = require('../coachloop/backend/services/sessionEndService');

// Import frontend functionality
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

require('dotenv').config();

const app = express();

// Initialize database connection
connectDB();

// Start session monitoring
startSessionMonitoring();

app.use(cors());
app.use(express.json());

// Backend API Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/session-summary', sessionSummaryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/webhook/', webhookRoutes);

// Voice routes (TTS/STT)
app.use('/', voiceRoutes);

// Chatbot Route (handling user input and sending to OpenAI GPT)
app.post('/chat', async (req, res) => {
    const { user_input, conversation_history = [], current_step = 1 } = req.body;

    if (!user_input) {
        return res.status(400).json({ response: 'Message cannot be empty' });
    }

    try {
        const openai = require('../coachloop/backend/config/openaiConfig');
        
        // Build conversation context
        const messages = [
            {
                role: "system",
                content: "You are an AI coach assistant. Provide helpful, supportive, and actionable coaching advice. Keep responses concise but meaningful."
            },
            ...conversation_history.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            {
                role: "user",
                content: user_input
            }
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages,
            max_tokens: 300,
            temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;

        // Update conversation history
        const updatedHistory = [
            ...conversation_history,
            { sender: 'user', text: user_input },
            { sender: 'assistant', text: aiResponse }
        ];

        res.json({
            response: aiResponse,
            conversation_history: updatedHistory,
            current_step: current_step + 1
        });

    } catch (error) {
        console.error("❌ Chat Error:", error);
        res.status(500).json({ 
            response: 'I apologize, but I encountered an error. Please try again.',
            conversation_history: conversation_history,
            current_step: current_step
        });
    }
});

// Frontend functionality
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../coachloop/frontend'));

// Static files
app.use('/public', express.static(path.join(__dirname, '../coachloop/frontend/public')));

// Frontend Schema for compatibility
const userSessionSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true },
  focusArea: { type: String, required: false },
  duration: { type: Number, required: false },
  amount: { type: Number, required: false },
  paymentStatus: { type: String, default: 'pending' },
  sessionDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, required: false },
  transactionId: { type: String, required: false },
  upiTransactionId: { type: String, required: false },
  expiresAt: { type: Date, required: false },
  paymentCompletedAt: { type: Date, required: false }
});

const UserSession = mongoose.model('UserSession', userSessionSchema);

// Payment duration mapping
const durationAmountMap = {
  1: 5,
  5: 10,
  10: 20,
  15: 30,
  30: 50,
  60: 100
};

// Route helper
const renderView = (viewName, data = {}) => (req, res) => {
  const viewPath = path.join(__dirname, '../coachloop/frontend', `${viewName}.ejs`);
  
  if (!fs.existsSync(viewPath)) {
    return res.status(404).send(`View ${viewName} not found`);
  }

  res.render(viewName, data, (err, html) => {
    if (err) {
      console.error(`Render error for ${viewName}:`, err);
      return res.status(500).send(`<h1>Render Error</h1><pre>${err.stack}</pre>`);
    }
    res.send(html);
  });
};

// Frontend Routes
app.get('/', renderView('index'));
app.get('/Focus', renderView('Focus'));
app.get('/chatbot', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.redirect('/Focus?error=no_session');
    }

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.redirect('/Focus?error=invalid_session');
    }

    const session = await UserSession.findById(sessionId);
    if (!session) {
      return res.redirect('/Focus?error=session_not_found');
    }

    if (session.paymentStatus !== 'completed') {
      return res.redirect(`/Focus?error=payment_pending&sessionId=${sessionId}`);
    }

    res.render('chatbot', { 
      sessionData: {
        focusArea: session.focusArea,
        duration: session.duration,
        sessionId: session._id
      }
    });

  } catch (error) {
    console.error('Chatbot route error:', error);
    res.redirect('/Focus?error=server_error');
  }
});

// Error Handler
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CoachLoop Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
