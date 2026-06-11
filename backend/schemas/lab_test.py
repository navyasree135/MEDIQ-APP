from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class LabTestBase(BaseModel):
    test_name: str
    lab_name: str
    order_date: str
    status: str
    file_name: Optional[str] = None


class LabTestCreate(LabTestBase):
    pass


class LabTestResponse(LabTestBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        from_attributes = True
