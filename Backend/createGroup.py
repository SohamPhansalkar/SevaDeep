from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import tables
import schemas
from DBConnection import get_db

router = APIRouter()

@router.post("/create-group", response_model=schemas.GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    # Find the user by creatorEmail since we are passing email from frontend localStorage
    user = db.query(tables.User).filter(tables.User.email == group.creatorEmail).first()
    if not user:
        raise HTTPException(status_code=404, detail="Creator user not found")
        
    new_group = tables.Group(
        name=group.name,
        maxSize=group.maxSize,
        memberCount=1,
        clgName=group.clgName,
        mentorName=group.mentorName,
        creatorId=user.id
    )
    
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    
    group_member = tables.GroupMember(
        userId=user.id,
        grpId=new_group.id
    )
    db.add(group_member)
    db.commit()
    
    return new_group
