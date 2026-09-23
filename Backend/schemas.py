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


class GroupCreate(BaseModel):
    name: str
    maxSize: int
    clgName: Optional[str] = None
    mentorName: Optional[str] = None
    creatorEmail: str

# --- New response schemas for group details and attendance ---

class AttendanceResponse(BaseModel):
    id: int
    userId: int
    date: str  # ISO format
    duration: Optional[int] = None
    activityName: Optional[str] = None
    note: Optional[str] = None

    class Config:
        from_attributes = True

class MemberWithAttendance(UserResponse):
    attendances: list[AttendanceResponse] = []

class GroupDetailsResponse(BaseModel):
    id: int
    name: str
    maxSize: int
    memberCount: int
    clgName: Optional[str] = None
    mentorName: Optional[str] = None
    creatorId: int
    members: list[MemberWithAttendance] = []

    class Config:
        from_attributes = True