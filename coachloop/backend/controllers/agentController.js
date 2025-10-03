const agents=[
    { id: 1, name: "Executive Coach", type: "executive_coach", description: "Helps executives develop leadership skills." },
    { id: 2, name: "Career Coach", type: "career_coach", description: "Guides you through career transitions and growth." },
    { id: 3, name: "Academic Success Coach", type: "academic_success_coach", description: "Supports students in achieving academic excellence." },
    { id: 4, name: "Financial Planning Assistant", type: "financial_planner", description: "Assists with budgeting, saving, and financial management." },
    { id: 5, name: "Health & Wellness Coach", type: "health_wellness_coach", description: "Focuses on physical and mental well-being." },
    { id: 6, name: "Parenting Coach", type: "parenting_coach", description: "Provides guidance for effective parenting strategies." },
    { id: 7, name: "Personal Development Coach", type: "personal_dev_coach", description: "Helps in self-improvement and goal setting." },
    { id: 8, name: "Presentation Skills Coach", type: "presentation_coach", description: "Improves public speaking and presentation skills." },
    { id: 9, name: "Relationship Coach", type: "relationship_coach", description: "Guides users in personal and professional relationships." },
    { id: 10, name: "Stress Management Coach", type: "stress_management_coach", description: "Teaches strategies to handle stress effectively." }
];

const getAllAgents= (req,res)=>{
   res.status(200).json({success:true,agents})
};


const getAgentByType=(req,res)=>{
  const {agentTypes}=req.params;
  const agent = agents.find(a => a.type === agentType);

  if(!agent){
    return res.status(404).json({message:false,message:"Agent Not Found"});
  }

  return res.status(200).json({message:true,agent});
};

module.exports={getAllAgents,getAgentByType};