import type { CallbackStatus } from "@prisma/client";
import { getCallbackStatusClassName, getCallbackStatusLabel } from "@/lib/callback-status";

type CallbackStatusHistoryItem = {
  id: string;
  oldStatus: CallbackStatus | null;
  newStatus: CallbackStatus;
  comment: string | null;
  createdAt: Date;
  changedBy: {
    name: string;
    email: string;
  } | null;
};

type CallbackStatusHistoryListProps = {
  items: CallbackStatusHistoryItem[];
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function StatusBadge({ status }: { status: CallbackStatus }) {
  return (
    <span className={`status-badge ${getCallbackStatusClassName(status)}`}>
      {getCallbackStatusLabel(status)}
    </span>
  );
}

export function CallbackStatusHistoryList({ items }: CallbackStatusHistoryListProps) {
  return (
    <div className="status-history-panel">
      <h2>История обработки</h2>
      {items.length === 0 ? (
        <p>История обработки пока отсутствует.</p>
      ) : (
        <div className="status-history-list">
          {items.map((item) => {
            const actor = item.changedBy ? `${item.changedBy.name} / ${item.changedBy.email}` : "Система";
            const isCommentOnly = item.oldStatus === item.newStatus && Boolean(item.comment);

            return (
              <article className="status-history-item" key={item.id}>
                <div className="status-history-top">
                  <strong>
                    {!item.oldStatus
                      ? "Начальный статус"
                      : isCommentOnly
                        ? "Комментарий администратора"
                        : "Статус изменён"}
                  </strong>
                  <span>{formatDateTime(item.createdAt)}</span>
                </div>

                <div className="status-history-statuses">
                  {item.oldStatus && !isCommentOnly ? (
                    <>
                      <StatusBadge status={item.oldStatus} />
                      <span>→</span>
                    </>
                  ) : null}
                  <StatusBadge status={item.newStatus} />
                </div>

                <div className="status-history-actor">Кто изменил: {actor}</div>
                {item.comment ? <p>{item.comment}</p> : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
