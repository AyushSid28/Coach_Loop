const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();

// OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple homepage
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>CoachLoop - AI Coaching Platform</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            .container {
                text-align: center;
                background: rgba(255,255,255,0.1);
                padding: 50px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            }
            h1 {
                font-size: 3em;
                margin-bottom: 20px;
                text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            p {
                font-size: 1.2em;
                margin-bottom: 30px;
                opacity: 0.9;
            }
            .btn {
                background: linear-gradient(45deg, #ffd700, #ffed4e);
                color: #333;
                padding: 15px 30px;
                border: none;
                border-radius: 25px;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                transition: transform 0.3s ease;
                box-shadow: 0 4px 15px rgba(255,215,0,0.3);
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255,215,0,0.4);
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 40px;
            }
            .feature {
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 15px;
                text-align: left;
            }
            .feature h3 {
                color: #ffd700;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 CoachLoop</h1>
            <p>AI-Powered Coaching Platform</p>
            <p>Pay-per-minute coaching • Voice support • PDF summaries</p>
            
            <a href="/chat-demo" class="btn">Start Demo Chat</a>
            
            <div class="features">
                <div class="feature">
                    <h3>💰 Smart Pricing</h3>
                    <p>₹5 = 5 minutes<br>₹10 = 10 minutes<br>Pay exactly what you use</p>
                </div>
                <div class="feature">
                    <h3>🤖 AI Coaching</h3>
                    <p>GPT-4 powered conversations<br>Personalized advice<br>Real-time responses</p>
                </div>
                <div class="feature">
                    <h3>🔊 Voice Support</h3>
                    <p>Speech-to-text input<br>Text-to-speech output<br>Natural conversations</p>
                </div>
                <div class="feature">
                    <h3>📄 PDF Summaries</h3>
                    <p>Auto-generated insights<br>Emailed after sessions<br>Action points included</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Demo chat page
app.get('/chat-demo', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>CoachLoop Chat Demo</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                color: white;
            }
            .chat-container {
                max-width: 800px;
                margin: 0 auto;
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 20px;
                backdrop-filter: blur(10px);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid rgba(255,255,255,0.2);
            }
            .messages {
                height: 400px;
                overflow-y: auto;
                margin-bottom: 20px;
                padding: 20px;
                background: rgba(255,255,255,0.05);
                border-radius: 15px;
            }
            .message {
                margin-bottom: 15px;
                padding: 10px 15px;
                border-radius: 15px;
                max-width: 70%;
            }
            .user {
                background: #ffd700;
                color: #333;
                margin-left: auto;
                text-align: right;
            }
            .assistant {
                background: rgba(255,255,255,0.1);
                color: white;
            }
            .input-area {
                display: flex;
                gap: 10px;
            }
            input {
                flex: 1;
                padding: 15px;
                border: none;
                border-radius: 25px;
                font-size: 16px;
                background: rgba(255,255,255,0.1);
                color: white;
                outline: none;
            }
            input::placeholder {
                color: rgba(255,255,255,0.7);
            }
            button {
                background: #ffd700;
                color: #333;
                border: none;
                padding: 15px 25px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                transition: transform 0.2s;
            }
            button:hover {
                transform: scale(1.05);
            }
            .tts-btn {
                background: #ff6b6b;
                color: white;
                padding: 10px 20px;
                margin-left: 10px;
            }
        </style>
    </head>
    <body>
        <div class="chat-container">
            <div class="header">
                <h1>🎯 CoachLoop Demo</h1>
                <p>Try our AI coaching - powered by GPT-4</p>
                <button class="tts-btn" onclick="toggleTTS()">🔊 TTS: Off</button>
            </div>
            
            <div class="messages" id="messages">
                <div class="message assistant">
                    <strong>AI Coach:</strong> Hello! I'm your AI coach. What would you like to work on today? I can help with goal setting, productivity, leadership, or any other area you'd like to improve.
                </div>
            </div>
            
            <div class="input-area">
                <input type="text" id="userInput" placeholder="Ask me anything about coaching, goals, or personal development..." onkeypress="if(event.key==='Enter') sendMessage()">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>

        <script>
            let ttsEnabled = false;
            let conversationHistory = [];

            function toggleTTS() {
                ttsEnabled = !ttsEnabled;
                const btn = document.querySelector('.tts-btn');
                btn.textContent = ttsEnabled ? '🔊 TTS: On' : '🔊 TTS: Off';
                btn.style.background = ttsEnabled ? '#4ecdc4' : '#ff6b6b';
            }

            function addMessage(role, content) {
                const messagesDiv = document.getElementById('messages');
                const messageDiv = document.createElement('div');
                messageDiv.className = \`message \${role}\`;
                messageDiv.innerHTML = \`<strong>\${role === 'user' ? 'You' : 'AI Coach'}:</strong> \${content}\`;
                messagesDiv.appendChild(messageDiv);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }

            async function sendMessage() {
                const input = document.getElementById('userInput');
                const userMessage = input.value.trim();
                
                if (!userMessage) return;

                addMessage('user', userMessage);
                input.value = '';

                try {
                    const response = await fetch('/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_input: userMessage,
                            conversation_history: conversationHistory,
                            current_step: conversationHistory.length + 1
                        })
                    });

                    const data = await response.json();
                    addMessage('assistant', data.response);
                    
                    conversationHistory = data.conversation_history || [];

                    // Play TTS if enabled
                    if (ttsEnabled && data.response) {
                        try {
                            const ttsResponse = await fetch('/stream-tts', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text: data.response })
                            });

                            if (ttsResponse.ok) {
                                const audioBlob = await ttsResponse.blob();
                                const audioUrl = URL.createObjectURL(audioBlob);
                                const audio = new Audio(audioUrl);
                                audio.play();
                                audio.onended = () => URL.revokeObjectURL(audioUrl);
                            }
                        } catch (ttsError) {
                            console.log('TTS not available:', ttsError);
                        }
                    }

                } catch (error) {
                    console.error('Error:', error);
                    addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
                }
            }

            // Initialize
            document.getElementById('userInput').focus();
        </script>
    </body>
    </html>
  `);
});

// Chat API endpoint
app.post('/chat', async (req, res) => {
    const { user_input, conversation_history = [], current_step = 1 } = req.body;

    if (!user_input) {
        return res.status(400).json({ response: 'Message cannot be empty' });
    }

    try {
        const messages = [
            {
                role: "system",
                content: "You are an AI coach assistant. Provide helpful, supportive, and actionable coaching advice. Keep responses concise but meaningful. Focus on practical steps and encouragement."
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

// Text-to-Speech endpoint
app.post('/stream-tts', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No text provided for TTS'
            });
        }

        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'alloy',
            input: text,
            response_format: 'mp3',
            speed: 1.0
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length
        });

        res.status(200).send(buffer);

    } catch (error) {
        console.error('❌ TTS error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate speech'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CoachLoop is running on Vercel!',
    timestamp: new Date().toISOString(),
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'CoachLoop API',
    version: '1.0.0',
    endpoints: [
      'GET / - Homepage',
      'GET /chat-demo - Demo chat interface', 
      'POST /chat - Chat with AI coach',
      'POST /stream-tts - Text to speech',
      'GET /health - Health check'
    ]
  });
});

module.exports = app;
