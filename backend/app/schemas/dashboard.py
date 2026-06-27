from pydantic import BaseModel


# =====================================================
# ADMIN DASHBOARD
# =====================================================

class DashboardSummary(BaseModel):

    total_complaints: int

    pending_complaints: int

    resolved_complaints: int

    closed_complaints: int

    escalated_complaints: int

    overdue_complaints: int

    critical_complaints: int

# =====================================================
# CATEGORY ANALYTICS
# =====================================================

class CategoryAnalytics(BaseModel):

    category: str

    total: int


# =====================================================
# PRIORITY ANALYTICS
# =====================================================

class PriorityAnalytics(BaseModel):

    priority: str

    total: int


# =====================================================
# STATUS ANALYTICS
# =====================================================

class StatusAnalytics(BaseModel):

    status: str

    total: int