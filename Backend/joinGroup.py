from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
import tables
import schemas
from DBConnection import get_db
from pydantic import BaseModel

router = APIRouter()


class JoinGroupRequest(BaseModel):
    groupId: int
    userEmail: str


@router.post("/join-group", response_model=schemas.GroupResponse)
def join_group(req: JoinGroupRequest, db: Session = Depends(get_db)):
    # Find the user by email
    user = db.query(tables.User).filter(tables.User.email == req.userEmail).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Find the group by ID
    group = db.query(tables.Group).filter(tables.Group.id == req.groupId).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Check if user is already a member
    existing = db.query(tables.GroupMember).filter(
        tables.GroupMember.userId == user.id,
        tables.GroupMember.grpId == group.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You are already a member of this group")

    # Check if group is full
    if group.memberCount >= group.maxSize:
        raise HTTPException(status_code=400, detail="Group is full")

    # Add user as a member
    group_member = tables.GroupMember(userId=user.id, grpId=group.id)
    db.add(group_member)

    # Increment member count
    group.memberCount += 1

    db.commit()
    db.refresh(group)

    return group
