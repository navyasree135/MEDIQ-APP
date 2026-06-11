from langchain.agents import create_agent

from backend.tools.api_tools import ToolingConfig, make_analyze_symptoms_tool


def build_triage_agent(llm, base_url: str, token: str | None = None):
    config = ToolingConfig(base_url, token)
    tools = [make_analyze_symptoms_tool(config)]
    system_prompt = "You collect symptoms and classify urgency."
    return create_agent(llm, tools, system_prompt=system_prompt)
