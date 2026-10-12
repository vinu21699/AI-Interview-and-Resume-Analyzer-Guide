from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ChatMessage
from app.schemas import ChatRequest
from app.auth import get_current_user
from app.ai_engine import generate_chatbot_response_ai

router = APIRouter(prefix="/api/chatbot", tags=["AI Learning Assistant"])

@router.post("/chat")
def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_msg = ChatMessage(user_id=current_user.id, role="user", message=req.message)
    db.add(user_msg)
    db.commit()

    ai_reply_text = generate_chatbot_response_ai(req.message)

    ai_msg = ChatMessage(user_id=current_user.id, role="model", message=ai_reply_text)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return {"reply": ai_reply_text, "chat_id": ai_msg.id}

@router.get("/history")
def get_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.id.asc()).all()
    return messages
