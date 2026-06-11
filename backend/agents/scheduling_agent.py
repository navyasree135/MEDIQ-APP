from langchain.agents import create_agent

from backend.tools.api_tools import (
    ToolingConfig,
    make_book_appointment_tool,
    make_get_doctor_availability_tool,
    make_verify_insurance_tool,
)


def build_scheduling_agent(llm, base_url: str, token: str | None = None):
    config = ToolingConfig(base_url, token)
    tools = [
        make_get_doctor_availability_tool(config),
        make_verify_insurance_tool(config),
        make_book_appointment_tool(config),
    ]
    system_prompt = "You find doctors, verify insurance, and book appointments."
    return create_agent(llm, tools, system_prompt=system_prompt)
