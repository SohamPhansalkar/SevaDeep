from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
import tables
import schemas
from DBConnection import get_db

router = APIRouter()

@router.post("/login", response_model=schemas.UserResponse)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(tables.User).filter(tables.User.email == user_credentials.email).first()
    
    # Standard practice is to return 401 Unauthorized for bad credentials
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid Credentials"
        )
    
    # Since password is in plain text for now, we just compare strings directly
    if user.password != user_credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid Credentials"
        )
    
    # Look up the user's group membership
    membership = db.query(tables.GroupMember).filter(tables.GroupMember.userId == user.id).first()
    
    # Build response with groupId (None if user hasn't joined a group yet)
    response = schemas.UserResponse.model_validate(user)
    if membership:
        response.groupId = membership.grpId
    
    return response
