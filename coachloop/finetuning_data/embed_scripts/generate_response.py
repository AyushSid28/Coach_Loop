import os
import json
import faiss
import numpy as np
import openai
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # Fetch from environment variable

if not OPENAI_API_KEY:
    raise ValueError("❌ OPENAI_API_KEY is not set. Please set it as an environment variable.")

# Initialize OpenAI client
client = openai.OpenAI()

# Base directories
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FINETUNING_DIR = "/Users/ayushsiddhant/Desktop/CoachLoop/coachloop/finetuning_data"
INDEX_DIR = os.path.join(BASE_DIR, "indexes")

# Tone file paths
TONE_FILES = {
    # "virtual_coach": os.path.join(FINETUNING_DIR, "virtual_coach", "tone_virtual_coach.json"),
    "virtual_trainer": os.path.join(FINETUNING_DIR, "virtual_trainer/agent_training", "tone_virtual_trainer.json"),
}

# Metadata files
METADATA_FILES = {
    # "virtual_coach": os.path.join(FINETUNING_DIR, "virtual_coach", "metadata_virtual_coach.json"),
    "virtual_trainer_negotiation": os.path.join(FINETUNING_DIR, "virtual_trainer/agent_training", "metadata_negotiation.json"),
    "virtual_trainer_sales": os.path.join(FINETUNING_DIR, "virtual_trainer/agent_training", "metadata_sales.json"),
    "virtual_trainer_presentation": os.path.join(FINETUNING_DIR, "virtual_trainer/agent_training", "metadata_presentation.json"),
    "virtual_trainer_behavior": os.path.join(FINETUNING_DIR, "virtual_trainer/agent_training", "metadata_behavior.json"),
    "virtual_trainer": os.path.join(FINETUNING_DIR, "virtual_trainer/agent_training", "metadata_virtual_trainer.json"),
}

def load_json(file_path, description):
    """Load JSON file safely."""
    if not os.path.exists(file_path):
        print(f"Warning: {description} not found at {file_path}")
        return None
    with open(file_path, "r") as file:
        return json.load(file)

def load_index(index_name):
    """Load FAISS index safely from multiple possible locations."""
    paths = [
        os.path.join(INDEX_DIR, f"{index_name}.index"),
        # os.path.join(INDEX_DIR, "virtual_coach_text", "faiss_index_vc_text.index"),
        # os.path.join(INDEX_DIR, "virtual_coach_video", "faiss_index_vc_video.index")
    ]
    for path in paths:
        if os.path.exists(path):
            print(f"Loaded FAISS index from: {path}")
            return faiss.read_index(path)
    print(f"Warning: No valid FAISS index found for {index_name}")
    return None

def get_embedding(text):
    """Generate an OpenAI embedding for a given text."""
    try:
        response = client.embeddings.create(
            model="text-embedding-ada-002",
            input=[text]
        )
        return np.array(response.data[0].embedding, dtype=np.float32)
    except Exception as e:
        print(f"Error: OpenAI Embedding API failed: {e}")
        return np.random.rand(1536).astype("float32")  # Random fallback embedding

def search_index(index, query_embedding, top_k=3):
    """Search FAISS index and return top matches."""
    if index is None:
        return []

    expected_dim = index.d
    actual_dim = query_embedding.shape[0]
    
    if actual_dim != expected_dim:
        print(f"Resizing embedding: Expected {expected_dim}, got {actual_dim}. Adjusting...")
        query_embedding = np.resize(query_embedding, expected_dim)
    
    distances, indices = index.search(np.array([query_embedding]), top_k)
    return indices[0] if indices.size > 0 else []

def load_tone(agent):
    """Load tone file for the selected agent."""
    # if agent.startswith("virtual_coach"):
    #     return load_json(TONE_FILES["virtual_coach"], "Virtual Coach Tone")
    return load_json(TONE_FILES["virtual_trainer"], "Virtual Trainer Tone")

def build_system_message(agent, tone_data):
    """Construct system message using tone settings."""
    if not tone_data:
        return "You are a helpful AI assistant."

    objective = tone_data.get("purpose", "Guide the user effectively.")
    role = tone_data.get("role", "An AI coach providing structured guidance.")
    session_steps = [step["title"] for step in tone_data.get("coaching_session_structure", []) if "title" in step]

    message = (
        f"Objective: {objective}. Role: {role}. Use an interactive coaching style. "
        "Provide responses in three key points with examples when relevant. "
        "Encourage engagement by asking a thought-provoking question at the end."
    )

    if session_steps:
        message += " Session Steps: " + ", ".join(session_steps) + "."

    return message.strip()

def call_openai(prompt, agent, tone_data):
    """Query OpenAI Chat API with structured messages."""
    system_message = build_system_message(agent, tone_data)
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": prompt}
    ]
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error: OpenAI Chat API failed: {e}")
        return "I'm experiencing difficulties. Please try again later."

def generate_response(user_id, agent_type, user_query):
    """Generate AI response based on user query and selected agent."""
    
    # Load necessary files
    metadata = load_json(METADATA_FILES.get(agent_type, ""), "Metadata")
    index = load_index(agent_type)
    tone_data = load_tone(agent_type)

    if metadata is None or index is None:
        return "❌ Missing necessary files. Unable to generate a response."

    # Process the user query
    query_embedding = get_embedding(user_query)
    top_indices = search_index(index, query_embedding, top_k=3)

    context_prompt = metadata[top_indices[0]] if top_indices.size > 0 and top_indices[0] < len(metadata) else user_query
    ai_response = call_openai(context_prompt, agent_type, tone_data)

    return ai_response  

if __name__ == "__main__":
    generate_response()
