from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import tables
import schemas
from DBConnection import get_db

router = APIRouter()


@router.get("/group/{group_id}/details", response_model=schemas.GroupDetailsResponse)
def get_group_details(group_id: int, db: Session = Depends(get_db)):
    # Get the group
    group = db.query(tables.Group).filter(tables.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Get members of the group via the junction table
    members = (
        db.query(tables.User)
        .join(tables.GroupMember, tables.GroupMember.userId == tables.User.id)
        .filter(tables.GroupMember.grpId == group_id)
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
                date=str(att.date.isoformat()),
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

    # Build final response
    response = schemas.GroupDetailsResponse(
        id=group.id,  # type: ignore[arg-type]
        name=str(group.name),
        maxSize=group.maxSize,  # type: ignore[arg-type]
        memberCount=group.memberCount,  # type: ignore[arg-type]
        creatorId=group.creatorId,  # type: ignore[arg-type]
        clgName=str(group.clgName) if group.clgName is not None else None,
        mentorName=str(group.mentorName) if group.mentorName is not None else None,
        members=members_with_attendance,
    )
    return response
