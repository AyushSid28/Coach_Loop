from utils import create_faiss_index  # Import the universal function

if __name__ == "__main__":
    training_type = "behavior_training"  # Only for vt_behavior
    print(f"\n🚀 Processing {training_type}...\n")
    create_faiss_index(training_type)
