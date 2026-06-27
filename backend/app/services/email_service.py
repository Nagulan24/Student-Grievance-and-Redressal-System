import resend

from app.core.config import (
    RESEND_API_KEY,
    EMAIL_FROM
)

# Configure Resend
resend.api_key = RESEND_API_KEY


class EmailService:

    @staticmethod
    def send_email(
        to_emails: list[str],
        subject: str,
        html: str
    ) -> bool:
        """
        Send an email to one or more recipients.

        Args:
            to_emails: List of recipient email addresses.
            subject: Email subject.
            html: HTML email content.

        Returns:
            True if email sent successfully, otherwise False.
        """

        # Remove duplicates and empty values
        recipients = list(
            {
                email.strip()
                for email in to_emails
                if email
            }
        )

        if not recipients:
            return False

        try:

            resend.Emails.send(
                {
                    "from": EMAIL_FROM,
                    "to": recipients,
                    "subject": subject,
                    "html": html
                }
            )

            return True

        except Exception as e:

            print(f"Resend Email Error: {e}")

            return False