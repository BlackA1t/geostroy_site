import Link from "next/link";
import { notFound } from "next/navigation";
import { EditRequestForm } from "@/components/EditRequestForm";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRequestTitle } from "@/lib/request-number";

type EditRequestPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditRequestPage({ params }: EditRequestPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const request = await prisma.request.findFirst({
    where: {
      id,
      userId: user.id
    },
    include: {
      files: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!request) {
    notFound();
  }

  return (
    <div className="dashboard-wide-card">
          <Link className="btn btn-primary dashboard-back-button" href={`/dashboard/requests/${request.id}`}>
            Назад к заявке
          </Link>
          <div className="dashboard-heading">
            <div>
              <div className="section-label">Редактирование</div>
              <h1>Изменить {formatRequestTitle(request.requestNumber)}</h1>
              <p>После сохранения статус заявки будет снова установлен как «Новая».</p>
            </div>
          </div>

          <EditRequestForm request={request} />
    </div>
  );
}
