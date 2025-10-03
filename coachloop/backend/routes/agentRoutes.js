const express = require('express');
const router = express.Router();
const {getAllAgents,getAgentByType}=require("../controllers/agentController")

router.get('/', getAllAgents);

router.get('/:agentType',getAgentByType);


module.exports = router;  
