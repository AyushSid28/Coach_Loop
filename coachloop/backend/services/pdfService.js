const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate PDF from session summary
 * @param {Object} sessionData - Session data containing summary and details
 * @returns {Buffer} PDF buffer
 */
const generateSessionSummaryPDF = async (sessionData) => {
    let browser;
    
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Create HTML content for PDF
        const htmlContent = generateHTMLTemplate(sessionData);
        
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });
        
        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });
        
        return pdfBuffer;
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

/**
 * Generate HTML template for session summary
 * @param {Object} sessionData - Session data
 * @returns {string} HTML template
 */
const generateHTMLTemplate = (sessionData) => {
    const { userName, email, agentType, sessionDate, duration, amount, summary, messages } = sessionData;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Session Summary - ${userName}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #fff;
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                margin-bottom: 30px;
            }
            
            .header h1 {
                font-size: 28px;
                margin-bottom: 10px;
                font-weight: 700;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 0 20px;
            }
            
            .session-info {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 30px;
                border-left: 5px solid #667eea;
            }
            
            .session-info h2 {
                color: #667eea;
                margin-bottom: 15px;
                font-size: 22px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .info-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            
            .info-label {
                font-weight: 600;
                color: #495057;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            
            .info-value {
                font-size: 16px;
                color: #212529;
                font-weight: 500;
            }
            
            .summary-section {
                background: white;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .summary-section h2 {
                color: #667eea;
                margin-bottom: 20px;
                font-size: 22px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
            }
            
            .summary-content {
                font-size: 16px;
                line-height: 1.8;
                color: #495057;
                white-space: pre-line;
            }
            
            .conversation-section {
                background: white;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .conversation-section h2 {
                color: #667eea;
                margin-bottom: 20px;
                font-size: 22px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
            }
            
            .message {
                margin-bottom: 15px;
                padding: 15px;
                border-radius: 10px;
                border-left: 4px solid #667eea;
            }
            
            .message.user {
                background: #e3f2fd;
                border-left-color: #2196f3;
            }
            
            .message.assistant {
                background: #f3e5f5;
                border-left-color: #9c27b0;
            }
            
            .message-sender {
                font-weight: 600;
                color: #667eea;
                margin-bottom: 5px;
                text-transform: capitalize;
            }
            
            .message-text {
                color: #495057;
                line-height: 1.6;
            }
            
            .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-radius: 12px;
                margin-top: 30px;
                border-top: 3px solid #667eea;
            }
            
            .footer p {
                color: #6c757d;
                font-size: 14px;
            }
            
            .logo {
                font-size: 24px;
                font-weight: bold;
                background: linear-gradient(45deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 5px;
            }
            
            @media print {
                body { margin: 0; }
                .header { margin-bottom: 20px; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">CoachLoop</div>
            <h1>AI Coaching Session Summary</h1>
            <p>Personalized insights and action points from your session</p>
        </div>
        
        <div class="container">
            <div class="session-info">
                <h2>Session Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Participant</div>
                        <div class="info-value">${userName || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${email || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Coach Type</div>
                        <div class="info-value">${agentType || 'AI Coach'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Session Date</div>
                        <div class="info-value">${sessionDate || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Duration</div>
                        <div class="info-value">${duration || 'N/A'} minutes</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Investment</div>
                        <div class="info-value">₹${amount || 'N/A'}</div>
                    </div>
                </div>
            </div>
            
            ${summary && summary.text ? `
            <div class="summary-section">
                <h2>Session Summary & Key Insights</h2>
                <div class="summary-content">${summary.text}</div>
                ${summary.generatedAt ? `<p style="margin-top: 20px; color: #6c757d; font-size: 14px; font-style: italic;">Generated on: ${summary.generatedAt}</p>` : ''}
            </div>
            ` : ''}
            
            ${messages && messages.length > 0 ? `
            <div class="conversation-section">
                <h2>Conversation Highlights</h2>
                ${messages.slice(0, 10).map(msg => `
                    <div class="message ${msg.sender}">
                        <div class="message-sender">${msg.sender === 'user' ? userName || 'You' : 'AI Coach'}</div>
                        <div class="message-text">${msg.text}</div>
                    </div>
                `).join('')}
                ${messages.length > 10 ? `<p style="color: #6c757d; font-style: italic; margin-top: 15px;">... and ${messages.length - 10} more messages</p>` : ''}
            </div>
            ` : ''}
            
            <div class="footer">
                <p><strong>Thank you for choosing CoachLoop!</strong></p>
                <p>Continue your growth journey with personalized AI coaching sessions.</p>
                <p style="margin-top: 10px; font-size: 12px;">This summary was generated automatically from your coaching session.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Save PDF to file system
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {string} fileName - File name
 * @returns {string} File path
 */
const savePDFToFile = async (pdfBuffer, fileName) => {
    const uploadsDir = path.join(__dirname, '../uploads/pdfs');
    
    // Ensure uploads directory exists
    try {
        await fs.access(uploadsDir);
    } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, pdfBuffer);
    
    return filePath;
};

module.exports = {
    generateSessionSummaryPDF,
    savePDFToFile
};
