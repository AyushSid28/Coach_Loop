import sys
import os

# Add finetuning_data/embed_scripts to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../finetuning_data/embed_scripts")))

from generate_response import get_response  # Assuming get_response is inside generate_response.py

def generate_ai_response(role, query):
    return get_response(role, query)  # Call the function
