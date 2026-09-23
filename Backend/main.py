from typing import List
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

import tables 
import schemas
from DBConnection import get_db

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SevaDeep API",
    description="Backend service for SevaDeep NGO Attendance Logging System",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from signUp import router as signup_router
from LogIn import router as login_router
from groupDetails import router as groupdetails_router
from createGroup import router as creategroup_router

app.include_router(signup_router)
app.include_router(login_router)
app.include_router(creategroup_router)
app.include_router(groupdetails_router)



@app.get("/")
def root():
    return {"message": "Welcome to SevaDeep NGO API Server"}


@app.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    """Fetch all users (Verification route)"""
    return db.query(tables.User).all()


@app.get("/groups", response_model=List[schemas.GroupResponse])
def get_all_groups(db: Session = Depends(get_db)):
    """Fetch all groups (Verification route)"""
    return db.query(tables.Group).all()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)