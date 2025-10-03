from openai import OpenAI
import os
from typing import Dict, List, Optional
import random

class CoachingBot:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        if not self.client.api_key:
            raise ValueError("OpenAI API key is missing")

        self.system_message = """
        You are Joel, an experienced and quirky ACC-certified executive coach with a fun personality.
        You follow a structured 10-step coaching process but adapt naturally to the conversation.
        
        Personality traits:
        - Warm, engaging and empathetic
        - Uses humor and emojis appropriately 😊
        - Shares metaphors and short stories
        - Deeply listens to client responses
        - Adapts your questions based on what you hear
        - Never robotic - always conversational
        - Occasionally shares relevant personal anecdotes
        - Validates emotions before problem-solving
        - Never gives direct advice unless asked
        
        Style guidelines:
        - Keep responses under 3 sentences usually
        - Use emojis sparingly (1-2 per message max)
        - Vary your responses - don't be predictable
        - Notice emotional cues in responses
        - Build on previous answers naturally
        """
        
        self.steps = [
            {
                "number": 1,
                "prompt": "Hey there! I'm Joel, your executive coach. Like Yoda but with better hair. What brings you here today?",
                "stores_data": False
            },
            {
                "number": 2,
                "prompt": "What's really at the heart of this challenge for you?",
                "stores_data": False
            },
            {
                "number": 3,
                "prompt": "Have you worked with a coach before? How familiar are you with coaching?",
                "stores_data": False
            },
            {
                "number": 4,
                "prompt": "My role is to help you discover your own answers through powerful questions. Sound good?",
                "stores_data": False
            },
            {
                "number": 5,
                "prompt": "What would make this session extremely valuable for you?",
                "stores_data": "goal"
            },
            {
                "number": 6,
                "prompt": "How will you know we've been successful today?",
                "stores_data": "success_indicators"
            },
            {
                "number": 7,
                "prompt": "What beliefs or assumptions might be holding you back?",
                "stores_data": False
            },
            {
                "number": 8,
                "prompt": "If someone had mastered this challenge, how might they view it differently?",
                "stores_data": False
            },
            {
                "number": 9,
                "prompt": "What's one small step you could take toward your goal?",
                "stores_data": "action_step"
            },
            {
                "number": 10,
                "prompt": "To summarize: You're working on {goal}, you'll know you've succeeded when {success_indicators}, and you'll try {action_step}. How does that sound?",
                "stores_data": False
            }
        ]
        
        self.current_step = 1
        self.total_steps = len(self.steps)
        self.conversation_history = {
            "messages": [],
            "user_data": {}
        }
        
        self.opening_lines = [
            "Hey there! 👋 I'm Joel, your executive coach. Think of me as your personal thinking partner! What's on your mind today?",
            "Hello! I'm Joel 🧠 - part coach, part idea-bouncer-offer. What challenge brings you here?",
            "Hi there! 👋 Joel here - professional question-asker and perspective-shifter. What's cooking in your world?"
        ]

        self.summarization_keywords = [
            "summarize", "summary", "sum up", "recap", "overview",
            "give me a summary", "summarise this", "wrap up", "brief me"
        ]

    def _get_gpt_response(self, prompt: str) -> str:
        try:
            messages = [
                {"role": "system", "content": self.system_message},
                *self.conversation_history["messages"],
                {"role": "user", "content": prompt}
            ]
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.8,
                max_tokens=150
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Oops! 🤖 Technical difficulty: {str(e)}"

    def _store_user_data(self, step: int, user_input: str):
        step_config = self.steps[step-1]
        if step_config.get("stores_data"):
            self.conversation_history["user_data"][step_config["stores_data"]] = user_input

    def is_summarization_request(self, user_input: str) -> bool:
        user_input_lower = user_input.lower().strip()
        for keyword in self.summarization_keywords:
            if keyword in user_input_lower:
                return True
        return False

    def summarize_conversation(self) -> str:
        try:
            user_data = self.conversation_history["user_data"]
            goal = user_data.get("goal", "Not specified")
            success_indicators = user_data.get("success_indicators", "Not specified")
            action_step = user_data.get("action_step", "Not specified")

            messages = "\n".join(
                [f"{msg['role'].capitalize()}: {msg['content']}" for msg in self.conversation_history["messages"]]
            )

            prompt = f"""
            Summarize the following conversation between a user and an executive coach named Joel. 
            Highlight key points such as the user's goal, success indicators, and action steps. 
            Keep the summary concise (under 200 words) and professional, focusing on the most important insights.

            Conversation:
            {messages}

            Key Points:
            - Goal: {goal}
            - Success Indicators: {success_indicators}
            - Action Step: {action_step}

            Summary:
            """
            summary = self._get_gpt_response(prompt)

            formatted_summary = (
                f"**Conversation Summary**\n\n"
                f"{summary}\n\n"
                f"**Key Points**\n"
                f"- **Goal**: {goal}\n"
                f"- **Success Indicators**: {success_indicators}\n"
                f"- **Action Step**: {action_step}"
            )
            return formatted_summary
        except Exception as e:
            return f"Error generating summary: {str(e)}"

    def get_step_response(self, user_input: Optional[str] = None) -> str:
        if user_input:
            self._store_user_data(self.current_step, user_input)
            self.conversation_history["messages"].append({"role": "user", "content": user_input})
        
        if self.current_step == 1:
            response = random.choice(self.opening_lines)
        elif self.current_step == 10:
            response = self.steps[9]["prompt"].format(**self.conversation_history["user_data"])
        else:
            step_goals = self.steps[self.current_step-1]["prompt"]
            last_user_msg = user_input if user_input else (
                self.conversation_history["messages"][-1]["content"] 
                if self.conversation_history["messages"] 
                else ""
            )
            
            prompt = f"""
            Current coaching step: {self.current_step} of {self.total_steps}
            Step purpose: {step_goals}
            Last user message: {last_user_msg}
            
            Craft a natural coaching response that:
            1. Acknowledges what the client just said
            2. Advances the coaching process
            3. Sounds human and engaging
            4. May include an appropriate emoji
            5. Is under 3 sentences
            
            Response:
            """
            response = self._get_gpt_response(prompt)
        
        self.conversation_history["messages"].append({"role": "assistant", "content": response})
        if user_input and self.current_step < self.total_steps:
            self.current_step += 1
            
        return response

    def reset_session(self):
        self.current_step = 1
        self.conversation_history = {"messages": [], "user_data": {}}

bot = CoachingBot()

def virtual_coach_response(conversation_history: List[Dict], user_input: str, current_step: int) -> str:
    bot.current_step = current_step
    bot.conversation_history["messages"] = conversation_history.copy()
    response = bot.get_step_response(user_input)
    return response