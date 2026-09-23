from fastapi import APIRouter, Depends, HTTPException, status
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
        
    # Login successful, return the user info (password is hidden by UserResponse schema)
    return user
