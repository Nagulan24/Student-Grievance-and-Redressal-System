class EmailTemplates:

    @staticmethod
    def complaint_submitted(complaint):

        return f"""
        <html>
        <body>

        <h2>Complaint Submitted Successfully</h2>

        <p>Your complaint has been submitted.</p>

        <table border="1" cellpadding="8">

        <tr>
            <td><b>Complaint Code</b></td>
            <td>{complaint.complaint_code}</td>
        </tr>

        <tr>
            <td><b>Category</b></td>
            <td>{complaint.category}</td>
        </tr>

        <tr>
            <td><b>Status</b></td>
            <td>{complaint.status}</td>
        </tr>

        <tr>
            <td><b>Priority</b></td>
            <td>{complaint.priority}</td>
        </tr>

        </table>

        <br>

        <p>
        You can log in anytime to track your complaint.
        </p>

        <hr>

        <small>
        Student Wellbeing & Grievance System
        </small>

        </body>
        </html>
        """

    @staticmethod
    def complaint_assigned(complaint):

        return f"""
        <html>
        <body>

        <h2>Complaint Assigned</h2>

        <p>

        Complaint

        <b>{complaint.complaint_code}</b>

        has been assigned.

        </p>

        </body>
        </html>
        """

    @staticmethod
    def complaint_status_updated(complaint):

        return f"""
        <html>
        <body>

        <h2>Status Updated</h2>

        <p>

        Complaint

        <b>{complaint.complaint_code}</b>

        is now

        <b>{complaint.status}</b>

        </p>

        </body>
        </html>
        """

    @staticmethod
    def complaint_resolved(complaint):

        return f"""
        <html>
        <body>

        <h2>Complaint Resolved</h2>

        <p>

        Complaint

        <b>{complaint.complaint_code}</b>

        has been resolved.

        </p>

        </body>
        </html>
        """

    @staticmethod
    def complaint_closed(complaint):

        return f"""
        <html>
        <body>

        <h2>Complaint Closed</h2>

        <p>

        Complaint

        <b>{complaint.complaint_code}</b>

        has been closed.

        </p>

        </body>
        </html>
        """

    @staticmethod
    def complaint_reopened(complaint):

        return f"""
        <html>
        <body>

        <h2>Complaint Reopened</h2>

        <p>

        Complaint

        <b>{complaint.complaint_code}</b>

        has been reopened.

        </p>

        </body>
        </html>
        """

    @staticmethod
    def complaint_escalated(complaint):

        return f"""
        <html>
        <body>

        <h2>Complaint Escalated</h2>

        <p>

        Complaint

        <b>{complaint.complaint_code}</b>

        has been escalated.

        </p>

        </body>
        </html>
        """