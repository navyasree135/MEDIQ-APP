from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from backend.agents.identity_agent import build_identity_agent
from backend.agents.scheduling_agent import build_scheduling_agent
from backend.agents.triage_agent import build_triage_agent

# Keywords that indicate a genuine medical/symptom query
SYMPTOM_KEYWORDS = [
    "symptom", "pain", "fever", "triage", "urgency", "headache", "vomit",
    "nausea", "dizzy", "cough", "cold", "sore", "ache", "hurt", "ill",
    "sick", "bleeding", "swollen", "rash", "breathe", "chest", "infection",
    "fatigue", "tired", "weak", "allerg", "diabetes", "blood pressure",
    "feeling", "feel", "stomach", "throat", "pressure", "sweat", "shiver",
]

# Keywords that indicate booking / scheduling intent
SCHEDULING_KEYWORDS = [
    "book", "appointment", "schedule", "doctor", "slot", "available",
    "reserve", "consult", "visit", "specialist", "cardiolog", "pediatr",
    "book this slot", "different slot",
]

CHAT_SYSTEM_PROMPT = (
    "You are MediQ, a warm and helpful medical assistant. "
    "Respond naturally to greetings and general questions. "
    "If a user mentions any health concern or symptom, gently acknowledge it "
    "and ask them to describe their symptoms so you can help assess and book an appointment. "
    "Keep responses short, friendly, and conversational. "
    "Do not run any medical analysis unless the user explicitly describes symptoms."
)


class Coordinator:
    def __init__(self, llm, base_url: str, token: str | None = None) -> None:
        self.llm = llm
        self.identity = build_identity_agent(llm, base_url, token)
        self.triage = build_triage_agent(llm, base_url, token)
        self.scheduling = build_scheduling_agent(llm, base_url, token)

    def build(self):
        llm = self.llm
        identity = self.identity
        triage = self.triage
        scheduling = self.scheduling

        def _run(input: dict):
            text = input.get("input", "").strip().lower()

            # 1. Identity queries
            if any(word in text for word in ["login", "verify", "identity", "who am i"]):
                return identity.invoke(input)

            # 2. Clear symptom/medical queries → triage agent
            if any(word in text for word in SYMPTOM_KEYWORDS):
                return triage.invoke(input)

            # 3. Booking/scheduling queries → scheduling agent
            if any(word in text for word in SCHEDULING_KEYWORDS):
                return scheduling.invoke(input)

            # 4. General chat / greetings → direct LLM conversational reply
            try:
                messages = [
                    SystemMessage(content=CHAT_SYSTEM_PROMPT),
                    HumanMessage(content=input.get("input", "")),
                ]
                reply_msg = llm.generate_response(messages)
                reply_text = reply_msg.content if hasattr(reply_msg, "content") else str(reply_msg)
            except Exception:
                reply_text = (
                    "Hello! I'm MediQ, your personal medical assistant. 😊\n"
                    "You can tell me your symptoms, and I'll help assess your condition "
                    "and book an appointment with the right doctor."
                )

            return {"messages": [AIMessage(content=reply_text)]}

        class CoordinatorRunnable:
            def invoke(self, data: dict):
                return _run(data)

        return CoordinatorRunnable()
