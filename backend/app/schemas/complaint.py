from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict
)


# =====================================================
# COMPLAINT CATEGORY
# =====================================================

class ComplaintCategory(str, Enum):
    ACADEMIC = "ACADEMIC"
    INFRASTRUCTURE = "INFRASTRUCTURE"
    HOSTEL = "HOSTEL"
    EXAMINATION = "EXAMINATION"
    PLACEMENT = "PLACEMENT"
    TRANSPORTATION = "TRANSPORTATION"
    SAFETY = "SAFETY"


# =====================================================
# COMPLAINT STATUS
# =====================================================

class ComplaintStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    REOPENED = "REOPENED"
    ESCALATED = "ESCALATED"


# =====================================================
# CREATE COMPLAINT
# =====================================================

class ComplaintCreate(BaseModel):

    title: str

    description: str

    category: ComplaintCategory

    subcategory: Optional[str] = None

    location: Optional[str] = None

    is_anonymous: bool = False


# =====================================================
# COMPLAINT RESPONSE
# =====================================================

class ComplaintResponse(BaseModel):

    complaint_id: int

    complaint_code: str

    title: str

    category: str

    priority: str

    status: str

    is_anonymous: bool

    anonymous_id: Optional[str] = None

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# COMPLAINT DETAIL RESPONSE
# =====================================================

class ComplaintDetailResponse(BaseModel):

    complaint_id: int

    complaint_code: str

    title: str

    description: str

    category: str

    subcategory: Optional[str]

    location: Optional[str]

    priority: str

    status: str

    severity_score: int

    support_count: int

    is_anonymous: bool

    anonymous_id: Optional[str]

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# ASSIGN COMPLAINT
# =====================================================

class AssignmentRequest(BaseModel):

    assigned_to: int

    remarks: Optional[str] = None


class AssignmentResponse(BaseModel):

    complaint_id: int

    complaint_code: str

    assigned_to: int

    current_owner: int

    status: str

    remarks: Optional[str] = None


    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# UPDATE STATUS
# =====================================================

class StatusUpdateRequest(BaseModel):

    status: ComplaintStatus

    remarks: Optional[str] = None


class StatusUpdateResponse(BaseModel):

    complaint_id: int

    complaint_code: str

    status: str

    remarks: Optional[str] = None

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# RESOLVE COMPLAINT
# =====================================================

class ResolveRequest(BaseModel):

    remarks: Optional[str] = None


# =====================================================
# CLOSE COMPLAINT
# =====================================================

class CloseRequest(BaseModel):

    remarks: Optional[str] = None


# =====================================================
# REOPEN COMPLAINT
# =====================================================

class ReopenRequest(BaseModel):

    remarks: Optional[str] = None


# =====================================================
# ESCALATE COMPLAINT
# =====================================================

class EscalateRequest(BaseModel):

    to_user_id: int

    remarks: Optional[str] = None