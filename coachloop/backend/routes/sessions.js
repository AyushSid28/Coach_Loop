const express = require('express');
const {saveMessage, bookSession, validateSession,getSessionMessage } = require('../controllers/sessionController');

const router = express.Router();

// Route to book a session
router.post('/book', bookSession);

// Route to validate if a session is active before AI interaction
router.post('/validate', validateSession);


router.post('/save-message',saveMessage);


router.get("/messages/:sessionId",getSessionMessage);
module.exports = router;
