import { getCallbackStatusClassName, getCallbackStatusLabel, type CallbackStatus } from "@/lib/callback-status";
import { ProcessingHistoryList, type ProcessingHistoryItem } from "./ProcessingHistoryList";

type CallbackStatusHistoryItem = {
  id: string;
  oldStatus: CallbackStatus | null;
  newStatus: CallbackStatus;
  comment: string | null;
  createdAt: Date | string;
  changedBy?: {
    name: string;
    email: string;
  } | null;
};

type CallbackStatusHistoryListProps = {
  items: CallbackStatusHistoryItem[];
};

function getHistoryKind(item: CallbackStatusHistoryItem): ProcessingHistoryItem["kind"] {
  if (!item.oldStatus) return "initial";
  if (item.oldStatus === item.newStatus && item.comment) return "comment";
  return "status_change";
}

function mapCallbackHistoryItem(item: CallbackStatusHistoryItem): ProcessingHistoryItem {
  return {
    id: item.id,
    createdAt: item.createdAt,
    actorName: item.changedBy?.name,
    actorEmail: item.changedBy?.email,
    actorType: item.changedBy ? "ADMIN" : "SYSTEM",
    oldStatusLabel: item.oldStatus ? getCallbackStatusLabel(item.oldStatus) : null,
    oldStatusClassName: item.oldStatus ? getCallbackStatusClassName(item.oldStatus) : null,
    newStatusLabel: getCallbackStatusLabel(item.newStatus),
    newStatusClassName: getCallbackStatusClassName(item.newStatus),
    comment: item.comment,
    kind: getHistoryKind(item)
  };
}

export function CallbackStatusHistoryList({ items }: CallbackStatusHistoryListProps) {
  return <ProcessingHistoryList title="История обработки" items={items.map(mapCallbackHistoryItem)} />;
}
