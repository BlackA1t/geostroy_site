import type { RequestStatus } from "@prisma/client";
import { getRequestStatusClassName, getRequestStatusLabel } from "@/lib/request-status";
import { ProcessingHistoryList, type ProcessingHistoryItem } from "./ProcessingHistoryList";

type StatusHistoryItem = {
  id: string;
  oldStatus: RequestStatus | null;
  newStatus: RequestStatus;
  comment: string | null;
  actorType: string;
  createdAt: Date;
  changedBy?: {
    name: string;
    email: string;
  } | null;
};

type StatusHistoryListProps = {
  title: string;
  items: StatusHistoryItem[];
  showActorDetails?: boolean;
};

function getHistoryKind(item: StatusHistoryItem): ProcessingHistoryItem["kind"] {
  if (!item.oldStatus) return "initial";
  if (item.actorType === "ADMIN" && item.comment?.startsWith("Администратор изменил данные заявки")) {
    return "admin_edit";
  }
  if (
    item.comment?.startsWith("Пользователь удалил файл") ||
    item.comment?.startsWith("Администратор удалил файл")
  ) {
    return "file_delete";
  }
  if (item.oldStatus === item.newStatus && item.comment) return "comment";
  if (item.actorType === "USER") return "user_edit";
  if (item.actorType === "SYSTEM" && item.comment?.includes("Пользователь изменил")) return "user_edit";
  if (item.actorType === "ADMIN") return "status_change";
  return "status_change";
}

function mapStatusHistoryItem(item: StatusHistoryItem, showActorDetails: boolean): ProcessingHistoryItem {
  return {
    id: item.id,
    createdAt: item.createdAt,
    actorName: showActorDetails ? item.changedBy?.name : null,
    actorEmail: showActorDetails ? item.changedBy?.email : null,
    actorType: item.actorType,
    oldStatusLabel: item.oldStatus ? getRequestStatusLabel(item.oldStatus) : null,
    oldStatusClassName: item.oldStatus ? getRequestStatusClassName(item.oldStatus) : null,
    newStatusLabel: getRequestStatusLabel(item.newStatus),
    newStatusClassName: getRequestStatusClassName(item.newStatus),
    comment: item.comment,
    kind: getHistoryKind(item)
  };
}

export function StatusHistoryList({ title, items, showActorDetails = false }: StatusHistoryListProps) {
  return <ProcessingHistoryList title={title} items={items.map((item) => mapStatusHistoryItem(item, showActorDetails))} />;
}
