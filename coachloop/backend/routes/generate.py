from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.response_service import generate_ai_response  

router = APIRouter()

class QueryRequest(BaseModel):
    role: str
    query: str

@router.post("/generate_response")
def generate_response(request: QueryRequest):
    response = generate_ai_response(request.role, request.query)
    return {"response": response}
