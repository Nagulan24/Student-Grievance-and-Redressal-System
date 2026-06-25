from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict
)


# ==========================
# HISTORY RESPONSE
# ==========================

class HistoryResponse(BaseModel):

    history_id: int

    complaint_id: int

    action_type: str

    old_status: str | None = None

    new_status: str | None = None

    remarks: str | None = None

    performed_by: int

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )