export type ProcessingHistoryKind =
  | "initial"
  | "status_change"
  | "comment"
  | "user_edit"
  | "admin_edit"
  | "file_delete";

export type ProcessingHistoryItem = {
  id: string;
  createdAt: Date | string;
  actorName?: string | null;
  actorEmail?: string | null;
  actorType?: string | null;
  oldStatusLabel?: string | null;
  oldStatusClassName?: string | null;
  newStatusLabel: string;
  newStatusClassName: string;
  comment?: string | null;
  kind: ProcessingHistoryKind;
};

type ProcessingHistoryListProps = {
  title: string;
  items: ProcessingHistoryItem[];
};

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

function getActorLabel(item: ProcessingHistoryItem) {
  if (item.actorName && item.actorEmail) {
    return `${item.actorName} / ${item.actorEmail}`;
  }

  if (item.actorName) return item.actorName;
  if (item.actorEmail) return item.actorEmail;

  if (item.kind === "user_edit") return "Пользователь";
  if (item.actorType === "ADMIN") return "Администратор";
  if (item.actorType === "USER") return "Пользователь";

  return "Система";
}

function getActionLabel(item: ProcessingHistoryItem) {
  if (item.kind === "initial") return "Начальный статус";
  if (item.kind === "comment") return "Комментарий администратора";
  if (item.kind === "user_edit") return "Пользователь изменил заявку";
  if (item.kind === "admin_edit") return "Администратор изменил заявку";
  if (item.kind === "file_delete") {
    return item.actorType === "USER" ? "Пользователь удалил файл" : "Администратор удалил файл";
  }
  return "Статус изменён";
}

function StatusBadge({ className, label }: { className: string; label: string }) {
  return <span className={`status-badge ${className}`}>{label}</span>;
}

export function ProcessingHistoryList({ title, items }: ProcessingHistoryListProps) {
  return (
    <section className="processing-history">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p className="processing-history-empty">История обработки пока отсутствует.</p>
      ) : (
        <div className="processing-history-list">
          {items.map((item) => (
            <article className="processing-history-item" key={item.id}>
              <div className="processing-history-item-header">
                <strong>{getActionLabel(item)}</strong>
                <span>{formatDateTime(item.createdAt)}</span>
              </div>
              <div className="processing-history-meta">
                <span className="processing-history-actor">Кто изменил: {getActorLabel(item)}</span>
              </div>
              <div className="processing-history-statuses">
                {item.oldStatusLabel &&
                item.oldStatusClassName &&
                (item.kind === "status_change" || item.kind === "user_edit") ? (
                  <>
                    <StatusBadge className={item.oldStatusClassName} label={item.oldStatusLabel} />
                    <span>→</span>
                  </>
                ) : null}
                <StatusBadge className={item.newStatusClassName} label={item.newStatusLabel} />
              </div>
              {item.comment ? <p className="processing-history-comment">{item.comment}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
