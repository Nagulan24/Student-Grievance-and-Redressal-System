from datetime import datetime
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict
)


# =====================================================
# SLA DETAILS RESPONSE
# =====================================================

class SLAResponse(BaseModel):

    complaint_id: int

    complaint_code: str

    sla_deadline: Optional[datetime] = None

    sla_status: str

    response_time: Optional[int] = None

    resolution_time: Optional[int] = None

    remaining_time: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# OVERDUE COMPLAINT RESPONSE
# =====================================================

class OverdueComplaintResponse(BaseModel):

    complaint_id: int

    complaint_code: str

    category: str

    priority: str

    status: str

    current_owner: Optional[int]

    sla_deadline: Optional[datetime]

    remaining_time: Optional[str]

    model_config = ConfigDict(
        from_attributes=True
    )