import re
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from backend.models.user import UserRole


def validate_password_complexity(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Password must contain at least one uppercase letter (A-Z).")
    if not re.search(r"[0-9]", v):
        raise ValueError("Password must contain at least one number (0-9).")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>\-_\\\/+=;']", v):
        raise ValueError("Password must contain at least one special character (e.g. @, #, $, !).")
    return v


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int
    role: UserRole


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str
    role: UserRole = UserRole.PATIENT
    specialty: Optional[str] = None
    location: Optional[str] = None

    @field_validator("password")
    @classmethod
    def check_password_complexity(cls, v: str) -> str:
        return validate_password_complexity(v)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    full_name: Optional[str]

    class Config:
        from_attributes = True


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def check_new_password_complexity(cls, v: str) -> str:
        return validate_password_complexity(v)
