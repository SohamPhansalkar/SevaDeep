from sqlalchemy import Column, Date, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship
from DBConnection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(50), unique=True, nullable=False)
    phoneNumber = Column(String(15), unique=True)
    password = Column(String(100), nullable=False)
    firstName = Column(String(50))
    lastName = Column(String(50))

    # Relationships
    groups_created = relationship("Group", back_populates="creator")
    groups = relationship("Group", secondary="grpMembers", back_populates="members")
    attendances = relationship("Attendance", back_populates="user")


class Group(Base):
    __tablename__ = "grps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    maxSize = Column(Integer, nullable=False)
    memberCount = Column(Integer, nullable=False, default=1)
    clgName = Column(String(255))
    mentorName = Column(String(50))
    creatorId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    # Relationships
    creator = relationship("User", back_populates="groups_created")
    members = relationship("User", secondary="grpMembers", back_populates="groups")


class GroupMember(Base):
    __tablename__ = "grpMembers"

    userId = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True
    )
    grpId = Column(
        Integer, ForeignKey("grps.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True
    )


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    duration = Column(Integer)
    activityName = Column(String(255))
    note = Column(String(255))

    # Relationship
    user = relationship("User", back_populates="attendances")