from backend.agents.identity_agent import build_identity_agent
from backend.agents.scheduling_agent import build_scheduling_agent
from backend.agents.triage_agent import build_triage_agent


class Coordinator:
    def __init__(self, llm, base_url: str, token: str | None = None) -> None:
        self.identity = build_identity_agent(llm, base_url, token)
        self.triage = build_triage_agent(llm, base_url, token)
        self.scheduling = build_scheduling_agent(llm, base_url, token)

    def route(self, intent: str):
        if "identity" in intent:
            return self.identity
        if "triage" in intent:
            return self.triage
        return self.scheduling

    def build(self):
        def _run(input: dict):
            intent = "scheduling"
            text = input.get("input", "").lower()
            if any(word in text for word in ["login", "verify", "identity", "who am i"]):
                intent = "identity"
            elif any(word in text for word in ["symptom", "pain", "fever", "triage", "urgency"]):
                intent = "triage"
            agent = self.route(intent)
            return agent.invoke(input)

        class CoordinatorRunnable:
            def invoke(self, data: dict):
                return _run(data)

        return CoordinatorRunnable()
