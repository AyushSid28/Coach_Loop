const express = require('express');
const { generateSessionSummary } = require('../controllers/sessionSummaryController');

const router = express.Router();

router.get('/summary/:sessionId', generateSessionSummary); 

module.exports = router;
