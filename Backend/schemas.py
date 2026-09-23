from datetime import date
from typing import Optional
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    email: str
    phoneNumber: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    gender: Optional[str] = None
    institution: Optional[str] = None

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: str
    contactNumber: str
    gender: str
    institution: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class GroupResponse(BaseModel):
    id: int
    name: str
    maxSize: int
    memberCount: int
    clgName: Optional[str] = None
    mentorName: Optional[str] = None
    creatorId: int

    class Config:
        from_attributes = True