from typing import Annotated, Any
from uuid import uuid4
import json

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.security import get_current_user
from backend.models import Patient, User, UserRole, UrgencyLevel
from backend.schemas.chat import ChatMessageRequest, ChatMessageResponse
from backend.schemas.triage import TriageResult
from backend.agents.coordinator import Coordinator
from langchain_core.messages import HumanMessage

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("/coordinator", response_model=ChatMessageResponse)
def coordinator_message(
    payload: ChatMessageRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    if user.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent coordinator is available for patient accounts",
        )

    patient = db.query(Patient).filter(Patient.user_id == user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile missing",
        )

    llm_provider = getattr(request.app.state, "llm_provider", None)
    if llm_provider is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI features are currently unavailable. Please try again later.",
        )

    base_url = str(request.base_url).rstrip("/")
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()

    coordinator = Coordinator(llm=llm_provider, base_url=base_url, token=token)
    runnable = coordinator.build()

    session_id = payload.session_id or str(uuid4())
    message_text = payload.message.strip()

    try:
        response = runnable.invoke({
            "input": message_text,
            "messages": [HumanMessage(content=message_text)],
        })
        
        messages = response.get("messages", [])
        if messages:
            reply = messages[-1].content
        else:
            reply = "I couldn't process your request."

        # Extract triage result, offered slots, or booked appointments from the tool calls/messages
        triage_data = None
        offered_slot_data = None
        appointment_data = None

        for msg in messages:
            if hasattr(msg, "name") and msg.name:
                tool_name = msg.name
                content = msg.content
                if tool_name == "analyze_symptoms":
                    try:
                        data = json.loads(content)
                        if isinstance(data, dict):
                            triage_data = data
                    except Exception:
                        pass
                elif tool_name == "book_appointment":
                    try:
                        data = json.loads(content)
                        if isinstance(data, dict):
                            appointment_data = data
                    except Exception:
                        pass
                elif tool_name == "get_doctor_availability":
                    try:
                        data = json.loads(content)
                        if isinstance(data, list) and len(data) > 0:
                            offered_slot_data = data[0]
                        elif isinstance(data, dict):
                            offered_slot_data = data
                    except Exception:
                        pass

        # Build ChatMessageResponse elements if extracted
        triage_result = None
        if triage_data:
            urgency_str = triage_data.get("urgency", "routine")
            try:
                urgency_enum = UrgencyLevel(urgency_str)
            except ValueError:
                urgency_enum = UrgencyLevel.ROUTINE
            triage_result = TriageResult(
                urgency=urgency_enum,
                rationale=triage_data.get("rationale", "")
            )

        return ChatMessageResponse(
            session_id=session_id,
            reply=reply,
            triage=triage_result,
            offered_slot=offered_slot_data,
            appointment=appointment_data
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent coordination failed: {e}",
        )
