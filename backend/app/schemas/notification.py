from datetime import datetime
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict
)


# =====================================================
# NOTIFICATION RESPONSE
# =====================================================

class NotificationResponse(BaseModel):

    notification_id: int

    complaint_id: Optional[int] = None

    notification_type: str

    title: str

    message: str

    is_read: bool

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# MARK AS READ REQUEST
# =====================================================

class MarkNotificationReadRequest(BaseModel):

    is_read: bool = True