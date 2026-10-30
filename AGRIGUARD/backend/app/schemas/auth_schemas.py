from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    mobile: str = Field(..., min_length=10, max_length=15)
    email: EmailStr
    state: str = Field(..., min_length=2)
    district: str = Field(..., min_length=2)
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    preferred_language: Optional[str] = "ta"

class LoginRequest(BaseModel):
    mobile: Optional[str] = None
    email: Optional[str] = None
    identifier: Optional[str] = None
    username: Optional[str] = None
    password: str = Field(..., min_length=1)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=10)
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

class UserProfileData(BaseModel):
    id: str
    full_name: str
    mobile: str
    email: str
    state: str
    district: str
    preferred_language: str
    created_at: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    message_ta: Optional[str] = None
    message_hi: Optional[str] = None
    token: Optional[str] = None
    user: Optional[UserProfileData] = None

class ForgotPasswordResponse(BaseModel):
    success: bool
    message: str
    message_ta: Optional[str] = None
    message_hi: Optional[str] = None
    email_sent: bool
    reset_token: Optional[str] = None
    reset_url: Optional[str] = None
