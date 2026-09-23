from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
import tables
import schemas
from DBConnection import get_db

router = APIRouter()

@router.post("/add-attendance", response_model=schemas.AttendanceResponse, status_code=status.HTTP_201_CREATED)
def add_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(tables.User).filter(tables.User.email == attendance.userEmail).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Convert duration (hours) to minutes for storage
    duration_minutes = int(attendance.duration * 60)
    
    new_attendance = tables.Attendance(
        userId=user.id,
        date=attendance.date,
        duration=duration_minutes,
        activityName=attendance.activityName,
        note=attendance.note
    )
    
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    
    return new_attendance
