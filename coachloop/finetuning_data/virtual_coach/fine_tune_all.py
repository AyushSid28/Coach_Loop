import time
from openai import OpenAI

# 🔑 OpenAI API Key (Replace with your actual API key)
client = OpenAI(api_key="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")  

# OpenAI fine-tuning job limit (1 job at a time)
MAX_ACTIVE_JOBS = 1  

# 🎯 **File IDs for Fine-Tuning** (Processing order)
FILE_IDS_TO_FINETUNE = [
    "file-VdAUZwShrsjoHVYeZ1GrfR",  # VC3.jsonl
    "file-B4bVUbp3xAnAYYQFuMELWh",  # VC11.jsonl
    "file-9wi7GWbUisMVgJTbafm6JP",  # VC1.jsonl
    "file-8NY8aBVXiKWQMndgckyHQm",  # VC5.jsonl
    "file-4etjMxLtVP2jwYKrdj2m5L",  # vc15.jsonl
    "file-J9uCyCYfmvP4XTsNaghkNK",  # VC17.jsonl
    "file-RH5jVjEn6tk9MwquQFqMnY",  # VC7.jsonl
    "file-RtR4LGFfbTAtneKAWVJrpB",  # VC10.jsonl
    "file-JbkwKgW49HSc4Td6RqMSPA",  # VC2.jsonl
    "file-GYYCtL9YmoEVFecCZcVR97",  # VC16.jsonl
    "file-VcAGu3CsV3Xw9N7ZeASmv7",  # VC6.jsonl
    "file-9zgnhVznp1oJs2j1TxDfny",  # VC25.jsonl
    "file-K53tQBa9ZdPczjFTzJoq3o",  # VC18.jsonl
    "file-PodPoryC8z8CtKeLXG87XU",  # VC8.jsonl
    "file-C42dFcox3bjqZabM3jzSv8",  # VC21.jsonl
    "file-6Y9gGqWkmALwr7AduP1pUW",  # VC26.jsonl
    "file-R4MXmCbJSBrsG2F3Z3mLtc",  # VC19.jsonl
    "file-RBoPFd6tdQGDCkvWkSULUW",  # VC9.jsonl
    "file-9XHyRRPWfvxtRnMA2i7CsL",  # VC20.jsonl
    "file-NeVhbTcM9fEvq98JXamch3"   # VC22.jsonl
]

# Track job statuses
active_jobs = {}
completed_jobs = {}

def get_active_fine_tune_jobs():
    """Fetch all active fine-tuning jobs."""
    try:
        jobs = client.fine_tuning.jobs.list()
        active = {job.id: job.status for job in jobs.data if job.status not in ["succeeded", "failed", "cancelled"]}
        print(f"🚀 {len(active)} active fine-tuning jobs.")
        return active
    except Exception as e:
        print(f"❌ Error fetching active jobs: {e}")
        return {}

def start_fine_tune(file_id):
    """Starts fine-tuning for a given file ID."""
    try:
        job = client.fine_tuning.jobs.create(training_file=file_id, model="gpt-3.5-turbo-0125")
        print(f"🚀 Fine-tuning started → File ID: {file_id}, Job ID: {job.id}")
        active_jobs[job.id] = file_id
        return job.id
    except Exception as e:
        print(f"❌ Error creating fine-tuning job for File ID {file_id}: {e}")
        return None

def track_jobs():
    """Monitors active fine-tuning jobs and starts new ones sequentially."""
    while FILE_IDS_TO_FINETUNE or active_jobs:
        completed_jobs_list = []

        # Check the status of active jobs
        for job_id in list(active_jobs.keys()):
            try:
                job = client.fine_tuning.jobs.retrieve(job_id)
                status = job.status
                print(f"📡 Job ID: {job_id}, Status: {status}")

                if status in ["succeeded", "failed", "cancelled"]:
                    completed_jobs[job_id] = status
                    completed_jobs_list.append(job_id)
                    print(f"✅ Job {job_id} completed! Model ID: {job.fine_tuned_model if status == 'succeeded' else 'N/A'}")

            except Exception as e:
                print(f"❌ Error fetching status for Job ID {job_id}: {e}")

        # Remove completed jobs from active list
        for job_id in completed_jobs_list:
            del active_jobs[job_id]

        # Start the next job if there's space
        while len(active_jobs) < MAX_ACTIVE_JOBS and FILE_IDS_TO_FINETUNE:
            next_file_id = FILE_IDS_TO_FINETUNE.pop(0)
            job_id = start_fine_tune(next_file_id)
            if job_id:
                active_jobs[job_id] = next_file_id

        if active_jobs:
            time.sleep(30)  # Wait before checking again

    print("\n🎉 **Fine-tuning completed for all jobs!** 🎉")
    for job_id, status in completed_jobs.items():
        print(f"🚀 Job {job_id}: {status}")

# 🚀 **Main Execution**
if __name__ == "__main__":
    # Step 1: Check active fine-tuning jobs
    active_jobs = get_active_fine_tune_jobs()

    # Step 2: Start fine-tuning and track progress
    if FILE_IDS_TO_FINETUNE:
        track_jobs()
    else:
        print("❌ No new file IDs available for fine-tuning.")
