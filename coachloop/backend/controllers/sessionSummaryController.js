const OpenAI = require('openai');
const Session = require('../models/sessionModel');
const moment = require('moment-timezone');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const { generateSessionSummaryPDF, savePDFToFile } = require('../services/pdfService');

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

const generateSessionSummary = async (req, res) => {
    const { sessionId } = req.params;

    try {
        const session = await Session.findById(sessionId);
        if (!session || !session.messages) {
            return res.status(404).json({ message: "Session Not Found" });
        }
        
        console.log("🔍 Debug: Session Data ->", session);

        if (!session.email) {
            return res.status(400).json({ message: "User email not found in session data" });
        }

        console.log("📧 Sending email to:", session.email); 
        const conversationHistory = session.messages
            .map(msg => `${msg.sender}: ${msg.text}`)
            .join("\n");

        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "You are an AI coach assistant. Summarize key insights from the session and provide a structured summary." },
        { 
            role: "user", 
            content: `Here is a conversation between a coach and a user:\n\n${conversationHistory}\n\n
            Please summarize the session in the following format:

            **Actions/commitments by the user:** 
            - [List the key commitments made by the user]

            **Key points discussed:** 
            - [Summarize the main insights from the conversation]

            **What actions and by when:** 
            - [Mention specific actions the user has committed to, along with deadlines]

            **Date of next review conversation:** 
            - [Suggest a follow-up session date based on the discussion]`
        },
            ],
            max_tokens: 300,
            temperature: 0.7
        });

        const summaryText = aiResponse.choices[0].message.content.trim();

        const generatedAt = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
        
        session.summary = {
            text: summaryText,
            generatedAt: generatedAt
        };
        await session.save();

        // Generate PDF
        let pdfPath = null;
        try {
            const sessionData = {
                userName: session.userName,
                email: session.email,
                agentType: session.agentType,
                sessionDate: session.sessionDate,
                duration: session.duration,
                amount: session.amount,
                summary: session.summary,
                messages: session.messages
            };

            const pdfBuffer = await generateSessionSummaryPDF(sessionData);
            const fileName = `session-summary-${session._id}-${Date.now()}.pdf`;
            pdfPath = await savePDFToFile(pdfBuffer, fileName);

            console.log("📄 PDF generated successfully:", pdfPath);
        } catch (pdfError) {
            console.error("❌ Error generating PDF:", pdfError);
            // Continue with email even if PDF generation fails
        }

        // Prepare email with PDF attachment
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: session.email,
            subject: "Your AI Coaching Session Summary 📄",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">CoachLoop</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your AI Coaching Session Summary</p>
                    </div>
                    <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333; margin-bottom: 20px;">Hello ${session.userName || 'there'}!</h2>
                        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                            Thank you for your AI coaching session! We've prepared a comprehensive summary of your session with key insights and action points.
                        </p>
                        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                            <h3 style="color: #667eea; margin-bottom: 15px;">Session Details:</h3>
                            <p><strong>Duration:</strong> ${session.duration || 'N/A'} minutes</p>
                            <p><strong>Date:</strong> ${session.sessionDate}</p>
                            <p><strong>Coach Type:</strong> ${session.agentType}</p>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #667eea; margin-bottom: 15px;">Key Insights:</h3>
                            <div style="white-space: pre-line; color: #555; line-height: 1.6;">${summaryText}</div>
                        </div>
                        <p style="color: #555; line-height: 1.6; margin-top: 20px;">
                            ${pdfPath ? 'A detailed PDF summary is attached to this email for your records.' : 'We attempted to generate a PDF summary, but you can find all the key points above.'}
                        </p>
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #667eea; font-weight: bold;">Ready for your next session?</p>
                            <p style="color: #777;">Continue your growth journey with personalized AI coaching.</p>
                        </div>
                    </div>
                    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                        <p>This summary was generated automatically from your coaching session.</p>
                        <p>© 2024 CoachLoop. All rights reserved.</p>
                    </div>
                </div>
            `,
            attachments: pdfPath ? [{
                filename: `CoachLoop-Session-Summary-${moment().format('YYYY-MM-DD')}.pdf`,
                path: pdfPath
            }] : []
        };

        await transporter.sendMail(mailOptions);
        console.log("📧 Email sent successfully to:", session.email);

        res.status(200).json({
            message: "Session Summary generated and sent via email with PDF attachment",
            summary: summaryText,
            pdfGenerated: !!pdfPath
        });


    } catch (error) {
        console.error("Error generating session summary", error);
        res.status(500).json({ message: "Failed generating session summary", error: error.message });
    }
};

module.exports = { generateSessionSummary };
