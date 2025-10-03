const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const sessionRoutes = require('./routes/sessions');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const agentRoutes = require("./routes/agentRoutes");
const feedbackRoutes = require('./routes/feedbackRoutes');
const emailRoutes = require('./routes/emailRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const sessionSummaryRoutes = require('./routes/sessionSummaryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const { startSessionMonitoring } = require('./services/sessionEndService');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
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
        const openai = require('./config/openaiConfig');
        
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

// Error Handler Middleware
app.use(errorHandler);

// Fallback for undefined routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`🚀 Server is running on Port ${port}`);
    
    // Start session monitoring service
    startSessionMonitoring();
});
