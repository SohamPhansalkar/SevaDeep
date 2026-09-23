from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import tables
import schemas
from DBConnection import get_db

router = APIRouter(prefix="/admin")

@router.get("/groups", response_model=List[schemas.GroupDetailsResponse])
def get_all_groups_details(db: Session = Depends(get_db)):
    groups = db.query(tables.Group).all()
    all_groups_response = []
    
    for group in groups:
        # Get members of the group via the junction table
        members = (
            db.query(tables.User)
            .join(tables.GroupMember, tables.GroupMember.userId == tables.User.id)
            .filter(tables.GroupMember.grpId == group.id)
            .all()
        )

        # Build member list with their attendance records
        members_with_attendance = []
        for member in members:
            attendances = (
                db.query(tables.Attendance)
                .filter(tables.Attendance.userId == member.id)
                .order_by(tables.Attendance.date.desc())
                .all()
            )
            member_attendance = [
                schemas.AttendanceResponse(
                    id=att.id,
                    userId=int(att.userId),
                    date=att.date,
                    duration=int(att.duration) if att.duration is not None else None,
                    activityName=str(att.activityName) if att.activityName is not None else None,
                    note=str(att.note) if att.note is not None else None,
                )
                for att in attendances
            ]
            member_data = schemas.MemberWithAttendance(
                id=member.id,
                email=str(member.email),
                phoneNumber=str(member.phoneNumber) if member.phoneNumber is not None else None,
                firstName=str(member.firstName) if member.firstName is not None else None,
                lastName=str(member.lastName) if member.lastName is not None else None,
                gender=str(member.gender) if member.gender is not None else None,
                institution=str(member.institution) if member.institution is not None else None,
                attendances=member_attendance,
            )
            members_with_attendance.append(member_data)

        # Build final response for this group
        group_response = schemas.GroupDetailsResponse(
            id=group.id,  # type: ignore[arg-type]
            name=str(group.name),
            maxSize=group.maxSize,  # type: ignore[arg-type]
            memberCount=group.memberCount,  # type: ignore[arg-type]
            creatorId=group.creatorId,  # type: ignore[arg-type]
            clgName=str(group.clgName) if group.clgName is not None else None,
            mentorName=str(group.mentorName) if group.mentorName is not None else None,
            members=members_with_attendance,
        )
        all_groups_response.append(group_response)
        
    return all_groups_response


@router.get("/users", response_model=List[schemas.AdminUserResponse])
def get_all_users_for_admin(db: Session = Depends(get_db)):
    users = db.query(tables.User).all()
    result = []
    for user in users:
        group_member = db.query(tables.GroupMember).filter(tables.GroupMember.userId == user.id).first()
        group_name = None
        group_id = None
        if group_member:
            group_id = group_member.grpId
            group = db.query(tables.Group).filter(tables.Group.id == group_id).first()
            if group:
                group_name = group.name
                
        user_res = schemas.AdminUserResponse.model_validate(user)
        user_res.groupId = group_id
        user_res.groupName = group_name
        result.append(user_res)
        
    return result

@router.get("/user/{email}", response_model=schemas.AdminUserDetailsResponse)
def get_user_details(email: str, db: Session = Depends(get_db)):
    user = db.query(tables.User).filter(tables.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    group_member = db.query(tables.GroupMember).filter(tables.GroupMember.userId == user.id).first()
    group_name = None
    group_id = None
    group_info = None
    if group_member:
        group_id = group_member.grpId
        group = db.query(tables.Group).filter(tables.Group.id == group_id).first()
        if group:
            group_name = group.name
            group_info = schemas.GroupResponse.model_validate(group)
            
    attendances = (
        db.query(tables.Attendance)
        .filter(tables.Attendance.userId == user.id)
        .order_by(tables.Attendance.date.desc())
        .all()
    )
    
    attendance_list = [
        schemas.AttendanceResponse(
            id=att.id,
            userId=int(att.userId),
            date=att.date,
            duration=int(att.duration) if att.duration is not None else None,
            activityName=str(att.activityName) if att.activityName is not None else None,
            note=str(att.note) if att.note is not None else None,
        )
        for att in attendances
    ]
    
    user_res = schemas.AdminUserDetailsResponse.model_validate(user)
    user_res.groupId = group_id
    user_res.groupName = group_name
    user_res.attendances = attendance_list
    user_res.groupInfo = group_info
    
    return user_res
