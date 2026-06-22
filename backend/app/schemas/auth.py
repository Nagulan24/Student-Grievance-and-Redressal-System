from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    register_no: str
    name: str
    email: EmailStr
    phone: str | None = None
    password: str
    department_id: int

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: int
    email: str
    role: str

class CurrentUserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    role: str
    department_id: int | None = None