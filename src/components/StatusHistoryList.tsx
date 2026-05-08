import type { RequestStatus } from "@prisma/client";
import { getStatusHistoryLabel } from "@/lib/status-history";

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

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function StatusHistoryList({ title, items, showActorDetails = false }: StatusHistoryListProps) {
  return (
    <section className="status-history-panel">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p>История пока пуста.</p>
      ) : (
        <div className="status-history-list">
          {items.map((item) => (
            <article className="status-history-item" key={item.id}>
              <div className="status-history-top">
                <strong>{getStatusHistoryLabel(item.oldStatus, item.newStatus)}</strong>
                <span>{formatDateTime(item.createdAt)}</span>
              </div>
              {showActorDetails ? (
                <div className="status-history-actor">
                  {item.changedBy ? `${item.changedBy.name} / ${item.changedBy.email}` : item.actorType} · {item.actorType}
                </div>
              ) : null}
              {item.comment ? <p>{item.comment}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
