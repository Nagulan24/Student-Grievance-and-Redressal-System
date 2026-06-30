export function mapStatus(status: string) {

  switch (status) {

    case "SUBMITTED":
      return "open";

    case "ASSIGNED":
      return "assigned";

    case "IN_PROGRESS":
      return "in_progress";

    case "RESOLVED":
      return "resolved";

    case "CLOSED":
      return "closed";

    case "ESCALATED":
      return "in_review";

    case "REOPENED":
      return "open";

    default:
      return "open";
  }
}

export function mapPriority(priority: string) {

  switch (priority) {

    case "LOW":
      return "low";

    case "MEDIUM":
      return "medium";

    case "HIGH":
      return "high";

    case "CRITICAL":
      return "critical";

    default:
      return "medium";
  }

}