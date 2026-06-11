from langchain.agents import create_agent

from backend.tools.api_tools import ToolingConfig, make_get_patient_data_tool, make_verify_identity_tool


def build_identity_agent(llm, base_url: str, token: str | None = None):
    config = ToolingConfig(base_url, token)
    tools = [
        make_verify_identity_tool(config),
        make_get_patient_data_tool(config),
    ]
    system_prompt = "You verify identity and retrieve patient profiles."
    return create_agent(llm, tools, system_prompt=system_prompt)
