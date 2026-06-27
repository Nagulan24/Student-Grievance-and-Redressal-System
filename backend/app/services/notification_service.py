from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationService:

    # =====================================================
    # CREATE NOTIFICATION
    # =====================================================

    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        complaint_id: int = None
    ):

        notification = Notification(

            user_id=user_id,

            complaint_id=complaint_id,

            notification_type=notification_type,

            title=title,

            message=message
        )

        db.add(notification)

        db.commit()

        db.refresh(notification)

        return notification


    # =====================================================
    # GET USER NOTIFICATIONS
    # =====================================================

    @staticmethod
    def get_notifications(
        db: Session,
        user_id: int
    ):

        return (

            db.query(Notification)

            .filter(
                Notification.user_id == user_id
            )

            .order_by(
                Notification.created_at.desc()
            )

            .all()

        )


    # =====================================================
    # MARK AS READ
    # =====================================================

    @staticmethod
    def mark_as_read(
        db: Session,
        notification_id: int,
        user_id: int
    ):

        notification = (

            db.query(Notification)

            .filter(

                Notification.notification_id == notification_id,

                Notification.user_id == user_id

            )

            .first()

        )

        if not notification:
            raise ValueError(
                "Notification not found"
            )

        notification.is_read = True

        db.commit()

        db.refresh(notification)

        return notification


    # =====================================================
    # UNREAD COUNT
    # =====================================================

    @staticmethod
    def get_unread_count(
        db: Session,
        user_id: int
    ):

        return (

            db.query(Notification)

            .filter(

                Notification.user_id == user_id,

                Notification.is_read == False

            )

            .count()

        )