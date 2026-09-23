from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import tables
import schemas
from DBConnection import get_db

router = APIRouter()

@router.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email is already registered
    db_user_email = db.query(tables.User).filter(tables.User.email == user.email).first()
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if phone number is already registered
    db_user_phone = db.query(tables.User).filter(tables.User.phoneNumber == user.contactNumber).first()
    if db_user_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    new_user = tables.User(
        email=user.email,
        phoneNumber=user.contactNumber,
        password=user.password,
        firstName=user.firstName,
        lastName=user.lastName,
        gender=user.gender,
        institution=user.institution
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user
