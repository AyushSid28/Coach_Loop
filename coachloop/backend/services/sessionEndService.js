const Session = require('../models/sessionModel');
const { generateSessionSummary } = require('../controllers/sessionSummaryController');
const moment = require('moment-timezone');

/**
 * Handle session end automatically
 * @param {string} sessionId - Session ID
 */
const handleSessionEnd = async (sessionId) => {
    try {
        console.log(`🔚 Handling session end for: ${sessionId}`);
        
        const session = await Session.findById(sessionId);
        if (!session) {
            console.error('Session not found:', sessionId);
            return;
        }

        // Mark session as inactive
        session.isActive = false;
        await session.save();

        // Generate and send summary if there are messages
        if (session.messages && session.messages.length > 0) {
            console.log('📄 Generating session summary...');
            
            // Create a mock request object for the generateSessionSummary function
            const mockReq = {
                params: { sessionId }
            };
            
            const mockRes = {
                status: (code) => ({
                    json: (data) => {
                        console.log(`Session summary response (${code}):`, data.message);
                        return data;
                    }
                })
            };

            await generateSessionSummary(mockReq, mockRes);
        } else {
            console.log('No messages found in session, skipping summary generation');
        }

        console.log(`✅ Session ${sessionId} ended successfully`);
        
    } catch (error) {
        console.error('Error handling session end:', error);
    }
};

/**
 * Schedule session end based on session end time
 * @param {Object} session - Session object
 */
const scheduleSessionEnd = (session) => {
    const currentTime = moment().tz("Asia/Kolkata");
    const sessionEndTime = moment(session.sessionEndTime);
    const timeUntilEnd = sessionEndTime.diff(currentTime);

    if (timeUntilEnd > 0) {
        console.log(`⏰ Scheduling session end for ${session._id} in ${Math.round(timeUntilEnd / 1000)} seconds`);
        
        setTimeout(() => {
            handleSessionEnd(session._id.toString());
        }, timeUntilEnd);
    } else {
        // Session should have already ended
        console.log(`⚠️ Session ${session._id} should have already ended, handling immediately`);
        handleSessionEnd(session._id.toString());
    }
};

/**
 * Check and handle expired sessions (run periodically)
 */
const checkExpiredSessions = async () => {
    try {
        const currentTime = moment().tz("Asia/Kolkata").toDate();
        
        // Find active sessions that have expired
        const expiredSessions = await Session.find({
            isActive: true,
            sessionEndTime: { $lt: currentTime }
        });

        console.log(`🔍 Found ${expiredSessions.length} expired sessions`);

        for (const session of expiredSessions) {
            await handleSessionEnd(session._id.toString());
        }
        
    } catch (error) {
        console.error('Error checking expired sessions:', error);
    }
};

/**
 * Start periodic check for expired sessions
 */
const startSessionMonitoring = () => {
    // Check every 5 minutes
    const MONITORING_INTERVAL = 5 * 60 * 1000;
    
    console.log('🔄 Starting session monitoring service...');
    
    setInterval(checkExpiredSessions, MONITORING_INTERVAL);
    
    // Run initial check
    checkExpiredSessions();
};

module.exports = {
    handleSessionEnd,
    scheduleSessionEnd,
    checkExpiredSessions,
    startSessionMonitoring
};
