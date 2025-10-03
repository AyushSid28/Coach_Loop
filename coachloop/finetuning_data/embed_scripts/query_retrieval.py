import faiss
import numpy as np
import openai
import os

# Set OpenAI API Key from environment variable
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Mapping of AI Agents to their index and CSV files
AGENT_FILES = {
    "presentation": {
        "index": "indexes/vt_presentation/faiss_index_vt_presentation.index",
        "metadata": "indexes/vt_presentation/metadata_vt_presentation.npy",
    },
    "negotiation": {
        "index": "indexes/vt_negotiation_sales/faiss_index_vt_negotiation.index",
        "metadata": "indexes/vt_negotiation_sales/metadata_vt_negotiation.npy",
    },
    "behavior": {
        "index": "indexes/vt_behavior_training/faiss_index_vt_behavior_training.index",
        "metadata": "indexes/vt_behavior_training/metadata_vt_behavior_training.npy",
    },
}

def get_embedding(text):
    """Get OpenAI embedding using the new API format."""
    response = openai.embeddings.create(
        input=[text],  # OpenAI expects a list
        model="text-embedding-ada-002"
    )
    return np.array(response.data[0].embedding)  # Correct way to access data

def load_faiss_index(index_path):
    """Load FAISS index from file."""
    if not os.path.exists(index_path):
        print(f"❌ Error: FAISS index file not found: {index_path}")
        return None
    return faiss.read_index(index_path)

def load_metadata(metadata_path):
    """Load metadata file."""
    if not os.path.exists(metadata_path):
        print(f"❌ Error: Metadata file not found: {metadata_path}")
        return None
    return np.load(metadata_path, allow_pickle=True)

import os

def find_best_match(user_query, agent):
    """Find the best matching response from the FAISS index."""
    if agent not in AGENT_FILES:
        print("❌ Error: Invalid agent selection.")
        return None

    # Load FAISS index
    index_path = AGENT_FILES[agent]["index"]
    index = load_faiss_index(index_path)
    if index is None:
        return None

    # Load metadata (stores responses)
    metadata_path = AGENT_FILES[agent]["metadata"]
    responses = load_metadata(metadata_path)
    if responses is None:
        return None

    # Convert user query into embedding
    query_embedding = get_embedding(user_query).reshape(1, -1)

    # Search for the most similar vector
    _, idx = index.search(query_embedding, k=1)  # Get top 1 match

    # Retrieve the best response
    best_response = responses[idx[0][0]]

    # If response looks like a filename, try loading the content
    if isinstance(best_response, str) and best_response.endswith(".txt"):
        file_path = os.path.join("indexes", "vt_presentation_agent", best_response)
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as file:
                best_response = file.read()
        else:
            best_response = f"❌ Error: Unable to find content for {best_response}"

    return best_response


def main():
    print("Select an AI Agent: presentation / negotiation / behavior")
    agent = input("Enter AI Agent: ").strip().lower()

    if agent not in AGENT_FILES:
        print("❌ Error: Invalid AI Agent selection.")
        return

    print("\nEnter your query:")
    user_query = input("Query: ").strip()

    response = find_best_match(user_query, agent)

    if response:
        print("\n✅ Best Response:\n", response)
    else:
        print("⚠️ No relevant responses found.")

if __name__ == "__main__":
    main()
