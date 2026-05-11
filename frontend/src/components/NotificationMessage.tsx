import {
  getRequestStatusClassName,
  getRequestStatusLabel,
  REQUEST_STATUSES
} from "@/lib/request-status";

type NotificationMessageProps = {
  message: string;
};

const STATUS_LABELS = REQUEST_STATUSES.map((status) => ({
  label: getRequestStatusLabel(status),
  status
}));

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTextAfterStatus(value: string) {
  const withoutLeadingSpace = value.replace(/^\s+/, "");

  if (!withoutLeadingSpace.startsWith(".")) {
    return withoutLeadingSpace;
  }

  const rest = withoutLeadingSpace.slice(1).replace(/^\s+/, "");
  return rest ? ` ${rest}` : "";
}

export function NotificationMessage({ message }: NotificationMessageProps) {
  const match = STATUS_LABELS.find((item) => message.includes(item.label));

  if (!match) {
    return <p>{message}</p>;
  }

  const escapedLabel = escapeRegExp(match.label);
  const statusPattern = new RegExp(`[«"“„]?\\s*${escapedLabel}\\s*[»"”]?`);
  const patternMatch = message.match(statusPattern);

  if (!patternMatch || patternMatch.index === undefined) {
    return <p>{message}</p>;
  }

  const before = message.slice(0, patternMatch.index).replace(/\s+$/, " ");
  const after = normalizeTextAfterStatus(message.slice(patternMatch.index + patternMatch[0].length));

  return (
    <p className="notification-message">
      {before}
      <span className={`status-badge notification-status-badge ${getRequestStatusClassName(match.status)}`}>
        {match.label}
      </span>
      {after}
    </p>
  );
}
